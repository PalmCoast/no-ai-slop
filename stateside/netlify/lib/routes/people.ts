import { CONNECTION_REQUESTS_PER_DAY, normalizeSkills, SERVICE_BRANCHES, STATE_CODES } from "../../../shared/rules";
import type { Connection, Conversation, Message, PublicUser } from "../../../shared/types";
import { rateLimit, requireUser, toMe, type UserRow } from "../auth";
import { db, one, type Queryable } from "../db";
import { bool, HttpError, int, isUuid, json, readJson, Router, str } from "../http";

const PUBLIC_USER = `u.id, u.name, u.headline, u.bio, u.city, u.state, u.years_experience, u.skills, u.open_to_work, u.veteran_status, u.veteran_branch, u.created_at`;

async function connectionBetween(q: Queryable, a: string, b: string): Promise<{ id: string; status: string; requester_id: string } | null> {
  return one(q, `SELECT id, status, requester_id FROM connections WHERE (requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1)`, [a, b]);
}

async function requireConnected(q: Queryable, me: UserRow, otherId: string): Promise<void> {
  if (me.is_admin) return;
  const c = await connectionBetween(q, me.id, otherId);
  if (!c || c.status !== "accepted") {
    throw new HttpError(403, "not_connected", "Direct messages are only open between accepted connections. Send a connection request first.");
  }
}

async function conversationFor(q: Queryable, a: string, b: string): Promise<string> {
  const [x, y] = a < b ? [a, b] : [b, a];
  const existing = await one<{ id: string }>(q, `SELECT id FROM conversations WHERE user_a = $1 AND user_b = $2`, [x, y]);
  if (existing) return existing.id;
  const created = await one<{ id: string }>(q, `INSERT INTO conversations (user_a, user_b) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id`, [x, y]);
  if (created) return created.id;
  return (await one<{ id: string }>(q, `SELECT id FROM conversations WHERE user_a = $1 AND user_b = $2`, [x, y]))!.id;
}

