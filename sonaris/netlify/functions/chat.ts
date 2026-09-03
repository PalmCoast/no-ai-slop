/**
 * POST /api/chat  { messages, personaId, licenseKey }
 * Streams the assistant reply as plain text chunks (text/plain; charset=utf-8).
 *
 * Provider: any OpenAI-compatible chat completions endpoint. With no key set,
 * the Netlify AI Gateway injects OPENAI_API_KEY/OPENAI_BASE_URL after the first
 * production deploy, so the same code path covers both. With nothing
 * configured at all we still return HTTP 200 with a helpful message so the
 * console can speak it and never hard-fails.
 */
import type { Config } from "@netlify/functions";
import { requireLicense } from "../lib/auth";
import { env } from "../lib/env";
import { error, licenseFromRequest, readJson, text } from "../lib/http";
import { memoryForPrompt, readJournal } from "../lib/memory";
import { resolvePersona } from "../lib/personas";
import { openStore } from "../lib/store";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatBody {
  messages?: ChatMessage[];
  personaId?: string;
  licenseKey?: string;
}

const MAX_MESSAGES = 24;
const MAX_CONTENT = 4000;

function baseSystemPrompt(personaName: string, style: string, memory: string): string {
  const parts = [
    `You are Sonaris, a voice assistant. The user is talking to you out loud and your reply will be read aloud, so write the way people speak: short sentences, no markdown, no bullet lists, no headings, no emojis. Spell out anything that would be awkward to hear (say "for example" not "e.g.").`,
    `Keep answers to two or three sentences unless the user asks for detail. Answer first, then explain if needed.`,
    `Active persona: ${personaName}. ${style}`,
  ];
  if (memory.trim()) {
    parts.push(`Recent memory from earlier conversations with this user (oldest first). Use it when relevant, do not recite it:\n${memory}`);
  }
  return parts.join("\n\n");
}

function sanitizeMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];
  const out: ChatMessage[] = [];
  for (const m of input.slice(-MAX_MESSAGES)) {
    if (!m || typeof m !== "object") continue;
    const role = (m as ChatMessage).role;
    const content = (m as ChatMessage).content;
    if ((role === "user" || role === "assistant") && typeof content === "string" && content.trim()) {
      out.push({ role, content: content.trim().slice(0, MAX_CONTENT) });
    }
  }
  return out;
}

function noProviderReply(lastUser: string): string {
  const heard = lastUser ? ` I heard you say: "${lastUser.slice(0, 200)}".` : "";
  return (
    `Sonaris is running without a language model, so I can't answer that yet.${heard} ` +
    `To turn on real answers, set OPENAI_API_KEY (and optionally OPENAI_BASE_URL) in your Netlify environment, ` +
    `or enable Netlify AI on this site and deploy once. Your words were still saved to memory.`
  );
}

/** Parse an OpenAI-style SSE stream and emit only the delta text. */
function deltaStream(upstream: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  return upstream.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const raw of lines) {
          const line = raw.trim();
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data || data === "[DONE]") continue;
          try {
            const j = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string | null } }> };
            const piece = j.choices?.[0]?.delta?.content;
            if (piece) controller.enqueue(encoder.encode(piece));
          } catch {
            // Ignore keep-alives and partial JSON.
          }
        }
      },
    }),
  );
}

export default async (req: Request) => {
  if (req.method !== "POST") return error(405, "method_not_allowed", "Use POST.");
  const body = await readJson<ChatBody>(req);
  if (!body) return error(400, "bad_json", "Body must be JSON.");

  const licenseKey = licenseFromRequest(req, body);
  const license = await requireLicense(licenseKey);
  if (license instanceof Response) return license;

  const messages = sanitizeMessages(body.messages);
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  if (!lastUser) return error(400, "empty", "Send at least one user message.");

  const persona = await resolvePersona(body.personaId, license.key);
  const memoryEntries = await readJournal(openStore("memory"), license.key).catch(() => []);
  const system = baseSystemPrompt(persona.name, persona.style, memoryForPrompt(memoryEntries));

  const apiKey = env("OPENAI_API_KEY");
  const baseUrl = (env("OPENAI_BASE_URL") ?? "https://api.openai.com/v1").replace(/\/$/, "");
  if (!apiKey) {
    return text(noProviderReply(lastUser), { headers: { "X-Sonaris-Provider": "none" } });
  }

  const model = env("OPENAI_MODEL") ?? "gpt-4o-mini";
  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        stream: true,
        temperature: 0.7,
        max_tokens: 400,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });
  } catch (e) {
    return text(`I couldn't reach the language model (${(e as Error).message}). Check OPENAI_BASE_URL and try again.`, {
      headers: { "X-Sonaris-Provider": "error" },
    });
  }

  if (!upstream.ok || !upstream.body) {
    const detail = (await upstream.text().catch(() => "")).slice(0, 300);
    return text(`The language model returned an error (${upstream.status}). ${detail}`, {
      headers: { "X-Sonaris-Provider": "error" },
    });
  }

  return new Response(deltaStream(upstream.body), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Sonaris-Provider": "openai-compatible",
      "X-Sonaris-Model": model,
    },
  });
};

export const config: Config = {
  path: "/api/chat",
  method: ["POST"],
};
