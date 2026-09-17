import { useEffect, useMemo, useState } from "react";
import { HIVE_SITES } from "../../shared/portfolio";
import { rankSites, type RankedSite } from "../../shared/rank";

const FILTERS = ["all", "live", "netlify", "infra", "saas", "field", "lab"] as const;

export default function Rankings() {
  const fallback = useMemo(
    () =>
      rankSites(
        HIVE_SITES,
        HIVE_SITES.map((site) => ({
          slug: site.slug,
          url: site.url,
          ok: site.statusHint === "live",
          status: site.statusHint === "live" ? 200 : 0,
          ms: 0,
        })),
      ),
    [],
  );
  const [sites, setSites] = useState<RankedSite[]>(fallback);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");

  useEffect(() => {
    fetch("/api/rank")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("rank unavailable"))))
      .then((data: { generatedAt?: string | null; sites?: RankedSite[] }) => {
        if (data.sites?.length) setSites(data.sites);
        if (data.generatedAt) setGeneratedAt(data.generatedAt);
      })
      .catch(() => undefined);
  }, []);

  const visible = sites.filter((site) => {
    if (filter === "all") return true;
    if (filter === "live") return site.statusLabel === "live" || site.statusLabel === "slow";
    if (filter === "netlify") return site.host === "netlify";
    if (filter === "lab") return site.statusLabel === "lab";
    return site.category === filter;
  });

  const liveCount = sites.filter((s) => s.statusLabel === "live" || s.statusLabel === "slow").length;
  const netlifyCount = sites.filter((s) => s.host === "netlify").length;

  return (
    <section className="section">
      <div className="container">
        <div className="buzz-hero">
          <div>
            <div className="eyebrow">Grok Scout · live portfolio</div>
            <h1 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}>
              Every hive app,
              <br />
              <em>ranked.</em>
            </h1>
            <p className="lede">
              Full public portfolio, including every Netlify app we could verify live. Score = uptime + speed + custom
              domain + whether someone can actually buy it. Grok re-probes the board every week.
            </p>
            <p className="fine">
              {liveCount} live · {netlifyCount} on Netlify · {sites.length} total
              {generatedAt ? ` · last scout ${new Date(generatedAt).toUTCString()}` : " · catalog ranks until the weekly scout stores a pass"}
            </p>
          </div>
          <div className="frame">
            <img src="/brand/hive-fleet.jpg" alt="Swarm of craft inside a gold honeycomb" />
          </div>
        </div>

        <div className="filters" style={{ marginTop: 28 }}>
          {FILTERS.map((key) => (
            <button key={key} className={`filter${filter === key ? " on" : ""}`} onClick={() => setFilter(key)}>
              {key}
            </button>
          ))}
        </div>

        <div className="rank-grid">
          {visible.map((site) => (
            <a key={site.slug} className="rank-card" href={site.url} rel="noreferrer" target="_blank">
              <div className="rank-num">{String(site.rank).padStart(2, "0")}</div>
              <div>
                <div className="rank-top">
                  <h3>{site.name}</h3>
                  <span className={`pill ${site.statusLabel}`}>{site.statusLabel}</span>
                  <span className="pill">{site.host}</span>
                </div>
                <p className="muted">{site.description}</p>
                {site.price ? <p className="fine">{site.price}</p> : null}
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="score">{site.score}</div>
                <div className="muted">{site.ms ? `${site.ms} ms` : site.statusLabel === "lab" ? "repo" : "catalog"}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
