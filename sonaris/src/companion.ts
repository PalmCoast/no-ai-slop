/**
 * The companion face: a short set of silent video clips of the Sonaris
 * creature, chosen from the turn-taking state. Two stacked <video> elements
 * are double-buffered so a clip change is a ~250 ms opacity crossfade instead
 * of a cut. The clips are built by scripts/build-companion-clips.sh.
 */
import { TurnState } from "./turn";

export type ClipName = "sleep" | "wake" | "alert" | "smile" | "speak";

export interface ClipPlan {
  clip: ClipName;
  /** Loop the clip (the ping-pong clips) or play it once. */
  loop: boolean;
  /** After a one-shot clip ends, continue with this looping clip. */
  then?: ClipName;
  /** Freeze the current frame for this long before the new clip fades in. */
  holdMs?: number;
}

/** Turn states whose face is "asleep or barely awake"; waking from them plays `wake`. */
const DORMANT = new Set<TurnState>([TurnState.Idle, TurnState.Listening]);

/**
 * Pure mapping from a turn transition to the clip to show. `prev` is null on
 * the first render. Returns the plan for `next`; the caller decides whether
 * the plan differs from what is already playing.
 */
export function clipForState(prev: TurnState | null, next: TurnState): ClipPlan {
  switch (next) {
    case TurnState.Idle:
      return { clip: "sleep", loop: true };
    case TurnState.Listening:
      return { clip: "alert", loop: true };
    case TurnState.UserSpeaking:
      if (prev === null || DORMANT.has(prev)) return { clip: "wake", loop: false, then: "alert" };
      return { clip: "alert", loop: true };
    case TurnState.Thinking:
      // Ends on the smile and stays there (no loop, no follow-up).
      return { clip: "smile", loop: false };
    case TurnState.Speaking:
      return { clip: "speak", loop: true };
    case TurnState.Interrupted:
      return { clip: "alert", loop: true, holdMs: 350 };
  }
}

export const CLIP_NAMES: readonly ClipName[] = ["sleep", "wake", "alert", "smile", "speak"];

export interface CompanionFaceOptions {
  /** URL prefix for the clips, default "/companion". */
  base?: string;
  /** Crossfade length in ms, default 250. */
  fadeMs?: number;
  /** Override the reduced-motion media query (tests). */
  reducedMotion?: boolean;
}

export class CompanionFace {
  readonly root: HTMLElement;
  private readonly ring: HTMLElement;
  private readonly poster: HTMLImageElement;
  private readonly videos: [HTMLVideoElement, HTMLVideoElement];
  private active = 0;
  private current: ClipName | null = null;
  private currentLoop = true;
  private state: TurnState | null = null;
  private holdTimer: number | null = null;
  private fadeTimer: number | null = null;
  private readonly base: string;
  private readonly fadeMs: number;
  private readonly reducedMotion: boolean;
  private preloaded = false;
  private preloadEls: HTMLVideoElement[] = [];
  private switchSeq = 0;

  constructor(mount: HTMLElement, opts: CompanionFaceOptions = {}) {
    this.base = opts.base ?? "/companion";
    this.fadeMs = opts.fadeMs ?? 250;
    this.reducedMotion =
      opts.reducedMotion ?? (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches);

    this.root = mount;
    this.root.classList.add("face");
    this.root.dataset.clip = "";

    this.ring = document.createElement("div");
    this.ring.className = "face-ring";
    this.ring.setAttribute("aria-hidden", "true");

    const frame = document.createElement("div");
    frame.className = "face-frame";

    this.poster = document.createElement("img");
    this.poster.className = "face-poster";
    this.poster.src = `${this.base}/poster.jpg`;
    this.poster.alt = "";
    this.poster.width = 720;
    this.poster.height = 720;
    this.poster.decoding = "async";

    const make = () => {
      const v = document.createElement("video");
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      v.setAttribute("playsinline", "");
      v.preload = "auto";
      v.poster = `${this.base}/poster.jpg`;
      v.setAttribute("aria-hidden", "true");
      v.tabIndex = -1;
      v.className = "face-video";
      return v;
    };
    this.videos = [make(), make()];

    frame.appendChild(this.poster);
    if (!this.reducedMotion) {
      frame.appendChild(this.videos[0]);
      frame.appendChild(this.videos[1]);
    } else {
      this.root.classList.add("reduced-motion");
    }
    this.root.appendChild(this.ring);
    this.root.appendChild(frame);
    this.root.dataset.state = TurnState.Idle;
  }

