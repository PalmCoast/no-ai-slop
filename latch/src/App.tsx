import { useEffect, useId, useRef, useState } from "react";
import {
  PRESETS,
  elapsedSec,
  firstMoves,
  formatClock,
  formatOnThis,
  progress,
  remainingSec,
} from "../shared/latch";
import { hasRecord } from "../shared/license";
import { BODY_NEEDS, RING_LINE, STEADY_STEPS, TOO_MUCH_LINE, WHO_LINE } from "../shared/steady";
import RecordPanel from "./Record";
import { chime, primeAudio } from "./sound";
import { useLatch } from "./useLatch";

function Mark() {
  return (
    <svg className="mark" viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M22 16h18a10 10 0 0 1 0 20H28"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path d="M28 30h12" fill="none" stroke="#f4efe6" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

function Ring({ value }: { value: number }) {
  const radius = 92;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <svg className="ring" viewBox="0 0 220 220" aria-hidden="true">
      <circle className="ring-track" cx="110" cy="110" r={radius} />
      <circle
        className="ring-value"
        cx="110"
        cy="110"
        r={radius}
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - clamped)}
        transform="rotate(-90 110 110)"
      />
    </svg>
  );
}

function Moves({ title, onPick }: { title: string; onPick: (move: string) => void }) {
  const moves = firstMoves(title);
  if (moves.length === 0) return null;
  return (
    <div className="moves">
      <p className="label">Smaller move</p>
      <div className="move-row">
        {moves.map((move) => (
          <button key={move} type="button" className="chip" onClick={() => onPick(move)}>
            {move}
          </button>
        ))}
      </div>
    </div>
  );
}

