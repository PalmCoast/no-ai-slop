import { elapsedSec, type LatchState, type TimeEntry } from "./latch";
import { hasRecord } from "./license";

export const LOG_MAX = 200;
export const MIN_KEEP_SEC = 15;

export function recordTime(state: LatchState, nowMs: number): LatchState {
  if (!hasRecord(state.licenseKey) || !state.timer || !state.now) return state;
  const seconds = Math.round(Math.min(elapsedSec(state.timer, state.phase, nowMs), state.timer.durationSec));
  const finished = state.phase === "done";
  if (!finished && seconds < MIN_KEEP_SEC) return state;
  if (seconds < 1) return state;
  const entry: TimeEntry = {
    id: state.timer.fenceId,
    title: state.now.title,
    seconds,
    parked: state.parked.length,
    endedAt: nowMs,
  };
  const rest = state.log.filter((item) => item.id !== entry.id);
  return { ...state, log: [entry, ...rest].slice(0, LOG_MAX) };
}

export function sameDay(a: number, b: number): boolean {
  const left = new Date(a);
  const right = new Date(b);
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

export function summarize(log: TimeEntry[], nowMs: number): { tasks: number; seconds: number; parked: number } {
  const today = log.filter((entry) => sameDay(entry.endedAt, nowMs));
  return {
    tasks: today.length,
    seconds: today.reduce((sum, entry) => sum + entry.seconds, 0),
    parked: today.reduce((sum, entry) => sum + entry.parked, 0),
  };
}

export function spanPhrase(seconds: number): string {
  if (seconds < 60) return "Under a minute";
  const minutes = Math.round(seconds / 60);
  if (minutes === 1) return "1 minute";
  return `${minutes} minutes`;
}

export function summaryLine(log: TimeEntry[], nowMs: number): string {
  const today = summarize(log, nowMs);
  if (today.tasks === 0) return "Nothing kept today.";
  const tasks = today.tasks === 1 ? "1 task" : `${today.tasks} tasks`;
  const parked = today.parked === 1 ? "1 thought parked" : `${today.parked} thoughts parked`;
  return `${spanPhrase(today.seconds)} on ${tasks}. ${parked}.`;
}

export function keptLine(entry: TimeEntry): string {
  const parked = entry.parked === 1 ? "1 parked" : `${entry.parked} parked`;
  return `${spanPhrase(entry.seconds)} · ${entry.title} · ${parked}`;
}

export function exportLog(log: TimeEntry[]): string {
  const lines = [...log]
    .sort((a, b) => a.endedAt - b.endedAt)
    .map((entry) => {
      const when = new Date(entry.endedAt).toISOString().slice(0, 16).replace("T", " ");
      return `${when}  ${spanPhrase(entry.seconds).toLowerCase()}  ${entry.title}  ${entry.parked} parked`;
    });
  return ["Latch record", ...lines].join("\n");
}
