# Grok / Reed — deploy the AgentHive Inc flagship update

You are a Grok Bot (or Reed) finishing a deploy another agent already built. Do not redesign the site. Do not touch Stateside or Sonaris Netlify settings. Ship `corp/` to production on **agenthiveinc.com**.

## What already shipped in git

- Repo: `https://github.com/PalmCoast/no-ai-slop`
- Branch: `cursor/agenthive-flagship-3e69`
- PR: `https://github.com/PalmCoast/no-ai-slop/pull/7`
- Code: `corp/` (Vite + React SPA + Netlify Functions)
- Tests: `cd corp && npm test` (rank math, catalog, live HTTP probe of every production catalog URL)

Pages:

- `/` swarm home
- `/about`
- `/buzz` The Buzz (weekly AI/infra briefing)
- `/rankings` live app ranking (Netlify portfolio + custom domains)
- `/build` First Deploy custom builds

Redirects already in `corp/netlify.toml`:

- `/about.html` → `/about`
- `/hive` and `/hive.html` → `/rankings`
- `/apps` and `/portfolio` → `/rankings`
- `/the-buzz` → `/buzz`

## Hard constraints

1. **AgentHiveInc.com is a separate Netlify site** from Stateside and Sonaris. Those apps also live in this repo. If you change the *repo-root* Netlify site, you will clobber them. Only change the site whose production domain is `agenthiveinc.com`.
2. Known existing site id for agenthiveinc.com (from Netlify RUM on the current HTML site): `d5d92fe5-eee9-482b-840c-b535a3333b42`. Confirm in the Netlify UI before you attach git. If the id does not match the domain, stop and use the site that actually serves `https://agenthiveinc.com`.
3. Base directory **must** be `corp`. Build `npm run build`. Publish `dist`. Node 22. `corp/netlify.toml` already encodes this.
4. Do not deploy from the repository root. Do not set base to `stateside` or `sonaris`.
5. Scheduled functions only run on **published production** deploys. A draft preview is not enough for The Buzz bot.

## Deploy sequence

### 1. Confirm the code

```bash
git fetch origin cursor/agenthive-flagship-3e69
git checkout cursor/agenthive-flagship-3e69
cd corp
npm ci
npm test
npm run build
```

If tests fail, stop and report. Do not “fix” catalog URLs by guessing new `*.netlify.app` hosts. Dead guessed hosts were already removed on purpose.

### 2. Merge only after a green production deploy preview, or merge first if Daniel wants main to be the source of truth

Preferred:

1. Attach **the agenthiveinc.com Netlify site** to `PalmCoast/no-ai-slop`.
2. Production branch: `main` after PR #7 is merged, **or** branch deploy from `cursor/agenthive-flagship-3e69` if you need it live before merge.
3. Site settings:
   - Base directory: `corp`
   - Build command: `npm run build` (or leave blank and let `netlify.toml` win)
   - Publish directory: `dist`
   - Functions directory: `netlify/functions` (relative to `corp/`)
4. Merge PR #7 into `main` once the preview looks right, then production-deploy `main`.

Manual fallback (no git wiring):

```bash
cd corp
npm ci
npm run build
npx netlify deploy --prod --dir=dist --site=d5d92fe5-eee9-482b-840c-b535a3333b42
```

Only use `--site` after you have confirmed that site id still maps to agenthiveinc.com.

### 3. Enable the weekly Grok bots

On the **agenthiveinc.com** Netlify site:

1. Enable **AI Gateway** (needed for `gpt-4o-mini` summaries in `buzz-weekly`). Do not set your own `OPENAI_API_KEY`; that bypasses the gateway.
2. Set env var `HIVE_REFRESH_SECRET` (random, site-scoped). Used by `POST /api/refresh` header `x-hive-secret`.
3. Confirm scheduled functions exist after the production deploy:
   - `buzz-weekly` — `@weekly` — writes The Buzz edition to Blobs
   - `rank-weekly` — `@weekly` — probes the portfolio and writes rankings to Blobs
4. Kick the first pass so Rankings is not stuck on catalog scores:

```bash
curl -X POST https://agenthiveinc.com/api/refresh \
  -H "x-hive-secret: $HIVE_REFRESH_SECRET"
```

Then:

```bash
curl -s https://agenthiveinc.com/api/buzz | head
curl -s https://agenthiveinc.com/api/rank | head
```

`/api/buzz` and `/api/rank` must return JSON, not `index.html`. If they return HTML, the function routes lost to the SPA catch-all — check that function `path` config deployed.

### 4. Production smoke check

Hit every URL. Expect 200 unless noted.

- `https://agenthiveinc.com/` — queen hero, 12 Grok bots
- `https://agenthiveinc.com/about`
- `https://agenthiveinc.com/buzz`
- `https://agenthiveinc.com/rankings`
- `https://agenthiveinc.com/build`
- `https://agenthiveinc.com/llms.txt`
- `https://agenthiveinc.com/about.html` — 301 to `/about`
- `https://agenthiveinc.com/hive` — 301 to `/rankings`
- `https://agenthiveinc.com/hive.html` — 301 to `/rankings`
- `https://agenthiveinc.com/api/buzz` — JSON
- `https://agenthiveinc.com/api/rank` — JSON with `sites[]`
- Click a Rankings row (First Deploy, Flick, WriteHive, Bot Lock, HiveBriefcase) and confirm the destination is live
- Assign a bot on `/` (Netlify form `mission`) and confirm a submission lands in Netlify Forms
- Phone `(509) 357-2230` and `coltsinsider@gmail.com` still in the footer

### 5. What done looks like

- `agenthiveinc.com` serves the gold/black SPA from `corp/`, not the old single-file HTML hive page
- `/buzz` shows a briefing (seed is acceptable until the first weekly run; a refresh call should store a `weekly-bot` edition if HN + gateway work)
- `/rankings` shows live/slow/down/lab pills and millisecond times after the scout runs
- Stateside (`stateside-jobs.netlify.app`) and Sonaris still deploy from their own sites, unchanged
- Report back: production URL, deploy id, `/api/buzz` method (`seed` vs `weekly-bot`), live vs down counts from `/api/rank`, and any URL that failed the smoke check

## Do not

- Redesign, rewrite copy, or add new guessed Netlify hostnames
- Force-push or amend the feature branch
- Enable auto-merge
- Point the Stateside or Sonaris Netlify sites at `corp/`
- Commit secrets
- Train or log customer form data into models

## Contacts if you get stuck

- Daniel Graham — `coltsinsider@gmail.com` / `daniel@agenthiveinc.com` / +1 509-357-2230
- Reed (CTO inbox) — `reedhive@agentmail.to`
- First Deploy voice — +1 320-335-6186
