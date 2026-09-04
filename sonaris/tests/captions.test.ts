import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WebSpeechCaptions, type CaptionEvents } from "../src/audio/captions";

/** Minimal stand-in for the browser's SpeechRecognition. */
class FakeRecognizer {
  static instances: FakeRecognizer[] = [];
  continuous = false;
  interimResults = false;
  lang = "";
  maxAlternatives = 1;
  started = false;
  aborted = false;
  stopped = false;
  onresult: ((e: unknown) => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  onend: (() => void) | null = null;
  onstart: (() => void) | null = null;
  constructor() {
    FakeRecognizer.instances.push(this);
  }
  start() {
    this.started = true;
    this.onstart?.();
  }
  stop() {
    this.stopped = true;
  }
  abort() {
    this.aborted = true;
  }
  /** Simulate the engine delivering one result. */
  emit(transcript: string, isFinal: boolean) {
    const res = { isFinal, length: 1, 0: { transcript, confidence: 1 } };
    this.onresult?.({ resultIndex: 0, results: { length: 1, 0: res } });
  }
}

function recorder() {
  const finals: string[] = [];
  const interims: string[] = [];
  const statuses: string[] = [];
  const events: CaptionEvents = {
    onFinal: (t) => finals.push(t),
    onInterim: (t) => interims.push(t),
    onStatus: (s) => statuses.push(s),
    onError: (code, message) => {
      throw new Error(`${code}: ${message}`);
    },
  };
  return { events, finals, interims, statuses };
}

describe("WebSpeechCaptions suspend/resume", () => {
  beforeEach(() => {
    FakeRecognizer.instances = [];
    vi.useFakeTimers();
    vi.stubGlobal("window", { SpeechRecognition: FakeRecognizer, setTimeout, clearTimeout });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("aborts the recognizer on suspend and drops anything it reports afterwards", () => {
    const r = recorder();
    const c = new WebSpeechCaptions(r.events, "en-US");
    c.start();
    const first = FakeRecognizer.instances[0]!;
    expect(first.started).toBe(true);
    first.emit("hello", false);
    expect(r.interims).toEqual(["hello"]);

    c.suspend();
    expect(first.aborted).toBe(true);
    expect(r.statuses).toContain("muted");

    // Chrome can still deliver results after abort(); they are the speakers.
    first.emit("this is the assistant talking", true);
    first.emit("more of the assistant", false);
    expect(r.finals).toEqual([]);
    expect(r.interims).toEqual(["hello"]);

    // The aborted instance must not respawn itself either.
    first.onend?.();
    vi.advanceTimersByTime(500);
    expect(FakeRecognizer.instances).toHaveLength(1);
  });

  it("spawns a fresh recognizer on resume and only that one is heard", () => {
    const r = recorder();
    const c = new WebSpeechCaptions(r.events, "en-US");
    c.start();
    const first = FakeRecognizer.instances[0]!;
    c.suspend();
    c.resume();
    expect(FakeRecognizer.instances).toHaveLength(2);
    const second = FakeRecognizer.instances[1]!;
    expect(second.started).toBe(true);

    // Late result from the old instance, after resume: still dropped.
    first.emit("stale", true);
    expect(r.finals).toEqual([]);

    second.emit("user speaks again", true);
    expect(r.finals).toEqual(["user speaks again"]);
  });

  it("treats a second suspend or a resume without suspend as no-ops", () => {
    const r = recorder();
    const c = new WebSpeechCaptions(r.events, "en-US");
    c.start();
    c.resume();
    expect(FakeRecognizer.instances).toHaveLength(1);
    c.suspend();
    c.suspend();
    expect(FakeRecognizer.instances[0]!.aborted).toBe(true);
    c.resume();
    c.resume();
    expect(FakeRecognizer.instances).toHaveLength(2);
  });

  it("keeps restarting a live recognizer when the engine ends a session", () => {
    const r = recorder();
    const c = new WebSpeechCaptions(r.events, "en-US");
    c.start();
    FakeRecognizer.instances[0]!.onend?.();
    vi.advanceTimersByTime(200);
    expect(FakeRecognizer.instances).toHaveLength(2);
    c.stop();
    FakeRecognizer.instances[1]!.onend?.();
    vi.advanceTimersByTime(200);
    expect(FakeRecognizer.instances).toHaveLength(2);
  });
});
