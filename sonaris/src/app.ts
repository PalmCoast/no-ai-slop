/**
 * Sonaris voice console.
 *
 * Wires the turn-taking state machine (turn.ts) to the microphone, live
 * captions, voice activity detection, the streaming chat reply, the sentence
 * playback queue, the memory panel, and the license gate.
 */
import { api, ApiError, type ChatMessage, type MemoryEntry } from "./api";
import { RecorderCaptions, WebSpeechCaptions, webSpeechSupported, type CaptionSource } from "./audio/captions";
import { MicError, openMic, type MicHandle } from "./audio/mic";
import { SpeechQueue, warmBrowserVoices } from "./audio/tts";
import { createSentenceChunker } from "./chunker";
import { isPlausibleLicense, normalizeKey } from "./license";
import { BUILTIN_PERSONAS, DEFAULT_PERSONA_ID, findPersona, type CustomPersonaInput, type Persona } from "./personas";
import { TurnMachine, TurnState } from "./turn";
import { clampSilence, DEFAULT_SILENCE_MS, shouldEndUtterance, VoiceActivityDetector } from "./vad";

// ---------------------------------------------------------------------------
// DOM helpers

function $<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

const els = {
  persona: $<HTMLSelectElement>("persona"),
  addVoiceBtn: $<HTMLButtonElement>("add-voice-btn"),
  statePill: $("state-pill"),
  settingsBtn: $<HTMLButtonElement>("settings-btn"),
  memoryBtn: $<HTMLButtonElement>("memory-btn"),
  notice: $("notice"),
  youCap: document.querySelector<HTMLElement>(".cap-you")!,
  youFinal: $("you-final"),
  youInterim: $("you-interim"),
  sonarisLabel: $("sonaris-label"),
  interruptedBadge: $("interrupted-badge"),
  sonarisText: $("sonaris-text"),
  meter: $("meter"),
  micBtn: $<HTMLButtonElement>("mic-btn"),
  typeForm: $<HTMLFormElement>("type-form"),
  typeInput: $<HTMLInputElement>("type-input"),
  demoBar: $("demo-bar"),
  demoRun: $<HTMLButtonElement>("demo-run"),
  memoryPanel: $("memory-panel"),
  memoryMeta: $("memory-meta"),
  memoryClose: $<HTMLButtonElement>("memory-close"),
  dlMd: $<HTMLAnchorElement>("dl-md"),
  dlJsonl: $<HTMLAnchorElement>("dl-jsonl"),
  memoryClear: $<HTMLButtonElement>("memory-clear"),
  memoryList: $("memory-list"),
  settings: $("settings"),
  settingsClose: $<HTMLButtonElement>("settings-close"),
  silence: $<HTMLInputElement>("silence"),
  silenceVal: $("silence-val"),
  neverTalkOver: $<HTMLInputElement>("never-talk-over"),
  preferBrowser: $<HTMLInputElement>("prefer-browser"),
  licenseInfo: $("license-info"),
  licenseForget: $<HTMLButtonElement>("license-forget"),
  engineInfo: $("engine-info"),
  voiceModal: $("voice-modal"),
  voiceForm: $<HTMLFormElement>("voice-form"),
  voiceCancel: $<HTMLButtonElement>("voice-cancel"),
  voiceError: $("voice-error"),
  voiceSave: $<HTMLButtonElement>("voice-save"),
  vProvider: $<HTMLSelectElement>("v-provider"),
  lock: $("lock"),
  lockBuy: $<HTMLButtonElement>("lock-buy"),
  lockForm: $<HTMLFormElement>("lock-form"),
  lockKey: $<HTMLInputElement>("lock-key"),
  lockMsg: $("lock-msg"),
};

// ---------------------------------------------------------------------------
// Settings (localStorage)

const LS = {
  license: "sonaris_license",
  persona: "sonaris_persona",
  silence: "sonaris_silence_ms",
  neverTalkOver: "sonaris_never_talk_over",
  preferBrowser: "sonaris_prefer_browser_voice",
};

const settings = {
  silenceMs: clampSilence(Number(localStorage.getItem(LS.silence) ?? DEFAULT_SILENCE_MS)),
  neverTalkOver: localStorage.getItem(LS.neverTalkOver) !== "false",
  preferBrowser: localStorage.getItem(LS.preferBrowser) === "true",
};

