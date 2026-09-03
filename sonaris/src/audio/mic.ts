/**
 * Microphone capture plus a WebAudio AnalyserNode that reports RMS frames.
 */
import { rms } from "../vad";

export type MicErrorCode = "unsupported" | "denied" | "notfound" | "busy" | "unknown";

export class MicError extends Error {
  constructor(
    public readonly code: MicErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export interface MicHandle {
  stream: MediaStream;
  context: AudioContext;
  analyser: AnalyserNode;
  /** Latest RMS in 0..1. */
  readRms(): number;
  close(): void;
}

function mapError(e: unknown): MicError {
  const name = (e as { name?: string }).name ?? "";
  if (name === "NotAllowedError" || name === "SecurityError") return new MicError("denied", "Microphone access was denied.");
  if (name === "NotFoundError" || name === "DevicesNotFoundError" || name === "OverconstrainedError") {
    return new MicError("notfound", "No microphone found.");
  }
  if (name === "NotReadableError" || name === "AbortError") return new MicError("busy", "The microphone is in use by another app.");
  return new MicError("unknown", (e as Error).message || "Could not open the microphone.");
}

export async function openMic(): Promise<MicHandle> {
  if (!navigator.mediaDevices?.getUserMedia) throw new MicError("unsupported", "This browser cannot capture audio.");
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
  } catch (e) {
    throw mapError(e);
  }
  if (stream.getAudioTracks().length === 0) {
    stream.getTracks().forEach((t) => t.stop());
    throw new MicError("notfound", "No microphone found.");
  }
  const context = new AudioContext();
  await context.resume().catch(() => undefined);
  const source = context.createMediaStreamSource(stream);
  const analyser = context.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.2;
  source.connect(analyser);
  const buf = new Float32Array(new ArrayBuffer(analyser.fftSize * 4));
  return {
    stream,
    context,
    analyser,
    readRms() {
      analyser.getFloatTimeDomainData(buf);
      return rms(buf);
    },
    close() {
      try {
        source.disconnect();
      } catch {
        // already disconnected
      }
      stream.getTracks().forEach((t) => t.stop());
      void context.close().catch(() => undefined);
    },
  };
}
