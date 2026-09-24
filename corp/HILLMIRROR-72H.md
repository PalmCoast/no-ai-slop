# HILLMIRROR 72-hour spike plan

HillMirror blew up 09/23: 911 House PTR filings, 6,509 extracted transactions, 20 cleared the 5-buy board. Board ranks delay-adjusted copy-book vs SPY. Traffic lands on a test-mode paywall, so conversions wait on live keys.

Live: <https://hillmirror-firstdeploy.netlify.app/> · Board: <https://hillmirror-firstdeploy.netlify.app/board> · Copy: <https://hillmirror-firstdeploy.netlify.app/copy> · Roster: <https://hillmirror-firstdeploy.netlify.app/535> · Billing: <https://hillmirror-firstdeploy.netlify.app/me>

## What shipped in this repo

- `corp/shared/portfolio.ts`: HILLMIRROR listed live with Unlock $9.99/mo, Copy $24.99/mo, Founding $99/yr. Rankings probes it weekly.
- `corp/src/pages/Home.tsx`: Spiking-now box links to `/board` and `/copy`. Proof grid includes HILLMIRROR.
- `corp/src/pages/Buzz.tsx`: Cross-link to HILLMIRROR board plus Netlify Form `buzz` email capture.
- `corp/public/__forms.html`: Hidden `buzz` form so Netlify detects it.
- `corp/public/llms.txt`: HILLMIRROR with board, copy, roster URLs for crawlers and LLMs.
- `askyard/shared/catalog.ts`: HILLMIRROR on the AskYard apps shelf as featured.

## Must do on the HillMirror Netlify site (not in this repo)

HillMirror code is not in `PalmCoast/no-ai-slop`. Do these in its Netlify UI on the AgentHive First Deploy AI account:

1. Set live `STRIPE_SECRET_KEY` plus webhook. Confirm `/me` no longer says test mode.
2. Set `CLERK_SECRET_KEY` production. Confirm login persists, not a signed browser session.
3. Buy Unlock $9.99/mo live, confirm the founding gallery writes, then refund yourself. Seed yourself as member one so the wall is not empty.
4. Create promo `FOUNDING50` for the first 20 founding years at $99/yr. Promotion codes are already enabled.
5. Footer: link Built by AgentHive Inc to <https://agenthiveinc.com>, free answers to <https://askyard.firstdeploy.ai/>, desk to <https://firstdeploy.ai/>.
6. Re-push IndexNow via IndexMe.lol for `/board` and `/feed` after each scrape.

Do not push Concierge $2,000/mo as the HillMirror hero. HillMirror order is Unlock $9.99, then Copy $24.99, then Founding $99. Concierge stays for field owners at <https://agenthiveinc.com/concierge>.

## Post kit (paste verbatim, prices on the same line)

Board post:

> Moskowitz 35 buys +24.7% copy-book. Latta +23.5%. Pelosi +7.4%. Foxx -10.7%. Same rules, delay-adjusted vs SPY. <https://hillmirror-firstdeploy.netlify.app/board>

Method post, 2 hours later:

> Two books. Member book starts trade date. Copy book starts next open after disclosure. Lag erases edge. <https://hillmirror-firstdeploy.netlify.app/methodology>

Copy post, next US morning:

> Paper only. No brokerage. Tick I copied this and export the watchlist. Copy Desk $24.99/mo. <https://hillmirror-firstdeploy.netlify.app/copy>

LinkedIn company version adds one line at the end:

> Built by AgentHive Inc, Palm Coast. Unlock $9.99/mo. <https://hillmirror-firstdeploy.netlify.app/me>

Hashtags: none. Location: Palm Coast if asked.

## Verify

```bash
cd corp && npm test
npm run build
curl -s https://agenthiveinc.com/api/rank | head -c 400
```

Rankings should list HILLMIRROR live. `/buzz` should show the HILLMIRROR panel and the Buzz email form.