const params = new URLSearchParams(location.search);
const DEMO_MODE = params.get("demo") === "1";

// ---------------------------------------------------------------------------
// App state

let licenseKey = "";
let personas: Persona[] = [...BUILTIN_PERSONAS];
let activePersona: Persona = findPersona(localStorage.getItem(LS.persona) ?? DEFAULT_PERSONA_ID);
let history: ChatMessage[] = [];
let memoryEntries: MemoryEntry[] = [];
let memoryStorage = "";

let mic: MicHandle | null = null;
let captions: CaptionSource | null = null;
let micUnavailable: string | null = null;
const vad = new VoiceActivityDetector();
let frameTimer: number | null = null;
let eouTimer: number | null = null;

// Current utterance
let finalText = "";
let interimText = "";
let lastVoiceAt: number | null = null;
let lastFinalAt: number | null = null;
let pttHeld = false;

// Current reply
let replyAbort: AbortController | null = null;
let replyQueue: SpeechQueue | null = null;
let replyText = "";

const machine = new TurnMachine({
  bargeInMs: 250,
  neverTalkOver: settings.neverTalkOver,
  onChange: (state, prev, event) => onStateChange(state, prev, event),
});

// ---------------------------------------------------------------------------
// UI primitives

const STATE_LABEL: Record<TurnState, string> = {
  [TurnState.Idle]: "Idle",
  [TurnState.Listening]: "Listening",
  [TurnState.UserSpeaking]: "You're speaking",
  [TurnState.Thinking]: "Thinking",
  [TurnState.Speaking]: "Speaking",
  [TurnState.Interrupted]: "Paused. Go ahead.",
};

function setPill(state: TurnState): void {
  els.statePill.dataset.state = state;
  els.statePill.textContent = STATE_LABEL[state];
}

let noticeTimer: number | null = null;
function notice(message: string, tone: "info" | "warn" = "info", ms = 8000): void {
  els.notice.textContent = message;
  els.notice.dataset.tone = tone;
  els.notice.hidden = false;
  if (noticeTimer !== null) clearTimeout(noticeTimer);
  noticeTimer = ms > 0 ? window.setTimeout(() => (els.notice.hidden = true), ms) : null;
}

const METER_BARS = 28;
for (let i = 0; i < METER_BARS; i++) els.meter.appendChild(document.createElement("i"));
const bars = Array.from(els.meter.children) as HTMLElement[];
function renderMeter(level: number, who: "user" | "assistant" | ""): void {
  els.meter.dataset.who = who;
  const mid = (METER_BARS - 1) / 2;
  for (let i = 0; i < METER_BARS; i++) {
    const dist = Math.abs(i - mid) / mid;
    const shape = 1 - dist * 0.75;
    const jitter = level > 0 ? 0.75 + Math.random() * 0.5 : 1;
    const h = 4 + Math.round(level * shape * jitter * 30);
    bars[i]!.style.height = `${Math.max(4, Math.min(34, h))}px`;
  }
}
renderMeter(0, "");

function renderYouCaption(): void {
  els.youFinal.textContent = finalText ? finalText + (interimText ? " " : "") : "";
  els.youInterim.textContent = interimText;
  const has = Boolean(finalText || interimText);
  els.youCap.classList.toggle("has-text", has);
  const live = machine.state === TurnState.UserSpeaking || (machine.state === TurnState.Listening && Boolean(interimText));
  els.youCap.classList.toggle("live", live || pttHeld);
}

function setSonarisLabel(): void {
  els.sonarisLabel.textContent = `Sonaris · ${activePersona.name}`;
}

// ---------------------------------------------------------------------------
// State changes

function onStateChange(state: TurnState, prev: TurnState, event: string): void {
  setPill(state);
  els.micBtn.setAttribute("aria-pressed", String(state !== TurnState.Idle));
  els.micBtn.setAttribute("aria-label", state === TurnState.Idle ? "Start listening" : "Stop listening");
  els.interruptedBadge.hidden = state !== TurnState.Interrupted;
  if (state === TurnState.Interrupted) {
    interruptReply();
  }
  if (state === TurnState.UserSpeaking && prev !== TurnState.UserSpeaking && prev !== TurnState.Interrupted) {
    // A fresh utterance begins: clear the previous one from the You panel.
    if (event === "voice_start" && !finalText && !interimText) renderYouCaption();
  }
  if (state === TurnState.Idle) renderMeter(0, "");
  renderYouCaption();
}