export function registerPeople(r: Router): void {
  r.on("PUT", "/api/me", async (req) => {
    const user = await requireUser(req);
    const body = (await readJson<Record<string, unknown>>(req)) ?? {};
    const name = str(body.name, 80) || user.name;
    const headline = str(body.headline, 140);
    const bio = str(body.bio, 3000);
    const city = str(body.city, 80);
    const state = str(body.state, 2).toUpperCase();
    if (state && !STATE_CODES.has(state)) throw new HttpError(422, "invalid", "Choose a US state.");
    const years = Math.min(60, Math.max(0, int(body.years_experience, 0) ?? 0));
    const skills = normalizeSkills(Array.isArray(body.skills) ? (body.skills as string[]) : str(body.skills, 1000)).slice(0, 30);
    const openToWork = body.open_to_work === undefined ? user.open_to_work : bool(body.open_to_work);
    // Members can self-report veteran status; only admins mark it verified.
    let veteranStatus = user.veteran_status;
    let branch = user.veteran_branch;
    if (body.veteran !== undefined && user.veteran_status !== "verified") veteranStatus = bool(body.veteran) ? "self_reported" : "none";
    if (body.veteran_branch !== undefined) {
      const b = str(body.veteran_branch, 40);
      branch = (SERVICE_BRANCHES as readonly string[]).includes(b) ? b : "";
    }
    if (veteranStatus === "none") branch = "";
    const q = await db();
    const updated = await one<UserRow>(
      q,
      `UPDATE users SET name = $2, headline = $3, bio = $4, city = $5, state = $6, years_experience = $7, skills = $8, open_to_work = $9, veteran_status = $10, veteran_branch = $11, updated_at = now()
       WHERE id = $1 RETURNING *`,
      [user.id, name, headline, bio, city, state, years, skills, openToWork, veteranStatus, branch],
    );
    const hasCompany = !!(await one(q, `SELECT 1 FROM companies WHERE owner_user_id = $1`, [user.id]));
    return json({ user: toMe(updated!, hasCompany) });
  });

  r.on("POST", "/api/me/veteran-verification", async (req) => {
    const user = await requireUser(req);
    if (user.veteran_status === "verified") return json({ status: "approved" });
    const body = (await readJson<{ branch?: string; service_years?: string; evidence?: string }>(req)) ?? {};
    const branch = str(body.branch, 40);
    if (!(SERVICE_BRANCHES as readonly string[]).includes(branch)) throw new HttpError(422, "invalid", "Choose your branch of service.");
    const q = await db();
    const pending = await one(q, `SELECT 1 FROM veteran_verifications WHERE user_id = $1 AND status = 'pending'`, [user.id]);
    if (pending) return json({ status: "pending" });
    await q.query(`INSERT INTO veteran_verifications (user_id, branch, service_years, evidence) VALUES ($1, $2, $3, $4)`, [user.id, branch, str(body.service_years, 40), str(body.evidence, 2000)]);
    await q.query(`UPDATE users SET veteran_status = 'self_reported', veteran_branch = $2 WHERE id = $1 AND veteran_status = 'none'`, [user.id, branch]);
    return json({ status: "pending" }, { status: 201 });
  });

  r.on("GET", "/api/me/veteran-verification", async (req) => {
    const user = await requireUser(req);
    const q = await db();
    const row = await one<{ status: string; created_at: string }>(q, `SELECT status, created_at FROM veteran_verifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`, [user.id]);
    return json({ verification: row });
  });

  r.on("GET", "/api/people", async (req) => {
    const user = await requireUser(req);
    const url = new URL(req.url);
    const text = str(url.searchParams.get("q"), 80);
    const state = str(url.searchParams.get("state"), 2).toUpperCase();
    const veterans = url.searchParams.get("veterans") === "true";
    const params: unknown[] = [user.id];
    const where = [`u.is_banned = false`, `u.id <> $1`];
    if (text) {
      params.push(`%${text}%`);
      where.push(`(u.name ILIKE $${params.length} OR u.headline ILIKE $${params.length} OR array_to_string(u.skills, ' ') ILIKE $${params.length} OR u.city ILIKE $${params.length})`);
    }
    if (state && STATE_CODES.has(state)) {
      params.push(state);
      where.push(`u.state = $${params.length}`);
    }
    if (veterans) where.push(`u.veteran_status <> 'none'`);
    const q = await db();
    const rows = await q.query<PublicUser & { connection_status: string | null }>(
      `SELECT ${PUBLIC_USER},
         (SELECT c.status FROM connections c WHERE (c.requester_id = u.id AND c.addressee_id = $1) OR (c.requester_id = $1 AND c.addressee_id = u.id)) AS connection_status
       FROM users u WHERE ${where.join(" AND ")} ORDER BY u.veteran_status = 'verified' DESC, u.created_at DESC LIMIT 60`,
      params,
    );
    return json({ people: rows.rows });
  });

  r.on("GET", "/api/people/:id", async (req, { id }) => {
    const user = await requireUser(req);
    if (!isUuid(id!)) throw new HttpError(404, "not_found", "No such member.");
    const q = await db();
    const person = await one<PublicUser>(q, `SELECT ${PUBLIC_USER} FROM users u WHERE u.id = $1 AND u.is_banned = false`, [id]);
    if (!person) throw new HttpError(404, "not_found", "No such member.");
    const c = await connectionBetween(q, user.id, id!);
    const connection = c ? { id: c.id, status: c.status, direction: c.requester_id === user.id ? "outgoing" : "incoming" } : null;
    return json({ person, connection });
  });

  r.on("GET", "/api/connections", async (req) => {
    const user = await requireUser(req);
    const q = await db();
    const rows = await q.query<{ connection_id: string; status: Connection["status"]; requester_id: string; connection_created_at: string } & PublicUser>(
      `SELECT c.id AS connection_id, c.status, c.requester_id, c.created_at AS connection_created_at, ${PUBLIC_USER}
       FROM connections c JOIN users u ON u.id = CASE WHEN c.requester_id = $1 THEN c.addressee_id ELSE c.requester_id END
       WHERE (c.requester_id = $1 OR c.addressee_id = $1) AND c.status IN ('pending', 'accepted') AND u.is_banned = false
       ORDER BY c.status = 'pending' DESC, c.created_at DESC`,
      [user.id],
    );
    const connections: Connection[] = rows.rows.map((row) => {
      const { connection_id, status, requester_id, connection_created_at, ...person } = row;
      return { id: connection_id, status, created_at: connection_created_at, direction: requester_id === user.id ? "outgoing" : "incoming", user: person };
    });
    return json({ connections });
  });

  r.on("POST", "/api/connections/:userId", async (req, { userId }) => {
    const user = await requireUser(req);
    if (!isUuid(userId!) || userId === user.id) throw new HttpError(422, "invalid", "Choose another member.");
    const q = await db();
    const target = await one<{ id: string }>(q, `SELECT id FROM users WHERE id = $1 AND is_banned = false`, [userId]);
    if (!target) throw new HttpError(404, "not_found", "No such member.");
    const existing = await connectionBetween(q, user.id, userId!);
    if (existing) {
      if (existing.status === "blocked") throw new HttpError(403, "blocked", "You cannot connect with this member.");
      return json({ status: existing.status });
    }
    await rateLimit(q, user.id, "connection_request", CONNECTION_REQUESTS_PER_DAY, 24);
    await q.query(`INSERT INTO connections (requester_id, addressee_id) VALUES ($1, $2)`, [user.id, userId]);
    return json({ status: "pending" }, { status: 201 });
  });

  r.on("PATCH", "/api/connections/:id", async (req, { id }) => {
    const user = await requireUser(req);
    if (!isUuid(id!)) throw new HttpError(404, "not_found", "No such request.");
    const body = (await readJson<{ action?: string }>(req)) ?? {};
    const action = str(body.action, 20);
    const q = await db();
    const c = await one<{ id: string; requester_id: string; addressee_id: string; status: string }>(q, `SELECT * FROM connections WHERE id = $1`, [id]);
    if (!c || (c.requester_id !== user.id && c.addressee_id !== user.id)) throw new HttpError(404, "not_found", "No such request.");
    if (action === "accept" || action === "decline") {
      if (c.addressee_id !== user.id || c.status !== "pending") throw new HttpError(409, "invalid", "Only the recipient of a pending request can do that.");
      await q.query(`UPDATE connections SET status = $2, responded_at = now() WHERE id = $1`, [id, action === "accept" ? "accepted" : "declined"]);
    } else if (action === "block") {
      await q.query(`UPDATE connections SET status = 'blocked', requester_id = $2, addressee_id = $3, responded_at = now() WHERE id = $1`, [id, c.requester_id === user.id ? c.addressee_id : c.requester_id, user.id]);
    } else if (action === "remove") {
      await q.query(`DELETE FROM connections WHERE id = $1 AND status <> 'blocked'`, [id]);
    } else {
      throw new HttpError(422, "invalid", "Unknown action.");
    }
    return json({ ok: true });
  });

  r.on("GET", "/api/messages", async (req) => {
    const user = await requireUser(req);
    const q = await db();
    const rows = await q.query<{ conversation_id: string; last_message: string | null; last_at: string | null } & PublicUser>(
      `SELECT cv.id AS conversation_id, ${PUBLIC_USER},
         (SELECT m.body FROM messages m WHERE m.channel_type = 'dm' AND m.channel_id = cv.id AND m.deleted_at IS NULL ORDER BY m.id DESC LIMIT 1) AS last_message,
         (SELECT m.created_at FROM messages m WHERE m.channel_type = 'dm' AND m.channel_id = cv.id AND m.deleted_at IS NULL ORDER BY m.id DESC LIMIT 1) AS last_at
       FROM conversations cv JOIN users u ON u.id = CASE WHEN cv.user_a = $1 THEN cv.user_b ELSE cv.user_a END
       WHERE cv.user_a = $1 OR cv.user_b = $1 ORDER BY last_at DESC NULLS LAST`,
      [user.id],
    );
    const conversations: Conversation[] = rows.rows.map((row) => {
      const { conversation_id, last_message, last_at, ...other } = row;
      return { id: conversation_id, last_message, last_at, other };
    });
    return json({ conversations });
  });

  r.on("GET", "/api/messages/:userId", async (req, { userId }) => {
    const user = await requireUser(req);
    if (!isUuid(userId!)) throw new HttpError(404, "not_found", "No such member.");
    const q = await db();
    await requireConnected(q, user, userId!);
    const convo = await conversationFor(q, user.id, userId!);
    const after = Number(new URL(req.url).searchParams.get("after") ?? 0) || 0;
    const rows = await q.query<Message>(
      `SELECT m.id, m.sender_id, u.name AS sender_name, u.veteran_status AS sender_veteran, m.body, m.created_at
       FROM messages m JOIN users u ON u.id = m.sender_id
       WHERE m.channel_type = 'dm' AND m.channel_id = $1 AND m.deleted_at IS NULL AND m.id > $2 ORDER BY m.id DESC LIMIT 100`,
      [convo, after],
    );
    const other = await one<PublicUser>(q, `SELECT ${PUBLIC_USER} FROM users u WHERE u.id = $1`, [userId]);
    return json({ conversation_id: convo, other, messages: rows.rows.reverse() });
  });

  r.on("POST", "/api/messages/:userId", async (req, { userId }) => {
    const user = await requireUser(req);
    if (!isUuid(userId!)) throw new HttpError(404, "not_found", "No such member.");
    const body = (await readJson<{ body?: string }>(req)) ?? {};
    const text = str(body.body, 4000);
    if (!text) throw new HttpError(422, "empty", "Write something first.");
    const q = await db();
    await requireConnected(q, user, userId!);
    await rateLimit(q, user.id, "dm", 200, 1);
    const convo = await conversationFor(q, user.id, userId!);
    const m = await one<{ id: number; created_at: string }>(q, `INSERT INTO messages (channel_type, channel_id, sender_id, body) VALUES ('dm', $1, $2, $3) RETURNING id, created_at`, [convo, user.id, text]);
    const message: Message = { id: m!.id, sender_id: user.id, sender_name: user.name, sender_veteran: user.veteran_status, body: text, created_at: m!.created_at };
    return json({ message }, { status: 201 });
  });

  r.on("POST", "/api/reports", async (req) => {
    const user = await requireUser(req);
    const body = (await readJson<{ target_type?: string; target_id?: string; reason?: string }>(req)) ?? {};
    const type = str(body.target_type, 10);
    const targetId = str(body.target_id, 80);
    const reason = str(body.reason, 2000);
    if (!["job", "user", "message", "group"].includes(type)) throw new HttpError(422, "invalid", "Unknown report type.");
    if (!targetId) throw new HttpError(422, "invalid", "Missing target.");
    if (reason.length < 5) throw new HttpError(422, "invalid", "Tell us what is wrong (a sentence is enough).");
    const q = await db();
    await rateLimit(q, user.id, "report", 30, 24);
    await q.query(`INSERT INTO reports (reporter_id, target_type, target_id, reason) VALUES ($1, $2, $3, $4)`, [user.id, type, targetId, reason]);
    return json({ ok: true }, { status: 201 });
  });
}
