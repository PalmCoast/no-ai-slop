# Flick

Skip the meeting.

Flick is a Loom replacement that records in the browser and gives you a shareable link. Watchers do not need an account, an extension, or a login wall. The live site uses the default Netlify URL — no custom domain.

## What it does

- **Screen, camera, both, or a demo scene.** Camera sits in a bubble on the recording when you combine it with the screen.
- **Mic meter and pause.** Space pauses, Esc stops. Cap is 15 minutes / 100 MB.
- **Publish a link.** The file is uploaded in 3.5 MB chunks to Netlify Blobs and played from `/v/:id`.
- **Keep a local copy.** Recordings are stored in IndexedDB on this device. You can download even if upload fails.

## Stack

- Frontend: React 18 + Vite + TypeScript, React Router. Design is `src/styles.css`.
- API: one Netlify Function (`netlify/functions/api.ts`) on `/api/*`.
- Storage: Netlify Blobs store `flick-clips` in production; `.netlify/flick-store/` during local development.

## Run it locally

```bash
cd flick
npm install
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

```bash
cd flick
npx netlify sites:create --name <unique-name>
npx netlify deploy --prod --build
```

`netlify.toml` lives in this folder. For a Git-connected site, set the Netlify **Base directory** to `flick`. Leave the domain on `*.netlify.app`.

## Layout

```
flick/
  src/                 UI, recorder, IndexedDB library
  shared/              ids, chunking, clip metadata (used by UI + functions)
  netlify/functions    /api/health, /api/clips, chunk upload, video stream
  tests/
```
