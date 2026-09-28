# No AI slop

This skill removes 20+ patterns of AI slop from your writing and it can also help you detect slop as well.

## What it catches

The patterns it detects include:

| Pattern | Smells like |
|---------|-------------|
| Binary contrasts | "It's not X. It's Y." |
| Throat-clearing openers | "Here's the thing..." |
| Faux-insight setups | "What nobody tells you..." |
| Colon reveals | "The best part: it learns." |
| Superficial analysis | "...highlighting the team's commitment" |
| Importance puffery | "marks a pivotal moment" |
| Weasel attribution | "experts agree," "studies show" |
| Fake-strong verbs | "serves as a centralized hub" |
| Synonym cycling | the agent, then the assistant, then the tool |
| Negative listing | "Not a X. Not a Y. A Z." |
| Dramatic fragmentation | "That's it. That's the whole thing." |

It also enforces the fundamentals that make writing good: Lead with the point when it helps, use active voice, untangle hard-to-follow sentences, and prefer concrete numbers over abstractions.

## Install

Paste this into Claude Code, Codex, or your favorite AI harness:

"Install this skill globally: [https://github.com/petergyang/no-ai-slop](https://github.com/petergyang/no-ai-slop)"

## Use

**1. Edit a draft.** Paste it and invoke the skill:

```
/no-ai-slop

[your draft]
```

You get back the edited draft plus a short What changed section. The skill makes the minimum effective edit, then checks its own work against [eval.md](eval.md).

**2. Detect slop.** Ask whether a piece reads as AI:

```
/no-ai-slop is this AI slop?

[the text]
```

You get every pattern it found each with the quoted line.

## Files

1. `SKILL.md`: The editing rules and workflow.
2. `eval.md`: Pass/fail checks the skill runs on its own edits.

## Who made this

This is one skill from my personal AI operating system. The full library, including my courses and workflows, lives at [Behind the Craft](https://behindthecraft.com).

## License

MIT

## Stateside

[Stateside](stateside/README.md) is a separate product in this repo: a job network for American IT professionals. Free for job seekers, veterans get first look at new postings, employers pay a flat $10 per posting, and members create their own groups with real-time chat. See [stateside/README.md](stateside/README.md) for setup and deployment.

## AgentHive Inc

[corp/](corp/README.md) is the flagship site for [agenthiveinc.com](https://agenthiveinc.com): AgentHive Inc (AGENTHIVEINCCOM LLC, Palm Coast) AI consultant shop, First Deploy AI, IndexMe.lol, The Buzz, and a live ranking of the public Netlify portfolio. See [corp/README.md](corp/README.md).

## AskYard

[AskYard](askyard/README.md) is a First Deploy AI product at [askyard.firstdeploy.ai](https://askyard.firstdeploy.ai): free AI answers for plumbers, teachers, receptionists, earth movers, and anyone else with a question. Ranked by how often people ask. Reputation meter on `/rep`. Marquee lights on the same site at [marquee.firstdeploy.ai](https://marquee.firstdeploy.ai/). Apps for sale on the same site. See [askyard/README.md](askyard/README.md).

## NetYard

[NetYard](netyard/README.md) is a First Deploy AI product that stands up a small-business network without Microsoft Server. Six questions produce addressing, Samba on Debian, guest Wi-Fi, a shopping list, and install scripts. See [netyard/README.md](netyard/README.md).

## Aisle

[Aisle](aisle/README.md) is a First Deploy AI product. Type a precise product, such as every brown wool sweater or a 4 inch aluminum tube with a flange. Aisle reads the spec and keeps only the listings that match, one column per shop. Publish that aisle for $29. See [aisle/README.md](aisle/README.md).

## Braid

[Braid](braid/README.md) is a language in this repo. One file holds the code, the binary flags, the hex dump, and the octal note. It checks that they are the same value, compresses the bytes, and seals a SHA-256. Local stamps are free. Hosting a stamp for a client is $29. See [braid/README.md](braid/README.md).

## Sonaris

[Sonaris](sonaris/README.md) is a separate product in this repo: a real-time voice layer for an AI assistant with live captions, turn-taking that never talks over you, persona voices, a memory file per license, and a paid skill hosted behind a paywall. See [sonaris/README.md](sonaris/README.md) for setup and [sonaris/BRAND.md](sonaris/BRAND.md) for the brand.
