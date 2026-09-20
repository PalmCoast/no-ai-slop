# Grok / Reed — launch NetYard, take Stripe, post the graphics

You are a Grok Bot (or Reed) finishing a launch another agent already built. Do not redesign NetYard. Do not rewrite the copy. Do not touch Stateside, Sonaris, AskYard, or the Netlify site that currently serves **firstdeploy.ai** or **agenthiveinc.com**. Stand up a **new** Netlify site for `netyard/`, attach **netyard.firstdeploy.ai**, turn on Stripe Checkout, then run the distribution checklist using the launch video and screenshots that already ship in git.

Daniel wants this in front of plumbers, HVAC shops, clinics, and anyone else who was quoted Windows Server plus CALs. The wizard is free. Money is Stripe.

## What already shipped in git

- Repo: `https://github.com/PalmCoast/no-ai-slop`
- Branch: `cursor/netyard-network-standup-470a`
- PR: `https://github.com/PalmCoast/no-ai-slop/pull/17`
- Code: `netyard/` (Vite + React SPA + Netlify Functions)
- Brand: `netyard/BRAND.md`
- Human launch notes: `netyard/LAUNCH.md`
- Tests: `cd netyard && npm test && npm run build`

Product: **NetYard** — stand up a small-business network without Microsoft Server. A First Deploy AI product from AgentHive Inc, Palm Coast.

Pages:

- `/` six-question standup wizard
- `/plan` generated LAN, Samba AD/workgroup, shopping list, Debian scripts
- `/tools` subnet calculator and VLAN cheat sheet
- `/compare` Samba vs Windows Server CALs
- `/buy` Stripe checkout for rack, desk, and consult
- `/launch` Harbor HVAC standup video + every screenshot
- `/thanks` Stripe session confirmation
- `/llms.txt` machine-readable record

APIs:

- `POST /api/checkout` `{ offer, shop? }` → Stripe Checkout Session URL, or a live payment-link fallback
- `GET /api/order?session_id=` paid-session check for `/thanks`
- `POST /api/stripe-webhook` `checkout.session.completed`

Launch media (use these, do not remake them):

- `https://netyard.firstdeploy.ai/launch/standup.mp4`
- `https://netyard.firstdeploy.ai/launch/wizard-home.webp`
- `https://netyard.firstdeploy.ai/launch/wizard-needs.webp`
- `https://netyard.firstdeploy.ai/launch/plan-overview.webp`
- `https://netyard.firstdeploy.ai/launch/vlans.webp`
- `https://netyard.firstdeploy.ai/launch/scripts.webp`
- `https://netyard.firstdeploy.ai/launch/tools.webp`
- `https://netyard.firstdeploy.ai/launch/compare.webp`
- `https://netyard.firstdeploy.ai/og.jpg`

## Hard constraints

1. **NetYard is a separate Netlify site.** Create one. Do not change the site that already serves `firstdeploy.ai`. Do not change `agenthiveinc.com`, AskYard, Stateside, or Sonaris. If you set the First Deploy AI site’s base directory to `netyard`, you will take firstdeploy.ai offline.
2. Base directory **must** be `netyard`. Build `npm run build`. Publish `dist`. Functions `netlify/functions`. Node 22. `netyard/netlify.toml` already encodes this.
3. Do not deploy from the repository root.
4. **Turn Stripe on.** Prices already exist on live Palm Coast AI (`acct_1SqPSHFJWYd4pYux`). Do not create new products. Do not change amounts. Do not set provider AI keys.
5. Do not auto-post into Facebook groups, Reddit, or HN comment threads as if you were a plumber. You may post as AgentHive Inc / First Deploy AI on X and LinkedIn with the copy below. Attach the video and screenshots from `/launch`.
6. Do not redesign, add guessed `*.netlify.app` hosts to the corp catalog, force-push, enable auto-merge, or commit secrets.
7. Prices stay on the page: wizard is free. First Deploy AI / NetYard rack is $1,500 setup, then $250/month. Live this week or they do not pay the setup. Consult is a free 30, then $75 / 30 min or $150 / hour.

## Stripe (do this before the marketing posts)

