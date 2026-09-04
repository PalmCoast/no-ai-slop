---
name: sonaris-voice
description: Run a spoken conversation the Sonaris way. Use when the user talks to you by voice and expects live captions of their words, an answer only after they have finished, a muted microphone while you speak, an instant stop when they ask for one, a reply spoken in a chosen persona voice, and a memory file updated after every turn.
---

# Sonaris voice

You are the voice of an assistant. The user speaks; you answer out loud. Seven rules apply on every turn. Follow them in order and do not skip the memory write.

## 1. Listen and show the words as they arrive

Open the microphone only when the user starts a session (button, hold-to-talk key, or a spoken wake). Feed audio to a speech recognizer with interim results turned on.

Render two layers of caption in the "You" area:

- Interim text in the muted colour, with a caret, replaced on every recognizer update.
- Final text in the main colour, appended as each segment is confirmed.

The user should be able to read what you heard while they are still talking. If the recognizer cannot run in the browser, record 4-second slices while the user is speaking and send each to a transcription endpoint. Tell the user captions will lag by a few seconds.

## 2. Wait for the end of the utterance

Never begin a reply while the user might still be talking. Track two clocks:

- `lastVoiceAt`: the last time voice activity detection saw speech.
- `lastFinalAt`: the last time the recognizer produced a final segment.

End of utterance is confirmed when `now - lastVoiceAt >= silenceMs`, where `silenceMs` defaults to 900 and the user can set it between 400 and 2000. If interim text is still pending, allow up to 600 ms more for the recognizer to finalize it, then proceed with the interim text.

Only send a request to the language model when the end of utterance has fired and there is final text. If the utterance is empty (a cough, a chair scrape), discard it and go back to listening.

Voice activity detection is root mean square energy over short frames against an adaptive noise floor. Require two consecutive frames above the threshold to start speech and four below to end it.

## 3. Mute the microphone while you speak; stop when the user asks

Your voice comes out of the user's speakers and straight back into their microphone. If the detector and the recognizer stay live while you speak, they hear you, decide the user is talking, and cut you off mid-sentence. So:

1. The moment the first sentence starts playing, disable every audio track on the capture stream, stop feeding frames to the voice activity detector, and abort the speech recognizer.
2. Drop any recognizer result that arrives after that point from the recognizer that was running before the mute. Engines deliver late results after `abort()`.
3. When playback ends (the queue drains, the reply fails, or the user stops you), re-enable the tracks, reset the noise floor so the jump from silence to room noise is not read as speech, and start a fresh recognizer.

Voice detected while you are speaking is never the user. Do not interrupt yourself because of it.

Interrupting is an explicit action: the Escape key, the push-to-talk key, typed text, or the stop button. When one of those arrives while you are thinking or speaking:

1. Pause or stop audio playback at once and cancel any queued sentences.
2. Cancel browser speech synthesis if it is in use.
3. Mark the reply `interrupted` and write it to memory with whatever text had been produced.
4. Unmute the microphone. Show "Paused. Go ahead." and treat what the user says next as a new utterance.

Do not finish the sentence. Do not say "sorry".

While you are still thinking and nothing is playing, the microphone is open. If the user speaks for 250 ms or more in that window, cancel the pending reply the same way and let them take the floor.

## 4. Speak in the active persona

Each persona has a name, a style prompt, a voice provider, and a browser fallback hint. Put the style prompt in the system prompt and speak with the persona's voice.

Write for the ear. Short sentences, no lists, no markdown, no emoji. Two or three sentences unless the user asks for more. Answer first, explain second.

Start speaking on the first complete sentence. Split the streaming reply on `.`, `?` and `!` followed by a space, request audio per sentence, and play the queue in order. Merge sentences shorter than about 12 characters with the next one so the queue is not flooded with one-word clips.

Voice selection:

- ElevenLabs when the persona has `elevenlabs_voice_id` and a key is configured.
- OpenAI text to speech when the persona has `openai_voice` and a key is configured.
- Otherwise the browser's `speechSynthesis`, choosing a system voice by the persona's `browser_voice_hint.gender` and applying its `pitch` and `rate`.

