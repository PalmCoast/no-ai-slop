# AgentHive Inc — flagship site

Palm Coast corporate site for [agenthiveinc.com](https://agenthiveinc.com). Gold-and-black hive brand, Grok Bot roster, weekly AI/infra briefing (**The Buzz**), and a live ranking of the public app portfolio.

## Local

```bash
cd corp
npm install
npm test
npm run dev
```

Vite serves the SPA at http://localhost:5174. Functions (`/api/buzz`, `/api/rank`) run on Netlify; locally The Buzz and Rankings use the cited seed/catalog until you run `npx netlify dev`. `npm run build` writes `dist/`.

## Weekly Grok bots

Netlify scheduled functions (UTC, published production deploys only):

- `netlify/functions/buzz-weekly.ts` — `@weekly`. Pulls HN + optional AI Gateway summary, stores the edition in Blobs.
- `netlify/functions/rank-weekly.ts` — `@weekly`. Probes every catalog URL and stores scores.

Read paths:

- `GET /api/buzz`
- `GET /api/rank`
- `POST /api/refresh` — optional `HIVE_REFRESH_SECRET` header `x-hive-secret`

The Buzz page always has a cited seed edition, so the room is never blank if Blobs or the gateway are cold.

## Deploy to AgentHiveInc.com

This folder is a separate Netlify site from Stateside/Sonaris. In the Netlify UI for agenthiveinc.com:

1. Base directory: `corp`
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Enable AI Gateway if you want Grok's briefing summarized through `gpt-4o-mini`.

`about.html` and `hive.html` 301 to `/about` and `/rankings`.
