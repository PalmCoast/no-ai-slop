// Latch keeps one task, a visible timer, and a parking list.
// Callers pass the clock and the ids. Nothing here tracks a streak.

export const STORAGE_KEY = "latch.v1";
export const EXTEND_SEC = 5 * 60;
export const TITLE_MAX = 200;
export const NOTE_MAX = 280;

export const PRESETS = [
  { id: "fifteen", label: "15 seconds", seconds: 15 },
  { id: "two", label: "2 minutes", seconds: 2 * 60 },
  { id: "ten", label: "10 minutes", seconds: 10 * 60 },
  { id: "twentyfive", label: "25 minutes", seconds: 25 * 60 },
] as const;

export type PresetId = (typeof PRESETS)[number]["id"];
export type Phase = "idle" | "running" | "paused" | "done";

export type Task = {
  id: string;
  title: string;
  createdAt: number;
};

export type Note = {
  id: string;
  text: string;
  createdAt: number;
};

export type Timer = {
  presetId: string;
  durationSec: number;
  startedAt: number;
  accumulatedSec: number;
  extensions: number;
};

export type LatchState = {
  now: Task | null;
  later: Task[];
  parked: Note[];
  timer: Timer | null;
  phase: Phase;
  sound: boolean;
};

const EMAIL = [
  "Open the thread",
  "Write the first sentence",
  "Send it, or leave the draft",
];

const CALL = ["Find the number", "Write the first sentence you will say", "Dial"];

const PAPER = ["Find the document", "Open it", "Fill the first blank"];

const READ = ["Open to the page", "Read one paragraph", "Write one line about what it said"];

const CLEAN = ["Stand up", "Pick one surface", "Put away five things"];

const LEAVE = ["Put on your shoes", "Grab the keys", "Walk to the door"];

const WRITE = ["Open the document", "Write the first sentence", "Stop when the timer rings"];

const PROJECT = ["Open the file", "Do the smallest piece you can see", "Stop when the timer rings"];

const START = ["Name the thing in front of you", "Open it", "Set a 15 second timer"];

