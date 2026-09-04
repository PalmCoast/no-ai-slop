# Sonaris

Speak freely. Answer in any voice.

Sonaris is a real-time voice conversation layer for an AI assistant. You talk to a small blue companion whose face reacts as you speak: your words appear in a bubble beside it, it waits until you finish, then answers out loud in a persona voice while the reply runs as subtitles under its face. Every spoken exchange is written to a memory file. The assistant's voice skill is hosted behind a paywall.

## Architecture

```
 Browser (Vite, vanilla TS)                        Netlify
 ┌──────────────────────────────────────┐          ┌──────────────────────────────────────┐
 │ app.html  voice console              │          │ netlify/functions                    │
 │  ├ companion.ts     face clips       │          │                                      │
 │  ├ audio/mic.ts     getUserMedia +   │  fetch   │  chat.ts        POST /api/chat  ───► │ OpenAI-compatible
 │  │                  AnalyserNode RMS │ ───────► │  tts.ts         POST /api/tts   ───► │ ElevenLabs / OpenAI TTS
 │  ├ vad.ts           noise floor, EOU │          │  transcribe.ts  POST /api/transcribe │ Whisper (fallback)
 │  ├ audio/captions   Web Speech API   │          │  personas.ts    GET/POST/DELETE      │
 │  │                  or recorder      │          │  memory.ts      GET/POST/DELETE      │
 │  ├ turn.ts          state machine    │          │  checkout.ts    POST → Stripe        │
 │  ├ chunker.ts       sentence split   │          │  license.ts     GET ?key= ?session_id│
 │  ├ audio/tts.ts     playback queue   │          │  stripe-webhook.ts                   │
 │  └ conversation sheet, paywall,      │          │  skill.ts       GET /api/skill (402) │
 │    persona chips                     │          │ netlify/lib: auth, store, memory,    │
 │ index.html  marketing + pricing      │          │              personas, stripe        │
 │ thanks.html post-checkout key        │          └──────────────┬───────────────────────┘
 │ skill.html  gated skill download     │                         │
 └──────────────────────────────────────┘                         │
                                                  Netlify Blobs: memory, personas, licenses
                                                  Local dev:     memory/<key>.jsonl, MEMORY-<key>.md,
                                                                 .netlify/sonaris-store/*
 public/companion/*.webm|mp4|poster.jpg  (built by scripts/build-companion-clips.sh)
 skill/SKILL.md  (bundled with functions via included_files; never in dist/)
```

## The console

The console is one screen built around the companion's face. The face sits in the upper half inside a circular frame with a thin gold ring; the persona's name and a state line ("Resting", "Listening", "You're talking", "Thinking", "Speaking", "Paused. Go ahead.") are underneath. Your words appear live in a speech bubble beside the face, grey while interim and cream once final; the bubble fades about 1.5 s after the assistant starts to answer. The reply is shown as a subtitle band under the face, two to three lines at a time, one sentence at a time as the voice reaches it. The full history and the memory downloads live in the Conversation sheet (`M`, or the button in the bar). Voices are a chip row above the large round microphone button; "Type to talk" opens a text box that goes through the same turn pipeline. Settings (silence window, browser voice, license, add a character voice) are in a side drawer. The root `<body>` carries `data-state` with the current turn state, so headless checks can follow along.

## Companion face

`src/companion.ts` exports `CompanionFace`, which owns two stacked, muted `<video>` elements inside the circular frame. A clip change loads the next clip into the hidden buffer, starts it, then crossfades opacity over 250 ms, so the face never cuts. Each clip is offered as WebM (VP9) first and MP4 (H.264) second; the poster is `poster.jpg`.

The pure function `clipForState(prev, next)` (unit-tested in `tests/companion.test.ts`) maps turn transitions to clips:

| Turn state | Clip | Plays |
|------------|------|-------|
| `idle`, and behind the paywall | `sleep` | loop |
| `listening` | `alert` | loop |
| `user_speaking` from `idle` or `listening` | `wake`, then `alert` | once, then loop |
| `user_speaking` from `interrupted` or `thinking` | `alert` | loop |
| `thinking` | `smile` | once, holds the last frame |
| `speaking` | `speak` | loop |
| `interrupted` | current frame held 350 ms, then `alert` | loop |

The gold ring around the face breathes slowly while listening, and while speaking its opacity follows the assistant's audio level (the same level that used to drive the bar meter). All clips are preloaded when the console opens. Videos are muted, so browsers allow autoplay; if `play()` still rejects, the poster is shown instead. With `prefers-reduced-motion: reduce` only the poster is shown and no clip is loaded.

### Clips

