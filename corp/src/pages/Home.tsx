import AskAiBar from "../components/AskAiBar";
import {
  BOOK_CTA_LABEL,
  BRAND_NAME,
  BRAND_PLACE,
  CALENDLY_URL,
  CONSULT_DISPLAY,
  CONSULT_RATES,
  CONSULT_TEL,
  FD_CTA_LABEL,
  FD_NAME,
  FD_PRICE,
  FD_PROMISE,
  FD_URL,
  HERO_H1,
  HERO_WHAT,
  HERO_WHY,
  INDEXME_BLURB,
  INDEXME_NAME,
  INDEXME_URL,
} from "../../shared/brand";
import { HIVE_SITES } from "../../shared/portfolio";

const PROOF_SLUGS = ["flick", "jobproof", "indexme", "claudefarm"];

export default function Home() {
  const proof = HIVE_SITES.filter((site) => PROOF_SLUGS.includes(site.slug));

  return (
    <>
      <section className="hero">
        <div className="hero-media">
          <img src="/brand/queen-full.jpg" alt="AgentHive Inc queen in gold honeycomb armor" />
        </div>
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="dot" /> {BRAND_NAME} · {BRAND_PLACE} · AI consultant who builds
          </div>
          <h1 className="display" style={{ fontSize: "clamp(1.85rem, 4.2vw, 3.1rem)", lineHeight: 1.12 }}>
            {HERO_H1}
          </h1>
          <p className="lede">{HERO_WHAT}</p>
          <p className="lede" style={{ marginTop: "-0.6rem" }}>
            {HERO_WHY}
          </p>
          <p className="fine" style={{ marginBottom: "1rem", color: "var(--ink)" }}>
            {FD_NAME}: {FD_PRICE}. {FD_PROMISE}.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={FD_URL}>
              {FD_CTA_LABEL}
            </a>
            <a className="btn btn-primary" href={CALENDLY_URL} rel="noreferrer" target="_blank">
              {BOOK_CTA_LABEL}
            </a>
          </div>
          <p className="fine">
            Free 30-minute qualifier, then {CONSULT_RATES}. Phone{" "}
            <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY}</a>.
          </p>
        </div>
      </section>

      <AskAiBar />

      <section className="section" id="work">
        <div className="container">
          <div className="section-head">
            <h2>Why field owners buy</h2>
            <p>
              {BRAND_NAME} embeds the after-hours desk and the live apps so the shop keeps moving when the owner is
              off the phone.
            </p>
          </div>
          <div className="trust-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <article className="trust">
              <h3>Missed night calls</h3>
              <p className="muted">The phone rings after hours. Nobody books the job. That leak is the desk.</p>
            </article>
            <article className="trust">
              <h3>Whiteboard quotes</h3>
              <p className="muted">The number lives on a wall, not in a link the customer can pay.</p>
            </article>
            <article className="trust">
              <h3>Crew waiting on the owner</h3>
              <p className="muted">Dirt, plants, and shops stall when only one person can say yes.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="buy">
        <div className="container">
          <div className="section-head">
            <h2>What you can buy</h2>
            <p>Prices stay on this page. {FD_NAME} is the cash product. {INDEXME_NAME} is a secondary money tool.</p>
          </div>
          <div className="cta-split">
            <article className="panel">
              <p className="eyebrow">Cash product</p>
              <h2>{FD_NAME}</h2>
              <p style={{ marginTop: 12 }}>
                After-hours booking plus live apps for dirt, plants, and shops. $1,500 setup —{" "}
                {FD_PROMISE.toLowerCase()} — then $250/mo.
              </p>
              <p className="muted" style={{ marginTop: 12 }}>
                Consult: free 30-minute qualifier, then {CONSULT_RATES}. 10-hour pack $1,250 (half up front).
              </p>
            </article>
            <article className="panel">
              <p className="eyebrow">Secondary</p>
              <h2>{INDEXME_NAME}</h2>
              <p style={{ marginTop: 12 }}>
                The {INDEXME_BLURB}. Pro $19.99 · Studio $29.99, one-time. Get the page found before you spend more on
                ads.
              </p>
              <p className="muted" style={{ marginTop: 12 }}>
                <a href={INDEXME_URL} rel="noreferrer" target="_blank">
                  indexme.lol
                </a>
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="proof">
        <div className="container">
          <div className="section-head">
            <h2>Shipped for field operators</h2>
            <p>
              Built for field operators in dirty physical businesses — including a commercial earth mover. Public apps
              below. No client names.
            </p>
          </div>
          <div className="card-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
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
            <h2>Start this week</h2>
            <p>
              {FD_NAME}: {FD_PRICE}. {FD_PROMISE}.
            </p>
            <div className="hero-actions" style={{ justifyContent: "center", marginTop: 18, marginBottom: 0 }}>
              <a className="btn btn-primary" href={FD_URL}>
                {FD_CTA_LABEL}
              </a>
              <a className="btn btn-primary" href={CALENDLY_URL} rel="noreferrer" target="_blank">
                {BOOK_CTA_LABEL}
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
