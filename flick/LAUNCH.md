# Launch plan

How we ship. No fake calendar. The live rundown is [https://useflick.netlify.app/launch](https://useflick.netlify.app/launch).

## 01 — Ship the product

The product is live at [https://useflick.netlify.app](https://useflick.netlify.app). Record, publish, watch. No custom domain. The watch page has no login. That wedge does not change.

## 02 — Sell Marquee

Marquee is $99 once while founder pricing is still up. Kill the SKU when it stops feeling scarce. Do not fake a countdown clock.

## 03 — Default to Lights

Lights at $19/month is the default paid plan. Street stays as a taste: one short publish. Every paid dollar is for the share link.

## Checklist

1. **Payments live** — Stripe Checkout is on. Street still works with no card. Webhook URL `https://useflick.netlify.app/api/stripe-webhook`. Checkout uses inline `price_data` unless Price IDs are set in Netlify.
2. **Founder blast** — personal notes, not a product dump. One Flick that *is* the pitch. Link the Marquee card.
3. **Public board** — Home, Pricing, Launch, Marketing are the campaign. Product Hunt / X / communities get the same three sentences.
4. **Watch conversions** — publishes, checkout starts, paid licenses. If people download and never pay, Street is doing its job.

## Where checkout lives

- **UI:** `/pricing` (also the three cards on `/`)
- **Studio:** Publish on `/record` returns **402** without a paid plan; the upgrade CTA is in-page
- **API:** `POST /api/clips` checks `X-Flick-License` / Street (`X-Flick-Device`)
- **Checkout:** `POST /api/checkout` → Stripe hosted Checkout (or a demo license when `ALLOW_DEMO_PAYMENTS=true` and this is not production)
- **Webhook:** `POST /api/stripe-webhook` mints the license even if `/thanks` never loads
- **Thanks:** `/thanks?session_id=…` claims the key into `localStorage`

Watch (`/v/:id`) is not paywalled. Never will be.
