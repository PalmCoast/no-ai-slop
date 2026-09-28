import { useEffect, useState } from "react";
import {
  clearAll,
  clearTimer,
  commitNow,
  extendTimer,
  finishNow,
  forgetLicense,
  narrowNow,
  parkThought,
  pauseTimer,
  promoteLater,
  promoteParked,
  removeLater,
  removeParked,
  renameNow,
  resumeTimer,
  setLicense,
  startCustomTimer,
  startTimer,
  tickTimer,
  toggleSound,
  addLater,
  type LatchState,
} from "../shared/latch";
import { hasRecord } from "../shared/license";
import { recordTime } from "../shared/record";
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
    setState((current) => settle(current, t));
  }, []);

  useEffect(() => {
    if (state.phase !== "running") return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNowMs(t);
      setState((current) => settle(current, t));
    }, 200);
    return () => window.clearInterval(id);
  }, [state.phase]);

  function at(): number {
    const t = Date.now();
    setNowMs(t);
    return t;
  }

  function settle(current: LatchState, t: number): LatchState {
    const next = tickTimer(current, t);
    if (next.phase === "done" && current.phase !== "done") return recordTime(next, t);
    return next;
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
      const t = at();
      setState((current) => finishNow(recordTime(current, t)));
    },
    addLater(title: string) {
      const t = at();
      setState((current) => addLater(current, title, createId(), t));
    },
    removeLater(id: string) {
      setState((current) => removeLater(current, id));
    },
    makeLaterNow(id: string) {
      const t = at();
      setState((current) => promoteLater(recordTime(current, t), id));
    },
    park(text: string) {
      const t = at();
      setState((current) => parkThought(current, text, createId(), t));
    },
    removeParked(id: string) {
      setState((current) => removeParked(current, id));
    },
    makeParkedNow(id: string) {
      const t = at();
      setState((current) => promoteParked(recordTime(current, t), id, createId()));
    },
    start(presetId: string) {
      const t = at();
      setState((current) => startTimer(recordTime(current, t), presetId, t, createId()));
    },
    startCustom(minutes: number) {
      const t = at();
      setState((current) => {
        if (!hasRecord(current.licenseKey)) return current;
        return startCustomTimer(recordTime(current, t), minutes, t, createId());
      });
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
      const t = at();
      setState((current) => clearTimer(recordTime(current, t)));
    },
    toggleSound() {
      setState((current) => toggleSound(current));
    },
    unlock(key: string) {
      setState((current) => setLicense(current, key));
    },
    forgetKey() {
      setState((current) => forgetLicense(current));
    },
    clear() {
      setState((current) => clearAll(current));
    },
  };
}
