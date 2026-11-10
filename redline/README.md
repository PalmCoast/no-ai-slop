# Redline

A hospital bill, marked up. $9 once. No percentage of the savings.

Upload a PDF, a photo, or a screenshot, or paste the itemized charges. Redline flags duplicates, charges already inside a panel, a second emergency-visit level, and lines many times a Medicare reference. It writes the hospital letter, the insurer letter, and a financial-assistance request. You send them. The desk tracks what comes off.

The bill stays in this browser. The payment does not include it. A model read is off until you turn it on.

Redline is not a law firm, a coder, or a promise the hospital will agree. Reference dollars are national figures kept in the app, and each one says what it is. Confirm the current CMS addendum before you quote a reference as the Medicare payment for a ZIP code.

## Price

$9 once for unlimited bills on this browser. Contingency billing advocates commonly charge 25% to 35% of the reduction. Redline does not.

Without `STRIPE_SECRET_KEY`, checkout issues a demo pass and no card is charged. A real charge starts when Stripe is set on the site.

## Local

```bash
cd redline
npm install
npm test
npm run dev
```

Vite serves the app at [http://127.0.0.1:5191](http://127.0.0.1:5191). The API (`/api/offer`, `/api/checkout`, `/api/license`, `/api/confirm`, `/api/restore`, `/api/read`) runs in the Vite dev server. `npm run build` writes `dist/`.

## Deploy

This folder is its own Netlify site. Do not point another product site at `redline/`. The handoff for Reed is [GROK-LAUNCH.md](GROK-LAUNCH.md). Do not post that file.

1. Base directory: `redline`
2. Build command: `npm run build`
3. Publish directory: `dist`
4. For a real $9 charge, set `STRIPE_SECRET_KEY` to a restricted key that can create and read Checkout Sessions. Set `STRIPE_WEBHOOK_SECRET` and register `/api/stripe-webhook` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, and `checkout.session.async_payment_failed`. The webhook is required before launch. Fulfillment is a paid Checkout Session in Stripe. The browser pass is signed from that session when the customer returns, or when they restore with the checkout email.
5. Do not enable Stripe Tax here. No tax registration is set up.
6. For the optional model read, enable AI Gateway. Do not set `OPENAI_API_KEY`. The route uses `gpt-4o-mini`.

Prefer a restricted key over a secret key. Keep both keys in the Netlify UI. Do not commit them.

## What the letters will and will not do

Redline prepares the packet after the patient permission box is checked. It does not email the hospital, call the billing office, or file the dispute. Copy, download, or open a short email draft, then mark it sent on the desk.
