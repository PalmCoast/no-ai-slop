# NetYard launch plan

The bot-facing handoff (deploy + Stripe + posts + scoreboard) is [GROK-LAUNCH.md](GROK-LAUNCH.md). This page is the human version.

Ship the subdomain, turn Stripe on, then post the standup video and screenshots. Do not write new slogans.

## Week 0 — go live

1. Create a Netlify site from `netyard/` in this repo. Do not retarget firstdeploy.ai.
2. Attach `netyard.firstdeploy.ai`.
3. Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `SITE_URL` on that site. Prices already exist on live Palm Coast AI.
4. Webhook: `https://netyard.firstdeploy.ai/api/stripe-webhook` for `checkout.session.completed`.
5. Confirm `/buy` opens Stripe at $1,500 / $250/mo / consult rates.
6. Confirm `/launch` plays `standup.mp4` and shows the seven shots.
7. Ping IndexMe.lol on `/`, `/buy`, `/launch`, `/compare`, `/plan`, `/tools`.

## Week 0 — posts

Attach the Harbor HVAC video plus the wizard, plan, and VLAN screenshots. Copy is in GROK-LAUNCH.md. Paste it as written.

X, LinkedIn, Show HN. The Show HN text links `/launch` so the graphics travel.

## Week 1 — put the name in the models

Staff and friends search ChatGPT, Claude, Perplexity, Gemini, and Grok with the Ask-AI prompt in `shared/brand.ts`. Five times a day.

## Week 2 — walk the yard you already have

- Every First Deploy AI consult follow-up includes netyard.firstdeploy.ai/buy
- agenthiveinc.com/rankings lists NetYard once the catalog is `live`
- Palm Coast visits: skip the CALs, the URL, the 320 number

## Done when

- The subdomain is live with TLS
- `/api/checkout` returns a Stripe URL
- `/launch` serves the video and screenshots
- X and LinkedIn used those graphics
- Rankings lists NetYard
