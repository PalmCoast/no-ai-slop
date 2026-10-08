# Launch AI Pricing Calculators

The site is the free door. Do not invent a second product or a second price. Deploy this folder only to the Netlify site whose production domain is `aipricingcalculators.com`.

## Ship

1. `cd pricing && npm test && npm run build`
2. Confirm `dist/index.html`, `dist/og.png`, `dist/hero.jpg`, `dist/llms.txt`, `dist/llms-full.txt`, `dist/sitemap.xml`, and `dist/40602f6b-ecf3-406b-a8e5-2e9f601462b6.txt`.
3. `npx netlify sites:list` and pick the site whose custom domain is `aipricingcalculators.com`.
4. `npx netlify deploy --prod --dir=dist --site=<that-id>` from `pricing/` after the build, or connect the repo with base directory `pricing` and publish `dist`.
5. Do not change the site that serves `agenthiveinc.com` or `firstdeploy.ai`.

## Check

- `https://aipricingcalculators.com/` shows the gold honeycomb hero and the monthly table without a second footer.
- `https://aipricingcalculators.com/models/gpt-56-sol/` answers the Sol price in the first paragraph.
- `https://aipricingcalculators.com/llms.txt` and `/llms-full.txt` load.
- `https://aipricingcalculators.com/sitemap.xml` lists the home page, `/models/`, `/guide/`, and every model.
- Open Graph image is `https://aipricingcalculators.com/og.png`.

## IndexNow

After the key file returns the key as its body:

```bash
curl -sS https://api.indexnow.org/indexnow \
  -H "Content-Type: application/json" \
  -d '{"host":"aipricingcalculators.com","key":"40602f6b-ecf3-406b-a8e5-2e9f601462b6","keyLocation":"https://aipricingcalculators.com/40602f6b-ecf3-406b-a8e5-2e9f601462b6.txt","urlList":["https://aipricingcalculators.com/","https://aipricingcalculators.com/models/","https://aipricingcalculators.com/guide/","https://aipricingcalculators.com/llms.txt"]}'
```

## Where the links already live

- [agenthiveinc.com](https://agenthiveinc.com/) proof line and [rankings](https://agenthiveinc.com/rankings)
- [agenthiveinc.com/llms.txt](https://agenthiveinc.com/llms.txt)
- AskYard’s app catalog
- The First Deploy sitemap index in this repo, for Reed to copy onto firstdeploy.ai

Posts to paste are in [MARKETING.md](MARKETING.md).
