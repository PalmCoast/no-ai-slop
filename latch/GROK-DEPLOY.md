# Grok / Reed — deploy Latch on latch.agenthiveinc.com

**Assigned to Reed.** Daniel assigned this deploy. Do not redesign Latch. Do not rewrite the page. Do not claim it treats autism, ADHD, or CPTSD.

This file stays off camera. Never post Stripe keys, license signing, or function paths in public.

## What already shipped in git

- Repo: `https://github.com/PalmCoast/no-ai-slop`
- Branch: `cursor/latch-adhd-app-03b3`
- PR: `https://github.com/PalmCoast/no-ai-slop/pull/32`
- Code: `latch/` (Vite + React SPA + Netlify Functions)
- Tests: `cd latch && npm test && npm run build`
- Job ticket: `latch/REED-ASSIGNMENT.md`

Product: **Latch** — one task, a timer you can see coming, a place to park the other thought, and a stop when it is too much. For AuDHD (autism and ADHD together) and for CPTSD. The timer is free. The record is $29 once. Sold by AgentHive Inc, Palm Coast.

## Hard constraints

1. **New Netlify site only.** Do not attach `latch/` to the site that serves `agenthiveinc.com` (`d5d92fe5-eee9-482b-840c-b535a3333b42` / `dashing-cascaron-ddd950`). Do not change firstdeploy.ai, Stateside, Sonaris, or AskYard. Changing one of those base directories takes that site offline.
2. Base directory **must** be `latch`. Build `npm run build`. Publish `dist`. Functions `netlify/functions` (relative to `latch/`). Node 22. `latch/netlify.toml` already encodes this.
3. Do not deploy from the repository root.
4. Production host is the subdomain **`https://latch.agenthiveinc.com`**. Not a path on agenthiveinc.com. Not a `*.firstdeploy.ai` host.
5. DNS: add a CNAME for the host `latch` only, pointing at the new site's `*.netlify.app` name. Do not change the apex record for `agenthiveinc.com`.
6. `STRIPE_SECRET_KEY` goes on the **new Latch site only**, and only if the live Palm Coast Stripe secret is already in hand. Do not invent a key. Do not commit it. Do not run a live charge. Without the key, **Get the record** issues a demo key and charges nothing. That is correct.
7. No Stripe webhook. Checkout returns to `/?session_id=` and the page calls `/api/confirm`. The same `STRIPE_SECRET_KEY` signs the license token.
8. Do not set `OPENAI_API_KEY` or any other provider key. Latch does not call a model.
9. Do not redesign, force-push, enable auto-merge, or put task text in Stripe metadata. Checkout sends the product name and the price, not the words on the screen.

## Deploy sequence

### 1. Confirm the code

```bash
git fetch origin cursor/latch-adhd-app-03b3
git checkout cursor/latch-adhd-app-03b3
cd latch
npm ci
npm test
npm run build
```

If tests fail, stop and report. Do not "fix" copy.

### 2. Create the site and deploy this branch now

Deploy before the PR merges. Production can move to `main` after PR #32 merges.

1. Create a new Netlify site. Suggested name: `latch-agenthive`.
2. Link it to `PalmCoast/no-ai-slop`.
3. Branch to deploy now: `cursor/latch-adhd-app-03b3`.
4. Site settings:
   - Base directory: `latch`
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions` (relative to `latch/`)
5. Add custom domain `latch.agenthiveinc.com` on **this** site. Wait until HTTPS is provisioned.
6. Environment, this site only:
   - `SITE_URL` = `https://latch.agenthiveinc.com`
   - `STRIPE_SECRET_KEY` = the live Palm Coast secret, if you already have it. Otherwise leave it unset.

Manual fallback after `npm run build`:

```bash
cd latch
npx netlify deploy --prod --dir=dist --site=<the new Latch site id>
```

Confirm `--site` is the new site before you run that. Never pass the agenthiveinc.com site id.

### 3. Smoke

All of these must pass before you reply:

```bash
curl -sI https://latch.agenthiveinc.com/ | head -n 15
curl -s https://latch.agenthiveinc.com/ | grep -F "AuDHD means autism and ADHD together"
curl -s https://latch.agenthiveinc.com/ | grep -F "does not treat autism, ADHD, or CPTSD"
curl -s -X POST https://latch.agenthiveinc.com/api/checkout \
  -H "content-type: application/json" \
  -d '{}'
```

- Home returns 200 over HTTPS on `latch.agenthiveinc.com`.
- The HTML contains the AuDHD line and the "does not treat" line.
- Checkout: if `STRIPE_SECRET_KEY` is set, the JSON has a `url` on `checkout.stripe.com` and `"demo":false`. If it is unset, the JSON has `"demo":true` and a `LATCH-DEMO-` key. Do not pay.

### 4. Portfolio, only after the subdomain returns 200

On a small follow-up, add Latch to `corp/shared/portfolio.ts` with `url: "https://latch.agenthiveinc.com/"`, `statusHint: "live"`, price `$29 once` for the record, and the free timer in the description. Not before the host is actually up. Do not change the agenthiveinc.com site's base directory to do that.

## Reply

Reply on the assignment thread with:

- The live home URL
- Whether HTTPS is on `latch.agenthiveinc.com`
- Whether checkout is demo or a real Stripe URL
- The new Netlify site name (not the flagship site)

## Contacts

- Daniel Graham — `coltsinsider@gmail.com` / `daniel@agenthiveinc.com` / +1 509-357-2230
- Reed inbox — `reedhive@agentmail.to`