function Composer({ onCommit }: { onCommit: (title: string, bigger: string | null) => void }) {
  const [draft, setDraft] = useState("");
  const [held, setHeld] = useState<string | null>(null);
  const fieldId = useId();
  const source = held ?? draft;
  const moves = firstMoves(source);

  function pick(move: string) {
    setHeld((current) => current ?? source.trim());
    setDraft(move);
  }

  return (
    <form
      className="composer"
      onSubmit={(event) => {
        event.preventDefault();
        const title = draft.trim();
        if (!title) return;
        onCommit(title, held);
        setDraft("");
        setHeld(null);
      }}
    >
      <label htmlFor={fieldId}>What is the one thing?</label>
      <input
        id={fieldId}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Reply to the landlord"
        maxLength={200}
        autoComplete="off"
        enterKeyHint="done"
        autoFocus
      />
      {held ? <p className="held">Keeping "{held}" on Later.</p> : null}
      {moves.length > 0 ? (
        <div className="moves">
          <p className="label">Smaller move</p>
          <div className="move-row">
            {moves.map((move) => (
              <button key={move} type="button" className="chip" onClick={() => pick(move)}>
                {move}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <button className="btn btn-primary" type="submit" disabled={!draft.trim()}>
        Put it on screen
      </button>
    </form>
  );
}

export default function App() {
  const latch = useLatch();
  const { state, nowMs } = latch;
  const [wander, setWander] = useState(false);
  const [tooMuch, setTooMuch] = useState(false);
  const [steadyId, setSteadyId] = useState<string | null>(null);
  const [handoff, setHandoff] = useState<{ id: string; title: string; source: "later" | "parked" } | null>(null);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState("");
  const [clearArmed, setClearArmed] = useState(false);
  const [banner, setBanner] = useState("");
  const pausedForWander = useRef(false);
  const prevPhase = useRef(state.phase);
  const backButton = useRef<HTMLButtonElement>(null);
  const steadyClose = useRef<HTMLButtonElement>(null);
  const handoffStay = useRef<HTMLButtonElement>(null);
  const laterInput = useRef<HTMLInputElement>(null);
  const laterSection = useRef<HTMLElement>(null);
  const timerSection = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prevPhase.current !== "done" && state.phase === "done") {
      setBanner(state.now ? `Time is up on ${state.now.title}.` : "Time is up.");
      if (state.sound) chime();
    }
    if (state.phase !== "done") setBanner("");
    prevPhase.current = state.phase;
  }, [state.phase, state.sound, state.now]);

  useEffect(() => {
    if (wander) backButton.current?.focus();
  }, [wander]);

  useEffect(() => {
    if (tooMuch) steadyClose.current?.focus();
  }, [tooMuch]);

  useEffect(() => {
    if (handoff) handoffStay.current?.focus();
  }, [handoff]);

  const backToItRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!wander && !tooMuch && !handoff) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (wander) backToItRef.current();
      setTooMuch(false);
      setSteadyId(null);
      setHandoff(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [wander, tooMuch, handoff]);

  function openWander() {
    pausedForWander.current = state.phase === "running";
    if (state.phase === "running") latch.pause();
    setWander(true);
  }

  function backToIt() {
    setWander(false);
    if (pausedForWander.current) {
      pausedForWander.current = false;
      latch.resume();
    }
  }
  backToItRef.current = backToIt;

  function pickSomethingElse() {
    pausedForWander.current = false;
    setWander(false);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    laterSection.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    laterInput.current?.focus();
  }

  function openTooMuch() {
    setHandoff(null);
    setSteadyId(null);
    if (state.phase === "running") latch.pause();
    setTooMuch(true);
  }

  function closeTooMuch() {
    setTooMuch(false);
    setSteadyId(null);
  }

  function takeBody(move: string) {
    setTooMuch(false);
    setSteadyId(null);
    latch.stopTimer();
    latch.commit(move, null);
  }

  function askSwitch(id: string, title: string, source: "later" | "parked") {
    if (!state.now) {
      if (source === "later") latch.makeLaterNow(id);
      else latch.makeParkedNow(id);
      return;
    }
    setTooMuch(false);
    setHandoff({ id, title, source });
  }

  function confirmHandoff() {
    if (!handoff) return;
    if (handoff.source === "later") latch.makeLaterNow(handoff.id);
    else latch.makeParkedNow(handoff.id);
    setHandoff(null);
  }

  const steadyStep = STEADY_STEPS.find((step) => step.id === steadyId) ?? null;
  const nextMove = state.now ? (firstMoves(state.now.title)[0] ?? null) : null;
  const handoffMove = handoff ? (firstMoves(handoff.title)[0] ?? null) : null;

  const timer = state.timer;
  const remaining = timer ? remainingSec(timer, state.phase, nowMs) : 0;
  const elapsed = timer ? elapsedSec(timer, state.phase, nowMs) : 0;
  const ring = timer ? progress(timer, state.phase, nowMs) : 0;
  const clock = formatClock(state.phase === "done" ? 0 : remaining);
  const spent = formatOnThis(elapsed);
  const spentSentence = spent.charAt(0).toUpperCase() + spent.slice(1);

  return (
    <div className="page">
      <p className="sr" aria-live="polite">
        {banner}
      </p>
      <header className={`top${state.phase === "done" ? " is-done" : ""}`}>
        <div className="brand">
          <Mark />
          <span>Latch</span>
        </div>
        {state.now ? (
          <p className="top-now">
            <span className="top-title">{state.now.title}</span>
            {timer && state.phase !== "idle" ? (
              <span className="top-clock">
                {state.phase === "done" ? "Time's up" : state.phase === "paused" ? `Paused ${clock}` : clock}
              </span>
            ) : null}
          </p>
        ) : (
          <p className="top-now quiet">One thing on screen, a timer you can see, a place to park the rest.</p>
        )}
        <div className="top-actions">
          <button type="button" className="too-much" onClick={openTooMuch}>
            Too much
          </button>
          <button
            type="button"
            className={`sound${state.sound ? " on" : ""}`}
            aria-pressed={state.sound}
            onClick={() => {
              if (!state.sound) primeAudio();
              latch.toggleSound();
            }}
          >
            {state.sound ? "Sound on" : "Sound off"}
          </button>
        </div>
      </header>

      <p className="who">{WHO_LINE}</p>

      <main>
        <section className="panel now-panel" aria-labelledby="now-heading">
          <p className="kicker" id="now-heading">
            The one thing
          </p>
          {state.now ? (
            <>
              {editing ? (
                <form
                  className="composer"
                  onSubmit={(event) => {
                    event.preventDefault();
                    latch.rename(editDraft);
                    setEditing(false);
                  }}
                >
                  <label htmlFor="edit-now" className="sr">
                    Change the one thing
                  </label>
                  <input
                    id="edit-now"
                    value={editDraft}
                    onChange={(event) => setEditDraft(event.target.value)}
                    maxLength={200}
                    autoComplete="off"
                    autoFocus
                  />
                  <div className="row">
                    <button className="btn btn-primary" type="submit">
                      Save
                    </button>
                    <button className="btn btn-ghost" type="button" onClick={() => setEditing(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <h1 className="now-title">{state.now.title}</h1>
              )}
              <div className="row">
                <button type="button" className="btn btn-ghost" onClick={() => latch.finish()}>
                  Done with this
                </button>
                <button type="button" className="btn btn-ghost" onClick={openWander}>
                  I wandered
                </button>
                <button type="button" className="btn btn-ghost" onClick={openTooMuch}>
                  Too much
                </button>
                {editing ? null : (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setEditDraft(state.now?.title ?? "");
                      setEditing(true);
                    }}
                  >
                    Change
                  </button>
                )}
              </div>
              {editing ? null : (
                <Moves
                  title={state.now.title}
                  onPick={(move) => {
                    latch.narrow(move);
                    setEditing(false);
                  }}
                />
              )}
            </>
          ) : (
            <Composer onCommit={latch.commit} />
          )}
        </section>

        {state.now ? (
          <section className="panel" ref={timerSection} aria-labelledby="timer-heading">
            <p className="kicker" id="timer-heading">
              Timer
            </p>
            <div
              className="ring-wrap"
              role="timer"
              aria-label={
                state.phase === "done"
                  ? "Time is up"
                  : timer && state.phase !== "idle"
                    ? `${clock} remaining`
                    : "No timer running"
              }
            >
              <Ring value={timer ? ring : 0} />
              <div className="ring-center">
                {state.phase === "done" ? (
                  <p className="time-up">Time's up</p>
                ) : (
                  <p className="clock">{timer && state.phase !== "idle" ? clock : "—"}</p>
                )}
                {timer && state.phase !== "idle" && state.phase !== "done" ? (
                  <p className="on-this">{formatOnThis(elapsed)}</p>
                ) : null}
                {state.phase === "paused" ? <p className="on-this">Paused</p> : null}
              </div>
            </div>

            {state.phase === "idle" ? (
              <>
                <p className="hint">{RING_LINE}</p>
                <div className="presets">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={preset.id === "fifteen" ? "btn btn-primary" : "btn btn-ghost"}
                      onClick={() => latch.start(preset.id)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {state.phase === "running" ? (
              <div className="row center">
                <button type="button" className="btn btn-ghost" onClick={() => latch.pause()}>
                  Pause
                </button>
              </div>
            ) : null}

            {state.phase === "paused" ? (
              <div className="row center">
                <button type="button" className="btn btn-primary" onClick={() => latch.resume()}>
                  Resume
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => latch.stopTimer()}>
                  Stop
                </button>
              </div>
            ) : null}

            {state.phase === "done" ? (
              <>
                <p className="hint">
                  {state.now ? `You were on "${state.now.title}".` : "The timer finished."} {spentSentence}.
                </p>
                <div className="presets">
                  <button type="button" className="btn btn-ghost" onClick={() => latch.extend()}>
                    5 more minutes
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={state.later.length === 0}
                    onClick={() => {
                      const next = state.later[0];
                      if (next) askSwitch(next.id, next.title, "later");
                    }}
                  >
                    Next thing
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => latch.stopTimer()}>
                    Stop
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={openTooMuch}>
                    Too much
                  </button>
                </div>
                {state.later.length === 0 ? <p className="hint">Nothing is on Later yet.</p> : null}
                {timer && state.log.some((entry) => entry.id === timer.fenceId) ? (
                  <p className="hint">Kept on the record.</p>
                ) : null}
              </>
            ) : null}

            {timer && timer.extensions >= 3 ? (
              <p className="hint">
                Extended {timer.extensions} times. {state.parked.length} parked.
              </p>
            ) : null}
          </section>
        ) : null}

        <section className="panel" aria-labelledby="park-heading">
          <div className="section-line">
            <h2 id="park-heading">Parked</h2>
            <span className="count">{state.parked.length}</span>
          </div>
          <form
            className="stack"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const field = form.elements.namedItem("thought");
              if (!(field instanceof HTMLInputElement)) return;
              latch.park(field.value);
              field.value = "";
              field.focus();
            }}
          >
            <label htmlFor="park-thought">Park a thought</label>
            <div className="inline">
              <input
                id="park-thought"
                name="thought"
                placeholder="The dentist, the invoice, the thing you just remembered"
                maxLength={280}
                autoComplete="off"
              />
              <button className="btn btn-primary" type="submit">
                Park it
              </button>
            </div>
          </form>
          {state.parked.length > 0 ? (
            <ul className="list">
              {state.parked.map((note) => (
                <li key={note.id}>
                  <p>{note.text}</p>
                  <div className="row">
                    <button type="button" className="btn btn-ghost" onClick={() => askSwitch(note.id, note.text, "parked")}>
                      Make this the one thing
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => latch.removeParked(note.id)}>
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="hint">Thoughts you park stay here until you take them off.</p>
          )}
        </section>

        <section className="panel" ref={laterSection} aria-labelledby="later-heading">
          <div className="section-line">
            <h2 id="later-heading">Later</h2>
            <span className="count">{state.later.length}</span>
          </div>
          {state.later.length === 0 ? <p className="hint">Nothing waiting.</p> : null}
          <ul className="list">
            {state.later.map((task) => (
              <li key={task.id}>
                <p>{task.title}</p>
                <div className="row">
                  <button type="button" className="btn btn-ghost" onClick={() => askSwitch(task.id, task.title, "later")}>
                    Make this the one thing
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => latch.removeLater(task.id)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <form
            className="stack"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const field = form.elements.namedItem("later");
              if (!(field instanceof HTMLInputElement)) return;
              latch.addLater(field.value);
              field.value = "";
            }}
          >
            <label htmlFor="later-task">Add to Later</label>
            <div className="inline">
              <input
                id="later-task"
                name="later"
                ref={laterInput}
                placeholder="Not this hour"
                maxLength={200}
                autoComplete="off"
              />
              <button className="btn btn-ghost" type="submit">
                Add
              </button>
            </div>
          </form>
        </section>

        <RecordPanel
          licensed={hasRecord(state.licenseKey)}
          licenseKey={state.licenseKey}
          log={state.log}
          nowMs={nowMs}
          hasTask={Boolean(state.now)}
          onUnlock={latch.unlock}
          onForget={latch.forgetKey}
          onCustom={latch.startCustom}
        />

        <details
          className="clear"
          onToggle={(event) => {
            if (!(event.currentTarget as HTMLDetailsElement).open) setClearArmed(false);
          }}
        >
          <summary>Clear this browser</summary>
          <p>Removes the one thing, Later, parked thoughts, and record lines from this browser. A record key, if you have one, stays.</p>
          {clearArmed ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                latch.clear();
                setClearArmed(false);
                setEditing(false);
                setWander(false);
                setTooMuch(false);
                setHandoff(null);
              }}
            >
              Yes, clear it
            </button>
          ) : (
            <button type="button" className="btn btn-ghost" onClick={() => setClearArmed(true)}>
              Clear everything
            </button>
          )}
        </details>
      </main>

      <footer>
        <p>
          Your list stays in this browser. There is no streak to break.{" "}
          <a href="#record">The timer is free. The record is $29 once.</a>
        </p>
        <p>
          Latch does not diagnose or treat ADHD, autism, or CPTSD. In a crisis, call local emergency services or 988 in the
          US.
        </p>
      </footer>

      {wander && state.now ? (
        <div className="scrim" onClick={backToIt}>
          <div
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wander-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="kicker" id="wander-title">
              You were on this
            </p>
            <p className="dialog-task">{state.now.title}</p>
            <p className="hint">
              {timer && state.phase !== "idle"
                ? `${formatClock(remaining)} left on the timer.`
                : "No timer running."}{" "}
              {state.parked.length === 0
                ? "Nothing is parked."
                : state.parked.length === 1
                  ? "1 thought is parked."
                  : `${state.parked.length} thoughts are parked.`}
            </p>
            <div className="row">
              <button ref={backButton} type="button" className="btn btn-primary" onClick={backToIt}>
                Back to it
              </button>
              <button type="button" className="btn btn-ghost" onClick={pickSomethingElse}>
                Pick something else
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {tooMuch ? (
        <div className="scrim" onClick={closeTooMuch}>
          <div
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="steady-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="kicker" id="steady-title">
              Too much
            </p>
            <p>{TOO_MUCH_LINE}</p>
            {state.phase === "paused" ? <p className="hint">The timer stays paused until you press Resume.</p> : null}
            {state.now && !steadyStep ? <p className="hint">A body need sends "{state.now.title}" to Later.</p> : null}
            {steadyStep ? (
              <p className="dialog-task">{steadyStep.detail}</p>
            ) : (
              <>
                <div className="row">
                  {STEADY_STEPS.map((step) => (
                    <button key={step.id} type="button" className="btn btn-ghost" onClick={() => setSteadyId(step.id)}>
                      {step.label}
                    </button>
                  ))}
                  {nextMove ? (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        latch.narrow(nextMove);
                        closeTooMuch();
                      }}
                    >
                      Smaller: {nextMove}
                    </button>
                  ) : null}
                </div>
                <div className="moves">
                  <p className="label">Or make the one thing a body need</p>
                  <div className="move-row">
                    {BODY_NEEDS.map((need) => (
                      <button key={need.id} type="button" className="chip" onClick={() => takeBody(need.move)}>
                        {need.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div className="row">
              <button ref={steadyClose} type="button" className="btn btn-primary" onClick={closeTooMuch}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {handoff && state.now ? (
        <div className="scrim" onClick={() => setHandoff(null)}>
          <div
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="handoff-title"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="kicker" id="handoff-title">
              Switching
            </p>
            <p className="hint">You are leaving</p>
            <p className="dialog-task">{state.now.title}</p>
            <p className="hint">Next</p>
            <p className="dialog-task">{handoff.title}</p>
            {handoffMove ? <p className="hint">First move: {handoffMove}</p> : null}
            <div className="row">
              <button ref={handoffStay} type="button" className="btn btn-ghost" onClick={() => setHandoff(null)}>
                Not yet
              </button>
              <button type="button" className="btn btn-primary" onClick={confirmHandoff}>
                Go
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
