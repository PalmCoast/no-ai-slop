/**
 * POST /api/transcribe  multipart/form-data { audio: <webm/ogg/mp4 blob>, licenseKey }
 * → { text }
 *
 * Fallback for browsers without the Web Speech API (Firefox). Uses OpenAI
 * Whisper when OPENAI_API_KEY is set, otherwise 501 with a clear message.
 */
import type { Config } from "@netlify/functions";
import { requireLicense } from "../lib/auth";
import { env } from "../lib/env";
import { error, json, licenseFromRequest } from "../lib/http";

export default async (req: Request) => {
  if (req.method !== "POST") return error(405, "method_not_allowed", "Use POST.");
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return error(400, "bad_form", "Send multipart/form-data with an `audio` file.");
  }
  const licenseKey = licenseFromRequest(req, { licenseKey: form.get("licenseKey") });
  const license = await requireLicense(licenseKey);
  if (license instanceof Response) return license;

  const audio = form.get("audio");
  if (!(audio instanceof Blob) || audio.size === 0) return error(400, "no_audio", "`audio` file is required.");
  if (audio.size > 8 * 1024 * 1024) return error(413, "too_large", "Audio must be under 8 MB.");

  const apiKey = env("OPENAI_API_KEY");
  if (!apiKey) {
    return error(
      501,
      "transcription_not_configured",
      "Server transcription needs OPENAI_API_KEY. Use Chrome, Edge, or Safari for live captions without it.",
    );
  }

  const base = (env("OPENAI_BASE_URL") ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const upstreamForm = new FormData();
  const filename = audio instanceof File && audio.name ? audio.name : "speech.webm";
  upstreamForm.append("file", audio, filename);
  upstreamForm.append("model", env("OPENAI_TRANSCRIBE_MODEL") ?? "whisper-1");
  upstreamForm.append("response_format", "json");
  const lang = form.get("language");
  if (typeof lang === "string" && lang) upstreamForm.append("language", lang);

  const r = await fetch(`${base}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: upstreamForm,
  });
  if (!r.ok) {
    return error(502, "transcription_failed", `Whisper returned ${r.status}.`, { detail: (await r.text()).slice(0, 300) });
  }
  const data = (await r.json()) as { text?: string };
  return json({ text: (data.text ?? "").trim() });
};

export const config: Config = {
  path: "/api/transcribe",
  method: ["POST"],
};
