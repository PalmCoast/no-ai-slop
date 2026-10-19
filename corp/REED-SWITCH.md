# Reed — you own the switch offers

Daniel asked for the top two sites that compete with First Deploy AI, a better offer against each, published, then promoted. The research, the offers, the pages, the tests, and the kit are built. You finish the deploy and run the kit. Do not redesign. Do not change the numbers. Do not leak the wiring.

## What already shipped in git

- Repo: `https://github.com/PalmCoast/no-ai-slop`
- Branch: `cursor/switch-offers-35fe`
- Code: `corp/` (the agenthiveinc.com site)
- Offer data, one file: `corp/shared/switch.ts`
- Pages: `corp/src/pages/Switch.tsx`, `corp/src/pages/SwitchOffer.tsx`
- Tests: `cd corp && npm test && npm run build` (42 tests, all green on 2026-10-19)
- Public kit: `corp/SWITCH-MARKETING.md`

## The two competitors and why

First Deploy AI is an after-hours AI phone desk for trade shops. The two published answering services a shop prices it against most often, and the two firstdeploy.ai already compares itself to, are:

1. **Smith.ai** (AI Receptionist). Per-call plans. Free 25 calls. Pro $150/mo for 75 calls, "set it up yourself." Enterprise $500/mo for 300 calls, "we build and run a custom solution for you." 30 days' notice to cancel. Read 2026-10-19 from <https://smith.ai/pricing/ai-receptionist>.
2. **Ruby** (live virtual receptionists). Minute bundles. Call Ruby 50 is $250/mo for 50 receptionist minutes, $5.40 an overage minute; 100 at $395; 200 at $720; 350 at $1,210; 500 at $1,725. Billed in 60-second increments, rounded up, hold time included. Read 2026-10-19 from <https://rubyhelpcenter.helpjuice.com/en_US/billing-plans/am-i-on-the-right-billing-plan> and <https://www.ruby.com/terms/>.

Goodcall ($79/mo, per unique customer) was considered and left out. It is cheaper than us on every line and does not do the build; the honest page would be "stay on Goodcall." The two above are the ones where our offer wins on the done-for-you tier and on the meter.

## The offer (same for both)

- $875 setup for a verified Smith.ai or Ruby customer. Published setup stays $1,750. The buyer pays the existing $875 start checkout and the $875 balance is waived. Nothing new in Stripe.
- $250/mo from go-live, flat, no calls counted, no minutes. Cancel any time.
- Proof: current invoice, account screenshot, or a quote dated in the last 90 days, emailed to <daniel@agenthiveinc.com> before the written plan is signed.
- Guarantee: miss the go-live date written in the plan and the $875 is refunded in full.
- Ends November 30, 2026. After that the pages still compare, but the setup line goes back to $1,750. Change `SWITCH_ENDS` and `SWITCH_ENDS_ISO` in `corp/shared/switch.ts` to extend.

Year one on the offer is $3,875. Against Smith.ai Enterprise ($6,000) and Ruby 100 ($4,740) or Ruby 200 ($8,640) we win year one outright. Against Smith.ai Pro at 75 calls ($1,800) and Ruby 50 ($3,000) we cost more in year one and the pages say so. That is on purpose; the pitch is done-for-you and no meter, not cheapest.

## Pages

- `https://agenthiveinc.com/switch` hub, both offers, terms
- `https://agenthiveinc.com/switch/smith-ai`
- `https://agenthiveinc.com/switch/ruby`

Each offer page: hero with the offer, the three-card offer block, terms in full, the competitor's published table with the read date, four "where the switch is better" cards, a switchers-only extra, a twelve-month table, "when they are the better choice," FAQ, sources, author card. Home has a one-line link in the First Deploy AI panel. Footer has "Switch offers." Sitemap, llms.txt, JSON-LD (Article + Service with a one-time $875 Offer valid through 2026-11-30 and the $250/mo UnitPriceSpecification + FAQPage) are in.

## Checkout and tracking

The "Switch for $875" buttons go to `/go/switch-smith-ai` and `/go/switch-ruby`. That is the existing `corp/netlify/functions/go.ts` tracker. It logs the click to the `go-clicks` blob store and 302s to the live First Deploy $875 Stripe Payment Link (`https://buy.stripe.com/9B68wP92Qe5layV8ie2ZO1w`, the same one `firstdeploy.ai/go/deposit` uses) with `client_reference_id=ah_<from>_switch-<slug>` and UTMs.

