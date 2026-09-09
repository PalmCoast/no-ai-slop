import type Stripe from "stripe";
import { employerVerification, JOB_DURATION_DAYS, POSTS_PER_DAY_UNVERIFIED, POSTS_PER_DAY_VERIFIED, sortApplicants, validateJob, websiteDomain, type JobInput } from "../../../shared/rules";
import type { Applicant, Company, Job } from "../../../shared/types";
import { rateLimit, requireUser, type UserRow } from "../auth";
import { db, one, type Queryable } from "../db";
import { env } from "../env";
import { HttpError, isUuid, json, readJson, Router, str } from "../http";
import { demoPaymentsAllowed, jobPostPriceCents, siteUrl, stripe, stripeConfigured } from "../stripe";
import { JOB_SELECT, veteranWindowHours } from "./jobs";

async function myCompany(q: Queryable, user: UserRow): Promise<Company | null> {
  return one<Company>(q, `SELECT id, name, website, domain, description, verification_status, created_at FROM companies WHERE owner_user_id = $1`, [user.id]);
}

async function ownedJob(q: Queryable, user: UserRow, id: string): Promise<Job> {
  if (!isUuid(id)) throw new HttpError(404, "not_found", "No such job.");
  const job = await one<Job>(
    q,
    `SELECT ${JOB_SELECT} FROM jobs j JOIN companies c ON c.id = j.company_id WHERE j.id = $2 AND (j.posted_by = $3 OR $4 = true)`,
    [String(veteranWindowHours()), id, user.id, user.is_admin],
  );
  if (!job) throw new HttpError(404, "not_found", "No such job.");
  return job;
}

export async function publishJob(q: Queryable, jobId: string, sessionId: string | null, mode: "paid" | "demo"): Promise<void> {
  await q.query(
    `UPDATE jobs SET status = 'published', paid_at = now(), stripe_session_id = COALESCE($2, stripe_session_id),
       published_at = COALESCE(published_at, now()), expires_at = COALESCE(expires_at, now() + ($3 || ' days')::interval)
     WHERE id = $1 AND status = 'pending_payment'`,
    [jobId, sessionId, String(JOB_DURATION_DAYS)],
  );
  if (sessionId) {
    await q.query(`UPDATE payments SET status = $2, paid_at = now() WHERE stripe_session_id = $1`, [sessionId, mode]);
  }
}

