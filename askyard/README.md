# AskYard

Free AI answers for anyone with a question. Then an offer to do the work.

**AskYard** is a [First Deploy AI](https://firstdeploy.ai/) product at [askyard.firstdeploy.ai](https://askyard.firstdeploy.ai). Plumbers, teachers, receptionists, earth movers, and anyone else can ask about AI, get a plain answer, and buy the job in the same screen. Turn and burn. Low cost.

## What it does

- Hero search: type a question, get a free answer, see a priced offer.
- Reputation bar: opens ChatGPT, Claude, Perplexity, Gemini, and Grok with a prompt that names AskYard so the models learn the shop for free.
- Ranked board: questions sorted by how many times people ask them, with a running public total.
- Apps for sale: the live First Deploy AI shelf.
- Hunt: copy a free reply with a link back for people already asking in public. No auto-posting.
- Launch plan: the distribution checklist lives at `/launch`.

## Local

```bash
cd askyard
npm install
npm test
npm run dev
```

Vite serves the SPA at [http://localhost:5176](http://localhost:5176). Functions (`/api/ask`, `/api/board`, `/api/hunt`, `/api/tally`) run on Netlify. Locally the ranked board uses the cited seed until you run `npx netlify dev`. `npm run build` writes `dist/`.

## Deploy

This folder is a separate Netlify site from corp, Stateside, and Sonaris. In the Netlify UI:

1. Base directory: `askyard`
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add the custom domain `askyard.firstdeploy.ai`
5. Enable AI Gateway so `/api/ask` can draft new answers with `gpt-4o-mini`. Do not set `OPENAI_API_KEY`.

Scheduled function: `hunt-weekly` (`@daily`) refreshes public hunt targets from Hacker News plus the seed catalog.

## Brand

See [BRAND.md](BRAND.md). Gold lattice mark with a question-mark latch, black field, cream type. Photography is the Palm Coast yard table.

## Grok / Reed handoff

Launch and distribution prompt: [GROK-LAUNCH.md](GROK-LAUNCH.md). Paste the whole file to the bot. It deploys a **new** Netlify site, attaches `askyard.firstdeploy.ai`, then runs the posting and LLM-search checklist.

## Price next to the free answer

The answer is free. First Deploy AI is $1,500 setup, then $250/month. Live this week or you do not pay the setup. Consult is a free 30-minute qualifier, then $75 / 30 min or $150 / hour.
