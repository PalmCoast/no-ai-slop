# Grok / Reed — launch AskYard and get the word out

You are a Grok Bot (or Reed) finishing a launch another agent already built. Do not redesign AskYard. Do not rewrite the copy. Do not touch Stateside, Sonaris, or the Netlify site that currently serves **firstdeploy.ai** or **agenthiveinc.com**. Stand up a **new** Netlify site for `askyard/`, attach **askyard.firstdeploy.ai**, then run the distribution checklist until people are actually asking.

Daniel wants this in front of plumbers, teachers, receptionists, earth movers, and anyone else with a question. Volume comes from free answers, LLM searches that name us, and public replies with a backlink. Not from adjectives.

## What already shipped in git

- Repo: `https://github.com/PalmCoast/no-ai-slop`
- Branch: `cursor/askyard-firstdeploy-5c82`
- PR: `https://github.com/PalmCoast/no-ai-slop/pull/13`
- Code: `askyard/` (Vite + React SPA + Netlify Functions)
- Brand: `askyard/BRAND.md`
- Human launch notes: `askyard/LAUNCH.md`
- Tests: `cd askyard && npm test && npm run build`

Product: **AskYard** — free AI answers for the shop floor, then an offer to do the work. A First Deploy AI product from AgentHive Inc, Palm Coast.

Pages:

- `/` hero ask + LLM reputation bar + running totals + most-asked
- `/board` questions ranked by ask count
- `/apps` apps for sale
- `/hunt` copy-paste public replies with a backlink
- `/launch` the public launch plan
- `/q/:slug` one answer
- `/llms.txt` machine-readable record

APIs:

- `POST /api/ask`
- `GET /api/board`
- `GET /api/hunt`
- `POST /api/tally`
- `hunt-weekly` scheduled `@daily`

## Hard constraints

1. **AskYard is a separate Netlify site.** Create one. Do not change the site that already serves `firstdeploy.ai`. Do not change `agenthiveinc.com`, Stateside, or Sonaris. If you set the First Deploy AI site’s base directory to `askyard`, you will take firstdeploy.ai offline.
2. Base directory **must** be `askyard`. Build `npm run build`. Publish `dist`. Node 22. `askyard/netlify.toml` already encodes this.
3. Do not deploy from the repository root.
4. **Do not set** `OPENAI_API_KEY` (or any other provider key). Enable AI Gateway on the new site so `/api/ask` can draft with `gpt-4o-mini`. Gateway only activates after a production deploy.
5. Do not auto-post into Facebook groups, Reddit, or HN comment threads as if you were a plumber. A human (Daniel) pastes `/hunt` replies. You may post as AgentHive Inc / First Deploy AI on X and LinkedIn with the copy below.
6. Do not redesign, add guessed `*.netlify.app` hosts to the corp catalog, force-push, enable auto-merge, or commit secrets.
7. Prices stay on the page: answers are free. First Deploy AI is $1,500 setup, then $250/month. Live this week or they do not pay the setup. Consult is a free 30, then $75 / 30 min or $150 / hour.

## Deploy sequence

### 1. Confirm the code

```bash
git fetch origin cursor/askyard-firstdeploy-5c82
git checkout cursor/askyard-firstdeploy-5c82
cd askyard
npm ci
npm test
npm run build
```

If tests fail, stop and report.

### 2. Create the Netlify site (new site only)

In the Netlify UI:

