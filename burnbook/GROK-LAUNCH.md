# Grok / Reed — put Burn Book on burnbook.firstdeploy.ai

You are finishing a launch that is already built. Do not redesign Burn Book. Do not change the price. Do not touch the Netlify site that serves firstdeploy.ai, agenthiveinc.com, Stateside, or Sonaris.

## What shipped

- Code: `burnbook/` (Vite + React + Netlify Functions)
- Host to attach: `burnbook.firstdeploy.ai`
- Tests: `cd burnbook && npm test && npm run build`
- Logo: `burnbook/public/mark.jpg`
- Offer: board packet, $750 once, paid in full

Stripe, live on Palm Coast AI (`acct_1SqPSHFJWYd4pYux`):

| | |
| --- | --- |
| Product | `prod_VbW6VdFl9ZxAni` |
| Price | `price_1UaJ40FJWYd4pYuxxNJ078sT` |
| Payment link | [buy.stripe.com/7sYcN5a6Ud1hcH3eGC2ZO1O](https://buy.stripe.com/7sYcN5a6Ud1hcH3eGC2ZO1O) |

The payment link already charges $750 and returns to `https://burnbook.firstdeploy.ai/thanks?session_id={CHECKOUT_SESSION_ID}`. Stripe Tax on this account is pending a head office, so this price does not add tax. Do not turn tax on for this price unless the rest of the catalog is moving too. The live link is [buy.stripe.com/7sYcN5a6Ud1hcH3eGC2ZO1O](https://buy.stripe.com/7sYcN5a6Ud1hcH3eGC2ZO1O).

## Deploy

1. Create a new Netlify site. Base directory `burnbook`. Build `npm run build`. Publish `dist`. Functions `netlify/functions`. Node 22. `burnbook/netlify.toml` already says this.
2. Add domain `burnbook.firstdeploy.ai` to that new site.
3. In DNS for firstdeploy.ai (NS1), add the same records the other subdomains use. `netyard.firstdeploy.ai` and `flick.firstdeploy.ai` answer at `98.84.224.111` and `18.208.88.157`. There is no wildcard. A missing record will not reach Netlify.
4. On the new site only, set `STRIPE_SECRET_KEY` to the Palm Coast AI live secret already used by NetYard, and `SITE_URL` to `https://burnbook.firstdeploy.ai`.
5. Add a webhook endpoint `https://burnbook.firstdeploy.ai/api/stripe-webhook` for `checkout.session.completed`, and set `STRIPE_WEBHOOK_SECRET`.
6. Do not set `OPENAI_API_KEY`. This product does not call a model.

## Check

- `https://burnbook.firstdeploy.ai/` shows the $750 offer and the Northline sample.
- Buy the packet goes to Stripe for $750.00, not a deposit.
- `POST /api/checkout` returns a Checkout URL when the secret is set, otherwise the payment link.
- `GET /api/order?session_id=` returns `paid: true` only for a paid session on `price_1UaJ40FJWYd4pYuxxNJ078sT`.
- After a paid return, `/packet` enables download and print.
- firstdeploy.ai still serves First Deploy, not this folder.

When the host returns 200, set the Burn Book row in `corp/shared/portfolio.ts` from `lab` to `live`.
