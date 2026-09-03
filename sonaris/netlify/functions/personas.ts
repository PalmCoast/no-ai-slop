/**
 * GET  /api/personas?key=…            → { personas: [...builtin, ...custom] }
 * POST /api/personas (JSON)           → add a custom character voice
 * POST /api/personas (multipart)      → action=clone: ElevenLabs instant clone
 * DELETE /api/personas?key=…&id=…     → remove a custom persona
 */
import type { Config } from "@netlify/functions";
import { buildCustomPersona, BUILTIN_PERSONAS, type CustomPersonaInput } from "../../src/personas";
import { requireLicense } from "../lib/auth";
import { env } from "../lib/env";
import { error, json, licenseFromRequest, readJson } from "../lib/http";
import { loadCustomPersonas, saveCustomPersonas } from "../lib/personas";

const MAX_CUSTOM = 24;

async function handleClone(form: FormData, licenseKey: string): Promise<Response> {
  const apiKey = env("ELEVENLABS_API_KEY");
  if (!apiKey) {
    return error(
      501,
      "cloning_not_configured",
      "Voice cloning needs ELEVENLABS_API_KEY. You can still add a character voice with an existing ElevenLabs voice ID, an OpenAI voice, or the browser voice.",
    );
  }
  const name = String(form.get("name") ?? "").trim();
  if (name.length < 2) return error(400, "bad_name", "Name must be at least 2 characters.");
  const sample = form.get("sample");
  if (!(sample instanceof Blob) || sample.size === 0) return error(400, "no_sample", "Attach an audio `sample` (30 s to 2 min works well).");
  if (sample.size > 10 * 1024 * 1024) return error(413, "too_large", "Sample must be under 10 MB.");

  const upstream = new FormData();
  upstream.append("name", `Sonaris: ${name}`.slice(0, 60));
  upstream.append("description", String(form.get("description") ?? "").slice(0, 500));
  upstream.append("files", sample, sample instanceof File && sample.name ? sample.name : "sample.webm");
  const r = await fetch("https://api.elevenlabs.io/v1/voices/add", {
    method: "POST",
    headers: { "xi-api-key": apiKey },
    body: upstream,
  });
  if (!r.ok) return error(502, "clone_failed", `ElevenLabs returned ${r.status}.`, { detail: (await r.text()).slice(0, 300) });
  const data = (await r.json()) as { voice_id?: string };
  if (!data.voice_id) return error(502, "clone_failed", "ElevenLabs did not return a voice id.");

  const existing = await loadCustomPersonas(licenseKey);
  const persona = buildCustomPersona(
    {
      name,
      description: String(form.get("description") ?? ""),
      provider: "elevenlabs",
      voiceId: data.voice_id,
      style: String(form.get("style") ?? ""),
      gender: (String(form.get("gender") ?? "male") as CustomPersonaInput["gender"]) ?? "male",
    },
    [...BUILTIN_PERSONAS, ...existing].map((p) => p.id),
  );
  if (typeof persona === "string") return error(400, "invalid", persona);
  await saveCustomPersonas(licenseKey, [...existing, persona]);
  return json({ persona, cloned: true }, { status: 201 });
}

export default async (req: Request) => {
  const url = new URL(req.url);

  if (req.method === "GET") {
    const licenseKey = licenseFromRequest(req);
    const license = await requireLicense(licenseKey);
    const custom = license instanceof Response ? [] : await loadCustomPersonas(license.key);
    return json({ personas: [...BUILTIN_PERSONAS, ...custom], licensed: !(license instanceof Response) });
  }

  if (req.method === "DELETE") {
    const license = await requireLicense(licenseFromRequest(req));
    if (license instanceof Response) return license;
    const id = url.searchParams.get("id") ?? "";
    const existing = await loadCustomPersonas(license.key);
    const next = existing.filter((p) => p.id !== id);
    if (next.length === existing.length) return error(404, "not_found", "No custom persona with that id.");
    await saveCustomPersonas(license.key, next);
    return json({ ok: true, personas: [...BUILTIN_PERSONAS, ...next] });
  }

  if (req.method !== "POST") return error(405, "method_not_allowed", "Use GET, POST, or DELETE.");

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const license = await requireLicense(licenseFromRequest(req, { licenseKey: form.get("licenseKey") }));
    if (license instanceof Response) return license;
    if (form.get("action") !== "clone") return error(400, "bad_action", "Multipart POST must set action=clone.");
    return handleClone(form, license.key);
  }

  const body = await readJson<CustomPersonaInput & { licenseKey?: string; action?: string }>(req);
  if (!body) return error(400, "bad_json", "Body must be JSON.");
  const license = await requireLicense(licenseFromRequest(req, body));
  if (license instanceof Response) return license;
  if (body.action === "clone") return error(400, "bad_action", "Send clone requests as multipart/form-data with a `sample` file.");

  const existing = await loadCustomPersonas(license.key);
  if (existing.length >= MAX_CUSTOM) return error(409, "limit", `At most ${MAX_CUSTOM} custom voices per license.`);
  const persona = buildCustomPersona(body, [...BUILTIN_PERSONAS, ...existing].map((p) => p.id));
  if (typeof persona === "string") return error(400, "invalid", persona);
  await saveCustomPersonas(license.key, [...existing, persona]);
  return json({ persona, personas: [...BUILTIN_PERSONAS, ...existing, persona] }, { status: 201 });
};

export const config: Config = {
  path: "/api/personas",
  method: ["GET", "POST", "DELETE"],
};