Live catalog already in code (`netyard/shared/offers.ts`):

| Offer | Amount | Price ID | Payment link fallback |
| --- | --- | --- | --- |
| Rack this network | $1,500 one-time | `price_1UHpioFJWYd4pYuxawfgIoHJ` | https://buy.stripe.com/dRm6oH6UI9P5ePb0PM2ZO1n |
| NetYard desk | $250/mo | `price_1UHpipFJWYd4pYuxCrWZNXmY` | https://buy.stripe.com/8x2aEXcf2e5lfTf41Y2ZO1o |
| 30-minute consult | $75 | `price_1UEsXoFJWYd4pYuxvYOkG9Wf` | https://buy.stripe.com/fZufZh92Qf9p5eB2XU2ZO1h |
| 1-hour consult | $150 | `price_1UEsXpFJWYd4pYuxhhAVBevZ` | https://buy.stripe.com/eVq9ATbaY6CT6iF7ea2ZO1g |
| 10-hour pack deposit | $625 of $1,250 | `price_1UEsXpFJWYd4pYuxDO35XzUU` | https://buy.stripe.com/7sY9ATenabXd7mJ7ea2ZO1i |

Products: rack `prod_VIQZ7VszWOYsdk`, desk `prod_VIQZdLIGHVUBiH`. Consult products already existed.

On the **new** NetYard Netlify site, set:

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SITE_URL=https://netyard.firstdeploy.ai
```

Optional overrides (defaults are already in code):

```
STRIPE_PRICE_ID_RACK=price_1UHpioFJWYd4pYuxawfgIoHJ
STRIPE_PRICE_ID_MONTHLY=price_1UHpipFJWYd4pYuxCrWZNXmY
STRIPE_PRICE_ID_CONSULT_30=price_1UEsXoFJWYd4pYuxvYOkG9Wf
STRIPE_PRICE_ID_CONSULT_HOUR=price_1UEsXpFJWYd4pYuxhhAVBevZ
STRIPE_PRICE_ID_PACK=price_1UEsXpFJWYd4pYuxDO35XzUU
```

Webhook in Stripe Dashboard (live Palm Coast AI):

1. Endpoint `https://netyard.firstdeploy.ai/api/stripe-webhook`
2. Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`
3. Put the signing secret in `STRIPE_WEBHOOK_SECRET`

`/api/checkout` opens a Checkout Session when the secret is set. If the secret is missing it still sends the buyer to the live payment-link fallback so money is not blocked. After the secret is set, confirm `/buy` → Pay setup lands on `checkout.stripe.com`, not a demo JSON blob.

Do not commit `sk_live` or `whsec`.

## Deploy sequence

### 1. Confirm the code

```bash
git fetch origin cursor/netyard-network-standup-470a
git checkout cursor/netyard-network-standup-470a
cd netyard
npm ci
npm test
npm run build
```

If tests fail, stop and report.

### 2. Create the Netlify site (new site only)

In the Netlify UI:

1. Add site from `PalmCoast/no-ai-slop`.
2. Production branch: `main` after PR #17 is merged, **or** a branch deploy from `cursor/netyard-network-standup-470a` if Daniel wants it live before merge.
3. Site settings:
   - Base directory: `netyard`
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions` (relative to `netyard/`)
4. Set the Stripe env vars above. Do not paste a provider AI key.
5. Publish a production deploy.

### 3. Attach netyard.firstdeploy.ai

`netyard.firstdeploy.ai` is a subdomain of the live First Deploy AI domain. Add it as a custom domain on the **new NetYard site**, not as a redirect on the First Deploy AI site.

DNS (pick the one that matches how firstdeploy.ai is hosted):

- If firstdeploy.ai uses Netlify DNS: add hostname `netyard` as a Netlify domain alias on the NetYard site, or a CNAME `netyard` → the NetYard `*.netlify.app` host.
- If firstdeploy.ai uses external DNS: CNAME `netyard.firstdeploy.ai` → the NetYard `*.netlify.app` host. Then verify TLS on the NetYard site.

Do not add a 301 from firstdeploy.ai `/` to NetYard. First Deploy AI stays the cash product. NetYard is the free planner plus Stripe for the rack.

