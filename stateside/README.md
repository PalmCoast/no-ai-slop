# Stateside

The job network for American IT professionals. Free for job seekers. Veterans first. $10 per posting.

Stateside is a LinkedIn alternative scoped to one thing: experienced IT people in the United States finding real jobs from real employers, and talking to each other without recruiter spam.

## What it does

### For job seekers (free, always)

- Profile with headline, skills, years in IT, location, and open-to-work flag.
- Job search with state, workplace (on-site / hybrid / US-remote), level, and veteran-preferred filters.
- One-click apply with a note and resume link; saved jobs; application status tracking.
- Groups: create your own (public or private), chat in real time, moderate it yourself.
- Connections and direct messages. DMs only open after a connection is accepted, so nobody can cold-pitch you.

### Veterans first

- New postings are visible only to veteran members for their first 48 hours (`VETERAN_EARLY_ACCESS_HOURS`).
- Employers see veteran applicants at the top of every applicant list (verified, then self-reported, then everyone else by time).
- Members self-report veteran status at signup and can request a verified badge; admins approve or reject requests.
- Employers can tag postings "veteran preferred", which ranks them higher in search.

### For employers ($10 per posting, 30 days)

- Company profile verified automatically when the account email matches the company website domain. Consumer mailboxes (gmail, yahoo, etc.) are labelled unverified and capped at 3 postings a day; admins can verify them manually.
- Stripe Checkout for the $10 fee (`price_data` inline, no Stripe product setup needed). Webhook plus success-page confirmation, so a posting goes live even if the webhook is late.
- Applicant dashboard with status tracking (submitted / reviewed / contacted / declined).

### Equal-opportunity guard rails

- Every posting is a US work location and requires US work authorization; both are shown automatically.
- Descriptions that state a preference or exclusion by race, national origin, religion, sex, age, or disability are rejected at submission (`shared/rules.ts`, `containsProhibitedTargeting`). It's a plain-language screen, not a legal review; members can report anything that slips through.
- `/policies` spells out the rules for employers and members.

### Anti-spam

- Paid postings, employer domain verification, per-account posting caps, connection-request caps (20/day), DM gating behind accepted connections, message rate limits, and a report button on every job, profile, group, and message.
- Admin moderation queue: dismiss, remove content, or ban the account. Bans revoke sessions immediately and pull the user's live postings.

## Stack

- Frontend: React 18 + Vite + TypeScript, React Router. No component library; `src/styles.css` is the whole design system.
- API: one Netlify Function (`netlify/functions/api.ts`) mounted on `/api/*` with a small router. Route modules live in `netlify/lib/routes/`.
- Database: Netlify Database (Postgres) in production via `@netlify/database`; embedded Postgres (PGlite) for local development with no setup. Schema lives in `netlify/database/migrations/` and is applied by the Netlify deploy (hosted) or on first request (local).
- Auth: email + password with scrypt hashes and server-side sessions in an HttpOnly cookie. Self-contained so the whole product runs and tests locally.
- Payments: Stripe Checkout + webhook. Demo mode (no charge) only when `STRIPE_SECRET_KEY` is unset **and** `ALLOW_DEMO_PAYMENTS=true` **and** the deploy context is not production.
- Chat: 3-second polling against the messages table. Works on serverless without a websocket layer.

## Run it locally

```bash
cd stateside
npm install
cp .env.example .env          # set ADMIN_EMAILS to your address to get the admin role
npx netlify dev               # frontend + API on http://localhost:8888
```

The first request creates `.data/pglite` and applies the migrations. `npm run dev` starts only the Vite frontend on port 5173 and proxies `/api/*` to 8888, so run it next to `netlify dev` if you want frontend hot reload.

Payments run in demo mode locally (`ALLOW_DEMO_PAYMENTS=true` in `.env.example`): "Publish (demo)" publishes the posting without a charge and it's labelled as such.

```bash
npm run typecheck
npm test
npm run build
```

## Deploy to Netlify

1. Create a Netlify site from this repository. `stateside/netlify.toml` sets `base = "stateside"`, so the site builds from this folder; Sonaris in `sonaris/` is a separate site the same way.
2. Netlify Database is provisioned automatically on the first deploy because `@netlify/database` is a dependency. Migrations in `netlify/database/migrations/` are applied by the deploy. Never run DDL against the hosted database by hand.
3. Set environment variables in the Netlify UI:
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (webhook endpoint: `https://<site>/api/stripe/webhook`, event `checkout.session.completed`)
   - `ADMIN_EMAILS` — comma-separated; these accounts get the admin role on login
   - Optional: `JOB_POST_PRICE_CENTS` (default `1000`), `VETERAN_EARLY_ACCESS_HOURS` (default `48`), `SITE_URL`
4. Leave `ALLOW_DEMO_PAYMENTS` unset in production. Demo publishing is refused in the production deploy context regardless.

## Layout

```
stateside/
  index.html, src/              React app (pages/, components/, api.ts, auth.tsx, styles.css)
  shared/                       rules.ts (validation, veteran window, domain checks) and types.ts, used by both sides
  netlify/functions/api.ts      the single API function (/api/*)
  netlify/lib/                  db.ts, auth.ts, http.ts (router), stripe.ts, env.ts, routes/*
  netlify/database/migrations/  SQL schema, applied by the deploy
  tests/                        vitest unit tests for shared/rules.ts
```

## API overview

- Auth: `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- Jobs: `GET /api/jobs`, `GET /api/jobs/:id`, `POST /api/jobs/:id/apply`, `POST` and `DELETE /api/jobs/:id/save`, `GET /api/me/applications`, `GET /api/me/saved`
- Employer: `GET` and `PUT /api/employer/company`, `GET` and `POST /api/employer/jobs`, `PUT /api/employer/jobs/:id`, `POST /api/employer/jobs/:id/close`, `POST /api/employer/jobs/:id/checkout`, `GET /api/employer/jobs/:id/applicants`, `PATCH /api/employer/applications/:id`, `GET /api/employer/checkout/confirm`, `POST /api/stripe/webhook`
- Groups: `GET` and `POST /api/groups`, `GET /api/groups/:slug`, `POST /api/groups/:slug/join`, `POST /api/groups/:slug/leave`, `GET` and `POST /api/groups/:slug/members`, `GET` and `POST /api/groups/:slug/messages`, `DELETE /api/groups/:slug/messages/:id`
- People: `PUT /api/me`, `GET` and `POST /api/me/veteran-verification`, `GET /api/people`, `GET /api/people/:id`, `GET /api/connections`, `POST /api/connections/:userId`, `PATCH /api/connections/:id`, `GET /api/messages`, `GET` and `POST /api/messages/:userId`, `POST /api/reports`
- Admin: `GET /api/admin/overview`, `GET /api/admin/reports`, `PATCH /api/admin/reports/:id`, `GET /api/admin/veterans`, `PATCH /api/admin/veterans/:id`, `GET /api/admin/companies`, `PATCH /api/admin/companies/:id`, `POST /api/admin/users/:id/ban`
