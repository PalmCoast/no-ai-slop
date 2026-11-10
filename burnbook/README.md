# Burn Book

A ledger for a team that already pays for AI agents. You type the vendors, the seats, the jobs finished, and the hours spent fixing the output. The book prices idle seats, a second tool on the same job, and rework, then writes the cuts.

The ledger stays in the browser. The board packet is $750, paid in full on Stripe. Checkout sends the product and the price. It does not send the rows.

Northline, the filled-in month on the front page, is a sample. It is not a customer.

## Price

| | |
| --- | --- |
| Packet | $750 once |
| Stripe product | `prod_VbW6VdFl9ZxAni` |
| Stripe price | `price_1UaJ40FJWYd4pYuxxNJ078sT` |
| Payment link | [buy.stripe.com/7sYcN5a6Ud1hcH3eGC2ZO1O](https://buy.stripe.com/7sYcN5a6Ud1hcH3eGC2ZO1O) |

The payment link charges the full $750 on Palm Coast AI even when this site has no Stripe secret. With `STRIPE_SECRET_KEY` set, `/api/checkout` opens a Checkout Session for the same price and `/api/order` confirms it before the packet files unlock.

## Local

```bash
cd burnbook
npm install
npm test
npm run dev
```

Vite serves the app at [http://127.0.0.1:5191](http://127.0.0.1:5191). `npm run build` writes `dist/`.

## Deploy

This folder is its own Netlify site. Do not attach it to the site that serves firstdeploy.ai.

1. Base directory: `burnbook`
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Domain: `burnbook.firstdeploy.ai`
5. `STRIPE_SECRET_KEY` from the Palm Coast AI live key already used by the other First Deploy sites
6. `SITE_URL=https://burnbook.firstdeploy.ai`
7. Webhook `https://burnbook.firstdeploy.ai/api/stripe-webhook` for `checkout.session.completed`

Brand notes are in [BRAND.md](BRAND.md). The launch handoff is in [GROK-LAUNCH.md](GROK-LAUNCH.md).
