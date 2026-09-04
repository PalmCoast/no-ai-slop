/**
 * Live captions. Primary: Web Speech API (Chrome, Edge, Safari) with
 * continuous interim results. Fallback: MediaRecorder slices sent to
 * /api/transcribe (Whisper) roughly every 4 seconds of speech.
 */

// The DOM lib does not ship SpeechRecognition types; declare the parts we use.
interface SRAlternative {
  transcript: string;
  confidence: number;
}
interface SRResult {
  isFinal: boolean;
  length: number;
  [index: number]: SRAlternative;
}
interface SRResultList {
  length: number;
  [index: number]: SRResult;
}
interface SREvent extends Event {
  resultIndex: number;
  results: SRResultList;
}
interface SRErrorEvent extends Event {
  error: string;
  message: string;
}
interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: SRErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}
type SRConstructor = new () => SpeechRecognitionLike;

function speechRecognitionCtor(): SRConstructor | null {
  const w = window as unknown as { SpeechRecognition?: SRConstructor; webkitSpeechRecognition?: SRConstructor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface CaptionEvents {
  /** Interim (not yet final) text for the current utterance. */
  onInterim(text: string): void;
  /** A final segment; append to the utterance. */
  onFinal(text: string): void;
  onStatus(status: string): void;
  onError(code: string, message: string): void;
}

export interface CaptionSource {
  readonly kind: "web-speech" | "recorder";
  start(): void;
  stop(): void;
  /**
   * Stop hearing while the assistant speaks. No result produced by a
   * recognizer that was running before suspend() may reach the events, even
   * if it arrives after resume().
   */
  suspend(): void;
  /** Start hearing again after playback; a no-op unless suspended. */
  resume(): void;
  /** Called at end of utterance so the source can flush pending audio. */
  flush(): Promise<void>;
}

export function webSpeechSupported(): boolean {
  return speechRecognitionCtor() !== null;
}

export class WebSpeechCaptions implements CaptionSource {
  readonly kind = "web-speech" as const;
  private rec: SpeechRecognitionLike | null = null;
  private ctor: SRConstructor | null = null;
  private active = false;
  private suspended = false;
  /**
   * Bumped on every suspend(). Each recognizer instance remembers the
   * generation it was spawned in and drops its results if that is stale, so a
   * recognizer that heard the speakers cannot deliver a transcript later.
   */
  private generation = 0;
  private restartTimer: number | null = null;

  constructor(
    private readonly events: CaptionEvents,
    private readonly lang = navigator.language || "en-US",
  ) {}

  start(): void {
    if (this.active) return;
    const Ctor = speechRecognitionCtor();
    if (!Ctor) {
      this.events.onError("unsupported", "Web Speech API is not available.");
      return;
    }
    this.ctor = Ctor;
    this.active = true;
    this.suspended = false;
    this.spawn(Ctor);
  }

  suspend(): void {
    if (this.suspended) return;
    this.suspended = true;
    this.generation++;
    this.clearRestart();
    const rec = this.rec;
    this.rec = null;
    try {
      rec?.abort();
    } catch {
      // already ended
    }
    if (this.active) this.events.onStatus("muted");
  }

  resume(): void {
    if (!this.suspended) return;
    this.suspended = false;
    if (this.active && this.ctor && !this.rec) this.spawn(this.ctor);
  }

  private clearRestart(): void {
    if (this.restartTimer !== null) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
  }

  private spawn(Ctor: SRConstructor): void {
    const gen = this.generation;
    const live = () => this.active && !this.suspended && gen === this.generation;
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = this.lang;
    rec.maxAlternatives = 1;
    rec.onstart = () => {
      if (live()) this.events.onStatus("listening");
    };
    rec.onresult = (e) => {
      if (!live()) return;
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (!res) continue;
        const alt = res[0];
        const t = alt?.transcript ?? "";
        if (res.isFinal) {
          if (t.trim()) this.events.onFinal(t.trim());
        } else {
          interim += t;
        }
      }
      this.events.onInterim(interim.trim());
    };
    rec.onerror = (e) => {
      // 'no-speech' and 'aborted' are routine; everything else is reported.
      if (e.error === "no-speech" || e.error === "aborted") return;
      if (!live()) return;
      this.events.onError(e.error, e.message || e.error);
      if (e.error === "not-allowed" || e.error === "service-not-allowed" || e.error === "network" || e.error === "audio-capture") {
        this.active = false;
      }
    };
    rec.onend = () => {
      if (this.rec === rec) this.rec = null;
      // A suspended or superseded recognizer must not respawn itself.
      if (!live()) return;
      // Chrome ends sessions after silence or ~60 s; restart to stay live.
      this.clearRestart();
      this.restartTimer = window.setTimeout(() => {
        this.restartTimer = null;
        if (live() && !this.rec) this.spawn(Ctor);
      }, 150);
    };
    this.rec = rec;
    try {
      rec.start();
    } catch (err) {
      this.events.onError("start-failed", (err as Error).message);
      this.active = false;
    }
  }

  stop(): void {
    this.active = false;
    this.suspended = false;
    this.clearRestart();
    try {
      this.rec?.stop();
    } catch {
      // ignore
    }
    this.rec = null;
    this.events.onStatus("stopped");
  }

  async flush(): Promise<void> {
    // Web Speech finalizes on its own; nothing to flush.
  }
}

export interface RecorderCaptionOptions {
  /** How often to cut a slice while the user is speaking. */
  sliceMs?: number;
  transcribe(blob: Blob): Promise<string>;
  /** True while the user is speaking (VAD); slices are only sent when there was speech. */
  isVoiced(): boolean;
}

/**
 * Fallback for browsers without Web Speech. Records short standalone files
 * (restarting MediaRecorder for each slice so every blob has a header) and
 * transcribes them server-side.
 */
export class RecorderCaptions implements CaptionSource {
  readonly kind = "recorder" as const;
  private recorder: MediaRecorder | null = null;
  private timer: number | null = null;
  private active = false;
  private suspended = false;
  private hadVoice = false;
  private pending: Promise<void> = Promise.resolve();
  private readonly sliceMs: number;

  constructor(
    private readonly stream: MediaStream,
    private readonly events: CaptionEvents,
    private readonly opts: RecorderCaptionOptions,
  ) {
    this.sliceMs = opts.sliceMs ?? 4000;
  }

  static supported(): boolean {
    return typeof MediaRecorder !== "undefined";
  }

  private mimeType(): string | undefined {
    const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
    return candidates.find((c) => MediaRecorder.isTypeSupported(c));
  }

  start(): void {
    if (this.active) return;
    if (!RecorderCaptions.supported()) {
      this.events.onError("unsupported", "MediaRecorder is not available.");
      return;
    }
    this.active = true;
    this.beginSlice();
    this.timer = window.setInterval(() => {
      if (this.opts.isVoiced()) this.hadVoice = true;
      // Rotate every sliceMs only if something was said in this slice.
      if (this.hadVoice && this.recorder && this.recorder.state === "recording") {
        if (performance.now() - this.sliceStart >= this.sliceMs) void this.cutSlice();
      }
    }, 250);
    this.events.onStatus("listening");
  }

  private sliceStart = 0;

  private beginSlice(): void {
    const mimeType = this.mimeType();
    const rec = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    rec.onstop = () => {
      const had = this.hadVoice;
      this.hadVoice = false;
      if (!had || chunks.length === 0) return;
      const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
      this.pending = this.pending.then(async () => {
        this.events.onStatus("transcribing");
        try {
          const text = await this.opts.transcribe(blob);
          if (text.trim()) this.events.onFinal(text.trim());
        } catch (err) {
          const e = err as { code?: string; message: string };
          this.events.onError(e.code ?? "transcribe-failed", e.message);
        } finally {
          if (this.active) this.events.onStatus("listening");
        }
      });
    };
    this.recorder = rec;
    this.sliceStart = performance.now();
    rec.start();
  }

  private async cutSlice(): Promise<void> {
    const rec = this.recorder;
    if (!rec) return;
    this.recorder = null;
    if (rec.state !== "inactive") rec.stop();
    if (this.active && !this.suspended) this.beginSlice();
  }

  /** Drop the slice in progress (it would contain the speakers) and record nothing until resume(). */
  suspend(): void {
    if (!this.active || this.suspended) return;
    this.suspended = true;
    const rec = this.recorder;
    this.recorder = null;
    this.hadVoice = false;
    if (rec) {
      rec.onstop = null;
      rec.ondataavailable = null;
      if (rec.state !== "inactive") rec.stop();
    }
    this.events.onStatus("muted");
  }

  resume(): void {
    if (!this.suspended) return;
    this.suspended = false;
    if (this.active && !this.recorder) {
      this.beginSlice();
      this.events.onStatus("listening");
    }
  }

  async flush(): Promise<void> {
    if (!this.active || this.suspended) return;
    this.hadVoice = true;
    await this.cutSlice();
    await this.pending;
  }

  stop(): void {
    this.active = false;
    this.suspended = false;
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    const rec = this.recorder;
    this.recorder = null;
    this.hadVoice = false;
    if (rec && rec.state !== "inactive") rec.stop();
    this.events.onStatus("stopped");
  }
}
