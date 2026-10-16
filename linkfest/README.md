# Link Fest

An IndexMe.lol marketing page. The board is a list of real outbound links. You put a visible link to the desk on your site. A passing check is a follow link to `https://indexme.lol/` with IndexMe in the anchor text. The idea stays on the page that wrote it.

Colors, type, and the wordmark follow the live IndexMe desk: ink `#10120f`, paper `#f4f2e9`, acid `#d8ff36`, Manrope, and DM Mono. See [BRAND.md](BRAND.md).

## What it does

- Lists pages on the desk, the AgentHive Inc house, and LaunchAF's write-up of IndexMe. Each card is an outbound `href`.
- Gives three snippets to paste: the anchor, a sentence with your site name, and a badge.
- `POST /api/check` with `{ "url": "https://your-page.example/" }` fetches public HTML and reports `linked`, `unnamed`, `nofollow`, `missing`, `unreachable`, or `blocked`.
- A pass is stored in `localStorage` on that browser. Public cards are added by hand. Email a passing URL to [hello@indexme.lol](mailto:hello@indexme.lol).

The check refuses credentialed URLs, ports other than 80 and 443, and hosts that resolve to loopback, private, or link-local addresses. It does not return the page body.

## Prices

The fest is free. IndexMe Starter is free on the desk. Pro is $19.99 and Studio is $29.99, one time, on [indexme.lol](https://indexme.lol/#pricing). This page links there. It does not run a second checkout.

## Local

```bash
cd linkfest
npm install
npm test
npm run dev
```

Vite serves the page at [http://127.0.0.1:5186](http://127.0.0.1:5186). `npm run build` writes `dist/`.

## Deploy

This folder is its own Netlify site. In the Netlify UI:

1. Base directory: `linkfest`
2. Build command: `npm run build`
3. Publish directory: `dist`

Intended host: `https://linkfest.indexme.lol`. The canonical URL, Open Graph image, and sitemap use that origin. Change `SITE_ORIGIN` in `shared/brand.ts` and the matching tags in `index.html` if the public host is different.

No environment variables. The check runs in the `/api/check` function.