The clips live in `public/companion/` and are cut from one 10 s render of the creature (the original is 3840×2160 HEVC, which most browsers cannot play, and it is not in the repository). `scripts/build-companion-clips.sh` takes a square centre crop, scales it to 720×720 and writes each clip as `.webm` (VP9, CRF 36) and `.mp4` (H.264, CRF 26, `yuv420p`, faststart), both silent, plus `poster.jpg`. Ping-pong clips are the forward frames followed by the same frames reversed, so they loop without a cut.

| Clip | Source time | Kind |
|------|-------------|------|
| `sleep` | 0.0 to 4.0 s | ping-pong, 8 s |
| `wake` | 4.0 to 6.0 s | forward, 2 s |
| `alert` | 5.6 to 6.0 s | ping-pong, 0.75 s |
| `smile` | 6.0 to 8.0 s | forward, 2 s |
| `speak` | 8.0 to 10.0 s | ping-pong, 4 s |
| `poster.jpg` | 9.9 s | still |

The whole folder is 1.4 MB. To regenerate from a new source file:

```bash
cd sonaris
scripts/build-companion-clips.sh /path/to/companion-source.mp4             # 720 px into public/companion
scripts/build-companion-clips.sh /path/to/source.mp4 public/companion 640  # smaller if the folder grows past 4 MB
```

The script needs `ffmpeg` with `libx264` and `libvpx-vp9`. If the timeline of a new render differs, change the five cut points at the bottom of the script.

## Turn-taking

Turn states: `idle → listening → user_speaking → thinking → speaking → listening`, plus `interrupted`. Speech may only start on `thinking → speaking`, never while the user holds the floor.

The microphone is muted for the whole time the assistant speaks. On entering `speaking` the console disables every audio track on the capture stream, stops feeding frames to the voice activity detector, and aborts the speech recognizer; any result the recognizer still delivers from before that point is dropped. On `reply_done` (and on `reply_failed`, stop, or an interruption) the tracks are re-enabled, the noise floor is reset, and recognition restarts. Without this the recognizer and the detector hear the assistant through the speakers and cut it off mid-sentence.

Because of the mute, voice detected during `speaking` is never treated as the user. Interrupting a reply is an explicit action: press Esc (stop and go back to listening), hold Space (stop and talk), submit typed text, or click the mic button. While the assistant is still `thinking` the microphone stays open, and speaking for 250 ms cancels the pending reply before it starts.

## Local development

```bash
cd sonaris
npm install
cp .env.example .env        # optional; everything runs in demo mode without keys
npx netlify dev             # frontend + functions on http://localhost:8888
```

`npm run dev` starts only the Vite frontend on port 5173 and proxies `/api/*` to port 8888, so run it next to `netlify dev` if you want hot reload for the frontend.

Other scripts: `npm run typecheck`, `npm test` (Vitest), `npm run build` (writes `dist/`), `npm run preview`.

Demo mode: with no Stripe keys, "Get a license" returns a demo license (`SONARIS-DEMO-XXXX`), which is labelled as such in the console. `app.html?demo=1` adds a "Run the demo" button that plays a simulated utterance through the bubble and then answers, so the turn-taking and the face can be shown without a microphone. If the browser has no microphone or permission is denied, the console says so and opens the text box, which goes through the same pipeline.

## Environment variables

| Variable | Used by | Purpose |
|----------|---------|---------|
| `OPENAI_API_KEY` | chat, tts, transcribe | OpenAI-compatible key. Leave unset to let the Netlify AI Gateway inject it (after the first production deploy with AI enabled). |
| `OPENAI_BASE_URL` | chat, tts, transcribe | Override the endpoint (any OpenAI-compatible server). Default `https://api.openai.com/v1`. |
| `OPENAI_MODEL` | chat | Chat model, default `gpt-4o-mini`. |
| `ELEVENLABS_API_KEY` | tts, personas | Server voices for personas with `elevenlabs_voice_id`, and instant voice cloning. |
| `STRIPE_SECRET_KEY` | checkout, license, webhook | Stripe secret key. Unset means demo licenses. |
| `STRIPE_PRICE_ID` | checkout | Price for the $29 one-time license. |
| `STRIPE_PRICE_ID_MONTHLY` | checkout | Optional monthly price. The landing page keeps the monthly card marked "Coming soon" until you enable the button. |
| `STRIPE_WEBHOOK_SECRET` | stripe-webhook | Signing secret for `checkout.session.completed`. |
| `SITE_URL` | checkout | Public URL for success and cancel links. Defaults to the request origin. |
| `SONARIS_SILENCE_MS` | docs | Default end-of-utterance silence. The console reads its own setting (slider 400 to 2000 ms, default 900). |

