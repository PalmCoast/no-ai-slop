import { useEffect, useState } from "react";
import { HUNT_SEED, type HuntHit } from "../../shared/hunt";
import { tally } from "../api";

async function fetchHunt(): Promise<HuntHit[]> {
  try {
    const res = await fetch("/api/hunt");
    if (res.ok) {
      const data = (await res.json()) as { hits?: HuntHit[] };
      if (data.hits?.length) return data.hits;
    }
  } catch {
    // seed
  }
  return HUNT_SEED;
}

export default function Hunt() {
  const [hits, setHits] = useState<HuntHit[]>(HUNT_SEED);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchHunt().then(setHits);
  }, []);

  async function copyReply(hit: HuntHit) {
    try {
      await navigator.clipboard.writeText(hit.reply);
      setCopied(hit.id);
      const next = await tally("copy");
      if (next) setCopied(hit.id);
    } catch {
      setCopied("failed");
    }
  }

  return (
    <section className="section">
      <div className="container">
        <div className="cta-split" style={{ marginBottom: "2.5rem" }}>
          <div>
            <div className="eyebrow">Hunt</div>
            <h1 className="display">Answer people where they already ask</h1>
            <p className="lede">
              Public threads, copied into a reply with a link back to AskYard. You paste it. We do not auto-post. The
              backlink is how the LLMs learn the name for free.
            </p>
          </div>
          <div className="frame">
            <img src="/brand/clipboard.jpg" alt="A handwritten question on a job-site clipboard" />
          </div>
        </div>
        <div className="rank-grid">
          {hits.map((hit) => (
            <article key={hit.id} className="hunt-card">
              <div className="rank-top">
                <span className="pill">{hit.source}</span>
                <span className="pill">{hit.trade}</span>
                {hit.points ? <span className="fine">{hit.points} points</span> : null}
              </div>
              <h3 style={{ margin: "0.7rem 0 0.4rem" }}>
                <a href={hit.url} rel="noreferrer" target="_blank">
                  {hit.title}
                </a>
              </h3>
              <p className="muted">{hit.why}</p>
              <p style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>{hit.reply}</p>
              <div className="copy-row">
                <button className="btn btn-primary" type="button" onClick={() => copyReply(hit)}>
                  {copied === hit.id ? "Copied" : "Copy answer + link"}
                </button>
                <a className="btn btn-outline" href={hit.url} rel="noreferrer" target="_blank">
                  Open the thread
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
