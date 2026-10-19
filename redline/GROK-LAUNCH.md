# Grok / Reed — put Redline up

You are Reed. Finish the deploy. Do not redesign Redline. Do not rewrite the copy. Do not touch the Netlify site that serves firstdeploy.ai or agenthiveinc.com. Do not touch AskYard, Stateside, Sonaris, NetYard, Latch, or the pricing site.

Stand up a **new** Netlify site for `redline/`. Attach **redline.firstdeploy.ai**. Turn on the $9 Stripe Checkout. Report the live URL.

## What is already in git

- Repo: [PalmCoast/no-ai-slop](https://github.com/PalmCoast/no-ai-slop)
- Branch: `cursor/redline-hospital-bills-5eb8`
- PR: [no-ai-slop#65](https://github.com/PalmCoast/no-ai-slop/pull/65)
- Code: `redline/` (Vite + React, Netlify Functions)
- Tests: `cd redline && npm test && npm run build`

Product: **Redline**. A person uploads a hospital bill. Redline marks duplicates, panel charges, a second emergency-visit level, and lines above 1.5 times a Medicare reference, then writes the letters. The patient sends the letters. **$9 once.** No percentage of the savings. The sample bill is free. The bill stays in the browser.

Sold by AgentHive Inc, Palm Coast.

## Hard constraints

1. Redline is its own Netlify site. If you point the firstdeploy.ai site at `redline/`, you take firstdeploy.ai offline.
2. Base directory `redline`. Build `npm run build`. Publish `dist`. Functions `netlify/functions`. Node 22. `redline/netlify.toml` already says this.
3. Do not deploy from the repository root.
4. Do not create a second price in Stripe. Checkout sends `price_data.unit_amount` of **900** cents. Do not change that number.
5. Do not enable Stripe Tax. No tax registration is set up for this product.
6. Do not set `OPENAI_API_KEY`. The optional model read uses Netlify AI Gateway and `gpt-4o-mini`. The site is usable with that off. The rules run in the browser.
7. Do not commit secrets. Do not paste keys back in email or in the repo.
8. Do not start a marketing blast. This ticket is the site and the $9 charge.

## Stripe

On the **new** Redline site, set:

```
STRIPE_SECRET_KEY=rk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SITE_URL=https://redline.firstdeploy.ai
```

Use a restricted key that can create and read Checkout Sessions, and list Customers (the restore path looks up a paid session by the checkout email). Prefer `rk_` over `sk_`.

Register the webhook before you call it launched:

- URL: `https://redline.firstdeploy.ai/api/stripe-webhook`
- Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`

Fulfillment is the paid Checkout Session. The browser pass is signed from that session when the customer returns, or when they restore with the checkout email. Until the webhook secret is set, `POST /api/stripe-webhook` returns 500 on purpose.

Without `STRIPE_SECRET_KEY`, `POST /api/checkout` returns a demo pass and charges nothing. After the key is set, that same route must return a `url` on `checkout.stripe.com`, and `GET /api/offer` must return `"demo": false` and `"priceCents": 900`.

## Smoke check

1. `https://redline.firstdeploy.ai/` returns 200. The sample card shows **$13,921.89** marked off a **$16,277.40** bill.
2. `#/case/sample` opens Riverside General Hospital, account 4482190.
3. `GET /api/offer` is `priceCents: 900` and `demo: false`.
4. `POST /api/checkout` with `{}` returns a Checkout URL. Open it. Do not need a live card charge for this ticket. Do not paste the URL if it contains a client secret. Say whether the host is `checkout.stripe.com`.
5. A test event from the Stripe CLI or Dashboard hits `/api/stripe-webhook` and returns 200 with a verified signature. A request with no signature returns 400.

## What to send back

1. Production URL and Netlify deploy id
2. Custom domain TLS, yes or no
3. Stripe env vars set, yes or no. Do not paste the values.
4. Webhook endpoint id
5. `/api/offer` body
6. Whether checkout returned a `checkout.stripe.com` URL
7. Anything that failed the smoke check

## Contacts

- Daniel Graham — `daniel@agenthiveinc.com` / `coltsinsider@gmail.com` / +1 509-357-2230
- Reed — `reedhive@agentmail.to`
