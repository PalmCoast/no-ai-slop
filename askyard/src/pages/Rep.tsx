import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import RepMeter from "../components/RepMeter";
import { lookupRep } from "../api";
import { KNOWN_LOOKUPS, REP_TOOLBAR_BLURB, type RepReport } from "../../shared/rep";
import { MARQUEE_NAME, MARQUEE_URL } from "../../shared/brand";

export default function Rep() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") ?? "AskYard";
  const [query, setQuery] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<RepReport | null>(null);

  useEffect(() => {
    void runLookup(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runLookup(name: string) {
    const q = name.trim();
    if (q.length < 2) {
      setError("Type a name. Two characters is the floor.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const next = await lookupRep(q);
      setReport(next);
      setParams({ q: q }, { replace: true });
    } catch {
      setError("Lookup is busy. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void runLookup(query);
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="section-head">
          <div className="eyebrow">Reputation meter</div>
          <h1 className="display">Search a name. See the meter.</h1>
          <p className="lede">
            Instant lookup if something rough is posted in public. AskYard votes plus public HN hits. A lookup, not a
            verdict. Less RateMy. More a toolbar for your name.
          </p>
        </div>
        <form className="ask-box" onSubmit={onSubmit}>
          <label htmlFor="rep-q">Name, shop, or rumor</label>
          <div className="ask-row">
            <input
              id="rep-q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Your name, your shop, AskYard…"
              maxLength={80}
              autoComplete="off"
            />
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? "Looking…" : "Look up"}
            </button>
          </div>
        </form>
        <div className="filters">
          {KNOWN_LOOKUPS.map((name) => (
            <button
              key={name}
              type="button"
              className={`filter${query === name ? " on" : ""}`}
              onClick={() => {
                setQuery(name);
                void runLookup(name);
              }}
            >
              {name}
            </button>
          ))}
        </div>
        {error ? <p className="fine">{error}</p> : null}
        {report ? (
          <>
            <RepMeter report={report} />
            {report.hits.length ? (
              <ol className="hit-list">
                {report.hits.map((hit) => (
                  <li key={`${hit.source}-${hit.url}`}>
                    <a href={hit.url} rel="noreferrer" target={hit.source === "hn" ? "_blank" : undefined}>
                      {hit.title}
                    </a>
                    <span className={`pill pill--${hit.tone}`}>
                      {hit.source} · {hit.tone}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="fine">No public hits yet. Ask a question, then search again.</p>
            )}
          </>
        ) : null}

        <div className="panel" style={{ marginTop: 28 }}>
          <h3>Chrome toolbar</h3>
          <p className="muted">{REP_TOOLBAR_BLURB}</p>
          <p className="fine" style={{ marginTop: 8 }}>
            Chrome → Extensions → Load unpacked → the <code>extension</code> folder on this site. Manifest lives at{" "}
            <a href="/extension/manifest.json">/extension/manifest.json</a>.
          </p>
          <div className="hero-actions" style={{ marginTop: 14 }}>
            <a className="btn btn-outline" href="/extension/popup.html">
              Open the toolbar page
            </a>
            <Link className="btn btn-primary" to="/marquee">
              {MARQUEE_NAME}: name in lights
            </Link>
          </div>
        </div>
        <p className="fine" style={{ marginTop: 18 }}>
          Paid crown sits on <a href={MARQUEE_URL}>{MARQUEE_URL.replace("https://", "")}</a>. You name the bid.
        </p>
      </div>
    </section>
  );
}
