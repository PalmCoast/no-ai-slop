# Reed — the desk offer changed

Daniel's call, after the first version: other companies' products are not named on our site. That comparison is intel, and it does not go on a page, in a post, in an outbound email, or in this repo. The earlier email that named them is withdrawn. Do not post it. Do not merge a branch that still has those pages.

## The offer

One page: `https://agenthiveinc.com/switch`

- $125 a month.
- No setup fee on a plan started by November 30, 2026.
- Year one is $1,500. Year two is $1,500. The monthly does not step up.
- The monthly starts when the desk goes live. Miss the written go-live date and the first month is on us.
- After November 30, 2026, a new plan is the published price: $1,750 setup, then $250 a month.
- Cancel any time.

The price is under every paid plan checked on October 19, 2026, on the monthly line and across twelve months. The numbers behind that check were sent to you and Daniel by email. They are not in git.

## What came off

- There is one URL, `/switch`. Do not add a path under it, and do not name another company anywhere on the site.
- The buttons no longer go to `/go/switch-*` or to the $875 Stripe link. That link charges the wrong amount for this offer. Do not use it here.
- No proof-of-another-vendor step on the page.
- Do not add a line about this offer to the comparison pages in `PalmCoast/FirstDeploy`.

## Checkout

There is no card button on the page, on purpose. The call to action is the free 30 and the desk number, +1 320-335-6186.

Before anyone is charged $125, create a $125/mo Stripe price on the First Deploy account and confirm the amount in the Dashboard. Until that price exists, a buyer starts on the free 30 and you invoice only after go-live. Do not run this offer through the $875 deposit link, and do not invoice a setup balance against it.

## Deploy

1. Review and merge the updated PR for `cursor/switch-offers-35fe` to `main`.
2. agenthiveinc.com deploys from `main`, base `corp`, build `npm run build`, publish `dist`, Node 22. Netlify site id `d5d92fe5-eee9-482b-840c-b535a3333b42`.
3. When the production deploy is published:
   - `curl -sI https://agenthiveinc.com/switch` returns 200
   - view-source title starts with "After-hours desk"
   - the page contains `$125` and does not contain another company's name
   - `https://agenthiveinc.com/sitemap.xml` lists `/switch` and does not list a path under it
4. IndexNow that one URL with the key file already at the corp root (`40602f6b-ecf3-406b-a8e5-2e9f601462b6.txt`), host `agenthiveinc.com`.
5. Then run `SWITCH-MARKETING.md`. If the page is not 200, do not post.

## Who does what

- **Reed:** merge, deploy, verify, IndexNow, the $125/mo Stripe price before any charge.
- **Grok:** the posts in `SWITCH-MARKETING.md`, verbatim. The 1200×630 still in the existing agenthiveinc.com OG style.
- **Mara:** no invoice until go-live. No setup balance on this offer. The $125 price is the one you create, not the $875 link.
- **Nova:** confirm `/switch` indexes. Watch Search Console for the offer URL.
- **Sage:** on the first of each month, re-check the paid plans from the October 19 note. If one of them drops to $125 or below, tell Daniel before anyone keeps posting the price.
- **Hank:** hivesales outbound, ten shops a day, the email in the kit, one per shop. The email does not name another service.

## Scoreboard (Daniel, day 0, 3, 7)

- Free 30 bookings that cite the $125 offer
- $125 payments, after the Stripe price exists
- Search Console impressions for `/switch`

## You do not own

- Changing $125, the deadline, or the first-month line without Daniel. They live in `corp/shared/switch.ts`.
- Naming another answering service on agenthiveinc.com, firstdeploy.ai, a post, or an email.
- Sending this offer to the $875 checkout.

## Contacts

- Daniel Graham: <daniel@agenthiveinc.com>, +1 509-357-2230
- Reed inbox: <reedhive@agentmail.to>
- Sales inbox: <hivesales@agentmail.to>
- First Deploy AI desk and consult: +1 320-335-6186
