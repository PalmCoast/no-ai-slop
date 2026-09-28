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
import { chime, primeAudio } from "./sound";
import { useLatch } from "./useLatch";

function Mark() {
  return (
    <svg className="mark" viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M11 9h9.5a5.5 5.5 0 0 1 0 11H14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path d="M14 16.5h7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
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
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState("");
  const [clearArmed, setClearArmed] = useState(false);
  const [banner, setBanner] = useState("");
  const pausedForWander = useRef(false);
  const prevPhase = useRef(state.phase);
  const backButton = useRef<HTMLButtonElement>(null);
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

  const backToItRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!wander) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") backToItRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [wander]);

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
      </header>

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
                <p className="hint">When it rings, you decide whether to stop or keep going.</p>
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
                      if (next) latch.makeLaterNow(next.id);
                    }}
                  >
                    Next thing
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => latch.stopTimer()}>
                    Stop
                  </button>
                </div>
                {state.later.length === 0 ? <p className="hint">Nothing is on Later yet.</p> : null}
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
                    <button type="button" className="btn btn-ghost" onClick={() => latch.makeParkedNow(note.id)}>
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
                  <button type="button" className="btn btn-ghost" onClick={() => latch.makeLaterNow(task.id)}>
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

        <details
          className="clear"
          onToggle={(event) => {
            if (!(event.currentTarget as HTMLDetailsElement).open) setClearArmed(false);
          }}
        >
          <summary>Clear this browser</summary>
          <p>Removes the one thing, Later, and parked thoughts from this browser.</p>
          {clearArmed ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                latch.clear();
                setClearArmed(false);
                setEditing(false);
                setWander(false);
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
        <p>Your list stays in this browser. There is no streak to break.</p>
        <p>Latch does not diagnose or treat ADHD. In a crisis, call local emergency services or 988 in the US.</p>
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
              {state.parked.length === 1 ? "1 thought is parked." : `${state.parked.length} thoughts are parked.`}
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
    </div>
  );
}
