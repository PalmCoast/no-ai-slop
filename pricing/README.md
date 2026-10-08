# AI Pricing Calculators

Free LLM API cost calculator for [aipricingcalculators.com](https://aipricingcalculators.com/). AgentHive Inc in Palm Coast. The calculator stays free. First Deploy AI and consult time are the paid offers.

List prices were read in September 2026. The card says so on the page. Confirm a provider’s own pricing page before you commit spend.

## Pages

- `/` monthly cost, token paste, price matrix, self-host floor, subscription break-even
- `/models/` every list price, with one page per model for answer engines
- `/guide/` how input, output, cache, and batch move a bill
- `/llms.txt` and `/llms-full.txt` for answer engines
- `/sitemap.xml` plus the shared IndexNow key

## Develop

```bash
cd pricing
npm test
npm run build
```

`npm run graphics` redraws `hero.jpg`, `og.png`, and the icons from the AgentHive honeycomb art. The built files are what Netlify publishes from `dist/`.

## Deploy

This folder is its own Netlify site. Do not point the agenthiveinc.com site, or the firstdeploy.ai site, at `pricing/`.

```bash
cd pricing
npx netlify deploy --prod --dir=dist
```

Attach the deploy to the site that already serves `aipricingcalculators.com`. After it is live, ping IndexNow with the key file at the site root. The launch notes are in [LAUNCH.md](LAUNCH.md). Posts are in [MARKETING.md](MARKETING.md).
