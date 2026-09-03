/**
 * Persona registry shared by the console (browser) and the Netlify functions.
 * Keep this file free of DOM or Node APIs.
 */

export type PersonaProvider = "elevenlabs" | "openai" | "browser";
export type PersonaGender = "male" | "female" | "neutral";

export interface BrowserVoiceHint {
  /** Used to pick a system voice when no server TTS provider is configured. */
  gender: "male" | "female";
  /** speechSynthesis pitch, 0..2 (1 = default). */
  pitch: number;
  /** speechSynthesis rate, 0.1..10 (1 = default). */
  rate: number;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  gender: PersonaGender;
  /** Style instructions appended to the system prompt. */
  style: string;
  provider: PersonaProvider;
  elevenlabs_voice_id?: string;
  openai_voice?: string;
  browser_voice_hint: BrowserVoiceHint;
  builtin: boolean;
}

export const BUILTIN_PERSONAS: readonly Persona[] = [
  {
    id: "atlas",
    name: "Atlas",
    description: "Default male voice. Warm baritone, measured pace.",
    gender: "male",
    style:
      "Speak in a warm, measured baritone register. Short sentences. Calm and direct. " +
      "Answer the question first, then add one useful detail if it helps.",
    provider: "openai",
    openai_voice: "onyx",
    browser_voice_hint: { gender: "male", pitch: 0.85, rate: 0.95 },
    builtin: true,
  },
  {
    id: "aria",
    name: "Aria",
    description: "Default female voice. Bright and clear.",
    gender: "female",
    style:
      "Speak in a bright, clear, friendly register. Plain words, natural rhythm. " +
      "Lead with the answer and keep it brief unless asked for more.",
    provider: "openai",
    openai_voice: "nova",
    browser_voice_hint: { gender: "female", pitch: 1.1, rate: 1.0 },
    builtin: true,
  },
  {
    id: "captain",
    name: "Captain Merriweather",
    description: "Example character voice. A theatrical sea captain who has seen every port.",
    gender: "male",
    style:
      "You are Captain Merriweather, a theatrical old sea captain. Nautical turns of phrase, " +
      "a dry sense of humour, and a fondness for weather metaphors. Stay in character, " +
      "but always give the real, correct answer underneath the theatre. Keep replies short " +
      "enough to say out loud in one breath or two.",
    provider: "openai",
    openai_voice: "fable",
    browser_voice_hint: { gender: "male", pitch: 0.75, rate: 0.9 },
    builtin: true,
  },
];

export const DEFAULT_PERSONA_ID = "atlas";

export function findPersona(id: string | null | undefined, extra: readonly Persona[] = []): Persona {
  const all = [...BUILTIN_PERSONAS, ...extra];
  return all.find((p) => p.id === id) ?? all[0]!;
}

export interface CustomPersonaInput {
  name: string;
  description?: string;
  provider: PersonaProvider;
  voiceId?: string;
  openaiVoice?: string;
  style?: string;
  gender?: PersonaGender;
}

const OPENAI_VOICES = new Set(["alloy", "ash", "ballad", "coral", "echo", "fable", "nova", "onyx", "sage", "shimmer", "verse"]);

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/**
 * Validates user input for a custom persona and returns a full Persona, or a
 * string describing what is wrong.
 */
export function buildCustomPersona(input: CustomPersonaInput, existingIds: readonly string[] = []): Persona | string {
  const name = (input.name ?? "").trim();
  if (name.length < 2 || name.length > 40) return "Name must be 2 to 40 characters.";
  const provider = input.provider;
  if (provider !== "elevenlabs" && provider !== "openai" && provider !== "browser") {
    return "Provider must be elevenlabs, openai, or browser.";
  }
  if (provider === "elevenlabs" && !(input.voiceId ?? "").trim()) return "An ElevenLabs voice ID is required.";
  const openaiVoice = (input.openaiVoice ?? "").trim().toLowerCase();
  if (provider === "openai" && !OPENAI_VOICES.has(openaiVoice)) {
    return `OpenAI voice must be one of: ${[...OPENAI_VOICES].join(", ")}.`;
  }
  const gender: PersonaGender = input.gender === "female" || input.gender === "neutral" ? input.gender : "male";
  let id = slugify(name) || "voice";
  let n = 2;
  while (existingIds.includes(id)) id = `${slugify(name)}-${n++}`;
  const hintGender = gender === "female" ? "female" : "male";
  return {
    id,
    name,
    description: (input.description ?? "").trim().slice(0, 200),
    gender,
    style: (input.style ?? "").trim().slice(0, 1200) || `Speak as ${name}. Keep replies short and natural.`,
    provider,
    elevenlabs_voice_id: provider === "elevenlabs" ? input.voiceId!.trim() : undefined,
    openai_voice: provider === "openai" ? openaiVoice : undefined,
    browser_voice_hint: { gender: hintGender, pitch: hintGender === "female" ? 1.1 : 0.85, rate: 1.0 },
    builtin: false,
  };
}
