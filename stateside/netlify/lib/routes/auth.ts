import { validateEmail, validatePassword } from "../../../shared/rules";
import { clearCookie, createSession, currentUser, destroySession, hashPassword, toMe, verifyPassword, type UserRow } from "../auth";
import { db, one } from "../db";
import { adminEmails } from "../env";
import { HttpError, json, readJson, Router, str } from "../http";

interface Credentials {
  email?: string;
  password?: string;
  name?: string;
  veteran?: boolean;
}

async function hasCompany(userId: string): Promise<boolean> {
  const q = await db();
  return !!(await one(q, `SELECT 1 FROM companies WHERE owner_user_id = $1 LIMIT 1`, [userId]));
}

export function registerAuth(r: Router): void {
  r.on("POST", "/api/auth/signup", async (req) => {
    const body = await readJson<Credentials>(req);
    if (!body) throw new HttpError(400, "bad_json", "Body must be JSON.");
    const email = str(body.email, 200).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";
    const name = str(body.name, 80);
    if (!validateEmail(email)) throw new HttpError(422, "invalid_email", "Enter a valid email address.");
    const pw = validatePassword(password);
    if (pw) throw new HttpError(422, "weak_password", pw);
    if (name.length < 2) throw new HttpError(422, "invalid_name", "Tell us your name (2+ characters).");

    const q = await db();
    if (await one(q, `SELECT 1 FROM users WHERE lower(email) = $1`, [email])) {
      throw new HttpError(409, "email_taken", "An account with that email already exists. Sign in instead.");
    }
    const user = await one<UserRow>(
      q,
      `INSERT INTO users (email, password_hash, name, veteran_status, is_admin)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [email, await hashPassword(password), name, body.veteran ? "self_reported" : "none", adminEmails().has(email)],
    );
    if (!user) throw new HttpError(500, "internal", "Could not create the account.");
    const { cookie } = await createSession(q, user.id);
    return json({ user: toMe(user, false) }, { status: 201, headers: { "Set-Cookie": cookie } });
  });

  r.on("POST", "/api/auth/login", async (req) => {
    const body = await readJson<Credentials>(req);
    if (!body) throw new HttpError(400, "bad_json", "Body must be JSON.");
    const email = str(body.email, 200).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";
    const q = await db();
    const user = await one<UserRow>(q, `SELECT * FROM users WHERE lower(email) = $1`, [email]);
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      throw new HttpError(401, "bad_credentials", "Email or password is incorrect.");
    }
    if (user.is_banned) throw new HttpError(403, "banned", "This account has been suspended. Contact support if you believe this is a mistake.");
    if (!user.is_admin && adminEmails().has(email)) {
      await q.query(`UPDATE users SET is_admin = true WHERE id = $1`, [user.id]);
      user.is_admin = true;
    }
    const { cookie } = await createSession(q, user.id);
    return json({ user: toMe(user, await hasCompany(user.id)) }, { headers: { "Set-Cookie": cookie } });
  });

  r.on("POST", "/api/auth/logout", async (req) => {
    await destroySession(req);
    return json({ ok: true }, { headers: { "Set-Cookie": clearCookie() } });
  });

  r.on("GET", "/api/auth/me", async (req) => {
    const user = await currentUser(req);
    if (!user) return json({ user: null });
    return json({ user: toMe(user, await hasCompany(user.id)) });
  });
}