// ---------------------------------------------------------------------------
// Microphone + VAD loop

function resetUtterance(): void {
  finalText = "";
  interimText = "";
  lastVoiceAt = null;
  lastFinalAt = null;
  renderYouCaption();
}

function captionEvents() {
  return {
    onInterim(text: string) {
      // Ignore the recognizer while the assistant holds the floor (echo of its
      // own voice); the VAD barge-in path decides when the user takes over.
      if (machine.state === TurnState.Speaking || machine.state === TurnState.Thinking) return;
      interimText = text;
      renderYouCaption();
    },
    onFinal(text: string) {
      if (machine.state === TurnState.Speaking || machine.state === TurnState.Thinking) return;
      if (machine.state === TurnState.Listening) {
        // Recognizer heard speech the VAD missed (very quiet mic); take the floor.
        machine.send("voice_start");
        lastVoiceAt = performance.now();
      }
      finalText = finalText ? `${finalText} ${text}` : text;
      interimText = "";
      lastFinalAt = performance.now();
      renderYouCaption();
    },
    onStatus(status: string) {
      if (status === "transcribing") notice("Transcribing…", "info", 3000);
      updateEngineInfo(status);
    },
    onError(code: string, message: string) {
      if (code === "network" || code === "service-not-allowed") {
        notice("Live captions need network access to the browser's speech service. Switching to server transcription.", "warn");
        switchToRecorderCaptions();
        return;
      }
      if (code === "not-allowed") {
        notice("Speech recognition was blocked. You can still type to talk.", "warn");
        return;
      }
      if (code === "transcription_not_configured") {
        notice("Server transcription is not configured (OPENAI_API_KEY). Type to talk instead.", "warn", 12000);
        return;
      }
      notice(`Captions: ${message}`, "warn");
    },
  };
}

function updateEngineInfo(status = ""): void {
  const engine = captions ? (captions.kind === "web-speech" ? "Web Speech API (live, in-browser)" : "MediaRecorder → /api/transcribe (Whisper), ~4 s slices") : micUnavailable ? `No microphone: ${micUnavailable}` : "Not started";
  els.engineInfo.textContent = status ? `${engine} · ${status}` : engine;
}

function switchToRecorderCaptions(): void {
  if (!mic) return;
  captions?.stop();
  captions = new RecorderCaptions(mic.stream, captionEvents(), {
    transcribe: (blob) => api.transcribe(licenseKey, blob),
    isVoiced: () => machine.state === TurnState.UserSpeaking,
  });
  captions.start();
  updateEngineInfo();
}

async function startListening(): Promise<void> {
  if (machine.state !== TurnState.Idle) return;
  if (!mic) {
    try {
      mic = await openMic();
      micUnavailable = null;
    } catch (e) {
      const err = e as MicError;
      micUnavailable = err.message;
      els.micBtn.dataset.unavailable = "true";
      const why = err.code === "denied" ? "Microphone access was denied" : err.code === "notfound" ? "No microphone found" : err.message;
      notice(`${why}. Type to talk: the text box below goes through the same turn pipeline.`, "warn", 0);
      els.typeInput.focus();
      updateEngineInfo();
      return;
    }
  }
  vad.reset();
  resetUtterance();
  machine.send("start");
  if (webSpeechSupported()) {
    captions = new WebSpeechCaptions(captionEvents());
  } else if (RecorderCaptions.supported()) {
    notice("This browser has no live speech recognition. Captions arrive in ~4 s slices via server transcription.", "info", 10000);
    captions = new RecorderCaptions(mic.stream, captionEvents(), {
      transcribe: (blob) => api.transcribe(licenseKey, blob),
      isVoiced: () => machine.state === TurnState.UserSpeaking,
    });
  }
  captions?.start();
  updateEngineInfo();
  frameTimer = window.setInterval(onFrame, 25);
  eouTimer = window.setInterval(checkEndOfUtterance, 50);
}

function stopListening(): void {
  if (frameTimer !== null) clearInterval(frameTimer);
  if (eouTimer !== null) clearInterval(eouTimer);
  frameTimer = eouTimer = null;
  captions?.stop();
  captions = null;
  stopReply(false);
  machine.send("stop");
  resetUtterance();
  updateEngineInfo();
}

