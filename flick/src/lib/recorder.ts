import type { CaptureMode } from "../../shared/types";
import { drawCameraBubble, drawDemoFrame } from "./compose";
import { pickMimeType } from "./mime";

export interface RecordingResult {
  blob: Blob;
  mimeType: string;
  durationMs: number;
  width: number;
  height: number;
  mode: CaptureMode;
}

export interface PrepareOptions {
  mode: CaptureMode;
  mic: boolean;
  mirrorCamera: boolean;
  preview: HTMLCanvasElement | HTMLVideoElement;
}

const MAX_W = 1920;
const MAX_H = 1080;

function stopStream(stream: MediaStream | null): void {
  if (!stream) return;
  for (const track of stream.getTracks()) track.stop();
}

function attach(video: HTMLVideoElement, stream: MediaStream): Promise<void> {
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  return video.play().then(() => undefined);
}

function waitVideo(video: HTMLVideoElement): Promise<void> {
  if (video.videoWidth > 0) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      video.removeEventListener("loadedmetadata", done);
      resolve();
    };
    video.addEventListener("loadedmetadata", done);
  });
}

function fit(width: number, height: number): { width: number; height: number } {
  const scale = Math.min(1, MAX_W / width, MAX_H / height);
  return { width: Math.max(16, Math.round(width * scale)), height: Math.max(16, Math.round(height * scale)) };
}

export class CaptureSession {
  private mode: CaptureMode = "screen";
  private mirror = true;
  private screenStream: MediaStream | null = null;
  private cameraStream: MediaStream | null = null;
  private micStream: MediaStream | null = null;
  private mixedAudio: AudioContext | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private startedAt = 0;
  private elapsedBeforePause = 0;
  private raf = 0;
  private hidden = document.createElement("div");
  private screenVideo = document.createElement("video");
  private cameraVideo = document.createElement("video");
  private canvas: HTMLCanvasElement | null = null;
  private preview: HTMLCanvasElement | HTMLVideoElement | null = null;
  private output: MediaStream | null = null;
  private mimeType = "";
  private size = { width: 1280, height: 720 };
  private onEnded: (() => void) | null = null;

  async prepare(opts: PrepareOptions): Promise<{ width: number; height: number }> {
    this.dispose();
    this.mode = opts.mode;
    this.mirror = opts.mirrorCamera;
    this.preview = opts.preview;
    this.hidden.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)";
    this.screenVideo.muted = true;
    this.cameraVideo.muted = true;
    this.hidden.append(this.screenVideo, this.cameraVideo);
    document.body.append(this.hidden);

