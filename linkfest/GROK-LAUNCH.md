# Grok / Reed — launch Link Fest

You are a Grok Bot (or Reed) finishing a launch another agent already built. Do not redesign Link Fest. Do not rewrite the copy. Do not touch the Netlify site that currently serves **indexme.lol**, **firstdeploy.ai**, or **agenthiveinc.com**. Stand up a **new** Netlify site for `linkfest/`, attach **linkfest.indexme.lol**, then post the lines below.

## What already shipped in git

- Repo: `https://github.com/PalmCoast/no-ai-slop`
- Branch: `cursor/indexme-link-fest-fb1f`
- PR: `https://github.com/PalmCoast/no-ai-slop/pull/67`
- Code: `linkfest/` (Vite + React + one Netlify Function)
- Brand: `linkfest/BRAND.md` (IndexMe ink, paper, acid `#d8ff36`, Manrope, DM Mono)
- Tests: `cd linkfest && npm test && npm run build`

Product: **Link Fest**. A board of real outbound links for IndexMe.lol. A passing check is a follow link to `https://indexme.lol/` with IndexMe in the anchor text. The fest is free. Pro is $19.99 and Studio is $29.99, one time, on the desk. This page does not run a second checkout.

## Hard constraints

1. **Link Fest is a separate Netlify site.** Create one. If you set the IndexMe site’s base directory to `linkfest`, you will take indexme.lol offline.
2. Base directory **must** be `linkfest`. Build `npm run build`. Publish `dist`. Functions `netlify/functions`. Node 22. `linkfest/netlify.toml` already encodes this.
3. Do not deploy from the repository root.
4. No environment variables. No Stripe keys. No AI keys.
5. Do not add `linkfest.indexme.lol` to the corp portfolio until the host returns 200. `corp/tests/live-links.test.ts` fetches every live URL.
6. Do not redesign, force-push, enable auto-merge, or commit secrets.
7. Canonical tags, the sitemap, and `llms.txt` already use `https://linkfest.indexme.lol`. If the public host is different, change `SITE_ORIGIN` in `linkfest/shared/brand.ts` and the matching tags in `linkfest/index.html` before the production build.

## DNS and the check

1. Create the Netlify site from this repo, base `linkfest`, after the PR is on `main` (or deploy the PR branch as a preview first).
2. Attach `linkfest.indexme.lol`. Netlify will show the CNAME or A record. Put that on the indexme.lol DNS.
3. Confirm these URLs return 200:
   - `https://linkfest.indexme.lol/`
   - `https://linkfest.indexme.lol/badge.svg`
   - `https://linkfest.indexme.lol/og.png`
   - `https://linkfest.indexme.lol/llms.txt`
4. Confirm the function:

```bash
curl -s -X POST https://linkfest.indexme.lol/api/check \
  -H 'content-type: application/json' \
  -d '{"url":"https://indexme.lol/"}'
```

Expect `"status":"linked"`. Then:

```bash
curl -s -X POST https://linkfest.indexme.lol/api/check \
  -H 'content-type: application/json' \
  -d '{"url":"http://127.0.0.1/"}'
```

Expect `"status":"blocked"`.

On the page, click **Try indexme.lol**. The status word is LINKED. Click **Copy the anchor**. The button reads Copied.

## Posts (after the host returns 200)

Paste these. Do not add a line that is not on the site. Attach `linkfest/public/og.png`.

### X

```text
Link Fest is up. Put a visible link to IndexMe.lol on your site. The board links back. The idea stays on the page that wrote it.

https://linkfest.indexme.lol

The desk is still https://indexme.lol. Pro $19.99. Studio $29.99. One time.
```

### LinkedIn

```text
Link Fest is the IndexMe.lol board of real outbound links.

Put a visible follow link to https://indexme.lol/ on your site, with IndexMe in the anchor. The board links back. A copied checklist with the link left off does not get a card.

https://linkfest.indexme.lol

Starter is free on the desk. Pro is $19.99. Studio is $29.99. One time. AgentHive Inc, Palm Coast.
```

## Done when

- `https://linkfest.indexme.lol/` returns 200 with TLS
- `POST /api/check` for `https://indexme.lol/` returns `linked`
- `POST /api/check` for `http://127.0.0.1/` returns `blocked`
- X and LinkedIn used the copy above and `og.png`
- Reply to Daniel with those four checks

## Contacts

- Daniel Graham — `coltsinsider@gmail.com` / `daniel@agenthiveinc.com` / +1 509-357-2230
- Reed (CTO inbox) — `reedhive@agentmail.to`
- IndexMe — `hello@indexme.lol`