function onFrame(): void {
  if (!mic) return;
  const now = performance.now();
  const frame = vad.push(mic.readRms());
  const voiced = frame.voiced || pttHeld;
  if (voiced) lastVoiceAt = now;
  machine.onVoiceFrame(voiced, now);
  if (machine.state === TurnState.UserSpeaking || machine.state === TurnState.Listening) {
    renderMeter(Math.min(1, frame.rms * 6), voiced ? "user" : "");
  }
}

function checkEndOfUtterance(): void {
  if (machine.state !== TurnState.UserSpeaking) return;
  if (pttHeld) return;
  const fire = shouldEndUtterance({
    now: performance.now(),
    lastVoiceAt,
    lastFinalAt,
    hasInterim: Boolean(interimText),
    silenceMs: settings.silenceMs,
  });
  if (fire) void finishUtterance();
}

async function finishUtterance(): Promise<void> {
  if (machine.state !== TurnState.UserSpeaking) return;
  await captions?.flush();
  // Promote leftover interim text (recognizer never finalized it).
  if (!finalText && interimText) finalText = interimText;
  interimText = "";
  const text = finalText.trim();
  if (!text) {
    machine.send("utterance_discarded");
    resetUtterance();
    return;
  }
  machine.send("end_of_utterance");
  renderYouCaption();
  await respond(text);
}

// ---------------------------------------------------------------------------
// Reply pipeline: stream chat → sentence chunks → playback queue

async function respond(userText: string): Promise<void> {
  history.push({ role: "user", content: userText });
  history = history.slice(-16);
  void recordMemory({ role: "user", text: userText, personaId: activePersona.id });

  els.sonarisText.textContent = "";
  replyText = "";
  const abort = new AbortController();
  replyAbort = abort;
  const chunker = createSentenceChunker();
  const persona = activePersona;

  const queue = new SpeechQueue({
    fetchAudio: (text, signal) => api.tts(licenseKey, persona.id, text, signal),
    hint: persona.browser_voice_hint,
    preferBrowser: settings.preferBrowser,
    allowPlayback: () => machine.state === TurnState.Speaking || machine.state === TurnState.Thinking,
    events: {
      onStart() {
        if (machine.state === TurnState.Thinking) machine.send("reply_ready");
      },
      onSentence() {
        // Caption already streams in; nothing extra to render per sentence.
      },
      onLevel(level) {
        if (machine.state === TurnState.Speaking) renderMeter(level, "assistant");
      },
      onDone() {
        if (replyQueue !== queue) return;
        replyQueue = null;
        finishReply(false);
      },
      onWarning(message) {
        notice(message, "warn", 6000);
      },
    },
  });
  replyQueue = queue;

  try {
    const { text } = await api.chat(
      licenseKey,
      persona.id,
      history,
      (piece) => {
        if (abort.signal.aborted) return;
        replyText += piece;
        els.sonarisText.textContent = replyText;
        for (const s of chunker.push(piece)) queue.enqueue(s);
      },
      abort.signal,
    );
    if (abort.signal.aborted) return;
    replyText = text;
    for (const s of chunker.flush()) queue.enqueue(s);
    if (!text.trim()) {
      queue.stop();
      replyQueue = null;
      machine.send("reply_failed");
      notice("The assistant returned an empty reply.", "warn");
      return;
    }
    queue.finish();
  } catch (e) {
    if (abort.signal.aborted) return;
    queue.stop();
    replyQueue = null;
    const err = e as ApiError;
    if (err.status === 402) {
      lockConsole("Your license was not accepted. Enter a valid key to continue.");
    } else {
      notice(`Could not get a reply: ${err.message}`, "warn");
    }
    machine.send("reply_failed");
  }
}

function finishReply(interrupted: boolean): void {
  const text = replyText.trim();
  if (text) {
    history.push({ role: "assistant", content: text });
    void recordMemory({ role: "assistant", text, personaId: activePersona.id, ...(interrupted ? { interrupted: true } : {}) });
  }
  replyText = "";
  replyAbort = null;
  if (!interrupted) machine.send("reply_done");
  renderMeter(0, "");
  if (machine.state === TurnState.Listening || machine.state === TurnState.Interrupted) {
    // Ready for the next utterance.
    finalText = "";
    interimText = "";
    lastFinalAt = null;
    renderYouCaption();
  }
}

/** Called when the machine enters `interrupted` (user barged in). */
function interruptReply(): void {
  stopReply(true);
  // The user is talking: start a fresh utterance capture.
  finalText = "";
  interimText = "";
  lastFinalAt = null;
  renderYouCaption();
}

