/**
 * Turn-taking state machine for the Sonaris console.
 *
 *   idle → listening → user_speaking → thinking → speaking → listening
 *
 * `interrupted` is entered from `speaking` when the user starts talking; the
 * machine then continues to `listening`/`user_speaking`. The rule that matters:
 * text-to-speech may only start in `thinking` → `speaking`, and never while the
 * user is speaking.
 */

export enum TurnState {
  Idle = "idle",
  Listening = "listening",
  UserSpeaking = "user_speaking",
  Thinking = "thinking",
  Speaking = "speaking",
  Interrupted = "interrupted",
}

export type TurnEvent =
  | "start" // mic opened
  | "stop" // mic closed
  | "voice_start" // VAD: user began speaking
  | "end_of_utterance" // VAD: silence long enough after final transcript
  | "utterance_discarded" // EOU fired but there was no final text
  | "reply_ready" // first sentence of the reply is ready to play
  | "reply_done" // playback queue drained
  | "reply_failed" // chat/tts failed; go back to listening
  | "user_barge_in"; // user spoke for >= barge-in threshold while we were speaking

const TRANSITIONS: Record<TurnState, Partial<Record<TurnEvent, TurnState>>> = {
  [TurnState.Idle]: { start: TurnState.Listening },
  [TurnState.Listening]: {
    stop: TurnState.Idle,
    voice_start: TurnState.UserSpeaking,
  },
  [TurnState.UserSpeaking]: {
    stop: TurnState.Idle,
    end_of_utterance: TurnState.Thinking,
    utterance_discarded: TurnState.Listening,
  },
  [TurnState.Thinking]: {
    stop: TurnState.Idle,
    reply_ready: TurnState.Speaking,
    reply_failed: TurnState.Listening,
    reply_done: TurnState.Listening, // text-only reply, nothing to play
    user_barge_in: TurnState.Interrupted,
  },
  [TurnState.Speaking]: {
    stop: TurnState.Idle,
    reply_done: TurnState.Listening,
    reply_failed: TurnState.Listening,
    user_barge_in: TurnState.Interrupted,
  },
  [TurnState.Interrupted]: {
    stop: TurnState.Idle,
    voice_start: TurnState.UserSpeaking,
    end_of_utterance: TurnState.Thinking,
    utterance_discarded: TurnState.Listening,
  },
};

export function nextState(state: TurnState, event: TurnEvent): TurnState {
  return TRANSITIONS[state][event] ?? state;
}

/** True when it is allowed to start (or continue) playing assistant speech. */
export function canSpeak(state: TurnState): boolean {
  return state === TurnState.Speaking;
}

/** True when the user holds the floor and the assistant must stay quiet. */
export function userHasFloor(state: TurnState): boolean {
  return state === TurnState.UserSpeaking || state === TurnState.Interrupted;
}

export interface TurnMachineOptions {
  /** How long the user must be talking while we speak before we cut ourselves off. */
  bargeInMs?: number;
  /** When false, the assistant finishes its sentence even if the user talks. */
  neverTalkOver?: boolean;
  onChange?: (state: TurnState, prev: TurnState, event: TurnEvent) => void;
}

/**
 * Small stateful wrapper around `nextState` that also implements the barge-in
 * timer: a user must be detected speaking for `bargeInMs` (default 250 ms)
 * before an active reply is interrupted.
 */
export class TurnMachine {
  private _state: TurnState = TurnState.Idle;
  private voiceSince: number | null = null;
  readonly bargeInMs: number;
  neverTalkOver: boolean;
  private readonly onChange?: TurnMachineOptions["onChange"];

  constructor(opts: TurnMachineOptions = {}) {
    this.bargeInMs = opts.bargeInMs ?? 250;
    this.neverTalkOver = opts.neverTalkOver ?? true;
    this.onChange = opts.onChange;
  }

  get state(): TurnState {
    return this._state;
  }

  send(event: TurnEvent): TurnState {
    const prev = this._state;
    const next = nextState(prev, event);
    if (next !== prev) {
      this._state = next;
      this.onChange?.(next, prev, event);
    }
    if (event === "stop" || event === "end_of_utterance" || event === "utterance_discarded") {
      this.voiceSince = null;
    }
    return this._state;
  }

  /**
   * Feed VAD frames. `voiced` is whether the current frame contains speech,
   * `now` a monotonic timestamp in ms. Returns the (possibly new) state.
   */
  onVoiceFrame(voiced: boolean, now: number): TurnState {
    if (!voiced) {
      this.voiceSince = null;
      return this._state;
    }
    if (this.voiceSince === null) this.voiceSince = now;
    const heldFor = now - this.voiceSince;

    switch (this._state) {
      case TurnState.Listening:
        return this.send("voice_start");
      case TurnState.Interrupted:
        return this.send("voice_start");
      case TurnState.Speaking:
      case TurnState.Thinking:
        if (this.neverTalkOver && heldFor >= this.bargeInMs) {
          this.send("user_barge_in");
          // Barge-in already proves the user is talking; take the floor at once.
          return this.send("voice_start");
        }
        return this._state;
      default:
        return this._state;
    }
  }

  canSpeak(): boolean {
    return canSpeak(this._state);
  }
}
