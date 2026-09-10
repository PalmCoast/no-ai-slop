import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { publishRecording } from "../api";
import { Layout } from "../components/Layout";
import { formatBytes, formatDuration } from "../lib/format";
import { markPublished, saveLocal } from "../lib/local";
import { canCaptureCamera, canCaptureScreen } from "../lib/mime";
import { CaptureSession, type RecordingResult } from "../lib/recorder";
import { makeClipId, MAX_DURATION_MS, type CaptureMode } from "../../shared/types";

type Phase = "setup" | "countdown" | "recording" | "paused" | "review";

const MODES: { id: CaptureMode; title: string; note: string }[] = [
  { id: "screen", title: "Screen", note: "A window, tab, or the whole display." },
  { id: "camera", title: "Camera", note: "Talking head. No screen share." },
  { id: "both", title: "Both", note: "Screen with a camera bubble in the corner." },
  { id: "demo", title: "Demo scene", note: "No permissions. Tests the share link." },
];

export function Record() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<CaptureSession | null>(null);
  const [mode, setMode] = useState<CaptureMode>("demo");
  const [mic, setMic] = useState(true);
  const [phase, setPhase] = useState<Phase>("setup");
  const [count, setCount] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecordingResult | null>(null);
  const [localId, setLocalId] = useState("");
  const [title, setTitle] = useState("Untitled Flick");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [remoteId, setRemoteId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const usesCanvas = mode === "both" || mode === "demo";

  useEffect(() => {
    return () => {
      sessionRef.current?.dispose();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // previewUrl is revoked on new recordings; unmount cleanup is enough
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "recording" && phase !== "paused") return;
    const id = window.setInterval(() => {
      const ms = sessionRef.current?.elapsedMs() ?? 0;
      elapsedRef.current = ms;
      setElapsed(ms);
      if (ms >= MAX_DURATION_MS) void finish();
    }, 200);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "Escape" && (phase === "recording" || phase === "paused" || phase === "countdown")) {
        e.preventDefault();
        void cancelOrStop();
      }
      if (e.code === "Space" && (phase === "recording" || phase === "paused")) {
        e.preventDefault();
        togglePause();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function previewEl(): HTMLCanvasElement | HTMLVideoElement {
    const el = usesCanvas ? canvasRef.current : videoRef.current;
    if (!el) throw new Error("Preview is not ready.");
    return el;
  }

  async function begin() {
    setError(null);
    if (mode !== "demo") {
      if ((mode === "screen" || mode === "both") && !canCaptureScreen()) {
        setError("This browser cannot share a screen. Use the demo scene or try Chrome.");
        return;
      }
      if ((mode === "camera" || mode === "both") && !canCaptureCamera()) {
        setError("Camera access is not available.");
        return;
      }
    }
    const session = new CaptureSession();
    sessionRef.current?.dispose();
    sessionRef.current = session;
    try {
      await session.prepare({ mode, mic: mic && mode !== "demo", mirrorCamera: true, preview: previewEl() });
    } catch (e) {
      session.dispose();
      sessionRef.current = null;
      setError(e instanceof Error ? e.message : "Could not start capture.");
      return;
    }
    session.setOnEnded(() => {
      void finish();
    });
    setPhase("countdown");
    setCount(3);
    let n = 3;
    const tick = window.setInterval(() => {
      n -= 1;
      if (n <= 0) {
        window.clearInterval(tick);
        try {
          session.start();
          setPhase("recording");
          setElapsed(0);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Recorder failed.");
          setPhase("setup");
        }
      } else setCount(n);
    }, 1000);
  }

  function togglePause() {
    const session = sessionRef.current;
    if (!session) return;
    if (phase === "recording") {
      session.pause();
      setPhase("paused");
    } else if (phase === "paused") {
      session.resume();
      setPhase("recording");
    }
  }

  async function finish() {
    const session = sessionRef.current;
    if (!session) return;
    try {
      const rec = await session.stop();
      session.dispose();
      sessionRef.current = null;
      const durationMs = Math.max(rec.durationMs, elapsedRef.current, 400);
      const id = makeClipId();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(rec.blob);
      setPreviewUrl(url);
      setResult(rec);
      setLocalId(id);
      setTitle(`Flick ${new Date().toLocaleString()}`);
      await saveLocal({
        id,
        title: `Flick ${new Date().toLocaleString()}`,
        createdAt: new Date().toISOString(),
        durationMs,
        width: rec.width,
        height: rec.height,
        mimeType: rec.mimeType,
        size: rec.blob.size,
        mode: rec.mode,
        blob: rec.blob,
      });
      setResult({ ...rec, durationMs });
      setPhase("review");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the recording.");
      setPhase("setup");
    }
  }

  async function cancelOrStop() {
    if (phase === "countdown") {
      sessionRef.current?.dispose();
      sessionRef.current = null;
      setPhase("setup");
      return;
    }
    if (phase === "recording" || phase === "paused") await finish();
  }

  async function publish() {
    if (!result) return;
    setPublishing(true);
    setError(null);
    try {
      const remote = await publishRecording(
        result.blob,
        {
          title,
          mimeType: result.mimeType,
          durationMs: result.durationMs,
          width: result.width,
          height: result.height,
          mode: result.mode,
        },
        (ratio) => setProgress(ratio),
      );
      await markPublished(localId, remote.id);
      setRemoteId(remote.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. You can still download the file.");
    } finally {
      setPublishing(false);
    }
  }

  async function copy() {
    if (!remoteId) return;
    await navigator.clipboard.writeText(`${window.location.origin}/v/${remoteId}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Layout wide>
      <div className="studio">
        <div className="row between">
          <div>
            <p className="kicker">Studio</p>
            <h1>Record</h1>
          </div>
          <p className="muted small">Space pauses. Esc stops. 15 minutes max.</p>
        </div>
        {error ? <div className="alert error">{error}</div> : null}

        {phase === "setup" ? (
          <>
            <div className="modes">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={mode === m.id ? "mode active" : "mode"}
                  onClick={() => setMode(m.id)}
                >
                  <b>{m.title}</b>
                  <span className="muted small">{m.note}</span>
                </button>
              ))}
            </div>
            <label className="switch">
              <input type="checkbox" checked={mic} onChange={(e) => setMic(e.target.checked)} disabled={mode === "demo"} />
              Microphone {mode === "demo" ? "(off in demo)" : mic ? "on" : "off"}
            </label>
            <button className="btn amber big" type="button" onClick={() => void begin()}>
              Start recording
            </button>
          </>
        ) : null}

        <div className="stage-wrap" hidden={phase === "setup" && !result}>
          <video ref={videoRef} hidden={usesCanvas} playsInline muted />
          <canvas ref={canvasRef} hidden={!usesCanvas} width={1280} height={720} />
          {phase === "countdown" ? <div className="countdown">{count}</div> : null}
          {(phase === "recording" || phase === "paused") && (
            <div className="hud">
              <span className="row">
                <span className="rec-dot" />
                <span className="timer">
                  {phase === "paused" ? "Paused " : ""}
                  {formatDuration(elapsed)}
                </span>
              </span>
              <span className="row">
                <button className="btn" type="button" onClick={togglePause}>
                  {phase === "paused" ? "Resume" : "Pause"}
                </button>
                <button className="btn danger" type="button" onClick={() => void finish()}>
                  Stop
                </button>
              </span>
            </div>
          )}
        </div>
        {(phase === "recording" || phase === "paused") && (
          <div className="transport">
            <span className="timer">
              {phase === "paused" ? "Paused · " : "Recording · "}
              {formatDuration(elapsed)}
            </span>
            <span className="row">
              <button className="btn" type="button" onClick={togglePause}>
                {phase === "paused" ? "Resume" : "Pause"}
              </button>
              <button className="btn danger" type="button" onClick={() => void finish()}>
                Stop
              </button>
            </span>
          </div>
        )}

        {phase === "review" && result ? (
          <div className="card">
            <h2>Preview</h2>
            {previewUrl ? <video src={previewUrl} controls playsInline style={{ width: "100%", borderRadius: 12 }} /> : null}
            <label className="small muted" htmlFor="title">
              Title
            </label>
            <input id="title" type="text" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} />
            <p className="muted small">
              {formatDuration(result.durationMs)} · {result.width}×{result.height} · {formatBytes(result.blob.size)}
            </p>
            {publishing ? <p className="muted">Uploading… {Math.round(progress * 100)}%</p> : null}
            {remoteId ? (
              <div className="alert ok">
                Live at <Link to={`/v/${remoteId}`}>{`${window.location.origin}/v/${remoteId}`}</Link>
              </div>
            ) : null}
            <div className="row">
              {!remoteId ? (
                <button className="btn amber" type="button" disabled={publishing} onClick={() => void publish()}>
                  Publish link
                </button>
              ) : (
                <>
                  <button className="btn amber" type="button" onClick={() => void copy()}>
                    {copied ? "Copied" : "Copy link"}
                  </button>
                  <button className="btn" type="button" onClick={() => navigate(`/v/${remoteId}`)}>
                    Open player
                  </button>
                </>
              )}
              <a className="btn ghost" href={previewUrl ?? undefined} download={`${localId}.webm`}>
                Download
              </a>
              <button
                className="btn ghost"
                type="button"
                onClick={() => {
                  setPhase("setup");
                  setResult(null);
                  setRemoteId(null);
                  setProgress(0);
                }}
              >
                Record again
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