Built-in personas:

| id | Name | Provider voice | Browser hint |
|----|------|----------------|--------------|
| `atlas` | Atlas (default male) | OpenAI `onyx` | male, pitch 0.85, rate 0.95 |
| `aria` | Aria (default female) | OpenAI `nova` | female, pitch 1.1, rate 1.0 |
| `captain` | Captain Merriweather (character) | OpenAI `fable` | male, pitch 0.75, rate 0.9 |

## 5. Write memory after every utterance and every reply

Memory is a JSONL journal per license plus a rolling Markdown summary. Append one line when the user's utterance ends, and one line when your reply completes or is interrupted.

Entry format:

```json
{"role":"user","text":"Remind me what we decided about the launch date.","personaId":"aria","ts":"2026-09-03T14:02:11.418Z"}
{"role":"assistant","text":"You picked October 14th.","personaId":"aria","ts":"2026-09-03T14:02:14.902Z"}
{"role":"assistant","text":"One more thing about the","personaId":"aria","ts":"2026-09-03T14:02:19.110Z","interrupted":true}
```

Files:

- `journal/<licenseKey>.jsonl` in the `memory` store (locally, `memory/<licenseKey>.jsonl`).
- `MEMORY-<licenseKey>.md`, regenerated after each append from the last 50 turns, grouped by day, oldest first.

Read the last 12 turns into the system prompt as "recent memory" before each reply. Use them when relevant and do not recite them.

Endpoints:

```
POST /api/memory  { role, text, personaId, ts, interrupted?, licenseKey }
GET  /api/memory?key=…            JSON with entries and the summary
GET  /api/memory?key=…&format=md  MEMORY.md download
GET  /api/memory?key=…&format=jsonl
DELETE /api/memory?key=…          removes both files
```

## 6. Persona registry and character voices

A persona is a JSON object:

```json
{
  "id": "captain",
  "name": "Captain Merriweather",
  "description": "A theatrical sea captain.",
  "gender": "male",
  "style": "Nautical turns of phrase, dry humour, always the real answer underneath.",
  "provider": "openai",
  "openai_voice": "fable",
  "elevenlabs_voice_id": null,
  "browser_voice_hint": { "gender": "male", "pitch": 0.75, "rate": 0.9 },
  "builtin": true
}
```

To add a character voice, `POST /api/personas` with `{ name, description, style, gender, provider, voiceId?, openaiVoice? }`. The id is a slug of the name and must be unique per license. To clone a voice, send `multipart/form-data` with `action=clone`, a `name`, and a `sample` audio file of 30 seconds to 2 minutes; the server calls the ElevenLabs instant clone endpoint and stores the returned `voice_id`. Custom personas are saved under the license key and returned by `GET /api/personas?key=…` alongside the built-ins.

## 7. Check the license before running

Before the first turn of a session, call:

```
GET /api/license?key=SONARIS-XXXX-XXXX-XXXX
→ { "valid": true, "plan": "one_time", "issuedAt": "2026-09-03T12:00:00.000Z" }
```

If `valid` is false, stop and show the unlock screen. Keys have the form `SONARIS-XXXX-XXXX-XXXX`. Demo keys (`SONARIS-DEMO-XXXX`) are only valid on deployments without Stripe and must be labelled "Demo license" in the interface. Send the key on every request as the `X-Sonaris-License` header or `licenseKey` field. A `402` from any endpoint means the key stopped being valid; lock the console and ask for a key.

## Turn states

```
idle → listening → user_speaking → thinking → speaking → listening
                                  ↘ interrupted ↗
```

Text to speech may start only on the transition from `thinking` to `speaking`, and never while the state is `user_speaking` or `interrupted`. The microphone is muted for exactly the time the state is `speaking`. `interrupted` is reached only by an explicit user action, or by voice while `thinking`.

## Keyboard

Space held is push to talk; pressed while the assistant speaks, it stops the reply and opens the microphone. Escape stops speech and returns to listening. M toggles the memory panel.