    if (opts.mode === "screen" || opts.mode === "both") {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30, width: { max: MAX_W }, height: { max: MAX_H } },
        audio: true,
      });
      this.screenStream.getVideoTracks()[0]?.addEventListener("ended", () => this.onEnded?.());
    }
    if (opts.mode === "camera" || opts.mode === "both") {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });
    }
    if (opts.mic) {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: false,
      });
    }

    if (opts.mode === "screen" && this.screenStream) {
      await attach(this.screenVideo, this.screenStream);
      await waitVideo(this.screenVideo);
      this.size = fit(this.screenVideo.videoWidth || 1280, this.screenVideo.videoHeight || 720);
      this.output = new MediaStream(this.screenStream.getVideoTracks());
      if (opts.preview instanceof HTMLVideoElement) {
        opts.preview.srcObject = this.screenStream;
        opts.preview.muted = true;
        await opts.preview.play().catch(() => undefined);
      }
    } else if (opts.mode === "camera" && this.cameraStream) {
      await attach(this.cameraVideo, this.cameraStream);
      await waitVideo(this.cameraVideo);
      this.size = fit(this.cameraVideo.videoWidth || 1280, this.cameraVideo.videoHeight || 720);
      this.output = new MediaStream(this.cameraStream.getVideoTracks());
      if (opts.preview instanceof HTMLVideoElement) {
        opts.preview.srcObject = this.cameraStream;
        opts.preview.muted = true;
        await opts.preview.play().catch(() => undefined);
      }
    } else {
      this.canvas = opts.preview instanceof HTMLCanvasElement ? opts.preview : document.createElement("canvas");
      if (opts.mode === "both" && this.screenStream) {
        await attach(this.screenVideo, this.screenStream);
        await waitVideo(this.screenVideo);
        this.size = fit(this.screenVideo.videoWidth || 1280, this.screenVideo.videoHeight || 720);
      } else {
        this.size = { width: 1280, height: 720 };
      }
      if (this.cameraStream) {
        await attach(this.cameraVideo, this.cameraStream);
        await waitVideo(this.cameraVideo);
      }
      this.canvas.width = this.size.width;
      this.canvas.height = this.size.height;
      this.output = this.canvas.captureStream(30);
      this.loop(0);
    }

    const audio = this.mixAudio();
    if (audio && this.output) this.output.addTrack(audio);
    return this.size;
  }

  setOnEnded(handler: () => void): void {
    this.onEnded = handler;
  }

  start(): void {
    if (!this.output) throw new Error("Call prepare() first.");
    this.mimeType = pickMimeType((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t));
    const recorder = this.mimeType
      ? new MediaRecorder(this.output, { mimeType: this.mimeType, videoBitsPerSecond: 2_500_000 })
      : new MediaRecorder(this.output);
    this.mimeType = recorder.mimeType || this.mimeType || "video/webm";
    this.chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    recorder.start(1000);
    this.recorder = recorder;
    this.startedAt = performance.now();
    this.elapsedBeforePause = 0;
  }

  pause(): void {
    if (this.recorder?.state === "recording") {
      this.recorder.pause();
      this.elapsedBeforePause += performance.now() - this.startedAt;
    }
  }

  resume(): void {
    if (this.recorder?.state === "paused") {
      this.recorder.resume();
      this.startedAt = performance.now();
    }
  }

  elapsedMs(): number {
    const live = this.recorder?.state === "recording" ? performance.now() - this.startedAt : 0;
    return this.elapsedBeforePause + live;
  }

  async stop(): Promise<RecordingResult> {
    const recorder = this.recorder;
    if (!recorder || recorder.state === "inactive") {
      throw new Error("Not recording.");
    }
    const blob = await new Promise<Blob>((resolve, reject) => {
      recorder.addEventListener("error", () => reject(new Error("Recorder failed.")), { once: true });
      recorder.addEventListener(
        "stop",
        () => resolve(new Blob(this.chunks, { type: this.mimeType || "video/webm" })),
        { once: true },
      );
      recorder.stop();
    });
    const durationMs = this.elapsedMs();
    this.recorder = null;
    return {
      blob,
      mimeType: blob.type || this.mimeType,
      durationMs,
      width: this.size.width,
      height: this.size.height,
      mode: this.mode,
    };
  }

  dispose(): void {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    if (this.recorder && this.recorder.state !== "inactive") {
      try {
        this.recorder.stop();
      } catch {
        /* already stopped */
      }
    }
    this.recorder = null;
    stopStream(this.screenStream);
    stopStream(this.cameraStream);
    stopStream(this.micStream);
    stopStream(this.output);
    this.screenStream = null;
    this.cameraStream = null;
    this.micStream = null;
    this.output = null;
    void this.mixedAudio?.close();
    this.mixedAudio = null;
    this.hidden.remove();
    if (this.preview instanceof HTMLVideoElement) this.preview.srcObject = null;
  }

  private mixAudio(): MediaStreamTrack | null {
    const streams = [this.screenStream, this.micStream].filter((s): s is MediaStream => !!s && s.getAudioTracks().length > 0);
    if (streams.length === 0) return null;
    if (streams.length === 1) return streams[0]!.getAudioTracks()[0] ?? null;
    const ctx = new AudioContext();
    this.mixedAudio = ctx;
    const dest = ctx.createMediaStreamDestination();
    for (const stream of streams) {
      ctx.createMediaStreamSource(stream).connect(dest);
    }
    void ctx.resume();
    return dest.stream.getAudioTracks()[0] ?? null;
  }

  private loop(start: number): void {
    const canvas = this.canvas;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const origin = start || performance.now();
    const tick = (now: number) => {
      if (this.mode === "demo") drawDemoFrame(ctx, now - origin, canvas.width, canvas.height);
      else {
        const src = this.screenVideo;
        if (src.readyState >= 2) ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
        else {
          ctx.fillStyle = "#0c0b0a";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        if (this.cameraStream) drawCameraBubble(ctx, this.cameraVideo, canvas.width, canvas.height, this.mirror);
      }
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }
}
