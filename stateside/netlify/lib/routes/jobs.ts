import { isVeteran, STATE_CODES, VETERAN_EARLY_ACCESS_HOURS_DEFAULT } from "../../../shared/rules";
import type { Job } from "../../../shared/types";
import { currentUser, rateLimit, requireUser, type UserRow } from "../auth";
import { db, one, type Queryable } from "../db";
import { envInt } from "../env";
import { HttpError, isUuid, json, readJson, Router, str } from "../http";

export function veteranWindowHours(): number {
  return envInt("VETERAN_EARLY_ACCESS_HOURS", VETERAN_EARLY_ACCESS_HOURS_DEFAULT);
}

export const JOB_SELECT = `
  j.id, j.company_id, c.name AS company_name, c.verification_status AS company_verification,
  j.title, j.description, j.employment_type, j.workplace, j.city, j.state, j.salary_min, j.salary_max,
  j.seniority, j.skills, j.veteran_preferred, j.requires_us_work_auth, j.apply_url, j.status,
  j.published_at, j.expires_at, j.created_at,
  (j.published_at IS NOT NULL AND j.published_at > now() - ($1 || ' hours')::interval) AS veteran_window`;

/** SQL fragment restricting rows to what `viewer` may see. `$1` must be the window hours. */
export function visibilityClause(viewer: UserRow | null): string {
  if (viewer?.is_admin) return `j.status = 'published'`;
  if (viewer && isVeteran(viewer.veteran_status)) return `j.status = 'published' AND (j.expires_at IS NULL OR j.expires_at > now())`;
  return `j.status = 'published' AND (j.expires_at IS NULL OR j.expires_at > now()) AND j.published_at <= now() - ($1 || ' hours')::interval`;
}

export async function decorate(q: Queryable, jobs: Job[], viewer: UserRow | null): Promise<Job[]> {
  if (!viewer || jobs.length === 0) return jobs;
  const ids = jobs.map((j) => j.id);
  const applied = new Set((await q.query<{ job_id: string }>(`SELECT job_id FROM applications WHERE user_id = $1 AND job_id = ANY($2::uuid[])`, [viewer.id, ids])).rows.map((r) => r.job_id));
  const saved = new Set((await q.query<{ job_id: string }>(`SELECT job_id FROM saved_jobs WHERE user_id = $1 AND job_id = ANY($2::uuid[])`, [viewer.id, ids])).rows.map((r) => r.job_id));
  return jobs.map((j) => ({ ...j, applied: applied.has(j.id), saved: saved.has(j.id) }));
}

