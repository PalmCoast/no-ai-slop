# Grok / Reed — deploy Aisle

You are Reed finishing a launch another agent already built. Do not redesign Aisle. Do not rewrite the copy. Do not touch Stateside, Sonaris, AskYard, NetYard, or the Netlify site that currently serves **firstdeploy.ai** or **agenthiveinc.com**. Stand up a **new** Netlify site for `aisle/`, attach **aisle.firstdeploy.ai**, turn on Stripe Checkout, smoke-check the two doors, then flip the corp catalog to live.

Daniel needs the live URL to reply to Nikita Bier. Do not post that reply yourself. Do not tweet, email, or @ Nikita. When the smoke checks pass, reply on the assignment thread with the live URL only.

## What already shipped in git

- Repo: `https://github.com/PalmCoast/no-ai-slop`
- Branch: `cursor/aisle-vertical-shops-6eae`
- PR: `https://github.com/PalmCoast/no-ai-slop/pull/30`
- Code: `aisle/` (Vite + React SPA + Netlify Functions)
- Brand: `aisle/BRAND.md`
- Tests: `cd aisle && npm test && npm run build`

Product: **Aisle**. One spec, a column per shop. Two doors ship with it: Brown Wool and Flange Tube. Publish is $29 once.

Pages:

- `/` spec field, both doors, $29 publish
- `/shop/brown-wool` brown wool sweaters
- `/shop/flange-tube` 4 inch aluminum tube with a flange
- `/build` same filter, plus a paste box for another shop's listing
- `/publish` shop name, spec, Pay $29
- `/door` named door after publish
- `/thanks` Stripe or demo confirmation
- `/llms.txt` machine-readable record

APIs:

- `POST /api/checkout` `{ shopName, query }` builds Stripe Checkout with `price_data.unit_amount` 2900. Do not create a fixed Stripe Price.
- `GET /api/order?session_id=` paid-session check for `/thanks`
- `POST /api/stripe-webhook` `checkout.session.completed` and `checkout.session.async_payment_succeeded`

## Hard constraints

1. **Aisle is a separate Netlify site.** Create one. If you set the First Deploy AI site's base directory to `aisle`, you will take firstdeploy.ai offline.
2. Base directory **must** be `aisle`. Build `npm run build`. Publish `dist`. Functions `netlify/functions`. Node 22. `aisle/netlify.toml` already encodes this.
3. Do not deploy from the repository root.
4. Deploy the branch `cursor/aisle-vertical-shops-6eae` now, before the PR merges. Daniel needs the host today. After merge, point production at `main`.
5. Do not auto-post to X, LinkedIn, Facebook, Reddit, or HN. Daniel posts the Nikita reply.
6. Do not add a guessed `*.netlify.app` host to the corp catalog. The public URL is `https://aisle.firstdeploy.ai/`.
7. Do not commit `sk_live` or `whsec`.

## Stripe

On the **new** Aisle site only:

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SITE_URL=https://aisle.firstdeploy.ai
```

Use the live Palm Coast AI account (`acct_1SqPSHFJWYd4pYux`). Checkout creates the $29 charge from `price_data`. Do not make a new Product or Price in the Stripe dashboard.

Webhook:

1. Endpoint `https://aisle.firstdeploy.ai/api/stripe-webhook`
2. Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`
3. Put the signing secret in `STRIPE_WEBHOOK_SECRET`

Without the secret, `/publish` still records a demo claim. After the secret is set, Pay $29 must land on `checkout.stripe.com` for **$29.00**. Do not complete a live charge unless Daniel asks.

## Deploy sequence

### 1. Confirm the code

```bash
git fetch origin cursor/aisle-vertical-shops-6eae
git checkout cursor/aisle-vertical-shops-6eae
cd aisle
npm ci
npm test
npm run build
```

If tests fail, stop and report.

### 2. Create the Netlify site (new site only)

1. Add site from `PalmCoast/no-ai-slop`.
2. Production branch: `cursor/aisle-vertical-shops-6eae` until PR 30 merges, then `main`.
3. Base directory: `aisle`
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Functions directory: `netlify/functions` (relative to `aisle/`)
7. Set the three env vars above.
8. Publish a production deploy.

### 3. Attach aisle.firstdeploy.ai

Add `aisle.firstdeploy.ai` as a custom domain on the **new Aisle site**, not as a redirect on the First Deploy AI site.

- If firstdeploy.ai uses Netlify DNS: add hostname `aisle` on the Aisle site.
- If firstdeploy.ai uses external DNS: CNAME `aisle.firstdeploy.ai` to the Aisle `*.netlify.app` host, then verify TLS.

Do not 301 firstdeploy.ai `/` to Aisle.

### 4. Production smoke check

Expect 200.

- `https://aisle.firstdeploy.ai/` shows "One spec. Every shop that has it." and both doors
- `https://aisle.firstdeploy.ai/shop/flange-tube` shows Flange Tube, shop columns, and a near-miss row
- `https://aisle.firstdeploy.ai/shop/brown-wool` shows Brown Wool
- `https://aisle.firstdeploy.ai/publish` shows Pay $29
- `https://aisle.firstdeploy.ai/llms.txt`
- `POST https://aisle.firstdeploy.ai/api/checkout` with `{"shopName":"Flange Tube","query":"4 inch aluminum tube with a flange"}` returns JSON with a Stripe Checkout URL once the secret is set

If `/api/*` returns HTML, the function routes lost to the SPA catch-all.

### 5. Flip the corp catalog from lab to live

After the subdomain returns 200, on this same branch:

File: `corp/shared/portfolio.ts`, slug `aisle`:

- `url`: `https://aisle.firstdeploy.ai/`
- `host`: `custom`
- `statusHint`: `"live"`

That is the only catalog edit. Do not flip it before the subdomain is actually live. Then `cd corp && npm test`.

### 6. Report

Reply on the assignment email with:

- `https://aisle.firstdeploy.ai/`
- `https://aisle.firstdeploy.ai/shop/flange-tube`
- Stripe: Checkout URL or still demo
- Catalog flip: done or waiting

Daniel posts the Nikita reply. You do not.