### 4. Production smoke check

Expect 200 unless noted.

- `https://netyard.firstdeploy.ai/` — wizard “Stand up a shop network without Microsoft Server.”
- `https://netyard.firstdeploy.ai/plan?demo=1` — Harbor HVAC / plumbing demo, Samba AD, Guest VLAN 30
- `https://netyard.firstdeploy.ai/tools`
- `https://netyard.firstdeploy.ai/compare`
- `https://netyard.firstdeploy.ai/buy` — five Stripe cards at $1,500 / $250/mo / $75 / $150 / $625
- `https://netyard.firstdeploy.ai/launch` — `<video src="/launch/standup.mp4">` plus the seven webp shots
- `https://netyard.firstdeploy.ai/launch/standup.mp4` — video bytes, not HTML
- `https://netyard.firstdeploy.ai/og.jpg`
- `https://netyard.firstdeploy.ai/llms.txt`
- `POST https://netyard.firstdeploy.ai/api/checkout` with `{"offer":"rack"}` — JSON `{ url }` pointing at Stripe, not `index.html`

Click **Pay setup** on `/buy`. Confirm Stripe Checkout (or the live payment link) shows **$1,500**. Do not complete a live charge unless Daniel asks.

If `/api/*` returns HTML, function routes lost to the SPA catch-all. Check that each function `path` config deployed.

### 5. Flip the corp catalog from lab to live

After the subdomain returns 200, on the same branch (or a tiny follow-up):

File: `corp/shared/portfolio.ts`, slug `netyard`:

- `url`: `https://netyard.firstdeploy.ai/`
- `host`: `custom`
- `statusHint`: `"live"`

That is the only corp edit this launch needs. Then `cd corp && npm test`. Do not merge that flip until the subdomain is actually live.

## Get the word out

Do these in order. **Marketing must use the graphics and video on `/launch`.** Do not generate new hero art. Do not post without the video or at least two screenshots.

### A. Make the models say our name (same day, then daily)

Search ChatGPT, Claude, Perplexity, Gemini, and Grok with the prompt already in `netyard/shared/brand.ts` (`ASK_AI_PROMPT`). That names NetYard, netyard.firstdeploy.ai, First Deploy AI, AgentHive Inc, and Palm Coast.

Quota: 5 searches (one per model) on launch day. Then 5 per day for 14 days.

### B. Index the pages (same day)

Use IndexMe.lol to ping:

- `https://netyard.firstdeploy.ai/`
- `https://netyard.firstdeploy.ai/buy`
- `https://netyard.firstdeploy.ai/launch`
- `https://netyard.firstdeploy.ai/compare`
- `https://netyard.firstdeploy.ai/tools`
- `https://netyard.firstdeploy.ai/plan`
- every URL in `https://netyard.firstdeploy.ai/sitemap.xml`

Confirm `https://netyard.firstdeploy.ai/llms.txt` is fetchable.

### C. Post as the company (same day)

Post these **verbatim**. Do not punch them up. Do not add emoji.

Attach **all** of:

1. `standup.mp4` (the Harbor HVAC wizard run)
2. `wizard-home.webp`
3. `plan-overview.webp`
4. `vlans.webp`
5. `og.jpg`

If the network only lets you attach one video + a few images, attach the video first, then `plan-overview.webp` and `vlans.webp`.

**X / Grok:**

> NetYard: six questions, a shop network, no Microsoft Server CALs. Samba on Debian, guest Wi-Fi, install scripts. Pay the rack on Stripe. netyard.firstdeploy.ai/launch