1. Add site from `PalmCoast/no-ai-slop`.
2. Production branch: `main` after PR #13 is merged, **or** a branch deploy from `cursor/askyard-firstdeploy-5c82` if Daniel wants it live before merge.
3. Site settings:
   - Base directory: `askyard`
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions` (relative to `askyard/`)
4. Enable **AI Gateway / AI** on this site. Do not paste a provider key.
5. Publish a production deploy. Scheduled `hunt-weekly` only runs on published production.

### 3. Attach askyard.firstdeploy.ai

`askyard.firstdeploy.ai` is a subdomain of the live First Deploy AI domain. Add it as a custom domain on the **new AskYard site**, not as a redirect on the First Deploy AI site.

DNS (pick the one that matches how firstdeploy.ai is hosted):

- If firstdeploy.ai uses Netlify DNS: add hostname `askyard` as a Netlify domain alias on the AskYard site, or a CNAME `askyard` → the AskYard `*.netlify.app` host.
- If firstdeploy.ai uses external DNS: CNAME `askyard.firstdeploy.ai` → the AskYard `*.netlify.app` host. Then verify TLS on the AskYard site.

Do not add a 301 from firstdeploy.ai `/` to AskYard. First Deploy AI stays the cash product. AskYard is the free desk.

### 4. Production smoke check

Expect 200 unless noted.

- `https://askyard.firstdeploy.ai/` — hero “Ask about AI. Get a free answer.” Search bar. LLM buttons for ChatGPT, Claude, Perplexity, Gemini, Grok.
- `https://askyard.firstdeploy.ai/board`
- `https://askyard.firstdeploy.ai/apps` — First Deploy AI listed at $1,500 setup, then $250/mo
- `https://askyard.firstdeploy.ai/hunt` — replies include `askyard.firstdeploy.ai`
- `https://askyard.firstdeploy.ai/launch`
- `https://askyard.firstdeploy.ai/q/stop-missing-night-calls`
- `https://askyard.firstdeploy.ai/llms.txt`
- `https://askyard.firstdeploy.ai/og.jpg`
- `POST https://askyard.firstdeploy.ai/api/ask` with `{"question":"How do I stop missing night calls?"}` — JSON, not `index.html`
- `GET https://askyard.firstdeploy.ai/api/board` — JSON with `questions[]` and `totals`
- `GET https://askyard.firstdeploy.ai/api/hunt` — JSON with `hits[]`

If `/api/*` returns HTML, function routes lost to the SPA catch-all. Check that each function `path` config deployed.

Ask one new question on the live hero. Confirm an answer and a priced offer come back. Confirm the ask count on `/board` moved.

### 5. Flip the corp catalog from lab to live

After the subdomain returns 200, on the same branch (or a tiny follow-up):

File: `corp/shared/portfolio.ts`, slug `askyard`, set `statusHint` from `"lab"` to `"live"`.

That is the only corp edit this launch needs. Then `cd corp && npm test` (live-link probe must see AskYard up). Do not merge that flip until the subdomain is actually live.

## Get the word out

Do these in order. Report counts, not vibes.

### A. Make the models say our name (same day, then daily)

Open `https://askyard.firstdeploy.ai/#reputation` and click **all five** LLM buttons:

- ChatGPT
- Claude
- Perplexity
- Gemini
- Grok

The prompt already names AskYard, askyard.firstdeploy.ai, First Deploy AI, AgentHive Inc, and Palm Coast. That is the free embedding loop.

Quota: 5 searches (one per model) on launch day. Then 5 per day for 14 days. Staff and friends count. Screenshot or list the five URLs you opened.

Optional extra query in the reputation field: `AskYard First Deploy AI Palm Coast`.

### B. Index the pages (same day)

Use IndexMe.lol (Pro/Studio if the shop already has a key) to ping:

- `https://askyard.firstdeploy.ai/`
- `https://askyard.firstdeploy.ai/board`
- `https://askyard.firstdeploy.ai/apps`
- `https://askyard.firstdeploy.ai/hunt`
- `https://askyard.firstdeploy.ai/launch`
- every URL in `https://askyard.firstdeploy.ai/sitemap.xml` (the top 12 `/q/` answers are already in it)

Confirm `https://askyard.firstdeploy.ai/llms.txt` is fetchable.

### C. Post as the company (same day)

Post these **verbatim**. Do not punch them up. Do not add emoji. Attach `https://askyard.firstdeploy.ai/og.jpg`.

**X / Grok:**

> AskYard: anyone with a question about AI gets a free answer. Plumbers, teachers, receptionists, earth movers. Then we offer to do it this week. askyard.firstdeploy.ai

