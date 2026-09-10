import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchClip, videoUrl } from "../api";
import { Layout } from "../components/Layout";
import { formatDuration } from "../lib/format";
import type { ClipMeta } from "../../shared/types";

const SPEEDS = [1, 1.25, 1.5, 1.75, 2];

export function Watch() {
  const { id = "" } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [meta, setMeta] = useState<ClipMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchClip(id)
      .then((m) => {
        if (!cancelled) setMeta(m);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message || "Clip not found.");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setTime(v.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        if (v.paused) void v.play();
        else v.pause();
      }
    };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    window.addEventListener("keydown", onKey);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      window.removeEventListener("keydown", onKey);
    };
  }, [meta]);

  async function copy() {
    const url = `${window.location.origin}/v/${id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  if (error) {
    return (
      <Layout>
        <div className="player-page">
          <h1>This Flick is gone</h1>
          <p className="muted">{error}</p>
          <Link className="btn amber" to="/record">
            Record a new one
          </Link>
        </div>
      </Layout>
    );
  }

  if (!meta) {
    return (
      <Layout>
        <p className="muted">Loading clip…</p>
      </Layout>
    );
  }

  const duration = meta.durationMs / 1000;

  return (
    <Layout>
      <div className="player-page">
        <p className="kicker">{meta.mode}</p>
        <h1>{meta.title}</h1>
        <p className="muted small">
          {formatDuration(meta.durationMs)} · {meta.width}×{meta.height}
        </p>
        <div className="player">
          <video ref={videoRef} src={videoUrl(meta.id)} playsInline preload="metadata" />
          <div className="controls">
            <input
              className="progress"
              type="range"
              min={0}
              max={duration || 0}
              step={0.05}
              value={time}
              onChange={(e) => {
                const v = videoRef.current;
                if (v) v.currentTime = Number(e.target.value);
              }}
              aria-label="Seek"
            />
            <div className="row between">
              <div className="row">
                <button
                  className="btn"
                  type="button"
                  onClick={() => {
                    const v = videoRef.current;
                    if (!v) return;
                    if (v.paused) void v.play();
                    else v.pause();
                  }}
                >
                  {playing ? "Pause" : "Play"}
                </button>
                <span className="timer">
                  {formatDuration(time * 1000)} / {formatDuration(meta.durationMs)}
                </span>
              </div>
              <div className="speed" role="group" aria-label="Playback speed">
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={s === speed ? "active" : ""}
                    onClick={() => {
                      setSpeed(s);
                      if (videoRef.current) videoRef.current.playbackRate = s;
                    }}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            </div>
            <div className="row">
              <button className="btn amber" type="button" onClick={() => void copy()}>
                {copied ? "Copied" : "Copy link"}
              </button>
              <a className="btn ghost" href={videoUrl(meta.id)} download={`${meta.id}.webm`}>
                Download
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
