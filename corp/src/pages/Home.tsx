import AskAiBar from "../components/AskAiBar";
import {
  BRAND_NAME,
  BRAND_PLACE,
  BRAND_URL,
  CONSULT_DISPLAY,
  CONSULT_TEL,
  FD_CONSULT_URL,
  FD_NAME,
  FD_PRICE,
  FD_URL,
  INDEXME_NAME,
  INDEXME_URL,
} from "../../shared/brand";
import { HIVE_SITES } from "../../shared/portfolio";

const ALSO_SHIPPED = ["flick", "jobproof", "bot-lock", "writehive"];

export default function Home() {
  const shipped = HIVE_SITES.filter((site) => ALSO_SHIPPED.includes(site.slug));

  return (
    <>
      <section className="hero">
        <div className="hero-media">
          <img src="/brand/queen-full.jpg" alt="AgentHive Inc queen in gold honeycomb armor" />
        </div>
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="dot" /> {BRAND_NAME} · {BRAND_PLACE} · agenthiveinc.com
          </div>
          <h1 className="display">
            We ship the thing
            <br />
            <em>you can sell.</em>
          </h1>
          <p className="lede">
            {BRAND_NAME} is a Palm Coast AI consultant shop. We embed working software in the operation and leave it
            running. {FD_NAME} is the after-hours desk: {FD_PRICE}. {INDEXME_NAME} gets the page found before you spend
            more on ads.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={FD_URL}>
              Start {FD_NAME}
            </a>
            <a className="btn btn-outline" href={INDEXME_URL} rel="noreferrer" target="_blank">
              Open {INDEXME_NAME}
            </a>
          </div>
          <p className="fine">
            {FD_PRICE}. Live this week or you do not pay the setup. Consult:{" "}
            <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY}</a>
          </p>
        </div>
      </section>

      <AskAiBar />

      <section className="section" id="work">
        <div className="container">
          <div className="section-head">
            <h2>What you can buy</h2>
            <p>
              {BRAND_NAME} sells work that ships. {FD_NAME} is the cash product. {INDEXME_NAME} is the index desk.
            </p>
          </div>
          <div className="cta-split">
            <article className="panel">
              <p className="eyebrow">Cash product</p>
              <h2>{FD_NAME}</h2>
              <p style={{ marginTop: 12 }}>
                After-hours desk plus the live apps for field operators. {FD_PRICE}. If it is not live this week, you do
                not pay the setup.
              </p>
              <div className="hero-actions" style={{ marginTop: 18 }}>
                <a className="btn btn-primary" href={FD_URL}>
                  firstdeploy.ai
                </a>
                <a className="btn btn-outline" href={`tel:${CONSULT_TEL}`}>
                  {CONSULT_DISPLAY}
                </a>
              </div>
            </article>
            <article className="panel">
              <p className="eyebrow">Get found</p>
              <h2>{INDEXME_NAME}</h2>
              <p style={{ marginTop: 12 }}>
                Pay-to-stand index. Pro $19.99 · Studio $29.99, one-time. Get the page found before you spend more on
                ads.
              </p>
              <div className="hero-actions" style={{ marginTop: 18 }}>
                <a className="btn btn-primary" href={INDEXME_URL} rel="noreferrer" target="_blank">
                  indexme.lol
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="consult">
        <div className="container">
          <div className="pricing-box">
            <h2>Need a person in the room?</h2>
            <p>Free 30-minute qualifier. Then paid time — or a fixed deploy if the leak is clear.</p>
            <p style={{ margin: "1rem 0 1.4rem" }}>$75 / 30 min · $150 / hour · 10-hour pack $1,250 (half up front)</p>
            <a className="btn btn-primary" href={FD_CONSULT_URL}>
              Book the free 30
            </a>
            <p className="fine" style={{ marginTop: 12 }}>
              {FD_NAME} consult line: <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY}</a>
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="also-shipped">
        <div className="container">
          <div className="section-head">
            <h2>Also shipped</h2>
            <p>A few live apps from the same shop. The full public board is on Rankings.</p>
          </div>
          <div className="card-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
            {shipped.map((site) => (
              <a key={site.slug} className="card" href={site.url} rel="noreferrer" target="_blank">
                <h3>{site.name}</h3>
                <p className="muted">{site.description}</p>
              </a>
            ))}
          </div>
          <div className="hero-actions" style={{ marginTop: 18 }}>
            <a className="btn btn-outline" href="/rankings">
              Open Rankings
            </a>
            <a className="btn btn-outline" href="/buzz">
              Read The Buzz
            </a>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to ship?</h2>
            <p>
              {BRAND_NAME} · {BRAND_PLACE} ·{" "}
              <a href={BRAND_URL}>agenthiveinc.com</a>
            </p>
            <a className="btn btn-primary" href={FD_URL} style={{ marginTop: 16 }}>
              Start {FD_NAME}
            </a>
            <p className="fine" style={{ marginTop: 16 }}>
              Consult: <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY}</a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
