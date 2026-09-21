# Shop check — internal launch note

Reed only. Public page is [https://askyard.firstdeploy.ai/check](https://askyard.firstdeploy.ai/check). Do not post this file. Do not touch the Netlify site that serves firstdeploy.ai.

## What shipped

- Route: `/check` on the existing AskYard site. Demo card: `/check/harbor-hvac`.
- Harbor HVAC is fictional. Not a client.
- A website URL is a live scrape of that page, `robots.txt`, and the sitemap. Phone, hours, sitemap, and IndexNow come from that scrape.
- Grok, ChatGPT, Claude, Perplexity, Gemini, and Google are deep links. The label is "Opened with this prompt". The card does not invent a model quote.
- Google Business and Facebook URLs are not scraped. The card says the page blocks a live scrape.
- Primary link: IndexMe Pro checkout, $19.99 (`utm_content=indexme-pro`). Studio is $29.99 (`utm_content=indexme-studio`). Both are the live Stripe payment links on indexme.lol.
- Secondary link: `firstdeploy.ai` 2-minute check, plus the free 30 on Calendly.
- NetYard appears only when the scraped page mentions Windows Server or CALs.
- Share image: `/check/og.png`, `/check/harbor-hvac.png`, and `/api/check-card` for a real shop token.
- Generated share pages (`/s/:token`) are `noindex`.

## Posts (one link each)

Daniel posts X himself. Company LinkedIn can use the second draft.

X:

```text
Harbor HVAC, Palm Coast. Fictional shop. Not a client.

The AskYard card has no site, no phone, no hours, and no IndexNow key. Open Grok with the prompt on the card. If it invents a business, that is the gap.

https://askyard.firstdeploy.ai/check/harbor-hvac
```

LinkedIn (AgentHive Inc company page):

```text
Harbor HVAC is a fictional Palm Coast shop. Not a client.

AskYard, from AgentHive Inc in Palm Coast (agenthiveinc.com), has a free check. Paste the shop. See what the public page is missing. Open the same prompt in Grok and the other models.

The demo card is blank on purpose. A real shop with a missing sitemap goes to IndexMe from the card.

https://askyard.firstdeploy.ai/check/harbor-hvac
```

## UTMs

| Destination | utm_content |
| --- | --- |
| IndexMe Pro, $19.99 | indexme-pro |
| IndexMe Studio, $29.99 | indexme-studio |
| firstdeploy.ai#check | first-deploy |
| Calendly free 30 | free-30 |
| Consult, pay $75 | consult-75 |
| netyard.firstdeploy.ai | netyard |
| askyard.firstdeploy.ai | ask |

`utm_source=askyard`, `utm_medium=check`, `utm_campaign=shop-visibility` on each.

## IndexNow

Ping only after `/check` is on the live host. Do not ping the fictional demo.

```bash
curl -sS https://api.indexnow.org/indexnow \
  -H "Content-Type: application/json" \
  -d '{"host":"askyard.firstdeploy.ai","key":"40602f6b-ecf3-406b-a8e5-2e9f601462b6","keyLocation":"https://askyard.firstdeploy.ai/40602f6b-ecf3-406b-a8e5-2e9f601462b6.txt","urlList":["https://askyard.firstdeploy.ai/check","https://askyard.firstdeploy.ai/llms.txt"]}'
```

## Kill rule

If 72 hours after the live URL shows zero shares and zero IndexMe or First Deploy clicks from these UTMs, stop promoting the scanner and run the reply swarm only.

## Acceptance

`cd askyard && npm test && npm run build`

- `/check` loads with no login.
- Harbor card image is cream and steel, 1200×630, and the page `og:image` points at it.
- A public https URL fills phone, hours, sitemap, and IndexNow from the page.
- Private hosts, link-local addresses, and credentialed URLs are rejected.
- Model rows say "Opened with this prompt".
- IndexMe is the primary button. No Linktree.