function stopReply(interrupted: boolean): void {
  const hadReply = Boolean(replyAbort || replyQueue);
  replyAbort?.abort();
  replyQueue?.stop();
  replyQueue = null;
  if (hadReply) finishReply(interrupted);
}

// ---------------------------------------------------------------------------
// Memory

async function recordMemory(entry: Omit<MemoryEntry, "ts">): Promise<void> {
  const local: MemoryEntry = { ...entry, ts: new Date().toISOString() };
  memoryEntries.push(local);
  renderMemory();
  try {
    await api.appendMemory(licenseKey, local);
  } catch (e) {
    notice(`Memory write failed: ${(e as Error).message}`, "warn");
  }
}

async function loadMemory(): Promise<void> {
  try {
    const m = await api.memory(licenseKey);
    memoryEntries = m.entries;
    memoryStorage = m.storage;
    renderMemory();
  } catch (e) {
    els.memoryMeta.textContent = `Could not load memory: ${(e as Error).message}`;
  }
}

function renderMemory(): void {
  const where = memoryStorage === "file" ? `memory/${licenseKey}.jsonl (local file)` : memoryStorage === "blobs" ? "Netlify Blobs" : "";
  els.memoryMeta.textContent = `${memoryEntries.length} turn${memoryEntries.length === 1 ? "" : "s"}${where ? ` · ${where}` : ""}`;
  els.dlMd.href = api.memoryDownloadUrl(licenseKey, "md");
  els.dlJsonl.href = api.memoryDownloadUrl(licenseKey, "jsonl");
  const list = els.memoryList;
  list.textContent = "";
  if (!memoryEntries.length) {
    const p = document.createElement("p");
    p.className = "muted small";
    p.textContent = "Nothing yet. Every spoken exchange lands here, and in the JSONL journal and MEMORY.md file.";
    list.appendChild(p);
    return;
  }
  let day = "";
  const today = new Date().toISOString().slice(0, 10);
  for (const e of memoryEntries) {
    const d = e.ts.slice(0, 10);
    if (d !== day) {
      day = d;
      const h = document.createElement("div");
      h.className = "memory-day";
      h.textContent = d === today ? "Today" : d;
      list.appendChild(h);
    }
    const row = document.createElement("div");
    row.className = `mem ${e.role}`;
    const meta = document.createElement("div");
    meta.className = "mem-meta";
    const who = document.createElement("span");
    who.className = "who";
    who.textContent = e.role === "user" ? "You" : `Sonaris (${e.personaId})`;
    meta.appendChild(who);
    meta.appendChild(document.createTextNode(` · ${e.ts.slice(11, 19)} UTC${e.interrupted ? " · interrupted" : ""}`));
    const text = document.createElement("div");
    text.className = "mem-text";
    text.textContent = e.text;
    row.appendChild(meta);
    row.appendChild(text);
    list.appendChild(row);
  }
  list.scrollTop = list.scrollHeight;
}

function toggleMemory(force?: boolean): void {
  const show = force ?? els.memoryPanel.hidden;
  els.memoryPanel.hidden = !show;
  els.memoryBtn.setAttribute("aria-pressed", String(show));
  if (show) void loadMemory();
}

// ---------------------------------------------------------------------------
// Personas

function renderPersonaSelect(): void {
  els.persona.textContent = "";
  const groups: Array<[string, Persona[]]> = [
    ["Default voices", personas.filter((p) => p.builtin && p.id !== "captain")],
    ["Character voices", personas.filter((p) => p.id === "captain" || !p.builtin)],
  ];
  for (const [label, list] of groups) {
    if (!list.length) continue;
    const og = document.createElement("optgroup");
    og.label = label;
    for (const p of list) {
      const o = document.createElement("option");
      o.value = p.id;
      o.textContent = p.builtin ? `${p.name} (${p.gender})` : `${p.name} (custom)`;
      og.appendChild(o);
    }
    els.persona.appendChild(og);
  }
  els.persona.value = activePersona.id;
  setSonarisLabel();
}

function selectPersona(id: string): void {
  activePersona = findPersona(id, personas);
  localStorage.setItem(LS.persona, activePersona.id);
  els.persona.value = activePersona.id;
  setSonarisLabel();
  notice(`Voice: ${activePersona.name}. ${activePersona.description}`, "info", 4000);
}