  /** The <video> currently shown (for checks and tests). */
  get activeVideo(): HTMLVideoElement {
    return this.videos[this.active]!;
  }

  get currentClip(): ClipName | null {
    return this.current;
  }

  /** Warm the browser's media cache so the first state change does not stall. */
  preload(): void {
    if (this.preloaded || this.reducedMotion) return;
    this.preloaded = true;
    const holder = document.createElement("div");
    holder.hidden = true;
    holder.setAttribute("aria-hidden", "true");
    for (const name of CLIP_NAMES) {
      if (name === this.current) continue;
      const v = document.createElement("video");
      v.muted = true;
      v.preload = "auto";
      this.setSources(v, name);
      v.load();
      holder.appendChild(v);
      this.preloadEls.push(v);
    }
    this.root.appendChild(holder);
  }

  /** Drive the face from the turn machine. */
  setState(next: TurnState): void {
    const prev = this.state;
    this.state = next;
    this.root.dataset.state = next;
    const plan = clipForState(prev, next);
    this.apply(plan);
  }

  /** The paywall is up: the companion rests behind it. */
  sleep(): void {
    this.state = TurnState.Idle;
    this.root.dataset.state = TurnState.Idle;
    this.apply({ clip: "sleep", loop: true });
  }

  /** 0..1 assistant level; drives the ring while speaking. */
  setLevel(level: number): void {
    const l = Math.max(0, Math.min(1, level));
    this.ring.style.opacity = this.state === TurnState.Speaking ? String(0.25 + l * 0.75) : "";
  }

  private apply(plan: ClipPlan): void {
    if (this.holdTimer !== null) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
    // Same looping clip already on screen: leave it alone.
    if (plan.clip === this.current && plan.loop && this.currentLoop && !plan.holdMs) return;
    if (this.reducedMotion) {
      this.current = plan.clip;
      this.currentLoop = plan.loop;
      this.root.dataset.clip = plan.clip;
      return;
    }
    if (plan.holdMs) {
      // Freeze what is on screen, then move on.
      this.activeVideo.pause();
      this.holdTimer = window.setTimeout(() => {
        this.holdTimer = null;
        void this.switchTo(plan.clip, plan.loop, plan.then);
      }, plan.holdMs);
      return;
    }
    void this.switchTo(plan.clip, plan.loop, plan.then);
  }

  private setSources(v: HTMLVideoElement, name: ClipName): void {
    v.textContent = "";
    for (const [type, ext] of [
      ["video/webm", "webm"],
      ["video/mp4", "mp4"],
    ] as const) {
      const s = document.createElement("source");
      s.src = `${this.base}/${name}.${ext}`;
      s.type = type;
      v.appendChild(s);
    }
  }

  private async switchTo(name: ClipName, loop: boolean, then?: ClipName): Promise<void> {
    const seq = ++this.switchSeq;
    const outgoing = this.activeVideo;
    const incoming = this.videos[1 - this.active]!;
    this.current = name;
    this.currentLoop = loop;
    this.root.dataset.clip = name;

    incoming.onended = null;
    incoming.loop = loop;
    this.setSources(incoming, name);
    incoming.load();
    if (!loop && then) {
      incoming.onended = () => {
        if (seq !== this.switchSeq) return;
        void this.switchTo(then, true);
      };
    }
    try {
      await incoming.play();
    } catch {
      if (seq !== this.switchSeq) return;
      // Autoplay refused even though the video is muted: fall back to the poster.
      this.root.classList.add("show-poster");
      return;
    }
    if (seq !== this.switchSeq) return;
    this.root.classList.remove("show-poster");

    // Crossfade: the new buffer fades in over the old one, then the old one stops.
    this.active = 1 - this.active;
    incoming.classList.add("is-active");
    outgoing.classList.remove("is-active");
    if (this.fadeTimer !== null) clearTimeout(this.fadeTimer);
    this.fadeTimer = window.setTimeout(() => {
      this.fadeTimer = null;
      if (seq !== this.switchSeq) return;
      outgoing.pause();
      outgoing.onended = null;
    }, this.fadeMs);
  }
}
