# First Deploy

Marketing site for [firstdeploy.ai](https://firstdeploy.ai) — the after-hours desk and live apps for field operators.

Static HTML. No framework. Publish directory is `.` inside this folder.

## Why this folder exists

The live site on Netlify (`first-deploy-ai`, id `59a673be-0880-43e0-a443-756e22cbf4ec`) is the cash product. Grok bots kept injecting HiveAds, JobProof/Flick strips, `firstdeploy-pay` footer scripts, and a fake comments block — often twice. This rebuild is one offer, one price, one path.

## Offer (do not invent new numbers)

- Setup **$1,500**. One leak live this week or they do not pay.
- Then **$250/month** per company to keep the desk and the apps on.
- No-shows and the deployment sprint are **$5,000** on the board.
- Consult is a separate lane: free 30, then $75 / 30 min, $150 / hour, or a $1,250 pack ($625 up front).

Phones: First Deploy +1 320-335-6186 · AgentHive +1 509-357-2230.

## Local

```bash
cd firstdeploy
npm start                 # http://127.0.0.1:4173 with clean URLs
node scripts/check-clean.mjs
```

`check-clean.mjs` fails if ads, promo strips, or negative-listing copy land back in the HTML.

## Ship to firstdeploy.ai

This repo cannot push to `PalmCoast/FirstDeploy`. To put this on the live domain:

1. In Netlify, point site `first-deploy-ai` at this repository with **base directory** `firstdeploy`.
2. Or copy these files into `PalmCoast/FirstDeploy` and deploy from there.
3. Delete Netlify **snippet injections** (HiveAds, JobProof strip, Flick strip, `footer.js` from firstdeploy-pay). The HTML guard and CSP block them if they come back, but empty injected nodes still look sloppy until the snippets are gone.

## Pages

`/`, `/consult`, `/about`, `/hive`, `/flick`, `/privacy`, `/terms`, `/thanks`, plus `404.html`.
