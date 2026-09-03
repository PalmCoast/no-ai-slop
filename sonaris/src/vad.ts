/**
 * Voice activity detection over RMS frames with an adaptive noise floor, and
 * the end-of-utterance rule that decides when the user has finished talking.
 * Pure functions: no WebAudio here so they can run in unit tests.
 */

export interface VadOptions {
  /** Frames of silence used to estimate the noise floor (exponential average). */
  floorAlpha?: number;
  /** Speech is RMS above `floor * ratio + margin`. */
  ratio?: number;
  margin?: number;
  /** Initial floor before any adaptation. */
  initialFloor?: number;
  /** Frames above threshold needed before we call it speech (debounce). */
  attackFrames?: number;
  /** Frames below threshold needed before we call it silence (hangover). */
  releaseFrames?: number;
}

export interface VadFrame {
  rms: number;
  voiced: boolean;
  threshold: number;
  floor: number;
}

export class VoiceActivityDetector {
  private floor: number;
  private above = 0;
  private below = 0;
  private voiced = false;
  private readonly o: Required<VadOptions>;

  constructor(opts: VadOptions = {}) {
    this.o = {
      floorAlpha: opts.floorAlpha ?? 0.05,
      ratio: opts.ratio ?? 2.2,
      margin: opts.margin ?? 0.006,
      initialFloor: opts.initialFloor ?? 0.01,
      attackFrames: opts.attackFrames ?? 2,
      releaseFrames: opts.releaseFrames ?? 4,
    };
    this.floor = this.o.initialFloor;
  }

  get threshold(): number {
    return this.floor * this.o.ratio + this.o.margin;
  }

  /** Feed one frame's RMS (0..1). */
  push(rms: number): VadFrame {
    const threshold = this.threshold;
    if (rms > threshold) {
      this.above++;
      this.below = 0;
      if (!this.voiced && this.above >= this.o.attackFrames) this.voiced = true;
    } else {
      this.below++;
      this.above = 0;
      if (this.voiced && this.below >= this.o.releaseFrames) this.voiced = false;
    }
    // Asymmetric adaptation: the floor drops quickly, rises slowly, and rises
    // very slowly while speech is detected so a long monologue never pushes the
    // floor into the speech range, while steady room noise still gets absorbed.
    let alpha: number;
    if (rms < this.floor) alpha = this.o.floorAlpha * 3;
    else if (this.voiced) alpha = this.o.floorAlpha / 100;
    else alpha = this.o.floorAlpha;
    this.floor = this.floor + alpha * (rms - this.floor);
    return { rms, voiced: this.voiced, threshold, floor: this.floor };
  }

  reset(): void {
    this.above = 0;
    this.below = 0;
    this.voiced = false;
    this.floor = this.o.initialFloor;
  }
}

/** Root-mean-square of a time-domain buffer of floats in -1..1. */
export function rms(samples: ArrayLike<number>): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    const v = samples[i]!;
    sum += v * v;
  }
  return samples.length ? Math.sqrt(sum / samples.length) : 0;
}

export interface EouInput {
  /** Monotonic time now, ms. */
  now: number;
  /** Time of the last voiced frame, ms (null if the user has not spoken yet). */
  lastVoiceAt: number | null;
  /** Time of the last final transcript segment, ms (null if none yet). */
  lastFinalAt: number | null;
  /** True when there is pending interim (not yet final) transcript text. */
  hasInterim: boolean;
  /** Required silence after the last voice, ms. */
  silenceMs: number;
  /**
   * Extra grace to wait for the recognizer to finalize interim text. If the
   * recognizer never finalizes, we still fire after this much extra time.
   */
  finalizeGraceMs?: number;
}

/**
 * End-of-utterance rule. Fires when the user has been silent for `silenceMs`
 * after their last voiced frame. If interim text is still pending we allow a
 * short grace period for the recognizer to finalize it, then fire anyway so a
 * stuck recognizer never blocks the turn.
 */
export function shouldEndUtterance(i: EouInput): boolean {
  if (i.lastVoiceAt === null) return false;
  const silentFor = i.now - i.lastVoiceAt;
  if (silentFor < i.silenceMs) return false;
  if (i.hasInterim) {
    const grace = i.finalizeGraceMs ?? 600;
    return silentFor >= i.silenceMs + grace;
  }
  return true;
}

export const DEFAULT_SILENCE_MS = 900;
export const MIN_SILENCE_MS = 400;
export const MAX_SILENCE_MS = 2000;

export function clampSilence(ms: number): number {
  if (!Number.isFinite(ms)) return DEFAULT_SILENCE_MS;
  return Math.min(MAX_SILENCE_MS, Math.max(MIN_SILENCE_MS, Math.round(ms)));
}
