import type { Company, Report } from "../../../shared/types";
import { requireAdmin } from "../auth";
import { db, one } from "../db";
import { HttpError, isUuid, json, readJson, Router, str } from "../http";

export function registerAdmin(r: Router): void {
  r.on("GET", "/api/admin/overview", async (req) => {
    await requireAdmin(req);
    const q = await db();
    const counts = await one<Record<string, string | number>>(
      q,
      `SELECT
         (SELECT count(*) FROM users) AS users,
         (SELECT count(*) FROM users WHERE veteran_status <> 'none') AS veterans,
         (SELECT count(*) FROM jobs WHERE status = 'published') AS published_jobs,
         (SELECT count(*) FROM companies) AS companies,
         (SELECT count(*) FROM groups) AS groups,
         (SELECT count(*) FROM reports WHERE resolved_at IS NULL) AS open_reports,
         (SELECT count(*) FROM veteran_verifications WHERE status = 'pending') AS pending_veterans,
         (SELECT coalesce(sum(amount_cents), 0) FROM payments WHERE status = 'paid') AS revenue_cents`,
    );
    return json({ counts: Object.fromEntries(Object.entries(counts ?? {}).map(([k, v]) => [k, Number(v)])) });
  });

  r.on("GET", "/api/admin/reports", async (req) => {
    await requireAdmin(req);
    const q = await db();
    const rows = await q.query<Report & { target_label: string | null }>(
      `SELECT r.id, r.target_type, r.target_id, r.reason, r.created_at, r.resolved_at, r.resolution, u.name AS reporter_name,
         CASE r.target_type
           WHEN 'job' THEN (SELECT j.title FROM jobs j WHERE j.id::text = r.target_id)
           WHEN 'user' THEN (SELECT t.name || ' <' || t.email || '>' FROM users t WHERE t.id::text = r.target_id)
           WHEN 'group' THEN (SELECT g.name FROM groups g WHERE g.id::text = r.target_id)
           WHEN 'message' THEN (SELECT left(m.body, 140) FROM messages m WHERE m.id::text = r.target_id)
         END AS target_label
       FROM reports r JOIN users u ON u.id = r.reporter_id
       ORDER BY r.resolved_at IS NULL DESC, r.created_at DESC LIMIT 200`,
    );
    return json({ reports: rows.rows });
  });

  r.on("PATCH", "/api/admin/reports/:id", async (req, { id }) => {
    const admin = await requireAdmin(req);
    if (!isUuid(id!)) throw new HttpError(404, "not_found", "No such report.");
    const body = (await readJson<{ action?: string; resolution?: string }>(req)) ?? {};
    const action = str(body.action, 20);
    const q = await db();
    const report = await one<Report>(q, `SELECT * FROM reports WHERE id = $1`, [id]);
    if (!report) throw new HttpError(404, "not_found", "No such report.");
    if (action === "remove_target") {
      switch (report.target_type) {
        case "job":
          await q.query(`UPDATE jobs SET status = 'removed' WHERE id::text = $1`, [report.target_id]);
          break;
        case "user":
          await q.query(`UPDATE users SET is_banned = true WHERE id::text = $1 AND is_admin = false`, [report.target_id]);
          await q.query(`DELETE FROM sessions WHERE user_id::text = $1`, [report.target_id]);
          await q.query(`UPDATE jobs SET status = 'removed' WHERE posted_by::text = $1 AND status = 'published'`, [report.target_id]);
          break;
        case "message":
          await q.query(`UPDATE messages SET deleted_at = now() WHERE id::text = $1`, [report.target_id]);
          break;
        case "group":
          await q.query(`DELETE FROM groups WHERE id::text = $1`, [report.target_id]);
          break;
      }
    } else if (action !== "dismiss") {
      throw new HttpError(422, "invalid", "Unknown action.");
    }
    await q.query(`UPDATE reports SET resolved_at = now(), resolved_by = $2, resolution = $3 WHERE id = $1`, [id, admin.id, str(body.resolution, 500) || action]);
    return json({ ok: true });
  });

  r.on("GET", "/api/admin/veterans", async (req) => {
    await requireAdmin(req);
    const q = await db();
    const rows = await q.query(
      `SELECT v.id, v.branch, v.service_years, v.evidence, v.status, v.created_at, u.id AS user_id, u.name, u.email
       FROM veteran_verifications v JOIN users u ON u.id = v.user_id ORDER BY v.status = 'pending' DESC, v.created_at DESC LIMIT 200`,
    );
    return json({ verifications: rows.rows });
  });

  r.on("PATCH", "/api/admin/veterans/:id", async (req, { id }) => {
    const admin = await requireAdmin(req);
    if (!isUuid(id!)) throw new HttpError(404, "not_found", "No such request.");
    const body = (await readJson<{ action?: string }>(req)) ?? {};
    const action = str(body.action, 10);
    if (action !== "approve" && action !== "reject") throw new HttpError(422, "invalid", "Unknown action.");
    const q = await db();
    const v = await one<{ user_id: string; branch: string }>(q, `SELECT user_id, branch FROM veteran_verifications WHERE id = $1`, [id]);
    if (!v) throw new HttpError(404, "not_found", "No such request.");
    await q.query(`UPDATE veteran_verifications SET status = $2, reviewed_by = $3, reviewed_at = now() WHERE id = $1`, [id, action === "approve" ? "approved" : "rejected", admin.id]);
    if (action === "approve") await q.query(`UPDATE users SET veteran_status = 'verified', veteran_branch = $2 WHERE id = $1`, [v.user_id, v.branch]);
    return json({ ok: true });
  });

  r.on("GET", "/api/admin/companies", async (req) => {
    await requireAdmin(req);
    const q = await db();
    const rows = await q.query<Company & { owner_name: string; owner_email: string; job_count: number }>(
      `SELECT c.id, c.name, c.website, c.domain, c.description, c.verification_status, c.created_at, u.name AS owner_name, u.email AS owner_email,
         (SELECT count(*) FROM jobs j WHERE j.company_id = c.id)::int AS job_count
       FROM companies c JOIN users u ON u.id = c.owner_user_id ORDER BY c.verification_status = 'unverified' DESC, c.created_at DESC LIMIT 200`,
    );
    return json({ companies: rows.rows });
  });

  r.on("PATCH", "/api/admin/companies/:id", async (req, { id }) => {
    await requireAdmin(req);
    if (!isUuid(id!)) throw new HttpError(404, "not_found", "No such company.");
    const body = (await readJson<{ status?: string }>(req)) ?? {};
    const status = str(body.status, 20);
    if (!["unverified", "admin_verified", "rejected"].includes(status)) throw new HttpError(422, "invalid", "Unknown status.");
    const q = await db();
    await q.query(`UPDATE companies SET verification_status = $2 WHERE id = $1`, [id, status]);
    if (status === "rejected") await q.query(`UPDATE jobs SET status = 'removed' WHERE company_id = $1 AND status IN ('published', 'pending_payment')`, [id]);
    return json({ ok: true });
  });

  r.on("POST", "/api/admin/users/:id/ban", async (req, { id }) => {
    await requireAdmin(req);
    if (!isUuid(id!)) throw new HttpError(404, "not_found", "No such user.");
    const body = (await readJson<{ banned?: boolean }>(req)) ?? {};
    const banned = body.banned !== false;
    const q = await db();
    await q.query(`UPDATE users SET is_banned = $2 WHERE id = $1 AND is_admin = false`, [id, banned]);
    if (banned) await q.query(`DELETE FROM sessions WHERE user_id = $1`, [id]);
    return json({ ok: true });
  });
}