const LADDERS: Array<{ test: RegExp; moves: string[] }> = [
  { test: /\b(can(?:not|'t) start|get started)\b|^(start|starting)$/i, moves: START },
  { test: /\b(e-?mail|reply|inbox|slack|dm|text)\b/i, moves: EMAIL },
  { test: /\b(call|phone|dial)\b/i, moves: CALL },
  { test: /\b(pay|bill|invoice|tax|taxes|form|paperwork)\b/i, moves: PAPER },
  { test: /\b(read|study|chapter|homework|assignment|textbook)\b/i, moves: READ },
  { test: /\b(clean|dishes|laundry|tidy|kitchen|vacuum|mess|closet)\b/i, moves: CLEAN },
  { test: /\b(errand|grocery|pharmacy|post office)\b|\bgo to the store\b|\bleave the house\b/i, moves: LEAVE },
  { test: /\b(write|draft|essay)\b/i, moves: WRITE },
  { test: /\b(project|presentation|report|slides|deck)\b/i, moves: PROJECT },
];

const KNOWN_MOVES = new Set(
  LADDERS.flatMap((ladder) => ladder.moves).map((move) => move.toLowerCase()),
);

const PHASES = new Set<Phase>(["idle", "running", "paused", "done"]);

export function emptyState(): LatchState {
  return { now: null, later: [], parked: [], timer: null, phase: "idle", sound: false };
}

export function cleanTitle(title: string): string {
  return title.trim().replace(/\s+/g, " ").slice(0, TITLE_MAX);
}

export function cleanNote(text: string): string {
  return text.trim().replace(/\s+/g, " ").slice(0, NOTE_MAX);
}

export function firstMoves(title: string): string[] {
  const trimmed = cleanTitle(title);
  if (!trimmed) return [];
  if (KNOWN_MOVES.has(trimmed.toLowerCase())) return [];
  const hit = LADDERS.find((ladder) => ladder.test.test(trimmed));
  if (hit) return hit.moves;
  if (trimmed.length > 80) return PROJECT;
  return [];
}

export function presetById(id: string): (typeof PRESETS)[number] | undefined {
  return PRESETS.find((preset) => preset.id === id);
}

export function addLater(state: LatchState, title: string, id: string, nowMs: number): LatchState {
  const clean = cleanTitle(title);
  if (!clean || !id) return state;
  return { ...state, later: [...state.later, { id, title: clean, createdAt: nowMs }] };
}

export function removeLater(state: LatchState, id: string): LatchState {
  if (!state.later.some((task) => task.id === id)) return state;
  return { ...state, later: state.later.filter((task) => task.id !== id) };
}

export function commitNow(
  state: LatchState,
  title: string,
  nowId: string,
  bigger: string | null,
  biggerId: string,
  nowMs: number,
): LatchState {
  const clean = cleanTitle(title);
  if (!clean || !nowId) return state;
  const big = bigger ? cleanTitle(bigger) : "";
  const withLater =
    big && big.toLowerCase() !== clean.toLowerCase() ? addLater(state, big, biggerId, nowMs) : state;
  const task: Task = { id: nowId, title: clean, createdAt: nowMs };
  const withoutNew = withLater.later.filter((item) => item.id !== nowId);
  const later = withLater.now && withLater.now.id !== nowId ? [withLater.now, ...withoutNew] : withoutNew;
  return { ...withLater, now: task, later };
}

export function renameNow(state: LatchState, title: string): LatchState {
  const clean = cleanTitle(title);
  if (!clean || !state.now || clean === state.now.title) return state;
  return { ...state, now: { ...state.now, title: clean } };
}

export function narrowNow(state: LatchState, move: string, laterId: string, nowMs: number): LatchState {
  if (!state.now) return state;
  const clean = cleanTitle(move);
  if (!clean) return state;
  const bigger = state.now.title;
  const withLater = bigger.toLowerCase() === clean.toLowerCase() ? state : addLater(state, bigger, laterId, nowMs);
  return renameNow(withLater, clean);
}

export function finishNow(state: LatchState): LatchState {
  if (!state.now && !state.timer && state.phase === "idle") return state;
  return { ...state, now: null, timer: null, phase: "idle" };
}

export function promoteLater(state: LatchState, id: string): LatchState {
  const task = state.later.find((item) => item.id === id);
  if (!task) return state;
  const rest = state.later.filter((item) => item.id !== id);
  const later = state.now ? [...rest, state.now] : rest;
  return { ...state, now: task, later, timer: null, phase: "idle" };
}

export function parkThought(state: LatchState, text: string, id: string, nowMs: number): LatchState {
  const clean = cleanNote(text);
  if (!clean || !id) return state;
  return { ...state, parked: [{ id, text: clean, createdAt: nowMs }, ...state.parked] };
}

export function removeParked(state: LatchState, id: string): LatchState {
  if (!state.parked.some((note) => note.id === id)) return state;
  return { ...state, parked: state.parked.filter((note) => note.id !== id) };
}

export function promoteParked(state: LatchState, noteId: string, taskId: string): LatchState {
  const note = state.parked.find((item) => item.id === noteId);
  if (!note || !taskId) return state;
  const title = cleanTitle(note.text);
  if (!title) return state;
  const parked = state.parked.filter((item) => item.id !== noteId);
  const task: Task = { id: taskId, title, createdAt: note.createdAt };
  const later = state.now ? [...state.later, state.now] : state.later;
  return { ...state, now: task, later, parked, timer: null, phase: "idle" };
}

export function startTimer(state: LatchState, presetId: string, nowMs: number): LatchState {
  const preset = presetById(presetId);
  if (!preset) return state;
  return {
    ...state,
    phase: "running",
    timer: {
      presetId: preset.id,
      durationSec: preset.seconds,
      startedAt: nowMs,
      accumulatedSec: 0,
      extensions: 0,
    },
  };
}

export function elapsedSec(timer: Timer, phase: Phase, nowMs: number): number {
  if (phase === "idle") return 0;
  const live = phase === "running" ? Math.max(0, (nowMs - timer.startedAt) / 1000) : 0;
  return timer.accumulatedSec + live;
}

export function remainingSec(timer: Timer, phase: Phase, nowMs: number): number {
  return Math.max(0, timer.durationSec - elapsedSec(timer, phase, nowMs));
}

export function progress(timer: Timer, phase: Phase, nowMs: number): number {
  if (timer.durationSec <= 0) return 0;
  return Math.max(0, Math.min(1, elapsedSec(timer, phase, nowMs) / timer.durationSec));
}

export function pauseTimer(state: LatchState, nowMs: number): LatchState {
  if (state.phase !== "running" || !state.timer) return state;
  return {
    ...state,
    phase: "paused",
    timer: { ...state.timer, accumulatedSec: elapsedSec(state.timer, "running", nowMs) },
  };
}

export function resumeTimer(state: LatchState, nowMs: number): LatchState {
  if (state.phase !== "paused" || !state.timer) return state;
  return { ...state, phase: "running", timer: { ...state.timer, startedAt: nowMs } };
}

export function tickTimer(state: LatchState, nowMs: number): LatchState {
  if (state.phase !== "running" || !state.timer) return state;
  if (elapsedSec(state.timer, "running", nowMs) < state.timer.durationSec) return state;
  return {
    ...state,
    phase: "done",
    timer: { ...state.timer, accumulatedSec: state.timer.durationSec },
  };
}

export function extendTimer(state: LatchState, nowMs: number, extraSec = EXTEND_SEC): LatchState {
  if (!state.timer || state.phase === "idle" || extraSec <= 0) return state;
  const elapsed = Math.min(elapsedSec(state.timer, state.phase, nowMs), state.timer.durationSec);
  return {
    ...state,
    phase: "running",
    timer: {
      ...state.timer,
      durationSec: state.timer.durationSec + extraSec,
      accumulatedSec: elapsed,
      startedAt: nowMs,
      extensions: state.timer.extensions + 1,
    },
  };
}

export function clearTimer(state: LatchState): LatchState {
  if (state.phase === "idle" && state.timer === null) return state;
  return { ...state, phase: "idle", timer: null };
}

export function toggleSound(state: LatchState): LatchState {
  return { ...state, sound: !state.sound };
}

export function clearAll(state: LatchState): LatchState {
  return { ...emptyState(), sound: state.sound };
}

export function formatClock(totalSec: number): string {
  const safe = Number.isFinite(totalSec) ? Math.max(0, Math.ceil(totalSec)) : 0;
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const mm = minutes.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");
  if (hours > 0) return `${hours}:${mm}:${ss}`;
  return `${minutes}:${ss}`;
}

export function formatOnThis(totalSec: number): string {
  const seconds = Math.max(0, Math.floor(totalSec));
  if (seconds < 60) return "on this for under a minute";
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return "on this for 1 minute";
  return `on this for ${minutes} minutes`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

function readTask(value: unknown): Task | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || !value.id || value.id.length > 80) return null;
  if (typeof value.title !== "string") return null;
  const title = cleanTitle(value.title);
  if (!title) return null;
  const createdAt = typeof value.createdAt === "number" && Number.isFinite(value.createdAt) ? value.createdAt : 0;
  return { id: value.id, title, createdAt };
}

function readNote(value: unknown): Note | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || !value.id || value.id.length > 80) return null;
  if (typeof value.text !== "string") return null;
  const text = cleanNote(value.text);
  if (!text) return null;
  const createdAt = typeof value.createdAt === "number" && Number.isFinite(value.createdAt) ? value.createdAt : 0;
  return { id: value.id, text, createdAt };
}

