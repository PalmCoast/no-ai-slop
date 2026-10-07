import { useMemo, useState } from "react";
import {
  AI_CREDIT_OFFERS,
  AI_CREDIT_PARTNERS,
  AI_CREDITS_FAQ,
  CREDIT_CATEGORIES,
  CREDIT_TOOLS,
  VERIFIED_ON,
  type CreditCategory,
  type CreditTool,
} from "../../shared/ai-credits";

type CatFilter = "all" | CreditCategory;
type ToolFilter = "all" | CreditTool;

export default function AiCredits() {
  const [cat, setCat] = useState<CatFilter>("all");
  const [tool, setTool] = useState<ToolFilter>("all");
  const visible = useMemo(
    () =>
      AI_CREDIT_OFFERS.filter(
        (o) => (cat === "all" || o.category === cat) && (tool === "all" || o.tools.includes(tool)),
      ),
    [cat, tool],
  );

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow">Free AI credits</div>
          <h1 className="display">Free AI credits, trials and startup programs</h1>
          <p className="lede">
            {AI_CREDIT_OFFERS.length} offers from the providers' own pages. Filter by stage and tool, open the
            official link, and redeem on the provider's site.
          </p>
          <p className="fine">
            Checked {VERIFIED_ON}. Offers change; redeem on the provider's site, and the provider's terms win.
          </p>
        </div>

        <p className="fine" style={{ marginBottom: "0.4rem" }}>Who it's for</p>
        <div className="filters" role="group" aria-label="Filter by category">
          {(["all", ...CREDIT_CATEGORIES] as CatFilter[]).map((c) => (
            <button key={c} className={`filter${cat === c ? " on" : ""}`} onClick={() => setCat(c)} aria-pressed={cat === c}>
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
        <p className="fine" style={{ marginBottom: "0.4rem" }}>Tool</p>
        <div className="filters" role="group" aria-label="Filter by tool">
          {(["all", ...CREDIT_TOOLS] as ToolFilter[]).map((t) => (
            <button key={t} className={`filter${tool === t ? " on" : ""}`} onClick={() => setTool(t)} aria-pressed={tool === t}>
              {t === "all" ? "All tools" : t}
            </button>
          ))}
        </div>

        <p className="muted" aria-live="polite">
          Showing {visible.length} of {AI_CREDIT_OFFERS.length}
        </p>
        <div className="card-grid credits-grid">
          {visible.map((o) => (
            <article className="card credit-card" key={o.id}>
              <p className="eyebrow">{o.provider}</p>
              <h3>{o.offer}</h3>
              <p className="credit-amount">{o.amount}</p>
              <p className="fine">
                <strong>Who qualifies:</strong> {o.qualifies}
              </p>
              <div className="credit-tags">
                <span className="pill">{o.category}</span>
                {o.tools.map((t) => (
                  <span className="pill" key={t}>
                    {t}
                  </span>
                ))}
              </div>
              <a className="btn btn-outline" href={o.url} target="_blank" rel="noopener noreferrer">
                Official page
              </a>
              <p className="muted">Verified {o.lastVerified}</p>
            </article>
          ))}
        </div>
        {visible.length === 0 ? <p className="fine">No offers match both filters. Try "All tools".</p> : null}

        <div className="section-head" style={{ marginTop: "3rem" }}>
          <div className="eyebrow">Our partners</div>
          <h2>Our partners</h2>
          <p>These are ours, not provider credits. We may earn from them.</p>
        </div>
        <div className="card-grid">
          {AI_CREDIT_PARTNERS.map((p) => (
            <article className="card credit-card partner-card" key={p.id}>
              <p className="eyebrow">Our partner</p>
              <h3>{p.name}</h3>
              <p className="fine">{p.blurb}</p>
              <a className="btn btn-primary" href={p.url} target="_blank" rel="noopener">
                {p.cta}
              </a>
            </article>
          ))}
        </div>

        <div className="section-head" style={{ marginTop: "3rem" }}>
          <h2>Questions</h2>
        </div>
        <dl className="board-qa">
          {AI_CREDITS_FAQ.map((f) => (
            <div key={f.q}>
              <dt>{f.q}</dt>
              <dd>{f.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
