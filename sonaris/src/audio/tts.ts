/**
 * Sentence-level playback queue. Each sentence is fetched from /api/tts as
 * soon as it is enqueued; playback is sequential. When the server answers 204
 * the sentence is spoken with browser speechSynthesis using the persona's
 * voice hint. If speech synthesis is missing or never starts (headless VMs,
 * some Linux builds), the sentence is "shown" for a duration proportional to
 * its length so the conversation still completes.
 */
import type { BrowserVoiceHint } from "../personas";

export interface SpeechQueueEvents {
  /** First audio (or first text-only sentence) is about to play. */
  onStart(): void;
  /** A sentence begins playing. */
  onSentence(text: string, index: number, mode: "audio" | "browser" | "text"): void;
  /** 0..1 level for the meter, ~30 times per second while speaking. */
  onLevel(level: number): void;
  /** Everything queued has been played and finish() was called. */
  onDone(): void;
  /** Non-fatal problem (falls back to browser/text mode). */
  onWarning(message: string): void;
}

export interface SpeechQueueOptions {
  fetchAudio(text: string, signal: AbortSignal): Promise<Blob | null>;
  hint: BrowserVoiceHint;
  /** Return false to refuse to start the next sentence (e.g. user is speaking). */
  allowPlayback(): boolean;
  /** Skip server TTS entirely (settings toggle or known-unconfigured). */
  preferBrowser?: boolean;
  events: SpeechQueueEvents;
}

interface Item {
  text: string;
  audio: Promise<Blob | null>;
}

let browserSpeechBroken = false;

function pickVoice(hint: BrowserVoiceHint): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === "undefined") return null;
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return null;
  const lang = (navigator.language || "en").slice(0, 2).toLowerCase();
  const male = /\b(male|man|david|daniel|alex|fred|george|james|thomas|mark|guy|ryan|aaron|arthur|onyx)\b/i;
  const female = /\b(female|woman|samantha|victoria|zira|karen|moira|tessa|fiona|susan|amy|emma|joanna|salli|kendra|allison|ava|serena|nova|aria|jenny|sonia)\b/i;
  const wanted = hint.gender === "female" ? female : male;
  const other = hint.gender === "female" ? male : female;
  const sameLang = voices.filter((v) => v.lang.toLowerCase().startsWith(lang));
  const pool = sameLang.length ? sameLang : voices;
  return (
    pool.find((v) => wanted.test(v.name)) ??
    pool.find((v) => !other.test(v.name) && v.default) ??
    pool.find((v) => !other.test(v.name)) ??
    pool[0] ??
    null
  );
}

function textOnlyDuration(text: string): number {
  return Math.min(6000, Math.max(700, text.length * 45));
}

export class SpeechQueue {
  private items: Item[] = [];
  private finished = false;
  private playing = false;
  private stopped = false;
  private started = false;
  private index = 0;
  private readonly abort = new AbortController();
  private audioEl: HTMLAudioElement | null = null;
  private levelTimer: number | null = null;
  private analyser: AnalyserNode | null = null;
  private analyserBuf: Float32Array<ArrayBuffer> | null = null;
  private static ctx: AudioContext | null = null;

  constructor(private readonly opts: SpeechQueueOptions) {}

  get length(): number {
    return this.items.length;
  }

  enqueue(text: string): void {
    if (this.stopped) return;
    const t = text.trim();
    if (!t) return;
    const audio = this.opts.preferBrowser
      ? Promise.resolve<Blob | null>(null)
      : this.opts.fetchAudio(t, this.abort.signal).catch((e: Error) => {
          if (e.name !== "AbortError") this.opts.events.onWarning(`Server voice unavailable (${e.message}); using the browser voice.`);
          return null;
        });
    this.items.push({ text: t, audio });
    void this.pump();
  }

  /** Signal that no more sentences will arrive. */
  finish(): void {
    this.finished = true;
    void this.pump();
  }

