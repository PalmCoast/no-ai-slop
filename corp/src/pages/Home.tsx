import FdPath from "../components/FdPath";
import AskAiBar from "../components/AskAiBar";
import {
  BOOK_CTA_LABEL,
  BOOK_HREF,
  CONSULT_DISPLAY,
  CONSULT_TEL,
  FD_DEPLOY_AGENT_URL,
  FD_FREIGHT_URL,
  FD_NAME,
  FD_URL,
  HERO_H1,
  HERO_WHAT,
  INDEXME_BLURB,
  INDEXME_NAME,
  SPRINT_GO_HREF,
} from "../../shared/brand";
import { CONCIERGE_GO_HREF } from "../../shared/concierge";
import { HIVE_SITES } from "../../shared/portfolio";

const PROOF_SLUGS = ["flick", "indexme", "bot-lock", "sonaris"];

const FIXES = [
  { h: "Loops and retries", p: "Agents that retry a failing call all night, or routines that keep triggering each other." },
  { h: "Drift and redundant runs", p: "Scheduled jobs nobody owns anymore, and three bots doing the same check." },
  { h: "Wrong model, no caching", p: "Frontier models on sorting work, and context that grows on every run." },
  { h: "No caps, no owner", p: "Seats and API keys with no limits, no alerts, and nobody watching the bill." },
];

export default function Home() {
  const proof = HIVE_SITES.filter((site) => PROOF_SLUGS.includes(site.slug));

  return (
    <>
      <section className="hero">
        <div className="hero-media">
          <img
            src="/brand/queen-full.webp"
            alt="Illustration: AgentHive Inc queen in gold honeycomb armor"
            width={784}
            height={1168}
          />
        </div>
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="dot" /> AI ops for funded teams of 30 to 200
          </div>
          <h1 className="display" style={{ fontSize: "clamp(1.85rem, 4.2vw, 3.1rem)", lineHeight: 1.12 }}>
            {HERO_H1}
          </h1>
          <p className="lede">{HERO_WHAT}</p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={BOOK_HREF}>
              {BOOK_CTA_LABEL}
            </a>
            <a className="btn btn-outline" href="/consult">
              See the $2,500 sprint
            </a>
          </div>
          <p className="fine">
            70+ live AI apps in production, built and run by Daniel Graham, a U.S. Army veteran with 10+ years in operations.
          </p>
        </div>
      </section>

      <section className="section" id="work">
        <div className="container">
          <div className="section-head">
            <h2>Where the money goes</h2>
            <p>The AI bill rarely climbs because of one big mistake. It climbs because of a handful of small ones nobody owns.</p>
          </div>
          <div className="trust-grid cols-2">
            {FIXES.map((f) => (
              <article key={f.h} className="trust card">
                <h3>{f.h}</h3>
                <p className="muted">{f.p}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" id="pricing">
        <div className="container">
          <div className="section-head">
            <h2>Three steps, one price each</h2>
            <p>
              <FdPath />
            </p>
          </div>
          <div className="trust-grid cols-3">
            <article className="trust card">
              <p className="eyebrow">01 · Free</p>
              <h3>Architecture &amp; Spend Triage</h3>
              <p className="muted">15 minutes. Bring last month’s bill. We tell you where the waste most likely is and whether the sprint pays for itself.</p>
              <p style={{ marginTop: 12 }}>
                <a className="btn btn-primary" href={BOOK_HREF}>
                  Book the triage
                </a>
              </p>
            </article>
            <article className="trust card">
              <p className="eyebrow">02 · $2,500 fixed</p>
              <h3>Agent Audit &amp; Stabilization Sprint</h3>
              <p className="muted">Delivered in 5 business days. We inventory every agent, routine and key, fix the loops, drift and redundant runs in your accounts, set caps, and hand back before-and-after numbers.</p>
              <p style={{ marginTop: 12 }}>
                <a className="btn btn-primary" href={SPRINT_GO_HREF} data-product="sprint2500" data-utm-source="dir" data-utm-medium="page" data-utm-content="ah-home-pricing">
                  Start the sprint
                </a>
              </p>
            </article>
            <article className="trust card">
              <p className="eyebrow">03 · $3,500/mo</p>
              <h3>Fractional AI Ops Retainer</h3>
              <p className="muted">Active monitoring of agent spend and failures, a 1-business-day response time, a monthly report, and async help. Month to month.</p>
              <p style={{ marginTop: 12 }}>
                <a className="btn btn-outline" href={CONCIERGE_GO_HREF} data-product="retainer3500" data-utm-source="dir" data-utm-medium="page" data-utm-content="ah-home-pricing">
                  Start the retainer
                </a>
              </p>
            </article>
          </div>
          <p className="fine" style={{ marginTop: 18 }}>
            Same offer on <a href={FD_URL}>{FD_NAME}</a>. Building a B2B AI product? See <a href={FD_DEPLOY_AGENT_URL}>Deploy Agent</a>. Freight brokerage? See the <a href={FD_FREIGHT_URL}>freight ops proof</a>.
          </p>
        </div>
      </section>

      <AskAiBar />

      <section className="section" id="proof">
        <div className="container">
          <div className="section-head">
            <h2>Shipped and public</h2>
            <p>A few of the 70+ live AI apps we built and run. {INDEXME_NAME} is the {INDEXME_BLURB}. No client names.</p>
          </div>
          <div className="card-grid cols-2">
            {proof.map((site) => (
              <a key={site.slug} className="card" href={site.url} rel="noreferrer" target="_blank">
                <h3>{site.name}</h3>
                <p className="muted">{site.description}</p>
              </a>
            ))}
          </div>
          <p className="fine" style={{ marginTop: 18 }}>
            Full public board on <a href="/rankings">Rankings</a>. Weekly briefing on <a href="/buzz">The Buzz</a>.
          </p>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="cta-box">
            <h2>Bring last month’s AI bill</h2>
            <p>15 minutes, free. You leave knowing where the money most likely goes and whether the sprint is worth it.</p>
            <div className="hero-actions" style={{ justifyContent: "center", marginTop: 18, marginBottom: 0 }}>
              <a className="btn btn-primary" href={BOOK_HREF}>
                {BOOK_CTA_LABEL}
              </a>
              <a className="btn btn-outline" href="/consult">
                See the $2,500 sprint
              </a>
            </div>
            <p className="fine" style={{ marginTop: 16 }}>
              Phone <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY}</a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
