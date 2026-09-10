import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { formatDuration, formatWhen } from "../lib/format";
import { deleteLocal, listLocal, type LocalClipMeta } from "../lib/local";

export function Library() {
  const [clips, setClips] = useState<LocalClipMeta[] | null>(null);

  async function refresh() {
    try {
      setClips(await listLocal());
    } catch {
      setClips([]);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  if (!clips) {
    return (
      <Layout>
        <p className="muted">Loading library…</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="row between">
        <h1>Library</h1>
        <Link className="btn amber" to="/record">
          Record
        </Link>
      </div>
      <p className="muted">Kept on this device. Published Flicks also have a share link.</p>
      {clips.length === 0 ? (
        <div className="empty">
          Nothing here yet. <Link to="/record">Record one</Link> — the demo scene works without a screen share.
        </div>
      ) : (
        <div className="clip-grid">
          {clips.map((clip) => (
            <article className="card clip-card" key={clip.id}>
              <h3>{clip.title}</h3>
              <p className="muted small">
                {formatDuration(clip.durationMs)} · {formatWhen(clip.createdAt)} · {clip.mode}
              </p>
              <div className="row">
                {clip.remoteId ? (
                  <Link className="btn amber" to={`/v/${clip.remoteId}`}>
                    Open link
                  </Link>
                ) : (
                  <span className="muted small">Not published</span>
                )}
                <button
                  className="btn ghost"
                  type="button"
                  onClick={async () => {
                    await deleteLocal(clip.id);
                    await refresh();
                  }}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </Layout>
  );
}
