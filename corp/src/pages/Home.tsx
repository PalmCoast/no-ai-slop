import AskAiBar from "../components/AskAiBar";
import {
  BOOK_CTA_LABEL,
  BRAND_NAME,
  BOOK_HREF,
  FD_PRICE_LINE,
  CONSULT_DISPLAY,
  CONSULT_RATES,
  CONSULT_TEL,
  FD_CTA_LABEL,
  FD_NAME,
  FD_PROMISE,
  FD_URL,
  HERO_H1,
  HERO_WHAT,
  HERO_WHY,
  INDEXME_BLURB,
  INDEXME_NAME,
  PICKS_PATH,
} from "../../shared/brand";
import { HIVE_SITES } from "../../shared/portfolio";

const PROOF_SLUGS = ["flick", "indexme", "bot-lock", "sonaris"];

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
            <span className="dot" /> {BRAND_NAME} · AI consultant who builds · for funded teams
          </div>
          <h1 className="display" style={{ fontSize: "clamp(1.85rem, 4.2vw, 3.1rem)", lineHeight: 1.12 }}>
            {HERO_H1}
          </h1>
          <p className="lede">{HERO_WHAT}</p>
          <p className="lede" style={{ marginTop: "-0.6rem" }}>
            {HERO_WHY}
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="/ads">
              See the AI Ad Sprint
            </a>
            <a className="btn btn-primary" href="/concierge">
              AI Concierge
            </a>
            <a className="btn btn-ghost" href={PICKS_PATH}>
              Shop Picks
            </a>
          </div>
          <p className="fine">
            {BOOK_CTA_LABEL}: a free 30-minute call, then {CONSULT_RATES}. Phone{" "}
            <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY}</a>.
          </p>
        </div>
      </section>

      <AskAiBar />

      <section className="section" id="work">
        <div className="container">
          <div className="section-head">
            <h2>What funded teams buy</h2>
            <p>
              Done for you, to your brand. You see the finished work. The AI stays in the background where it belongs.
            </p>
          </div>
          <div className="trust-grid cols-3">
            <a className="trust card" href="/ads">
              <h3>AI Ad Sprint</h3>
              <p className="muted">
                6 video ads and 6 image ads made from your product page, delivered in 72 hours. $297 one time, or $997/mo
                for 20 new ads.
              </p>
            </a>
            <a className="trust card" href="/concierge">
              <h3>AI Concierge</h3>
              <p className="muted">
                A senior AI operator on retainer for your leadership team. $2,000/mo.
              </p>
            </a>
            <a className="trust card" href="/consult">
              <h3>Operator hours</h3>
              <p className="muted">Free 30-minute call, then {CONSULT_RATES}. 10-hour pack $1,250.</p>
            </a>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="buy">
        <div className="container">
          <div className="section-head">
            <h2>Picks: look sharp, build a beast rig</h2>
            <p>
              Our Come and Take It tees and desk gear, plus the RAM, GPU, and gaming builds we would buy ourselves. One
              page.
            </p>
          </div>
          <div className="cta-split">
            <article className="panel">
              <p className="eyebrow">Look sharp</p>
              <h2>Come and Take It</h2>
              <p style={{ marginTop: 12 }}>
                Tees from $24 and desk gear from Brooms.ai. Gear ships in 1–3 weeks.
              </p>
              <p className="muted" style={{ marginTop: 12 }}>
                <a href={PICKS_PATH}>Shop Picks</a>
              </p>
            </article>
            <article className="panel">
              <p className="eyebrow">Build a beast rig</p>
              <h2>RAM and rig deals</h2>
              <p style={{ marginTop: 12 }}>
                DDR5 and DDR4 kits with the store, price, and date checked, plus GPUs, CPUs, and gaming laptops.
              </p>
              <p className="muted" style={{ marginTop: 12 }}>
                <a href="/ram-deals/">See RAM deals</a> · <a href={PICKS_PATH}>All picks</a>
              </p>
            </article>
          </div>
          <p className="fine" style={{ marginTop: 18 }}>
            Also live: <a href={FD_URL}>{FD_NAME}</a>, a front desk that sounds like your brand. {FD_PRICE_LINE}{" "}
            {FD_PROMISE}. <a href={FD_URL}>{FD_CTA_LABEL}</a>.
          </p>
        </div>
      </section>

      <section className="section" id="proof">
        <div className="container">
          <div className="section-head">
            <h2>Shipped and public</h2>
            <p>Public apps we built and run. {INDEXME_NAME} is the {INDEXME_BLURB}. No client names.</p>
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
            <h2>Start with a free 30-minute call</h2>
            <p>Tell us what has to look finished this quarter. We tell you what we would build first and what it costs.</p>
            <div className="hero-actions" style={{ justifyContent: "center", marginTop: 18, marginBottom: 0 }}>
              <a className="btn btn-primary" href={BOOK_HREF}>
                {BOOK_CTA_LABEL}
              </a>
              <a className="btn btn-primary" href={PICKS_PATH}>
                Shop Picks
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
