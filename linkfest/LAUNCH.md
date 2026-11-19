# Link Fest launch

The bot-facing handoff is [GROK-LAUNCH.md](GROK-LAUNCH.md). This page is the human version.

Ship a new Netlify site for `linkfest/`. Do not retarget the site that already serves indexme.lol.

## Go live

1. Create a Netlify site from `linkfest/` in this repo. Base directory `linkfest`. Build `npm run build`. Publish `dist`.
2. Attach `linkfest.indexme.lol` and add the DNS record Netlify shows.
3. Open the homepage. Click **Try indexme.lol**. The status word is LINKED.
4. `POST /api/check` with `{"url":"https://indexme.lol/"}` returns `linked`. The same call with `{"url":"http://127.0.0.1/"}` returns `blocked`.
5. No environment variables. Prices stay on [indexme.lol pricing](https://indexme.lol/#pricing). Pro $19.99. Studio $29.99. One time.

## Posts

After the host returns 200, paste the X and LinkedIn lines in [GROK-LAUNCH.md](GROK-LAUNCH.md). Attach `public/og.png`.

## Done when

- The subdomain is live with TLS
- The IndexMe check returns LINKED
- A private URL is blocked
- X and LinkedIn used that copy