**LinkedIn** (company [AgentHive Inc](https://www.linkedin.com/company/agenthiveinc)):

> We shipped NetYard. A plumber or HVAC shop answers six questions and walks out with VLANs, Samba AD, a shopping list, and Debian install scripts. No Windows Server User CALs. If you want us to rack it, First Deploy AI is $1,500 setup, then $250/month, live this week or you do not pay setup. Pay on Stripe: netyard.firstdeploy.ai/buy Watch the standup: netyard.firstdeploy.ai/launch

**Second X, 4–8 hours later** (thread or new post). Attach `scripts.webp` and `compare.webp`:

> Windows Server Standard plus 12 User CALs is about $1,680 before the box. NetYard writes Samba on Debian and the scripts for $0 on the license line. Harbor HVAC through the wizard is on the launch page. netyard.firstdeploy.ai/launch

If you cannot post, put the three posts in a draft email to `daniel@agenthiveinc.com` and `coltsinsider@gmail.com` with the video and screenshots attached. Subject: `NetYard posts — paste these today`.

### D. Show HN (same day or next morning US)

Title: `Show HN: NetYard – stand up a shop network without Microsoft Server`

Text:

> NetYard is a free planner for small shops that were quoted Windows Server plus CALs for a file share. Six questions. You get VLANs, Samba AD or a workgroup, guest Wi-Fi, a shopping list, and Debian install scripts.
>
> If you want it racked, First Deploy AI is $1,500 setup, then $250/month, live this week or you do not pay setup. Pay on Stripe.
>
> Demo video and screenshots: netyard.firstdeploy.ai/launch
> Wizard: netyard.firstdeploy.ai

Submit as a Show HN, not as a comment on someone else’s thread. One post. Do not reply-spam. Link `/launch` so the graphics travel.

### E. Put NetYard on the shelves we already own (same day)

Add a visible link to `https://netyard.firstdeploy.ai/` on:

- firstdeploy.ai (a line: “Stand up a shop network without Microsoft Server: NetYard”)
- askyard.firstdeploy.ai apps shelf if it is live
- agenthiveinc.com/rankings (automatic once catalog is `live`)
- The Buzz next edition
- Every First Deploy AI consult follow-up: include `netyard.firstdeploy.ai/buy` and `netyard.firstdeploy.ai/launch`

Do not rebuild those sites. One line and a URL. If you cannot edit firstdeploy.ai from this repo, send Daniel the exact line to paste.

### F. Palm Coast card (print, Daniel walks)

One sentence on a card, gold on black if you can print:

> Skip the CALs. Stand up the LAN. netyard.firstdeploy.ai · +1 320-335-6186

If you can generate a one-page PDF from `public/og.jpg` plus that line, attach it for Daniel.

## 14-day scoreboard

Report this table. Fill numbers. Do not write “traction.”

| Day | LLM searches (5 models) | Stripe checkout opens | Posts live | IndexMe pings | Notes |
| --- | --- | --- | --- | --- | --- |
| 0 (launch) | | | X, LinkedIn, Show HN | | video + shots attached |
| 1 | | | | | |
| 7 | | | | | |
| 14 | | | | | |

Done at day 14 when **all** of these are true:

- `https://netyard.firstdeploy.ai/` is 200 and `/api/checkout` returns a Stripe URL
- `/launch` serves `standup.mp4` and the seven webps
- corp catalog `netyard` is `live` and rankings lists it
- IndexMe has pinged home + buy + launch + compare
- X and LinkedIn posts are live with the video/screenshots and the NetYard URL
- Show HN is submitted with `/launch`
- First Deploy AI follow-ups include the NetYard URL
- At least one real Stripe Checkout Session has been opened (not necessarily paid)

## What to send back

1. NetYard production URL and Netlify deploy id
2. Custom domain status (TLS yes/no)
3. Stripe env vars set (yes/no — do not paste secrets)
4. Webhook endpoint id
5. `/api/checkout` sample (status + whether `url` is checkout.stripe.com or a buy.stripe.com fallback)
6. Smoke-check failures, if any
7. Links to the X, LinkedIn, and Show HN posts (confirm the video/screenshots attached)
8. The 14-day scoreboard (day 0 is enough on launch night)
9. Anything Daniel still has to paste by hand

## Contacts if you get stuck

- Daniel Graham — `coltsinsider@gmail.com` / `daniel@agenthiveinc.com` / +1 509-357-2230
- Reed (CTO inbox) — `reedhive@agentmail.to`
- First Deploy AI consult — +1 320-335-6186
- Book 30 — [Calendly](https://calendly.com/coltsinsider/30min)
