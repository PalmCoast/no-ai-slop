import { describe, expect, it } from "vitest";
import {
  EXTEND_SEC,
  addLater,
  clearAll,
  commitNow,
  elapsedSec,
  emptyState,
  extendTimer,
  finishNow,
  firstMoves,
  formatClock,
  formatOnThis,
  hydrate,
  narrowNow,
  parkThought,
  pauseTimer,
  promoteLater,
  promoteParked,
  remainingSec,
  resumeTimer,
  sanitize,
  serialize,
  startTimer,
  tickTimer,
} from "../shared/latch";

const T0 = 1_700_000_000_000;

describe("first moves", () => {
  it("turns a big task into a physical first move", () => {
    expect(firstMoves("Reply to the landlord")).toEqual([
      "Open the thread",
      "Write the first sentence",
      "Send it, or leave the draft",
    ]);
    expect(firstMoves("Call the dentist")).toEqual([
      "Find the number",
      "Write the first sentence you will say",
      "Dial",
    ]);
    expect(firstMoves("Clean the kitchen")).toEqual(["Stand up", "Pick one surface", "Put away five things"]);
    expect(firstMoves("Read chapter 4")).toContain("Read one paragraph");
    expect(firstMoves("Pay the electric bill")).toContain("Fill the first blank");
    expect(firstMoves("Leave the house")).toContain("Walk to the door");
    expect(firstMoves("I can't start")).toContain("Set a 15 second timer");
    expect(firstMoves("Finish the slides")).toContain("Open the file");
  });

  it("stays quiet once the task is already a small move", () => {
    expect(firstMoves("Open the thread")).toEqual([]);
    expect(firstMoves("Dial")).toEqual([]);
    expect(firstMoves("the thing")).toEqual([]);
  });

  it("offers a start when the line is a paragraph", () => {
    const paragraph =
      "I told myself I would handle the pile on the desk before the end of the day and I have not touched it.";
    expect(paragraph.length).toBeGreaterThan(80);
    expect(firstMoves(paragraph)).toContain("Do the smallest piece you can see");
  });
});

describe("the one thing", () => {
  it("keeps the bigger line on Later when you pick a smaller move", () => {
    const next = commitNow(emptyState(), "Pick one surface", "now-1", "Clean the kitchen", "later-1", T0);
    expect(next.now?.title).toBe("Pick one surface");
    expect(next.later.map((task) => task.title)).toEqual(["Clean the kitchen"]);
  });

  it("narrowing the current task keeps the old wording on Later", () => {
    const started = commitNow(emptyState(), "Clean the kitchen", "now-1", null, "unused", T0);
    const next = narrowNow(started, "Stand up", "later-1", T0 + 1);
    expect(next.now?.title).toBe("Stand up");
    expect(next.now?.id).toBe("now-1");
    expect(next.later.map((task) => task.title)).toEqual(["Clean the kitchen"]);
  });

  it("parking a thought does not change the one thing", () => {
    const started = commitNow(emptyState(), "Reply to the landlord", "now-1", null, "unused", T0);
    const next = parkThought(started, "the dentist number is on the fridge", "note-1", T0 + 5);
    expect(next.now?.title).toBe("Reply to the landlord");
    expect(next.parked).toHaveLength(1);
    expect(next.parked[0]?.text).toBe("the dentist number is on the fridge");
  });

  it("puts a parked thought on screen and keeps the old task", () => {
    const started = parkThought(
      commitNow(emptyState(), "Reply to the landlord", "now-1", null, "unused", T0),
      "Call the dentist",
      "note-1",
      T0,
    );
    const next = promoteParked(started, "note-1", "now-2");
    expect(next.now?.title).toBe("Call the dentist");
    expect(next.later.map((task) => task.title)).toEqual(["Reply to the landlord"]);
    expect(next.parked).toHaveLength(0);
    expect(next.phase).toBe("idle");
  });

  it("switches to Later without dropping the current task", () => {
    const withLater = addLater(
      commitNow(emptyState(), "Reply to the landlord", "now-1", null, "unused", T0),
      "Empty the dishwasher",
      "later-1",
      T0,
    );
    const next = promoteLater(withLater, "later-1");
    expect(next.now?.title).toBe("Empty the dishwasher");
    expect(next.later.map((task) => task.title)).toEqual(["Reply to the landlord"]);
  });

  it("finishes the task and clears the timer", () => {
    const running = startTimer(
      commitNow(emptyState(), "Reply to the landlord", "now-1", null, "unused", T0),
      "two",
      T0,
    );
    const next = finishNow(running);
    expect(next.now).toBeNull();
    expect(next.timer).toBeNull();
    expect(next.phase).toBe("idle");
  });
});

