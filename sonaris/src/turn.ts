/**
 * Turn-taking state machine for the Sonaris console.
 *
 *   idle → listening → user_speaking → thinking → speaking → listening
 *
 * `interrupted` is entered from `thinking` or `speaking` on `user_interrupt`;
 * the machine then continues to `listening`/`user_speaking`. Two rules matter:
 * text-to-speech may only start on `thinking` → `speaking`, never while the
 * user is speaking; and while the assistant speaks the microphone is muted, so
 * voice activity reported in `speaking` is ignored (it would be the assistant's
 * own voice coming back through the speakers). Interrupting playback is an
 * explicit action: Esc, Space, the mic button, or typed text.
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
  | "user_interrupt"; // user cut the reply off (Esc, Space, typed text; or voice while thinking)

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
    user_interrupt: TurnState.Interrupted,
  },
  [TurnState.Speaking]: {
    stop: TurnState.Idle,
    reply_done: TurnState.Listening,
    reply_failed: TurnState.Listening,
    user_interrupt: TurnState.Interrupted,
    // No `voice_start` here on purpose: the mic is muted while we speak.
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

/** True when the microphone must be muted: the assistant's voice is on the speakers. */
export function micMuted(state: TurnState): boolean {
  return state === TurnState.Speaking;
}

export interface TurnMachineOptions {
  /**
   * How long the user must be talking while we are still thinking (mic open,
   * speakers silent) before the pending reply is cancelled.
   */
  bargeInMs?: number;
  onChange?: (state: TurnState, prev: TurnState, event: TurnEvent) => void;
}

/**
 * Small stateful wrapper around `nextState`. It owns the one acoustic
 * interruption that remains: while `thinking`, a user detected speaking for
 * `bargeInMs` (default 250 ms) cancels the reply before it starts. While
 * `speaking`, voice frames are ignored; only `user_interrupt` cuts playback.
 */
export class TurnMachine {
  private _state: TurnState = TurnState.Idle;
  private voiceSince: number | null = null;
  readonly bargeInMs: number;
  private readonly onChange?: TurnMachineOptions["onChange"];

  constructor(opts: TurnMachineOptions = {}) {
    this.bargeInMs = opts.bargeInMs ?? 250;
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
      // The "held for" clock belongs to the state it started in.
      this.voiceSince = null;
      this.onChange?.(next, prev, event);
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
      case TurnState.Interrupted:
        return this.send("voice_start");
      case TurnState.Thinking:
        if (heldFor >= this.bargeInMs) {
          this.send("user_interrupt");
          // The user is already talking; take the floor at once.
          return this.send("voice_start");
        }
        return this._state;
      case TurnState.Speaking:
        // Muted mic: whatever the detector reports is the assistant's own
        // voice leaking back in. Never treat it as the user.
        return this._state;
      default:
        return this._state;
    }
  }

  canSpeak(): boolean {
    return canSpeak(this._state);
  }

  micMuted(): boolean {
    return micMuted(this._state);
  }
}
