import { STORAGE_KEY, emptyState, hydrate, serialize, type LatchState } from "../shared/latch";

export function loadState(): LatchState {
  if (typeof localStorage === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    return hydrate(raw);
  } catch {
    return emptyState();
  }
}

export function saveState(state: LatchState): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, serialize(state));
  } catch {
    // Private mode can refuse the write. The hour still works in memory.
  }
}