export function registerEmployer(r: Router): void {
  r.on("GET", "/api/employer/company", async (req) => {
    const user = await requireUser(req);
    const q = await db();
    return json({ company: await myCompany(q, user), price_cents: jobPostPriceCents(), payments: stripeConfigured() ? "stripe" : demoPaymentsAllowed() ? "demo" : "unconfigured" });
  });

  r.on("PUT", "/api/employer/company", async (req) => {
    const user = await requireUser(req);
    const body = (await readJson<Partial<Company>>(req)) ?? {};
    const name = str(body.name, 120);
    const website = str(body.website, 200);
    const description = str(body.description, 4000);
    if (name.length < 2) throw new HttpError(422, "invalid", "Company name is required.");
    const domain = websiteDomain(website);
    if (!domain) throw new HttpError(422, "invalid", "Enter the company website (for example acme.com). It is how we verify employers.");
    const q = await db();
    const existing = await myCompany(q, user);
    // Admin decisions stick; otherwise recompute self-verification from the email/website pair.
    const auto = employerVerification(user.email, website);
    const status = existing && (existing.verification_status === "admin_verified" || existing.verification_status === "rejected") ? existing.verification_status : auto;
    const company = existing
      ? await one<Company>(
          q,
          `UPDATE companies SET name = $2, website = $3, domain = $4, description = $5, verification_status = $6 WHERE id = $1
           RETURNING id, name, website, domain, description, verification_status, created_at`,
          [existing.id, name, website, domain, description, status],
        )
      : await one<Company>(
          q,
          `INSERT INTO companies (owner_user_id, name, website, domain, description, verification_status) VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, name, website, domain, description, verification_status, created_at`,
          [user.id, name, website, domain, description, status],
        );
    return json({ company });
  });

  r.on("GET", "/api/employer/jobs", async (req) => {
    const user = await requireUser(req);
    const q = await db();
    const rows = await q.query<Job>(
      `SELECT ${JOB_SELECT}, (SELECT count(*) FROM applications a WHERE a.job_id = j.id)::int AS application_count
       FROM jobs j JOIN companies c ON c.id = j.company_id WHERE j.posted_by = $2 AND j.status <> 'removed' ORDER BY j.created_at DESC`,
      [String(veteranWindowHours()), user.id],
    );
    return json({ jobs: rows.rows });
  });

  r.on("POST", "/api/employer/jobs", async (req) => {
    const user = await requireUser(req);
    const body = (await readJson<Partial<JobInput>>(req)) ?? {};
    const v = validateJob(body);
    if (!v.ok) throw new HttpError(422, "invalid_job", "Fix the highlighted problems.", v.errors);
    const q = await db();
    const company = await myCompany(q, user);
    if (!company) throw new HttpError(409, "no_company", "Set up your company profile before posting.");
    if (company.verification_status === "rejected") throw new HttpError(403, "employer_rejected", "This employer account is not allowed to post.");
    const verified = company.verification_status !== "unverified";
    await rateLimit(q, user.id, "post_job", verified ? POSTS_PER_DAY_VERIFIED : POSTS_PER_DAY_UNVERIFIED, 24);
    const j = v.value;
    const job = await one<{ id: string }>(
      q,
      `INSERT INTO jobs (company_id, posted_by, title, description, employment_type, workplace, city, state, salary_min, salary_max, seniority, skills, veteran_preferred, apply_url, requires_us_work_auth)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true) RETURNING id`,
      [company.id, user.id, j.title, j.description, j.employment_type, j.workplace, j.city, j.state, j.salary_min, j.salary_max, j.seniority, j.skills, j.veteran_preferred, j.apply_url],
    );
    return json({ job: await ownedJob(q, user, job!.id) }, { status: 201 });
  });

  r.on("PUT", "/api/employer/jobs/:id", async (req, { id }) => {
    const user = await requireUser(req);
    const q = await db();
    const existing = await ownedJob(q, user, id!);
    if (existing.status === "removed") throw new HttpError(403, "removed", "This posting was removed by moderation.");
    const body = (await readJson<Partial<JobInput>>(req)) ?? {};
    const v = validateJob(body);
    if (!v.ok) throw new HttpError(422, "invalid_job", "Fix the highlighted problems.", v.errors);
    const j = v.value;
    await q.query(
      `UPDATE jobs SET title = $2, description = $3, employment_type = $4, workplace = $5, city = $6, state = $7, salary_min = $8, salary_max = $9, seniority = $10, skills = $11, veteran_preferred = $12, apply_url = $13 WHERE id = $1`,
      [id, j.title, j.description, j.employment_type, j.workplace, j.city, j.state, j.salary_min, j.salary_max, j.seniority, j.skills, j.veteran_preferred, j.apply_url],
    );
    return json({ job: await ownedJob(q, user, id!) });
  });

  r.on("POST", "/api/employer/jobs/:id/close", async (req, { id }) => {
    const user = await requireUser(req);
    const q = await db();
    const job = await ownedJob(q, user, id!);
    if (job.status !== "published") throw new HttpError(409, "not_published", "Only published postings can be closed.");
    await q.query(`UPDATE jobs SET status = 'closed' WHERE id = $1`, [id]);
    return json({ job: await ownedJob(q, user, id!) });
  });

  r.on("GET", "/api/employer/jobs/:id/applicants", async (req, { id }) => {
    const user = await requireUser(req);
    const q = await db();
    const job = await ownedJob(q, user, id!);
    const rows = await q.query<Applicant & { created_at: string }>(
      `SELECT u.id, u.name, u.headline, u.bio, u.city, u.state, u.years_experience, u.skills, u.open_to_work, u.veteran_status, u.veteran_branch, u.created_at,
              a.id AS application_id, a.note, a.resume_url, a.status AS application_status, a.created_at AS applied_at
       FROM applications a JOIN users u ON u.id = a.user_id WHERE a.job_id = $1 AND u.is_banned = false`,
      [id],
    );
    // Veterans first is the platform's stated preference; the sort is the implementation.
    const applicants = sortApplicants(rows.rows.map((a) => ({ ...a, created_at: a.applied_at })));
    return json({ job, applicants });
  });

  r.on("PATCH", "/api/employer/applications/:id", async (req, { id }) => {
    const user = await requireUser(req);
    if (!isUuid(id!)) throw new HttpError(404, "not_found", "No such application.");
    const body = (await readJson<{ status?: string }>(req)) ?? {};
    const status = str(body.status, 20);
    if (!["submitted", "reviewed", "contacted", "declined"].includes(status)) throw new HttpError(422, "invalid", "Unknown status.");
    const q = await db();
    const updated = await q.query(
      `UPDATE applications a SET status = $2 FROM jobs j WHERE a.id = $1 AND j.id = a.job_id AND (j.posted_by = $3 OR $4 = true)`,
      [id, status, user.id, user.is_admin],
    );
    if (!updated.rowCount) throw new HttpError(404, "not_found", "No such application.");
    return json({ ok: true });
  });

  /** Start payment for a pending posting. Returns a Stripe Checkout URL, or publishes directly in demo mode. */
  r.on("POST", "/api/employer/jobs/:id/checkout", async (req, { id }) => {
    const user = await requireUser(req);
    const q = await db();
    const job = await ownedJob(q, user, id!);
    if (job.status !== "pending_payment") throw new HttpError(409, "already_paid", "This posting has already been paid for.");
    const amount = jobPostPriceCents();
    const base = siteUrl(req);

    const s = stripe();
    if (!s) {
      if (!demoPaymentsAllowed()) {
        throw new HttpError(503, "payments_unconfigured", "Payments are not configured yet. Set STRIPE_SECRET_KEY to accept job postings.");
      }
      const demoId = `demo_${job.id}`;
      await q.query(
        `INSERT INTO payments (job_id, user_id, stripe_session_id, amount_cents, status) VALUES ($1, $2, $3, $4, 'pending') ON CONFLICT (stripe_session_id) DO NOTHING`,
        [job.id, user.id, demoId, amount],
      );
      await publishJob(q, job.id, demoId, "demo");
      return json({ demo: true, url: `${base}/post/success?job=${job.id}&demo=1` });
    }

    const session = await s.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amount,
            product_data: { name: `Stateside job posting: ${job.title}`, description: `${JOB_DURATION_DAYS}-day listing on Stateside` },
          },
        },
      ],
      metadata: { job_id: job.id, user_id: user.id },
      success_url: `${base}/post/success?job=${job.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/employer?cancelled=${job.id}`,
    });
    await q.query(
      `INSERT INTO payments (job_id, user_id, stripe_session_id, amount_cents, status) VALUES ($1, $2, $3, $4, 'pending') ON CONFLICT (stripe_session_id) DO NOTHING`,
      [job.id, user.id, session.id, amount],
    );
    return json({ url: session.url });
  });

  /** Called by the success page. Confirms payment with Stripe in case the webhook has not landed yet. */
  r.on("GET", "/api/employer/checkout/confirm", async (req) => {
    const user = await requireUser(req);
    const url = new URL(req.url);
    const jobId = str(url.searchParams.get("job"), 60);
    const sessionId = str(url.searchParams.get("session_id"), 200);
    const q = await db();
    const job = await ownedJob(q, user, jobId);
    if (job.status === "published") return json({ job });
    const s = stripe();
    if (s && sessionId) {
      const session = await s.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid" && session.metadata?.job_id === job.id) {
        await publishJob(q, job.id, session.id, "paid");
      }
    }
    return json({ job: await ownedJob(q, user, jobId) });
  });

  r.on("POST", "/api/stripe/webhook", async (req) => {
    const s = stripe();
    const secret = env("STRIPE_WEBHOOK_SECRET");
    if (!s || !secret) throw new HttpError(503, "unconfigured", "Stripe webhook is not configured.");
    const signature = req.headers.get("stripe-signature") ?? "";
    let event: Stripe.Event;
    try {
      event = await s.webhooks.constructEventAsync(await req.text(), signature, secret);
    } catch (e) {
      throw new HttpError(400, "bad_signature", `Webhook signature verification failed: ${(e as Error).message}`);
    }
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const jobId = session.metadata?.job_id;
      if (session.payment_status === "paid" && jobId && isUuid(jobId)) {
        const q = await db();
        await publishJob(q, jobId, session.id, "paid");
      }
    }
    return json({ received: true });
  });
}
