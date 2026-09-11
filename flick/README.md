# Flick

Skip the meeting.

Flick is a Loom replacement that records in the browser and gives you a shareable link. Watchers do not need an account, an extension, or a login wall. Live at [https://useflick.netlify.app](https://useflick.netlify.app) — the default Netlify URL, no custom domain.

**Watch is free. Publish is the gate.**

- Payment gate: [https://useflick.netlify.app/pricing](https://useflick.netlify.app/pricing)
- Marketing plan: [https://useflick.netlify.app/marketing](https://useflick.netlify.app/marketing) · [MARKETING.md](MARKETING.md)
- Launch plan: [https://useflick.netlify.app/launch](https://useflick.netlify.app/launch) · [LAUNCH.md](LAUNCH.md)

## What it does

- **Screen, camera, both, or a demo scene.** Camera sits in a bubble on the recording when you combine it with the screen.
- **Mic meter and pause.** Space pauses, Esc stops. Cap is 15 minutes / 100 MB.
- **Publish a link.** Street pass: one clip, two minutes. Lights ($19/mo) and Marquee ($99 founder) unlock unlimited publish. Watchers never pay.
- **Keep a local copy.** Recordings are stored in IndexedDB on this device. You can download even if upload fails.

## Stack

- Frontend: React 18 + Vite + TypeScript, React Router. Design is `src/styles.css`.
- API: one Netlify Function (`netlify/functions/api.ts`) on `/api/*`.
- Storage: Netlify Blobs store `flick-clips` in production; `.netlify/flick-store/` during local development.
- Payments: Stripe Checkout Sessions. Webhook mints a `FLICK-…` license. Demo keys only with `ALLOW_DEMO_PAYMENTS=true` outside production.

## Run it locally

```bash
cd flick
npm install
cp .env.example .env
# ALLOW_DEMO_PAYMENTS=true issues a rehearsal license with no Stripe
npm run dev
```

`@netlify/vite-plugin` exposes functions and Blobs on the Vite server. If you prefer the CLI wrapper:

```bash
npx netlify dev
```

```bash
npm test
npm run typecheck
npm run build
```

Open `http://localhost:5173`. The demo scene records without screen or camera permission, so you can exercise publish and the watch page on a locked-down machine.

## Deploy

Live: [https://useflick.netlify.app](https://useflick.netlify.app)

```bash
cd flick
npx netlify deploy --prod --build
```

Set `SITE_URL`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` in the Netlify UI. Webhook endpoint: `https://useflick.netlify.app/api/stripe-webhook`.

`netlify.toml` lives in this folder. For a Git-connected site, set the Netlify **Base directory** to `flick`. Leave the domain on `*.netlify.app`.

## Layout

```
flick/
  src/                 UI, recorder, IndexedDB library, billboard pages
  shared/              ids, chunking, licenses, plans
  netlify/functions    /api/* (clips, checkout, webhook, me)
  MARKETING.md
  LAUNCH.md
  tests/
```
