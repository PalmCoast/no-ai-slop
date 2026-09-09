import { slugify } from "../../../shared/rules";
import type { Group, Message, PublicUser } from "../../../shared/types";
import { rateLimit, requireUser, type UserRow } from "../auth";
import { db, one, type Queryable } from "../db";
import { bool, HttpError, isUuid, json, readJson, Router, str } from "../http";

const GROUP_SELECT = `
  g.id, g.slug, g.name, g.description, g.is_private, g.created_by, g.created_at,
  (SELECT count(*) FROM group_members m WHERE m.group_id = g.id)::int AS member_count,
  (SELECT m.role FROM group_members m WHERE m.group_id = g.id AND m.user_id = $1) AS my_role`;

async function loadGroup(q: Queryable, user: UserRow, slug: string): Promise<Group> {
  const g = await one<Group>(q, `SELECT ${GROUP_SELECT} FROM groups g WHERE g.slug = $2`, [user.id, slug]);
  if (!g) throw new HttpError(404, "not_found", "No such group.");
  return g;
}

function canModerate(g: Group, user: UserRow): boolean {
  return user.is_admin || g.my_role === "owner" || g.my_role === "moderator";
}

function requireAccess(g: Group, user: UserRow): void {
  if (g.is_private && !g.my_role && !user.is_admin) throw new HttpError(403, "private_group", "This is a private group. Ask a member to add you.");
}

