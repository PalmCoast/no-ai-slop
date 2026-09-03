# Sonaris brand

## Name

Sonaris comes from *sonus*, Latin for sound, with an ending that reads like a proper name rather than a feature. It is short, easy to say in any accent, and has no common meaning in English, so it can stand for the product and nothing else. The "S" mark doubles as a sound wave.

## Palette

| Token | Hex | Use |
|-------|-----|-----|
| Navy | `#0B1220` | Page background |
| Ink | `#121A2B` | Panels, cards, drawers |
| Gold | `#C9A227` | The single accent: primary buttons, active state, the mark, the assistant's caption label |
| Cream | `#F1EAD8` | Body text, final captions |
| Steel | `#8A94A6` | Muted text, interim captions |
| Stroke | `rgba(241,234,216,0.12)` | Borders and dividers |

Rules: one accent only. No orange, no gradients, no drop shadows, no emoji. Surfaces are flat; hierarchy comes from spacing, type size and the gold accent. The founder portrait (navy suit, gold-lit background) set this palette.

Exposed as CSS variables in `src/styles.css`: `--navy`, `--ink`, `--gold`, `--cream`, `--steel`, `--stroke`.

## Logo

- `public/brand/logo.svg`: the mark. A stylised "S" made of a central S-curve and two nested sound-wave arcs, gold on transparent. Minimum size 24 px.
- `public/brand/wordmark.svg`: mark plus "SONARIS" in Georgia with wide letter-spacing, cream.
- `public/brand/favicon.svg`: the mark on a navy rounded square.
- `public/brand/og.svg`: 1200 by 630 social card with the wordmark and tagline.

Keep the mark gold on navy or ink. On a light background use navy instead of gold. Do not recolour it, add effects, or place it on photographs.

## Typography

System sans for everything (`-apple-system, Segoe UI, Roboto, Helvetica, Arial`). The wordmark uses `Georgia, "Times New Roman", serif` with letter-spacing around 0.28em. Headings are semibold with slightly tight tracking. Captions in the console are large (up to 2.1rem) because they are meant to be read from arm's length while talking.

## Voice and tone

Write the way the product listens: plainly, and without talking over the reader.

- Say what it does. "Your words appear on screen as you speak" rather than "a seamless voice experience".
- Use numbers. 900 ms, 50 turns, $29, four browsers.
- Active voice, present tense. Sonaris waits. Sonaris stops.
- No banned words: leverage, seamless, empower, robust, cutting-edge, elevate, harness, delve, transformative. "Unlock" is fine only for the literal paywall button.
- No "It's not X, it's Y" contrasts, no colon reveals, no rhetorical questions in copy.
- Short copy has no em dashes. The one exception is the CTA "Get a license — $29", which is a label, not a sentence.
- Humour is fine when a persona carries it (Captain Merriweather). The brand itself stays calm.

## Launch posts

### X

> Sonaris: talk to your AI assistant out loud. Your words show up on screen as you say them. It waits until you finish, never talks over you, then answers in the voice you pick (Atlas, Aria, or a character you add). Every exchange lands in a memory file you can read. $29, one time.

### LinkedIn

> I built Sonaris because I wanted to talk to an assistant the way I talk to a person: without typing, and without being interrupted.
>
> It does four things. It captions your speech live while you talk. It waits for 900 ms of silence before it answers, and if you start speaking while it is talking it stops within a quarter of a second. It answers in a persona voice, with two defaults and any character you want to add. And after every exchange it appends a line to a JSONL journal and refreshes a plain MEMORY.md, so you can open your conversation history in a text editor.
>
> It runs on Netlify, brings your own OpenAI or ElevenLabs keys, and the voice protocol ships as a skill file your own agent can follow. One license, $29.

### Product Hunt tagline

> Talk to your AI. It listens, waits, and answers in any voice.
