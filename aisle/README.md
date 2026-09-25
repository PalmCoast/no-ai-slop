# Aisle

One spec. Every shop that has it.

**Aisle** is a [First Deploy AI](https://firstdeploy.ai/) product. You type a precise product, the way you would ask for every brown wool sweater or a 4 inch aluminum tube with a flange. Aisle reads the size, material, color, and features in that sentence, then keeps only the listings that match. Each shop gets a column. Near misses stay on the page with the reason they failed.

The catalog is the form. There is no chat thread.

## What you can sell

The two sample doors are the proof:

- [Brown Wool](https://aisle.firstdeploy.ai/shop/brown-wool) is a sweater shop. Cotton, navy, and wool blends stay in the near-miss row.
- [Flange Tube](https://aisle.firstdeploy.ai/shop/flange-tube) is a tube shop. Steel, pipe, plain ends, and a loose flange fitting stay in the near-miss row.

Publish is **$29** once. The buyer names the shop, gets a door they can send, a CSV of every match and near miss, and a one-page brief. Stripe Checkout uses `price_data.unit_amount` of 2900. No pre-made Stripe Price. Without `STRIPE_SECRET_KEY`, checkout records a demo claim on that browser so the door still unlocks.

The shelf is compiled from public shop listings so the filter has descriptions to read. Prices are the figures on that shelf. Open the shop to confirm stock. Paste more lines on `/build` and they go through the same filter.

## Local

```bash
cd aisle
npm install
npm test
npm run dev
```

Vite serves the app at [http://localhost:5178](http://localhost:5178). `npm run build` writes `dist/` with unique HTML per route. `npm run dev:netlify` wraps functions on port 8892.

## Deploy

This folder is a separate Netlify site. In the Netlify UI:

1. Base directory: `aisle`
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Functions directory: `netlify/functions`
5. Add the custom domain `aisle.firstdeploy.ai`
6. Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `SITE_URL`

Webhook: `https://aisle.firstdeploy.ai/api/stripe-webhook`.

## Price

Reading the catalog is free. Publishing an aisle is $29.
