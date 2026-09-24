import { Link } from "react-router-dom";
import AskAiBar from "../components/AskAiBar";
import {
  BRAND_NAME,
  BRAND_URL,
  CALENDLY_URL,
  CONSULT_DISPLAY,
  CONSULT_RATES,
  CONSULT_TEL,
  CONTACT_EMAIL,
  FD_NAME,
  FD_PRICE,
  FD_URL,
  HIVE_CONSULT_PATH,
} from "../../shared/brand";
import {
  CONCIERGE_BOOK_LABEL,
  CONCIERGE_NAME,
  CONCIERGE_PRICE,
  CONCIERGE_PRICE_AMOUNT,
  CONCIERGE_STRIPE_URL,
  CONCIERGE_URL,
} from "../../shared/concierge";

const CONCIERGE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: `${BRAND_NAME} ${CONCIERGE_NAME}`,
  url: CONCIERGE_URL,
  image: `${BRAND_URL}/brand/consult-operator.jpg`,
  provider: {
    "@type": "Organization",
    name: BRAND_NAME,
    url: `${BRAND_URL}/`,
    email: CONTACT_EMAIL,
    telephone: "+1-320-335-6186",
  },
  description:
    "Done-with-you AI retainer. Audit, optimize, then automate. Two 45-minute sessions a month, unlimited async Slack or text, and a shared asset inventory.",
  offers: {
    "@type": "Offer",
    name: CONCIERGE_NAME,
    price: CONCIERGE_PRICE_AMOUNT,
    priceCurrency: "USD",
    url: CONCIERGE_STRIPE_URL,
    availability: "https://schema.org/InStock",
  },
};

export default function Concierge() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(CONCIERGE_SCHEMA) }} />
      <section className="hero consult-hero">
        <div className="hero-media">
          <img
            src="/brand/consult-operator.jpg"
            alt="Male founder-operator at the gold honeycomb boardroom — signet ring and bee tattoo"
          />
        </div>
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="dot" /> {CONCIERGE_NAME} · {CONCIERGE_PRICE}
          </div>
          <h1 className="display">
            Two sessions.
            <br />
            <em>The work ships.</em>
          </h1>
          <p className="lede">
            A {CONCIERGE_PRICE} done-with-you retainer for owners who tried ChatGPT and it didn’t stick. We audit the
            messy task, cut the broken steps, then automate it — with an operator in the room.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={CONCIERGE_STRIPE_URL} rel="noreferrer" target="_blank">
              Start {CONCIERGE_NAME} — {CONCIERGE_PRICE}
            </a>
            <a className="btn btn-outline" href={CALENDLY_URL} rel="noreferrer" target="_blank">
              {CONCIERGE_BOOK_LABEL}
            </a>
          </div>
          <p className="fine">
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            {" · "}
            <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY}</a>
          </p>
        </div>
      </section>

      <AskAiBar />

      <section className="section" id="aoa">
        <div className="container">
          <div className="section-head">
            <h2>Audit. Optimize. Automate.</h2>
            <p>Same order every month. AI comes after the process is worth automating.</p>
          </div>
          <div className="steps">
            <article className="trust">
              <p className="step-num">01</p>
              <h3>Audit</h3>
              <p className="muted">Screen-share the messy task live. We watch it and map what actually eats the week.</p>
            </article>
            <article className="trust">
              <p className="step-num">02</p>
              <h3>Optimize</h3>
              <p className="muted">Cut broken and duplicate steps before any model touches the work.</p>
            </article>
            <article className="trust">
              <p className="step-num">03</p>
              <h3>Automate</h3>
              <p className="muted">
                Claude projects, skills, and workflows. When software is the right tool, that hands off to {FD_NAME} or
                a scoped build.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="included">
        <div className="container">
          <div className="section-head">
            <h2>What’s included.</h2>
            <p>Forced working time, a thread you can use while the work is in front of you, and a list of assets you keep.</p>
          </div>
          <div className="trust-grid consult-offers">
            <article className="trust">
              <p className="eyebrow">Sessions</p>
              <h3>2 × 45 minutes</h3>
              <p className="muted">Two working sessions a month on Zoom, screen-share. You leave with something usable the same day.</p>
            </article>
            <article className="trust">
              <p className="eyebrow">Between calls</p>
              <h3>Unlimited async</h3>
              <p className="muted">Slack or text while the question is in front of you. Not a ticket queue.</p>
            </article>
            <article className="trust">
              <p className="eyebrow">The hub</p>
              <h3>Shared asset inventory</h3>
              <p className="muted">Notion or Drive: links, schedule, and a running list of every skill, automation, and asset we build.</p>
            </article>
            <article className="trust">
              <p className="eyebrow">Before kickoff</p>
              <h3>Intake</h3>
              <p className="muted">Time sinks, tool stack, and the process inventory — so the first session starts on the real leak.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="price">
        <div className="container cta-split">
          <div>
            <div className="eyebrow">The retainer</div>
            <h2 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}>
              {CONCIERGE_PRICE}.
              <br />
              <em>Month to month.</em>
            </h2>
            <p className="lede">
              You’re not buying hours. You’re buying two forced working sessions a month so the AI work actually ships —
              and a running list of assets you’ll hate to lose at renewal. Six seats, so the sessions stay sharp.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href={CONCIERGE_STRIPE_URL} rel="noreferrer" target="_blank">
                Start {CONCIERGE_NAME} — {CONCIERGE_PRICE}
              </a>
              <a className="btn btn-outline" href={CALENDLY_URL} rel="noreferrer" target="_blank">
                {CONCIERGE_BOOK_LABEL}
              </a>
            </div>
            <p className="fine">Stripe subscription. Recurring {CONCIERGE_PRICE}. Cancel any month after the first 30 days.</p>
          </div>
          <article className="rate-card">
            <p className="eyebrow">Who it’s for</p>
            <p className="rate-amt">{CONCIERGE_PRICE}</p>
            <p className="muted">
              Owners and COOs who already tried ChatGPT or Claude and it didn’t stick. Stuck in sales follow-up, quoting,
              scheduling, ops handoffs, or reporting — and want a partner on the calls, not a PDF of prompts.
            </p>
            <p className="muted">
              Not included: unlimited custom software, staffing your team, or a black-box agency that runs without you.
            </p>
          </article>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2>If a retainer is the wrong shape.</h2>
            <p>
              {FD_NAME} and the hourly packs stay open. The bottleneck call is how we say which one fits — we don’t
              force the retainer.
            </p>
          </div>
          <div className="trust-grid bridge-grid">
            <article className="trust">
              <p className="eyebrow">{FD_NAME}</p>
              <h3>{FD_PRICE}</h3>
              <p className="muted">After-hours desk and a fixed deploy when the audit shows calls or quotes leaking.</p>
              <a className="btn btn-outline" href={FD_URL} rel="noreferrer" target="_blank">
                {FD_NAME}
              </a>
            </article>
            <article className="trust">
              <p className="eyebrow">Hourly consult</p>
              <h3>{CONSULT_RATES}</h3>
              <p className="muted">Paid time, or a 10-hour pack at $1,250, when continuity is more than you need.</p>
              <Link className="btn btn-outline" to={HIVE_CONSULT_PATH}>
                See hourly consult
              </Link>
            </article>
          </div>
          <p className="fine" style={{ marginTop: 18 }}>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            {" · "}
            <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY}</a>
            {" · "}
            <a href={CALENDLY_URL} rel="noreferrer" target="_blank">
              Free 15–30 minute bottleneck call
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
