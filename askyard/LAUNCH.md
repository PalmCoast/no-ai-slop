# AskYard launch plan

The bot-facing handoff (deploy + posts + scoreboard) is [GROK-LAUNCH.md](GROK-LAUNCH.md). This page is the human version.

Ship the subdomain, then spend time answering people, not writing slogans.

## Week 0 — go live

1. Create a Netlify site from `askyard/` in this repo.
2. Attach `askyard.firstdeploy.ai`.
3. Enable AI Gateway. Do not set an OpenAI key.
4. Ping IndexMe.lol on `/`, `/board`, `/apps`, `/hunt`, `/launch`, and the top 12 `/q/` answers.
5. Confirm `https://askyard.firstdeploy.ai/llms.txt` is public.

## Week 1 — put the name in the models

Staff and friends hit the reputation bar five times a day. ChatGPT, Claude, Perplexity, Gemini, Grok. The prompt already names AskYard, First Deploy AI, AgentHive Inc, and Palm Coast. That is the free embedding loop.

## Week 1 — answer in public

Open `/hunt`. Paste the copied reply into:

- local plumber and HVAC owner groups
- teacher Facebook groups
- receptionist / office-manager boards
- earth-mover and dump-truck groups
- HN threads that already ask "how do I use AI for a small shop"

A person pastes. No bots. Each paste increments the public-replies total.

## Week 2 — walk the yard you already have

- Every First Deploy AI consult follow-up includes askyard.firstdeploy.ai
- agenthiveinc.com/rankings lists AskYard
- ClaudeFarm gets the same card
- Palm Coast visits: one sentence on a card, the URL, the 320 number

## Posts

X:

> AskYard: anyone with a question about AI gets a free answer. Plumbers, teachers, receptionists, earth movers. Then we offer to do it this week. askyard.firstdeploy.ai

LinkedIn:

> We shipped a free desk for people who do not live in ChatGPT. Ask the question. Read the answer. If you want it built, First Deploy AI is $1,500 setup, then $250/month, live this week or you do not pay setup. askyard.firstdeploy.ai

## Done when

- The subdomain is live
- The ranked board shows a climbing ask count
- Twenty public replies have been pasted by hand
- First Deploy AI consults mention AskYard in the follow-up