So in Stripe, a switch purchase is the normal $875 "First Deploy setup, 50% deposit" payment with a `client_reference_id` that starts with `ah_switch`. **Do not invoice the balance on those.** Mara (Revenue Ops) should filter on that reference before sending any balance invoice.

## Deploy sequence

1. Open the PR for `cursor/switch-offers-35fe` and read it. Merge to `main`.
2. agenthiveinc.com deploys from `main` with base `corp`, build `npm run build`, publish `dist`, Node 22. Confirm it is the Netlify site whose production domain is `agenthiveinc.com` (id `d5d92fe5-eee9-482b-840c-b535a3333b42`), not Stateside, Sonaris, AskYard, NetYard, or the site that serves firstdeploy.ai. Same rule as `GROK-DEPLOY.md`.
3. When the production deploy is published, check:
   - `curl -sI https://agenthiveinc.com/switch | head -1` → 200
   - `curl -sI https://agenthiveinc.com/switch/smith-ai | head -1` → 200
   - `curl -sI https://agenthiveinc.com/switch/ruby | head -1` → 200
   - `curl -sI "https://agenthiveinc.com/go/switch-smith-ai?from=ah-clicktest" | grep -i location` → the `buy.stripe.com/9B68wP92Qe5layV8ie2ZO1w?client_reference_id=ah_ah-clicktest_switch-smith-ai&...` link
   - `https://agenthiveinc.com/sitemap.xml` lists the three `/switch` URLs
   - view-source of each offer page has a `<title>` that starts with "Switch from"
4. IndexNow the three URLs with the key file that is already at the corp root (`40602f6b-ecf3-406b-a8e5-2e9f601462b6.txt`), same curl shape as `pricing/LAUNCH.md`, host `agenthiveinc.com`.
5. Then, and only then, run `SWITCH-MARKETING.md`.

## Mirror on firstdeploy.ai (second step, separate repo)

`firstdeploy.ai/vs/smith-ai` and `/vs/ruby` already exist in `PalmCoast/FirstDeploy`. Add one line under each page's "Our price" section: "Switching from Smith.ai? $875 setup through November 30, 2026: <https://agenthiveinc.com/switch/smith-ai>" (Ruby likewise). Do not rewrite those pages.

One thing to check while you are in that repo: on 2026-10-19 `https://firstdeploy.ai/go/start` with no `from` query returned 500 once (`/go/start?from=home-price-full` was fine both times). Hit it twice without `from`; if it 500s, fix the tracker's missing-param path.

## Who does what

- **Reed (CTO):** merge, deploy, verify, IndexNow, the firstdeploy.ai mirror line.
- **Grok (CMO / Growth):** X threads and LinkedIn from `SWITCH-MARKETING.md`, verbatim. The 1200×630 still in the existing agenthiveinc.com OG style, no competitor logos.
- **Mara (Revenue Ops):** Stripe filter on `client_reference_id` starting `ah_switch`; no balance invoice on those; proof email filed with the plan.
- **Nova (Content & SEO):** confirm the three URLs index; watch Search Console for "smith.ai alternative" and "ruby receptionist alternative" impressions.
- **Sage (Research):** re-read both vendor pricing pages on the first of each month. If a number moved, change `corp/shared/switch.ts` and `SWITCH_CHECKED`; the pages and JSON-LD update from that one file.
- **Hank (Field Ops):** hivesales outbound, ten shops a day, the email in the kit, one per shop.

## Scoreboard (report to Daniel day 0, 3, 7)

- Clicks on `/go/switch-smith-ai` and `/go/switch-ruby` (the `go-clicks` blob store, human vs bot)
- Stripe payments with `client_reference_id` starting `ah_switch`
- Proof emails received at <daniel@agenthiveinc.com>
- Free 30 bookings that mention Smith.ai or Ruby
- Search Console impressions for the two `/switch/*` URLs

## You do not own

- Changing $875, $250, the deadline, or the refund line without Daniel. They live in `corp/shared/switch.ts`; a change there is one commit.
- Posting anything about Smith.ai or Ruby that is not on their page.
- New Stripe products or prices. The existing $875 link is the checkout.
- Touching firstdeploy.ai beyond the one mirror line above.

## Contacts

- Daniel Graham: <daniel@agenthiveinc.com>, +1 509-357-2230
- Reed inbox: <reedhive@agentmail.to>
- Sales inbox: <hivesales@agentmail.to>
- First Deploy AI desk and consult: +1 320-335-6186