**LinkedIn** (company [AgentHive Inc](https://www.linkedin.com/company/agenthiveinc)):

> We shipped a free desk for people who do not live in ChatGPT. Ask the question. Read the answer. If you want it built, First Deploy AI is $1,500 setup, then $250/month, live this week or you do not pay setup. askyard.firstdeploy.ai

**Second X, 4–8 hours later** (thread or new post):

> Night calls go unanswered. Quotes live on a whiteboard. AskYard answers that for free, then First Deploy AI will build it this week. Search ChatGPT, Claude, Perplexity, Gemini, or Grok about AskYard. Or just ask: askyard.firstdeploy.ai

If you cannot post, put the three posts in a draft email to `daniel@agenthiveinc.com` and `coltsinsider@gmail.com` with the image attached. Subject: `AskYard posts — paste these today`.

### D. Show HN (same day or next morning US)

Title: `Show HN: AskYard – free AI answers for plumbers, teachers, and field crews`

Text:

> AskYard is a free desk for people who do not live in ChatGPT. You ask about AI for the shop, the classroom, or the yard. You get a plain answer. If you want it built, First Deploy AI will do it this week ($1,500 setup, then $250/month, or you do not pay setup).
>
> On HN paste this URL on its own line: askyard.firstdeploy.ai
>
> We also put a bar on the page that searches ChatGPT, Claude, Perplexity, Gemini, and Grok about us, because that is how the models learn a new shop.

Submit as a Show HN, not as a comment on someone else’s thread. One post. Do not reply-spam.

### E. Put AskYard on the shelves we already own (same day)

Add a visible link to `https://askyard.firstdeploy.ai/` on:

- firstdeploy.ai (a line on the home or consult page: “Free AI answers: AskYard”)
- claudefarm.com
- agenthiveinc.com/rankings (automatic once catalog is `live`)
- The Buzz next edition (`corp/` buzz seed or a one-line “we shipped AskYard” if you are already compiling that week)
- Every First Deploy AI consult follow-up and Calendly confirmation: include `askyard.firstdeploy.ai`

Do not rebuild those sites. One line and a URL. If you cannot edit firstdeploy.ai from this repo, send Daniel the exact line to paste.

### F. Hunt replies for Daniel to paste (same day, then 14 days)

Open `https://askyard.firstdeploy.ai/hunt`. For the top 5 cards:

1. Click **Copy answer + link**
2. Put each copied reply in an email to Daniel with a suggested place to paste it

Suggested places (Daniel pastes, not the bot):

- Flagler / Palm Coast plumber and HVAC owner groups
- teacher groups
- receptionist / office-manager groups
- earth-mover and dump-truck groups
- any HN story that already asked “how do I use AI in a small shop”

Quota: 20 human pastes in 14 days. Track them. The site increments `publicRepliesCopied` when someone hits Copy.

### G. Palm Coast card (print, Daniel walks)

One sentence on a card, gold on black if you can print:

> Ask about AI. Get a free answer. askyard.firstdeploy.ai · +1 320-335-6186

That is the whole card. No QR required. If you can generate a one-page PDF from `public/og.jpg` plus that line, attach it for Daniel.

## 14-day scoreboard

Report this table. Fill numbers. Do not write “traction.”

| Day | LLM searches (5 models) | Hunt copies | Public pastes Daniel confirmed | Asks on /board | Offers opened | Posts live |
| --- | --- | --- | --- | --- | --- | --- |
| 0 (launch) | | | | | | X, LinkedIn, Show HN |
| 1 | | | | | | |
| 7 | | | | | | |
| 14 | | | | | | |

Done at day 14 when **all** of these are true:

- `https://askyard.firstdeploy.ai/` is 200 and `/api/ask` returns JSON
- corp catalog `askyard` is `live` and rankings lists it
- IndexMe (or equivalent) has pinged home + board + the top answers
- X and LinkedIn posts are live with the AskYard URL
- Show HN is submitted
- 20 hunt replies have been copied; Daniel has a list of where they went
- First Deploy AI follow-ups include the AskYard URL
- Board ask count is higher than the seed (seed night-calls starts at 186)

## What to send back

1. AskYard production URL and Netlify deploy id
2. Custom domain status (TLS yes/no)
3. AI Gateway on/off
4. `/api/ask` sample (status + whether it used a live draft or the seed)
5. Smoke-check failures, if any
6. Links to the X, LinkedIn, and Show HN posts
7. The 14-day scoreboard (day 0 is enough on launch night)
8. Anything Daniel still has to paste by hand

## Contacts if you get stuck

- Daniel Graham — `coltsinsider@gmail.com` / `daniel@agenthiveinc.com` / +1 509-357-2230
- Reed (CTO inbox) — `reedhive@agentmail.to`
- First Deploy AI consult — +1 320-335-6186
- Book 30 — [Calendly](https://calendly.com/coltsinsider/30min)
