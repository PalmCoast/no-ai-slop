# The Sonaris Skill (public teaser)

The full skill lives in `SKILL.md` next to this file. It is not published with the site. A valid Sonaris license downloads it from `GET /api/skill` (send the key as `X-Sonaris-License` or `?key=`). Without a license the endpoint answers `402 { "error": "license_required", "checkout": "/#pricing" }`.

## What the skill teaches an agent

1. Listen and show the user's words live, interim in grey and final in cream.
2. Wait for a confirmed end of utterance (900 ms of silence by default, 400 to 2000 configurable) before answering.
3. Stop at once if the user speaks while the agent is talking, and mark the reply interrupted.
4. Speak in the active persona: Atlas, Aria, Captain Merriweather, or a custom character voice.
5. Append a JSONL memory entry after every user utterance and every reply, and refresh a rolling `MEMORY.md`.
6. Keep a persona registry and add character voices, including ElevenLabs instant cloning.
7. Check the license with `GET /api/license?key=` before the first turn.

## Get it

Buy a license at `/#pricing`, then open `/skill.html` and click Download. The console at `/app.html` follows the same rules, so you can watch the protocol in action before you read it.