async function loadPersonas(): Promise<void> {
  try {
    personas = await api.personas(licenseKey);
  } catch {
    personas = [...BUILTIN_PERSONAS];
  }
  activePersona = findPersona(activePersona.id, personas);
  renderPersonaSelect();
}

function openVoiceModal(): void {
  els.voiceError.hidden = true;
  els.voiceForm.reset();
  syncProviderFields();
  els.voiceModal.hidden = false;
  $<HTMLInputElement>("v-name").focus();
}

function syncProviderFields(): void {
  const p = els.vProvider.value;
  els.voiceForm.querySelectorAll<HTMLElement>("[data-provider]").forEach((el) => {
    el.hidden = el.dataset.provider !== p;
  });
}

async function saveVoice(ev: Event): Promise<void> {
  ev.preventDefault();
  els.voiceError.hidden = true;
  els.voiceSave.disabled = true;
  const fd = new FormData(els.voiceForm);
  const sample = fd.get("sample");
  try {
    let persona: Persona;
    if (sample instanceof File && sample.size > 0) {
      const form = new FormData();
      for (const k of ["name", "description", "style", "gender"]) form.set(k, String(fd.get(k) ?? ""));
      form.set("sample", sample);
      persona = await api.clonePersona(licenseKey, form);
    } else {
      const input: CustomPersonaInput = {
        name: String(fd.get("name") ?? ""),
        description: String(fd.get("description") ?? ""),
        style: String(fd.get("style") ?? ""),
        gender: String(fd.get("gender") ?? "male") as CustomPersonaInput["gender"],
        provider: String(fd.get("provider") ?? "browser") as CustomPersonaInput["provider"],
        voiceId: String(fd.get("voiceId") ?? ""),
        openaiVoice: String(fd.get("openaiVoice") ?? ""),
      };
      persona = await api.addPersona(licenseKey, input);
    }
    personas.push(persona);
    renderPersonaSelect();
    selectPersona(persona.id);
    els.voiceModal.hidden = true;
  } catch (e) {
    els.voiceError.textContent = (e as Error).message;
    els.voiceError.hidden = false;
  } finally {
    els.voiceSave.disabled = false;
  }
}

// ---------------------------------------------------------------------------
// License gate

function lockConsole(message = ""): void {
  els.lock.hidden = false;
  els.lockMsg.textContent = message;
  if (machine.state !== TurnState.Idle) stopListening();
}

async function unlockWith(key: string, label: string): Promise<void> {
  licenseKey = key;
  localStorage.setItem(LS.license, key);
  els.lock.hidden = true;
  els.licenseInfo.textContent = `${label} · ${key}`;
  await Promise.all([loadPersonas(), loadMemory()]);
  if (DEMO_MODE) els.demoBar.hidden = false;
}

async function tryKey(raw: string, quiet = false): Promise<boolean> {
  const key = normalizeKey(raw);
  if (!key) return false;
  if (!isPlausibleLicense(key)) {
    if (!quiet) els.lockMsg.textContent = "That does not look like a Sonaris key (SONARIS-XXXX-XXXX-XXXX).";
    return false;
  }
  try {
    const status = await api.license(key);
    if (!status.valid) {
      if (!quiet) els.lockMsg.textContent = status.reason === "demo_disabled" ? "Demo keys are disabled once Stripe is configured." : "That key is not valid.";
      localStorage.removeItem(LS.license);
      return false;
    }
    const label = status.demo ? "Demo license" : status.plan === "monthly" ? "Monthly license" : "One-time license";
    await unlockWith(key, label);
    return true;
  } catch (e) {
    if (!quiet) els.lockMsg.textContent = `Could not check the key: ${(e as Error).message}`;
    return false;
  }
}

async function buy(): Promise<void> {
  els.lockBuy.disabled = true;
  els.lockMsg.textContent = "Opening checkout…";
  try {
    const r = await api.checkout("one_time");
    if (r.url) {
      location.href = r.url;
      return;
    }
    if (r.demo && r.licenseKey) {
      els.lockMsg.textContent = "Stripe is not configured here, so you received a demo license.";
      await unlockWith(r.licenseKey, "Demo license");
      notice(`Demo license ${r.licenseKey} is active on this device. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID to sell real licenses.`, "info", 12000);
      return;
    }
    els.lockMsg.textContent = r.message ?? "Checkout did not return a URL.";
  } catch (e) {
    els.lockMsg.textContent = `Checkout failed: ${(e as Error).message}`;
  } finally {
    els.lockBuy.disabled = false;
  }
}