export function registerGroups(r: Router): void {
  r.on("GET", "/api/groups", async (req) => {
    const user = await requireUser(req);
    const url = new URL(req.url);
    const text = str(url.searchParams.get("q"), 80);
    const mine = url.searchParams.get("mine") === "true";
    const params: unknown[] = [user.id];
    const where: string[] = [];
    if (mine) where.push(`EXISTS (SELECT 1 FROM group_members m WHERE m.group_id = g.id AND m.user_id = $1)`);
    else where.push(`(g.is_private = false OR EXISTS (SELECT 1 FROM group_members m WHERE m.group_id = g.id AND m.user_id = $1))`);
    if (text) {
      params.push(`%${text}%`);
      where.push(`(g.name ILIKE $${params.length} OR g.description ILIKE $${params.length})`);
    }
    const q = await db();
    const rows = await q.query<Group>(`SELECT ${GROUP_SELECT} FROM groups g WHERE ${where.join(" AND ")} ORDER BY member_count DESC, g.created_at DESC LIMIT 100`, params);
    return json({ groups: rows.rows });
  });

  r.on("POST", "/api/groups", async (req) => {
    const user = await requireUser(req);
    const body = (await readJson<{ name?: string; description?: string; is_private?: boolean }>(req)) ?? {};
    const name = str(body.name, 80);
    const description = str(body.description, 2000);
    if (name.length < 3) throw new HttpError(422, "invalid", "Group name must be at least 3 characters.");
    const base = slugify(name);
    if (!base) throw new HttpError(422, "invalid", "Group name needs some letters or numbers.");
    const q = await db();
    await rateLimit(q, user.id, "create_group", 5, 24);
    return q.transaction(async (tx) => {
      let slug = base;
      for (let i = 2; await one(tx, `SELECT 1 FROM groups WHERE slug = $1`, [slug]); i++) slug = `${base}-${i}`;
      const created = await one<{ id: string }>(
        tx,
        `INSERT INTO groups (slug, name, description, created_by, is_private) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [slug, name, description, user.id, bool(body.is_private)],
      );
      await tx.query(`INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, 'owner')`, [created!.id, user.id]);
      return json({ group: await loadGroup(tx, user, slug) }, { status: 201 });
    });
  });

  r.on("GET", "/api/groups/:slug", async (req, { slug }) => {
    const user = await requireUser(req);
    const q = await db();
    const g = await loadGroup(q, user, slug!);
    requireAccess(g, user);
    return json({ group: g });
  });

  r.on("POST", "/api/groups/:slug/join", async (req, { slug }) => {
    const user = await requireUser(req);
    const q = await db();
    const g = await loadGroup(q, user, slug!);
    if (g.is_private) throw new HttpError(403, "private_group", "Private groups are invite-only.");
    await q.query(`INSERT INTO group_members (group_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [g.id, user.id]);
    return json({ group: await loadGroup(q, user, slug!) });
  });

  r.on("POST", "/api/groups/:slug/leave", async (req, { slug }) => {
    const user = await requireUser(req);
    const q = await db();
    const g = await loadGroup(q, user, slug!);
    if (g.my_role === "owner") {
      const others = await one<{ n: string | number }>(q, `SELECT count(*) AS n FROM group_members WHERE group_id = $1 AND user_id <> $2`, [g.id, user.id]);
      if (Number(others?.n ?? 0) > 0) throw new HttpError(409, "owner", "Hand ownership to another member before leaving, or delete the group.");
      await q.query(`DELETE FROM groups WHERE id = $1`, [g.id]);
      return json({ deleted: true });
    }
    await q.query(`DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`, [g.id, user.id]);
    return json({ group: await loadGroup(q, user, slug!) });
  });

  r.on("GET", "/api/groups/:slug/members", async (req, { slug }) => {
    const user = await requireUser(req);
    const q = await db();
    const g = await loadGroup(q, user, slug!);
    requireAccess(g, user);
    const rows = await q.query<PublicUser & { role: string }>(
      `SELECT u.id, u.name, u.headline, u.bio, u.city, u.state, u.years_experience, u.skills, u.open_to_work, u.veteran_status, u.veteran_branch, u.created_at, m.role
       FROM group_members m JOIN users u ON u.id = m.user_id WHERE m.group_id = $1 ORDER BY m.role = 'owner' DESC, m.role = 'moderator' DESC, m.joined_at`,
      [g.id],
    );
    return json({ members: rows.rows });
  });

  r.on("POST", "/api/groups/:slug/members", async (req, { slug }) => {
    const user = await requireUser(req);
    const body = (await readJson<{ user_id?: string; action?: string }>(req)) ?? {};
    const target = str(body.user_id, 60);
    const action = str(body.action, 20);
    if (!isUuid(target)) throw new HttpError(422, "invalid", "Choose a member.");
    const q = await db();
    const g = await loadGroup(q, user, slug!);
    if (!canModerate(g, user)) throw new HttpError(403, "forbidden", "Only group owners and moderators can do that.");
    if (action === "add") {
      await q.query(`INSERT INTO group_members (group_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [g.id, target]);
    } else if (action === "remove") {
      if (target === g.created_by) throw new HttpError(403, "forbidden", "The group owner cannot be removed.");
      await q.query(`DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`, [g.id, target]);
    } else if (action === "moderator" || action === "member") {
      if (g.my_role !== "owner" && !user.is_admin) throw new HttpError(403, "forbidden", "Only the owner can change roles.");
      await q.query(`UPDATE group_members SET role = $3 WHERE group_id = $1 AND user_id = $2 AND role <> 'owner'`, [g.id, target, action]);
    } else {
      throw new HttpError(422, "invalid", "Unknown action.");
    }
    return json({ ok: true });
  });

  r.on("GET", "/api/groups/:slug/messages", async (req, { slug }) => {
    const user = await requireUser(req);
    const q = await db();
    const g = await loadGroup(q, user, slug!);
    requireAccess(g, user);
    const after = Number(new URL(req.url).searchParams.get("after") ?? 0) || 0;
    const rows = await q.query<Message>(
      `SELECT m.id, m.sender_id, u.name AS sender_name, u.veteran_status AS sender_veteran, m.body, m.created_at
       FROM messages m JOIN users u ON u.id = m.sender_id
       WHERE m.channel_type = 'group' AND m.channel_id = $1 AND m.deleted_at IS NULL AND m.id > $2
       ORDER BY m.id DESC LIMIT 100`,
      [g.id, after],
    );
    return json({ messages: rows.rows.reverse() });
  });

  r.on("POST", "/api/groups/:slug/messages", async (req, { slug }) => {
    const user = await requireUser(req);
    const body = (await readJson<{ body?: string }>(req)) ?? {};
    const text = str(body.body, 4000);
    if (!text) throw new HttpError(422, "empty", "Write something first.");
    const q = await db();
    const g = await loadGroup(q, user, slug!);
    if (!g.my_role) throw new HttpError(403, "not_member", "Join the group to post.");
    await rateLimit(q, user.id, "group_message", 300, 1);
    const m = await one<{ id: number; created_at: string }>(
      q,
      `INSERT INTO messages (channel_type, channel_id, sender_id, body) VALUES ('group', $1, $2, $3) RETURNING id, created_at`,
      [g.id, user.id, text],
    );
    const message: Message = { id: m!.id, sender_id: user.id, sender_name: user.name, sender_veteran: user.veteran_status, body: text, created_at: m!.created_at };
    return json({ message }, { status: 201 });
  });

  r.on("DELETE", "/api/groups/:slug/messages/:id", async (req, { slug, id }) => {
    const user = await requireUser(req);
    const q = await db();
    const g = await loadGroup(q, user, slug!);
    const mid = Number(id);
    if (!Number.isInteger(mid)) throw new HttpError(404, "not_found", "No such message.");
    const res = await q.query(
      `UPDATE messages SET deleted_at = now() WHERE id = $1 AND channel_type = 'group' AND channel_id = $2 AND (sender_id = $3 OR $4 = true)`,
      [mid, g.id, user.id, canModerate(g, user)],
    );
    if (!res.rowCount) throw new HttpError(404, "not_found", "No such message.");
    return json({ ok: true });
  });
}