  /** Hard stop: pause audio, cancel speech, drop the queue. */
  stop(): void {
    if (this.stopped) return;
    this.stopped = true;
    this.items = [];
    this.abort.abort();
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.src = "";
      this.audioEl = null;
    }
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    this.stopLevel();
  }

  private async pump(): Promise<void> {
    if (this.playing || this.stopped) return;
    const item = this.items.shift();
    if (!item) {
      if (this.finished && this.started) {
        this.stopLevel();
        this.opts.events.onDone();
      } else if (this.finished && !this.started) {
        this.opts.events.onDone();
      }
      return;
    }
    this.playing = true;
    try {
      const blob = await item.audio;
      if (this.stopped) return;
      if (!this.opts.allowPlayback()) {
        this.stop();
        return;
      }
      if (!this.started) {
        this.started = true;
        this.opts.events.onStart();
        if (this.stopped) return;
      }
      const i = this.index++;
      if (blob) {
        this.opts.events.onSentence(item.text, i, "audio");
        await this.playBlob(blob);
      } else if (!browserSpeechBroken && typeof speechSynthesis !== "undefined") {
        this.opts.events.onSentence(item.text, i, "browser");
        const ok = await this.speakBrowser(item.text);
        if (!ok && !this.stopped) {
          browserSpeechBroken = true;
          this.opts.events.onWarning("Browser speech did not start; showing the reply as text.");
          await this.textOnly(item.text);
        }
      } else {
        this.opts.events.onSentence(item.text, i, "text");
        await this.textOnly(item.text);
      }
    } finally {
      this.playing = false;
    }
    void this.pump();
  }

  private static context(): AudioContext | null {
    try {
      if (!SpeechQueue.ctx) SpeechQueue.ctx = new AudioContext();
      void SpeechQueue.ctx.resume().catch(() => undefined);
      return SpeechQueue.ctx;
    } catch {
      return null;
    }
  }

  private playBlob(blob: Blob): Promise<void> {
    return new Promise((resolve) => {
      const el = new Audio();
      this.audioEl = el;
      const url = URL.createObjectURL(blob);
      const done = () => {
        URL.revokeObjectURL(url);
        if (this.audioEl === el) this.audioEl = null;
        this.stopLevel();
        resolve();
      };
      el.onended = done;
      el.onerror = () => {
        this.opts.events.onWarning("Audio playback failed for one sentence.");
        done();
      };
      el.src = url;
      const ctx = SpeechQueue.context();
      if (ctx) {
        try {
          const src = ctx.createMediaElementSource(el);
          const an = ctx.createAnalyser();
          an.fftSize = 512;
          src.connect(an);
          an.connect(ctx.destination);
          this.analyser = an;
          this.analyserBuf = new Float32Array(new ArrayBuffer(an.fftSize * 4));
        } catch {
          this.analyser = null;
        }
      }
      this.startLevel();
      el.play().catch(() => {
        this.opts.events.onWarning("Autoplay blocked; click anywhere and try again.");
        done();
      });
    });
  }

  private speakBrowser(text: string): Promise<boolean> {
    return new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(text);
      const voice = pickVoice(this.opts.hint);
      if (voice) u.voice = voice;
      u.pitch = this.opts.hint.pitch;
      u.rate = this.opts.hint.rate;
      let startedSpeaking = false;
      let settled = false;
      const settle = (ok: boolean) => {
        if (settled) return;
        settled = true;
        this.stopLevel();
        resolve(ok);
      };
      const startWatchdog = window.setTimeout(() => {
        if (!startedSpeaking) {
          speechSynthesis.cancel();
          settle(false);
        }
      }, 1500);
      u.onstart = () => {
        startedSpeaking = true;
        clearTimeout(startWatchdog);
        this.startLevel();
        // Safety net: some engines never fire onend.
        window.setTimeout(() => settle(true), textOnlyDuration(text) * 2.5);
      };
      u.onend = () => settle(true);
      u.onerror = (e) => {
        clearTimeout(startWatchdog);
        settle(startedSpeaking || e.error === "interrupted" || e.error === "canceled");
      };
      speechSynthesis.speak(u);
    });
  }

  private textOnly(text: string): Promise<void> {
    return new Promise((resolve) => {
      this.startLevel();
      const t = window.setTimeout(() => {
        this.stopLevel();
        resolve();
      }, textOnlyDuration(text));
      // If stopped early, resolve promptly.
      const check = window.setInterval(() => {
        if (this.stopped) {
          clearTimeout(t);
          clearInterval(check);
          resolve();
        }
      }, 50);
      window.setTimeout(() => clearInterval(check), textOnlyDuration(text) + 100);
    });
  }

  private startLevel(): void {
    this.stopLevel();
    const t0 = performance.now();
    this.levelTimer = window.setInterval(() => {
      let level: number;
      if (this.analyser && this.analyserBuf) {
        this.analyser.getFloatTimeDomainData(this.analyserBuf);
        let sum = 0;
        for (let i = 0; i < this.analyserBuf.length; i++) sum += this.analyserBuf[i]! ** 2;
        level = Math.min(1, Math.sqrt(sum / this.analyserBuf.length) * 4);
      } else {
        // Synthetic cadence for browser/text speech so the meter still moves.
        const t = (performance.now() - t0) / 1000;
        level = 0.35 + 0.25 * Math.sin(t * 7.3) + 0.15 * Math.sin(t * 13.1) + Math.random() * 0.08;
        level = Math.max(0.05, Math.min(1, level));
      }
      this.opts.events.onLevel(level);
    }, 33);
  }

  private stopLevel(): void {
    if (this.levelTimer !== null) {
      clearInterval(this.levelTimer);
      this.levelTimer = null;
    }
    this.analyser = null;
    this.analyserBuf = null;
    this.opts.events.onLevel(0);
  }
}

/** Warm the voice list; Chrome populates it asynchronously. */
export function warmBrowserVoices(): void {
  if (typeof speechSynthesis === "undefined") return;
  speechSynthesis.getVoices();
  speechSynthesis.addEventListener?.("voiceschanged", () => speechSynthesis.getVoices(), { once: true });
}