function readTimer(value: unknown): Timer | null {
  if (!isRecord(value)) return null;
  const durationSec = typeof value.durationSec === "number" && value.durationSec > 0 ? value.durationSec : 0;
  if (!durationSec || !Number.isFinite(durationSec)) return null;
  const accumulated = typeof value.accumulatedSec === "number" && value.accumulatedSec >= 0 ? value.accumulatedSec : 0;
  const startedAt = typeof value.startedAt === "number" && Number.isFinite(value.startedAt) ? value.startedAt : 0;
  const extensions =
    typeof value.extensions === "number" && Number.isFinite(value.extensions) ? Math.max(0, Math.floor(value.extensions)) : 0;
  const presetId = typeof value.presetId === "string" ? value.presetId.slice(0, 40) : "custom";
  return {
    presetId,
    durationSec,
    startedAt,
    accumulatedSec: Math.min(accumulated, durationSec),
    extensions,
  };
}

export function sanitize(input: unknown): LatchState {
  if (!isRecord(input)) return emptyState();
  const now = readTask(input.now);
  let later = Array.isArray(input.later) ? dedupeById(input.later.map(readTask).filter((task): task is Task => task !== null)) : [];
  if (now) later = later.filter((task) => task.id !== now.id);
  const parked = Array.isArray(input.parked)
    ? dedupeById(input.parked.map(readNote).filter((note): note is Note => note !== null))
    : [];
  let timer = readTimer(input.timer);
  let phase: Phase = PHASES.has(input.phase as Phase) ? (input.phase as Phase) : "idle";
  if (!timer && phase !== "idle") phase = "idle";
  if (timer && phase === "done") timer = { ...timer, accumulatedSec: timer.durationSec };
  if (timer && phase === "idle") timer = null;
  const sound = input.sound === true;
  return { now, later, parked, timer, phase, sound };
}

export function serialize(state: LatchState): string {
  return JSON.stringify(sanitize(state));
}

export function hydrate(raw: string): LatchState {
  try {
    return sanitize(JSON.parse(raw) as unknown);
  } catch {
    return emptyState();
  }
}
