import { randomBytes, scrypt as scryptCb, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import type { Me } from "../../shared/types";
import { db, one, type Queryable } from "./db";
import { adminEmails, isProduction } from "./env";
import { HttpError } from "./http";

const scrypt = promisify(scryptCb);
const COOKIE = "stateside_session";
const SESSION_DAYS = 30;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, salt, hex] = stored.split("$");
  if (algo !== "scrypt" || !salt || !hex) return false;
  const key = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hex, "hex");
  return key.length === expected.length && timingSafeEqual(key, expected);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  headline: string;
  bio: string;
  city: string;
  state: string;
  years_experience: number;
  skills: string[];
  open_to_work: boolean;
  veteran_status: "none" | "self_reported" | "verified";
  veteran_branch: string;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
}

export function toMe(u: UserRow, hasCompany: boolean): Me {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    headline: u.headline,
    bio: u.bio,
    city: u.city,
    state: u.state,
    years_experience: u.years_experience,
    skills: u.skills,
    open_to_work: u.open_to_work,
    veteran_status: u.veteran_status,
    veteran_branch: u.veteran_branch,
    is_admin: u.is_admin,
    has_company: hasCompany,
    created_at: typeof u.created_at === "string" ? u.created_at : new Date(u.created_at).toISOString(),
  };
}

export async function createSession(q: Queryable, userId: string): Promise<{ token: string; cookie: string }> {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  await q.query(`INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`, [userId, hashToken(token), expires]);
  return { token, cookie: sessionCookie(token, expires) };
}

export function sessionCookie(token: string, expires: Date): string {
  const parts = [`${COOKIE}=${token}`, "Path=/", "HttpOnly", "SameSite=Lax", `Expires=${expires.toUTCString()}`];
  if (isProduction()) parts.push("Secure");
  return parts.join("; ");
}

export function clearCookie(): string {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function tokenFromRequest(req: Request): string | null {
  const header = req.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === COOKIE) return rest.join("=") || null;
  }
  return null;
}

export async function currentUser(req: Request): Promise<UserRow | null> {
  const token = tokenFromRequest(req);
  if (!token) return null;
  const q = await db();
  const user = await one<UserRow>(
    q,
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [hashToken(token)],
  );
  if (!user) return null;
  if (user.is_banned) return null;
  // Promote configured admins on the fly so the first admin needs no manual DB step.
  if (!user.is_admin && adminEmails().has(user.email.toLowerCase())) {
    await q.query(`UPDATE users SET is_admin = true WHERE id = $1`, [user.id]);
    user.is_admin = true;
  }
  return user;
}

export async function requireUser(req: Request): Promise<UserRow> {
  const u = await currentUser(req);
  if (!u) throw new HttpError(401, "unauthorized", "Sign in to continue.");
  return u;
}

export async function requireAdmin(req: Request): Promise<UserRow> {
  const u = await requireUser(req);
  if (!u.is_admin) throw new HttpError(403, "forbidden", "Admins only.");
  return u;
}

export async function destroySession(req: Request): Promise<void> {
  const token = tokenFromRequest(req);
  if (!token) return;
  const q = await db();
  await q.query(`DELETE FROM sessions WHERE token_hash = $1`, [hashToken(token)]);
}

/** Sliding-window rate limit backed by the rate_events table. */
export async function rateLimit(q: Queryable, userId: string, kind: string, max: number, windowHours: number): Promise<void> {
  const r = await one<{ n: string | number }>(
    q,
    `SELECT count(*) AS n FROM rate_events WHERE user_id = $1 AND kind = $2 AND created_at > now() - ($3 || ' hours')::interval`,
    [userId, kind, String(windowHours)],
  );
  if (Number(r?.n ?? 0) >= max) {
    throw new HttpError(429, "rate_limited", `You have hit the limit for this action (${max} per ${windowHours}h). Try again later.`);
  }
  await q.query(`INSERT INTO rate_events (user_id, kind) VALUES ($1, $2)`, [userId, kind]);
}
