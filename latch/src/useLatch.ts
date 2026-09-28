import { useEffect, useState } from "react";
import {
  clearAll,
  clearTimer,
  commitNow,
  extendTimer,
  finishNow,
  narrowNow,
  parkThought,
  pauseTimer,
  promoteLater,
  promoteParked,
  removeLater,
  removeParked,
  renameNow,
  resumeTimer,
  startTimer,
  tickTimer,
  toggleSound,
  addLater,
  type LatchState,
} from "../shared/latch";
import { loadState, saveState } from "./storage";

function createId(): string {
  return crypto.randomUUID();
}

export function useLatch() {
  const [state, setState] = useState<LatchState>(() => loadState());
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const t = Date.now();
    setNowMs(t);
    setState((current) => tickTimer(current, t));
  }, []);

  useEffect(() => {
    if (state.phase !== "running") return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNowMs(t);
      setState((current) => tickTimer(current, t));
    }, 200);
    return () => window.clearInterval(id);
  }, [state.phase]);

  function at(): number {
    const t = Date.now();
    setNowMs(t);
    return t;
  }

  return {
    state,
    nowMs,
    commit(title: string, bigger: string | null) {
      const t = at();
      setState((current) => commitNow(current, title, createId(), bigger, createId(), t));
    },
    rename(title: string) {
      setState((current) => renameNow(current, title));
    },
    narrow(move: string) {
      const t = at();
      setState((current) => narrowNow(current, move, createId(), t));
    },
    finish() {
      setState((current) => finishNow(current));
    },
    addLater(title: string) {
      const t = at();
      setState((current) => addLater(current, title, createId(), t));
    },
    removeLater(id: string) {
      setState((current) => removeLater(current, id));
    },
    makeLaterNow(id: string) {
      setState((current) => promoteLater(current, id));
    },
    park(text: string) {
      const t = at();
      setState((current) => parkThought(current, text, createId(), t));
    },
    removeParked(id: string) {
      setState((current) => removeParked(current, id));
    },
    makeParkedNow(id: string) {
      setState((current) => promoteParked(current, id, createId()));
    },
    start(presetId: string) {
      const t = at();
      setState((current) => startTimer(current, presetId, t));
    },
    pause() {
      const t = at();
      setState((current) => pauseTimer(current, t));
    },
    resume() {
      const t = at();
      setState((current) => resumeTimer(current, t));
    },
    extend() {
      const t = at();
      setState((current) => extendTimer(current, t));
    },
    stopTimer() {
      setState((current) => clearTimer(current));
    },
    toggleSound() {
      setState((current) => toggleSound(current));
    },
    clear() {
      setState((current) => clearAll(current));
    },
  };
}