// ---------------------------------------------------------------------------
// Scripted demo (?demo=1): drives the same pipeline without a microphone.

const DEMO_UTTERANCE = "Hello Sonaris, what can you do?";
let demoRunning = false;

async function runScriptedDemo(): Promise<void> {
  if (demoRunning) return;
  if (machine.state === TurnState.Speaking || machine.state === TurnState.Thinking) stopReply(true);
  demoRunning = true;
  els.demoRun.disabled = true;
  try {
    if (machine.state === TurnState.Idle) {
      // Enter listening without a microphone: the demo supplies the frames.
      machine.send("start");
      vad.reset();
    }
    resetUtterance();
    const words = DEMO_UTTERANCE.split(" ");
    let spoken = "";
    for (let i = 0; i < words.length; i++) {
      const now = performance.now();
      lastVoiceAt = now;
      machine.onVoiceFrame(true, now);
      spoken = spoken ? `${spoken} ${words[i]}` : words[i]!;
      interimText = spoken;
      renderYouCaption();
      renderMeter(0.4 + Math.random() * 0.4, "user");
      await sleep(170 + Math.random() * 90);
    }
    // Recognizer finalizes the utterance shortly after the last word.
    await sleep(220);
    finalText = spoken;
    interimText = "";
    lastFinalAt = performance.now();
    renderYouCaption();
    renderMeter(0, "");
    // Silence: wait for the configured end-of-utterance window, then respond.
    await sleep(settings.silenceMs);
    if (machine.state === TurnState.UserSpeaking) await finishUtterance();
  } finally {
    demoRunning = false;
    els.demoRun.disabled = false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Typed input goes through the exact same turn pipeline.

async function submitTyped(text: string): Promise<void> {
  const t = text.trim();
  if (!t) return;
  if (machine.state === TurnState.Speaking || machine.state === TurnState.Thinking) {
    machine.send("user_barge_in");
  }
  if (machine.state === TurnState.Idle) machine.send("start");
  if (machine.state === TurnState.Listening || machine.state === TurnState.Interrupted) machine.send("voice_start");
  finalText = t;
  interimText = "";
  lastVoiceAt = performance.now();
  lastFinalAt = lastVoiceAt;
  renderYouCaption();
  await finishUtterance();
}

// ---------------------------------------------------------------------------
// Wiring

function bind(): void {
  els.micBtn.addEventListener("click", () => {
    if (machine.state === TurnState.Idle) void startListening();
    else stopListening();
  });

  els.typeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const t = els.typeInput.value;
    els.typeInput.value = "";
    void submitTyped(t);
  });

  els.persona.addEventListener("change", () => selectPersona(els.persona.value));
  els.addVoiceBtn.addEventListener("click", openVoiceModal);
  els.voiceCancel.addEventListener("click", () => (els.voiceModal.hidden = true));
  els.voiceModal.addEventListener("click", (e) => {
    if (e.target === els.voiceModal) els.voiceModal.hidden = true;
  });
  els.vProvider.addEventListener("change", syncProviderFields);
  els.voiceForm.addEventListener("submit", (e) => void saveVoice(e));

  els.memoryBtn.addEventListener("click", () => toggleMemory());
  els.memoryClose.addEventListener("click", () => toggleMemory(false));
  els.memoryClear.addEventListener("click", async () => {
    if (!confirm("Delete the whole memory journal and MEMORY.md for this license?")) return;
    try {
      await api.clearMemory(licenseKey);
      memoryEntries = [];
      history = [];
      renderMemory();
      notice("Memory deleted.", "info", 3000);
    } catch (e) {
      notice(`Could not delete memory: ${(e as Error).message}`, "warn");
    }
  });

  els.settingsBtn.addEventListener("click", () => {
    els.settings.hidden = !els.settings.hidden;
    els.settingsBtn.setAttribute("aria-expanded", String(!els.settings.hidden));
  });
  els.settingsClose.addEventListener("click", () => {
    els.settings.hidden = true;
    els.settingsBtn.setAttribute("aria-expanded", "false");
  });
  els.silence.value = String(settings.silenceMs);
  els.silenceVal.textContent = String(settings.silenceMs);
  els.silence.addEventListener("input", () => {
    settings.silenceMs = clampSilence(Number(els.silence.value));
    els.silenceVal.textContent = String(settings.silenceMs);
    localStorage.setItem(LS.silence, String(settings.silenceMs));
  });
  els.neverTalkOver.checked = settings.neverTalkOver;
  els.neverTalkOver.addEventListener("change", () => {
    settings.neverTalkOver = els.neverTalkOver.checked;
    machine.neverTalkOver = settings.neverTalkOver;
    localStorage.setItem(LS.neverTalkOver, String(settings.neverTalkOver));
  });
  els.preferBrowser.checked = settings.preferBrowser;
  els.preferBrowser.addEventListener("change", () => {
    settings.preferBrowser = els.preferBrowser.checked;
    localStorage.setItem(LS.preferBrowser, String(settings.preferBrowser));
  });
  els.licenseForget.addEventListener("click", () => {
    localStorage.removeItem(LS.license);
    licenseKey = "";
    els.settings.hidden = true;
    lockConsole("Key removed from this device.");
  });

  els.lockBuy.addEventListener("click", () => void buy());
  els.lockForm.addEventListener("submit", (e) => {
    e.preventDefault();
    void tryKey(els.lockKey.value);
  });

  els.demoRun.addEventListener("click", () => void runScriptedDemo());

  // Keyboard: Space = push-to-talk, Esc = stop speaking, M = memory panel.
  document.addEventListener("keydown", (e) => {
    const target = e.target as HTMLElement | null;
    const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT");
    if (e.key === "Escape") {
      if (!els.voiceModal.hidden) els.voiceModal.hidden = true;
      else if (!els.settings.hidden) els.settings.hidden = true;
      else if (machine.state === TurnState.Speaking || machine.state === TurnState.Thinking) {
        machine.send("user_barge_in");
        // Esc means "stop", not "I'm talking": return to listening.
        machine.send("utterance_discarded");
        resetUtterance();
      }
      return;
    }
    if (typing || !els.lock.hidden) return;
    if (e.key === " " && !e.repeat) {
      e.preventDefault();
      pttHeld = true;
      if (machine.state === TurnState.Idle) {
        void startListening().then(() => {
          if (pttHeld) machine.onVoiceFrame(true, performance.now());
        });
      } else {
        if (machine.state === TurnState.Speaking || machine.state === TurnState.Thinking) machine.send("user_barge_in");
        machine.onVoiceFrame(true, performance.now());
      }
      renderYouCaption();
    } else if (e.key.toLowerCase() === "m") {
      e.preventDefault();
      toggleMemory();
    }
  });
  document.addEventListener("keyup", (e) => {
    if (e.key === " " && pttHeld) {
      pttHeld = false;
      lastVoiceAt = performance.now();
      renderYouCaption();
      // Release ends the utterance after a short grace for the recognizer.
      window.setTimeout(() => {
        if (machine.state === TurnState.UserSpeaking) void finishUtterance();
      }, Math.min(settings.silenceMs, 500));
    }
  });

  window.addEventListener("beforeunload", () => {
    mic?.close();
  });
}

async function init(): Promise<void> {
  bind();
  setPill(TurnState.Idle);
  setSonarisLabel();
  renderPersonaSelect();
  warmBrowserVoices();
  updateEngineInfo();
  if (DEMO_MODE) {
    els.demoBar.hidden = true; // shown after unlock
  }

  const sessionId = params.get("session_id");
  const fromUrl = params.get("key");
  if (fromUrl && (await tryKey(fromUrl))) return finishInit();
  if (sessionId) {
    try {
      const r = await api.licenseFromSession(sessionId);
      if (r.paid && r.licenseKey && (await tryKey(r.licenseKey))) return finishInit();
    } catch {
      // fall through to the stored key / paywall
    }
  }
  const stored = localStorage.getItem(LS.license);
  if (stored && (await tryKey(stored, true))) return finishInit();
  lockConsole();
  finishInit();
}

function finishInit(): void {
  if (!webSpeechSupported()) {
    notice("Live captions use server transcription in this browser (Chrome, Edge or Safari show words instantly).", "info", 9000);
  }
  if (DEMO_MODE && params.get("autoplay") === "1" && els.lock.hidden) {
    window.setTimeout(() => void runScriptedDemo(), 800);
  }
}

void init();