export function registerJobs(r: Router): void {
  r.on("GET", "/api/jobs", async (req) => {
    const viewer = await currentUser(req);
    const url = new URL(req.url);
    const qs = url.searchParams;
    const params: unknown[] = [String(veteranWindowHours())];
    const where: string[] = [visibilityClause(viewer)];

    const text = str(qs.get("q"), 100);
    if (text) {
      params.push(`%${text}%`);
      where.push(`(j.title ILIKE $${params.length} OR j.description ILIKE $${params.length} OR c.name ILIKE $${params.length} OR array_to_string(j.skills, ' ') ILIKE $${params.length})`);
    }
    const state = str(qs.get("state"), 2).toUpperCase();
    if (state && STATE_CODES.has(state)) {
      params.push(state);
      where.push(`(j.state = $${params.length} OR j.workplace = 'remote')`);
    }
    const workplace = str(qs.get("workplace"), 10);
    if (workplace) {
      params.push(workplace);
      where.push(`j.workplace = $${params.length}`);
    }
    const seniority = str(qs.get("seniority"), 10);
    if (seniority) {
      params.push(seniority);
      where.push(`j.seniority = $${params.length}`);
    }
    const type = str(qs.get("type"), 20);
    if (type) {
      params.push(type);
      where.push(`j.employment_type = $${params.length}`);
    }
    if (qs.get("veteran_preferred") === "true") where.push(`j.veteran_preferred = true`);
    const page = Math.max(1, Number(qs.get("page") ?? 1) || 1);
    const limit = 20;
    params.push(limit, (page - 1) * limit);

    const q = await db();
    const rows = await q.query<Job>(
      `SELECT ${JOB_SELECT} FROM jobs j JOIN companies c ON c.id = j.company_id
       WHERE ${where.join(" AND ")}
       ORDER BY j.veteran_preferred DESC, j.published_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    const total = await one<{ n: string | number }>(
      q,
      // `$1::text IS NOT NULL` keeps the parameter referenced when the visibility clause does not use it.
      `SELECT count(*) AS n FROM jobs j JOIN companies c ON c.id = j.company_id WHERE $1::text IS NOT NULL AND ${where.join(" AND ")}`,
      params.slice(0, -2),
    );
    return json({ jobs: await decorate(q, rows.rows, viewer), total: Number(total?.n ?? 0), page, limit, veteran_window_hours: veteranWindowHours() });
  });

  r.on("GET", "/api/jobs/:id", async (req, { id }) => {
    if (!isUuid(id!)) throw new HttpError(404, "not_found", "No such job.");
    const viewer = await currentUser(req);
    const q = await db();
    const job = await one<Job & { posted_by: string }>(
      q,
      `SELECT ${JOB_SELECT}, j.posted_by FROM jobs j JOIN companies c ON c.id = j.company_id WHERE j.id = $2`,
      [String(veteranWindowHours()), id],
    );
    if (!job) throw new HttpError(404, "not_found", "No such job.");
    const isPoster = !!viewer && viewer.id === job.posted_by;
    if (!isPoster && !viewer?.is_admin) {
      if (job.status !== "published") throw new HttpError(404, "not_found", "This posting is no longer available.");
      if (job.veteran_window && !(viewer && isVeteran(viewer.veteran_status))) {
        throw new HttpError(403, "veteran_window", `New postings are shown to veteran members first. This one opens to everyone in under ${veteranWindowHours()} hours.`);
      }
    }
    const { posted_by: _omit, ...rest } = job;
    const [decorated] = await decorate(q, [rest as Job], viewer);
    return json({ job: decorated, is_poster: isPoster });
  });

  r.on("POST", "/api/jobs/:id/apply", async (req, { id }) => {
    const user = await requireUser(req);
    if (!isUuid(id!)) throw new HttpError(404, "not_found", "No such job.");
    const body = (await readJson<{ note?: string; resume_url?: string }>(req)) ?? {};
    const note = str(body.note, 3000);
    const resume_url = str(body.resume_url, 500);
    if (resume_url && !/^https?:\/\/\S+$/i.test(resume_url)) throw new HttpError(422, "bad_url", "Resume link must start with http:// or https://.");
    const q = await db();
    const job = await one<{ status: string; published_at: string | null; posted_by: string }>(q, `SELECT status, published_at, posted_by FROM jobs WHERE id = $1`, [id]);
    if (!job || job.status !== "published") throw new HttpError(404, "not_found", "This posting is not open.");
    if (job.posted_by === user.id) throw new HttpError(400, "own_job", "You cannot apply to your own posting.");
    const inWindow = job.published_at && Date.now() - new Date(job.published_at).getTime() < veteranWindowHours() * 3600_000;
    if (inWindow && !isVeteran(user.veteran_status)) throw new HttpError(403, "veteran_window", "This posting is in its veterans-first window.");
    await rateLimit(q, user.id, "apply", 40, 24);
    await q.query(
      `INSERT INTO applications (job_id, user_id, note, resume_url) VALUES ($1, $2, $3, $4)
       ON CONFLICT (job_id, user_id) DO UPDATE SET note = EXCLUDED.note, resume_url = EXCLUDED.resume_url`,
      [id, user.id, note, resume_url],
    );
    return json({ ok: true }, { status: 201 });
  });

  r.on("POST", "/api/jobs/:id/save", async (req, { id }) => {
    const user = await requireUser(req);
    if (!isUuid(id!)) throw new HttpError(404, "not_found", "No such job.");
    const q = await db();
    await q.query(`INSERT INTO saved_jobs (user_id, job_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [user.id, id]);
    return json({ ok: true });
  });

  r.on("DELETE", "/api/jobs/:id/save", async (req, { id }) => {
    const user = await requireUser(req);
    if (!isUuid(id!)) throw new HttpError(404, "not_found", "No such job.");
    const q = await db();
    await q.query(`DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2`, [user.id, id]);
    return json({ ok: true });
  });

  r.on("GET", "/api/me/applications", async (req) => {
    const user = await requireUser(req);
    const q = await db();
    const rows = await q.query<Job & { application_status: string; applied_at: string }>(
      `SELECT ${JOB_SELECT}, a.status AS application_status, a.created_at AS applied_at
       FROM applications a JOIN jobs j ON j.id = a.job_id JOIN companies c ON c.id = j.company_id
       WHERE a.user_id = $2 ORDER BY a.created_at DESC`,
      [String(veteranWindowHours()), user.id],
    );
    return json({ jobs: rows.rows });
  });

  r.on("GET", "/api/me/saved", async (req) => {
    const user = await requireUser(req);
    const q = await db();
    const rows = await q.query<Job>(
      `SELECT ${JOB_SELECT} FROM saved_jobs s JOIN jobs j ON j.id = s.job_id JOIN companies c ON c.id = j.company_id
       WHERE s.user_id = $2 ORDER BY s.created_at DESC`,
      [String(veteranWindowHours()), user.id],
    );
    return json({ jobs: (await decorate(q, rows.rows, user)).map((j) => ({ ...j, saved: true })) });
  });
}