Optional: `OPENAI_TTS_MODEL` (default `tts-1`), `OPENAI_TRANSCRIBE_MODEL` (default `whisper-1`), `ELEVENLABS_MODEL` (default `eleven_turbo_v2_5`).

Functions read variables with `Netlify.env.get()`. Never commit real values; set them in the Netlify UI or with `netlify env:set`.

## Deploy to Netlify

1. Create a site from this repository and set the base directory to `sonaris`. `netlify.toml` sets the build command (`npm run build`), the publish directory (`dist`) and the functions directory.
2. Add the environment variables above.
3. Deploy. Functions answer under `/api/*` because each one declares its `path` in its `Config` export.
4. In Stripe, add a webhook for `checkout.session.completed` pointing at `https://<site>/api/stripe-webhook` and put its signing secret in `STRIPE_WEBHOOK_SECRET`.
5. Optional: enable Netlify AI on the site to use the AI Gateway for chat without your own OpenAI key. It activates after the first production deploy.

## How memory works

Every final user utterance and every completed or interrupted assistant reply is `POST`ed to `/api/memory`. The function appends one JSON line to `journal/<licenseKey>.jsonl` in the `memory` Blobs store and rewrites `MEMORY-<licenseKey>.md`, a rolling summary of the last 50 turns grouped by day. When running locally (`NETLIFY_DEV=true`) or when Blobs is unavailable, the same two files are written to `sonaris/memory/` on disk (`memory/*.jsonl` and `MEMORY-*.md` are gitignored). The Conversation sheet in the console lists the journal and offers both files for download. `/api/chat` reads the last 12 turns into the system prompt.

Entry shape:

```json
{"role":"user","text":"…","personaId":"aria","ts":"2026-09-03T14:02:11.418Z"}
{"role":"assistant","text":"…","personaId":"aria","ts":"2026-09-03T14:02:19.110Z","interrupted":true}
```

## How to add a character voice

In the console, click the "+ Add a voice" chip (or "Add a character voice" in Settings). Give it a name, a short description, a style prompt (how it talks), a gender for the browser fallback, and a voice provider:

- Browser voice: no keys needed.
- OpenAI voice: one of `alloy, ash, ballad, coral, echo, fable, nova, onyx, sage, shimmer, verse`.
- ElevenLabs voice ID: paste an ID from your ElevenLabs library.
- Audio sample: attach 30 seconds to 2 minutes of speech and the server calls ElevenLabs instant cloning (`/v1/voices/add`). Needs `ELEVENLABS_API_KEY`.

Custom personas are stored per license in the `personas` store and come back from `GET /api/personas?key=`. Built-ins are defined once in `src/personas.ts` and shared with the functions. The chosen persona's name is shown under the companion's face; the face itself is the same for every voice.

## Paywall and skill gating

- `POST /api/checkout` creates a Stripe Checkout Session (`mode: payment`, or `subscription` with `plan: "monthly"`). Without Stripe it returns `{ demo: true, licenseKey }`.
- `GET /api/license?session_id=` verifies the session is paid and mints `SONARIS-XXXX-XXXX-XXXX` once per session (idempotent; the webhook does the same).
- `GET /api/license?key=` returns `{ valid, plan, issuedAt }`. Demo keys validate only while Stripe is not configured.
- `GET /api/skill` returns `skill/SKILL.md` as `text/markdown` for a valid key, or `402 { error: "license_required", checkout: "/#pricing" }`. The file is bundled with the function through `included_files` and is not in `dist/`.
- The console stores the key in `localStorage` (`sonaris_license`) and checks it on load; every API call sends it as `X-Sonaris-License`.

## Browser support

| Browser | Live captions | Notes |
|---------|---------------|-------|
| Chrome, Edge | Yes (Web Speech API) | Recognition uses Google's speech service; needs network. |
| Safari | Yes (Web Speech API) | macOS and iOS 14.5+. |
| Firefox | No | Falls back to MediaRecorder slices sent to `/api/transcribe` (Whisper, needs `OPENAI_API_KEY`). Captions arrive every ~4 s. |

Server voices play through an `<audio>` element. Without a TTS provider the browser's `speechSynthesis` speaks, using the persona's gender, pitch and rate hint. If speech synthesis never starts (headless or minimal Linux builds) the reply is shown as text and the turn still completes.

## Tests

```bash
npm test
```

Vitest covers the turn state machine and interruption rule (voice while speaking is ignored, explicit interrupts stop playback, `reply_done` returns to listening), the companion's `clipForState` mapping, the mic track mute helper, the recognizer suspend and resume logic including late results, the sentence chunker, VAD end-of-utterance timing, license key format and validation, and the memory JSONL append and summary functions using the file adapter in a temp directory.
