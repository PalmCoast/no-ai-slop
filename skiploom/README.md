# Skiploom

Skiploom is a local-first browser screen recorder. It records a display, tab, or window with optional microphone, system audio, and a composited camera bubble.

## Run locally

```bash
npm install
npm run dev
```

Open the local HTTPS or `localhost` URL in a current desktop version of Chrome, Edge, or Firefox. Screen capture APIs require a secure context.

## Build

```bash
npm run build
```

The production output is written to `dist/`. Netlify configuration is included in `netlify.toml`.

## Privacy

Recordings are created in browser memory. Skiploom does not upload, inspect, or store recordings. Closing or refreshing the page clears the current recording unless it has been downloaded.