describe("timer", () => {
  it("counts from the clock, pauses, and rings at the end", () => {
    const started = startTimer(emptyState(), "fifteen", T0);
    expect(tickTimer(started, T0 + 10_000)).toBe(started);
    expect(remainingSec(started.timer!, "running", T0 + 10_000)).toBeCloseTo(5);

    const paused = pauseTimer(started, T0 + 5_000);
    expect(paused.phase).toBe("paused");
    expect(elapsedSec(paused.timer!, "paused", T0 + 20_000)).toBeCloseTo(5);
    expect(tickTimer(paused, T0 + 20_000)).toBe(paused);

    const resumed = resumeTimer(paused, T0 + 20_000);
    const done = tickTimer(resumed, T0 + 30_000);
    expect(done.phase).toBe("done");
    expect(done.timer?.accumulatedSec).toBe(15);
  });

  it("adds five minutes when you extend, and counts the extensions", () => {
    const done = tickTimer(startTimer(emptyState(), "fifteen", T0), T0 + 15_000);
    const extended = extendTimer(done, T0 + 15_000);
    expect(extended.phase).toBe("running");
    expect(extended.timer?.extensions).toBe(1);
    expect(extended.timer?.durationSec).toBe(15 + EXTEND_SEC);
    expect(remainingSec(extended.timer!, "running", T0 + 15_000)).toBeCloseTo(EXTEND_SEC);

    const again = extendTimer(extendTimer(extended, T0 + 16_000), T0 + 17_000);
    expect(again.timer?.extensions).toBe(3);
  });
});

describe("storage", () => {
  it("drops streaks and repairs a broken save", () => {
    const saved = startTimer(commitNow(emptyState(), "Open the file", "now-1", null, "unused", T0), "ten", T0);
    const raw = JSON.stringify({ ...JSON.parse(serialize(saved)), streak: 12, points: 40, badges: ["star"] });
    const next = hydrate(raw);
    expect(next.now?.title).toBe("Open the file");
    expect(next.phase).toBe("running");
    expect(Object.keys(next).sort()).toEqual(["later", "now", "parked", "phase", "sound", "timer"]);
    expect(JSON.stringify(next)).not.toContain("streak");
    expect(hydrate("{")).toEqual(emptyState());
    expect(sanitize({ phase: "running", timer: null, later: [{ id: "a", title: "  " }] }).phase).toBe("idle");
  });

  it("clear keeps the sound setting and nothing else", () => {
    const noisy = { ...emptyState(), sound: true, now: { id: "a", title: "Call", createdAt: T0 } };
    expect(clearAll(noisy)).toEqual({ ...emptyState(), sound: true });
  });
});

describe("clock copy", () => {
  it("formats the countdown and the time already spent", () => {
    expect(formatClock(15)).toBe("0:15");
    expect(formatClock(125)).toBe("2:05");
    expect(formatClock(3600)).toBe("1:00:00");
    expect(formatOnThis(12)).toBe("on this for under a minute");
    expect(formatOnThis(60)).toBe("on this for 1 minute");
    expect(formatOnThis(180)).toBe("on this for 3 minutes");
  });
});
