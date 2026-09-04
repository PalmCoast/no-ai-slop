/**
 * POST /api/tts  { text, personaId, licenseKey }  → audio/mpeg
 *
 * ElevenLabs when the persona has an elevenlabs_voice_id and ELEVENLABS_API_KEY
 * is set; OpenAI TTS when the persona has an openai_voice and OPENAI_API_KEY is
 * set. Neither: HTTP 204 and the console falls back to browser speechSynthesis
 * using the persona's browser_voice_hint.
 */
import type { Config } from "@netlify/functions";
import { requireLicense } from "../lib/auth";
import { env } from "../lib/env";
import { error, licenseFromRequest, readJson } from "../lib/http";
import { resolvePersona } from "../lib/personas";

interface TtsBody {
  text?: string;
  personaId?: string;
  licenseKey?: string;
}

const MAX_TTS_CHARS = 1200;

async function elevenLabs(text: string, voiceId: string, apiKey: string): Promise<Response> {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: env("ELEVENLABS_MODEL") ?? "eleven_turbo_v2_5" }),
  });
  return r;
}

async function openAiTts(text: string, voice: string, apiKey: string): Promise<Response> {
  const base = (env("OPENAI_BASE_URL") ?? "https://api.openai.com/v1").replace(/\/$/, "");
  return fetch(`${base}/audio/speech`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: env("OPENAI_TTS_MODEL") ?? "tts-1", voice, input: text, response_format: "mp3" }),
  });
}

export default async (req: Request) => {
  if (req.method !== "POST") return error(405, "method_not_allowed", "Use POST.");
  const body = await readJson<TtsBody>(req);
  if (!body) return error(400, "bad_json", "Body must be JSON.");
  const license = await requireLicense(licenseFromRequest(req, body));
  if (license instanceof Response) return license;

  const text = (body.text ?? "").trim().slice(0, MAX_TTS_CHARS);
  if (!text) return error(400, "empty", "text is required.");
  const persona = await resolvePersona(body.personaId, license.key);

  const eleven = env("ELEVENLABS_API_KEY");
  const openai = env("OPENAI_API_KEY");

  let upstream: Response | null = null;
  let provider = "none";
  try {
    if (persona.elevenlabs_voice_id && eleven) {
      provider = "elevenlabs";
      upstream = await elevenLabs(text, persona.elevenlabs_voice_id, eleven);
    } else if (openai && (persona.openai_voice || persona.provider !== "browser")) {
      // OpenAI TTS also serves ElevenLabs personas when only OPENAI_API_KEY is
      // set, mapped by gender, so a missing ElevenLabs key never mutes them.
      provider = "openai";
      const voice = persona.openai_voice ?? (persona.gender === "female" ? "nova" : "onyx");
      upstream = await openAiTts(text, voice, openai);
    }
  } catch (e) {
    console.warn("tts upstream failed", (e as Error).message);
    upstream = null;
  }

  if (!upstream) {
    return new Response(null, { status: 204, headers: { "X-Sonaris-TTS": "browser" } });
  }
  if (!upstream.ok || !upstream.body) {
    console.warn("tts provider error", provider, upstream.status, (await upstream.text().catch(() => "")).slice(0, 200));
    return new Response(null, { status: 204, headers: { "X-Sonaris-TTS": "browser", "X-Sonaris-TTS-Error": String(upstream.status) } });
  }
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
      "X-Sonaris-TTS": provider,
    },
  });
};

export const config: Config = {
  path: "/api/tts",
  method: ["POST"],
};
