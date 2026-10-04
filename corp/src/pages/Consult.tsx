import { Link } from "react-router-dom";
import AskAiBar from "../components/AskAiBar";
import FaqList from "../components/FaqList";
import { CONSULT_FAQS } from "../../shared/faqs";
import {
  BOOK_CTA_LABEL,
  CALENDLY_URL,
  CONSULT_DISPLAY,
  CONSULT_RATES,
  CONSULT_TEL,
  FD_CHECK_LABEL,
  FD_CHECK_URL,
  FD_NAME,
  FD_PRICE,
  FD_PROMISE,
  FD_URL,
} from "../../shared/brand";
import { CONSULT_STRIPE_RATES } from "../../shared/consult";
import { CONCIERGE_NAME, CONCIERGE_PATH, CONCIERGE_PRICE } from "../../shared/concierge";

export default function Consult() {
  return (
    <>
      <section className="hero consult-hero">
        <div className="hero-media">
          <img
            src="/brand/consult-operator.webp"
            alt="Illustration: gold honeycomb boardroom"
            width={1400}
            height={930}
          />
        </div>
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="dot" /> AI consulting that ships
          </div>
          <h1 className="display">
            An operator
            <br />
            <em>in the room.</em>
          </h1>
          <p className="lede">
            Not another deck. Free 30-minute qualifier. Then paid time — or a fixed deploy if the leak is clear.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={CALENDLY_URL} rel="noreferrer" target="_blank">
              {BOOK_CTA_LABEL}
            </a>
            <a className="btn btn-outline" href={`tel:${CONSULT_TEL}`}>
              Call {CONSULT_DISPLAY}
            </a>
          </div>
          <p className="fine">
            <a href={FD_URL} rel="noreferrer" target="_blank">
              Need the after-hours desk instead? First Deploy AI — $1,750 setup (50% to start or pay in full), then $250/mo → firstdeploy.ai
            </a>
          </p>
          <p className="fine">
            {CONSULT_RATES} · 10-hour pack $1,250 — $625 up front. {FD_NAME}: {FD_PRICE}.
          </p>
        </div>
      </section>

      <AskAiBar />

      <section className="section">
        <div className="container">
          <div className="trust-grid consult-offers">
            <article className="trust">
              <p className="eyebrow">The door</p>
              <h3>Free 30 on Calendly</h3>
              <p className="muted">Then paid time, or a fixed deploy if the leak is clear. Book the free 30. Pay on Stripe.</p>
            </article>
            <article className="trust">
              <p className="eyebrow">The rates</p>
              <h3>$75 · $150 · $1,250</h3>
              <p className="muted">Thirty minutes, an hour, or a 10-hour pack at $125/hour with half up front.</p>
            </article>
            <article className="trust">
              <p className="eyebrow">Also paid</p>
              <h3>Referrals &amp; alignment</h3>
              <p className="muted">Referrals paid. LLM-alignment work paid. {FD_NAME} and Flick stay as products.</p>
            </article>
            <article className="trust">
              <p className="eyebrow">The product</p>
              <h3>{FD_NAME}</h3>
              <p className="muted">
                After-hours desk and live apps. {FD_PRICE}. {FD_PROMISE}.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="rates">
        <div className="container">
          <div className="section-head">
            <h2>Paid time, after the qualifier.</h2>
            <p>The free 30 is how we see if there is paid work. 10-hour pack is $125/hour, half up front.</p>
          </div>
          <div className="rate-grid">
            {CONSULT_STRIPE_RATES.map((rate) => (
              <article key={rate.slug} className="rate-card">
                <p className="eyebrow">{rate.name}</p>
                <p className="rate-amt">{rate.amount}</p>
                <p className="muted">{rate.note}</p>
                <a className="btn btn-primary" href={rate.href} rel="noreferrer" target="_blank">
                  {rate.cta}
                </a>
              </article>
            ))}
          </div>
          <p className="fine" style={{ marginTop: 18 }}>
            Stripe secured. Referrals paid. LLM-alignment work paid.
          </p>
          <div className="continuity-bridge">
            <p>
              Need continuity instead of hours?{" "}
              <Link to={CONCIERGE_PATH}>{CONCIERGE_NAME}</Link> is the {CONCIERGE_PRICE} retainer — two working sessions
              a month, unlimited async, and a shared asset inventory. The hourly rates above stay the consult offer.
            </p>
            <Link className="btn btn-outline" to={CONCIERGE_PATH}>
              See the continuity retainer
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="ai-consultant-cost">
        <div className="container">
          <div className="section-head">
            <h2>What an AI consultant costs</h2>
            <p>These are the prices on this page. Palm Coast, Florida, and remote by Calendly.</p>
          </div>
          <div className="trust-grid consult-offers">
            <article className="trust">
              <p className="eyebrow">Qualifier</p>
              <h3>Free 30</h3>
              <p className="muted">No charge. We use it to see if there is paid work.</p>
            </article>
            <article className="trust">
              <p className="eyebrow">Paid time</p>
              <h3>{CONSULT_RATES}</h3>
              <p className="muted">$75 for 30 minutes. $150 for an hour. Pay on Stripe after the qualifier.</p>
            </article>
            <article className="trust">
              <p className="eyebrow">Pack</p>
              <h3>$1,250 for 10 hours</h3>
              <p className="muted">$625 up front. That is half of the $1,250 pack.</p>
            </article>
            <article className="trust">
              <p className="eyebrow">Monthly</p>
              <h3>{CONCIERGE_PRICE}</h3>
              <p className="muted">
                <Link to={CONCIERGE_PATH}>{CONCIERGE_NAME}</Link> when you want continuity instead of hours.
              </p>
            </article>
          </div>
          <p style={{ marginTop: 18 }}>
            AI consulting from Palm Coast, Florida (Flagler County). Daniel Graham is based there. The free 30 and the
            paid sessions are Calendly calls, so owners outside Palm Coast hire him remotely. This page does not sell
            an on-site visit.
          </p>
          <p>
            Need it monthly? <Link to={CONCIERGE_PATH}>{CONCIERGE_NAME}</Link>. For a{" "}
            <a href="https://ainexus360.com/">fixed-fee audit</a>, see AI Nexus 360. For{" "}
            <a href="https://infrastructure.agenthiveinc.com/">telco/network work</a>, see Seat &amp; Circuit. Compare
            the retainer with a hire on <Link to="/concierge/vs-hiring">Concierge vs hiring</Link>.
          </p>
        </div>
      </section>

      <section className="section section-alt" id="faq">
        <div className="container">
          <div className="section-head">
            <h2>Consult questions</h2>
          </div>
          <FaqList items={CONSULT_FAQS} />
        </div>
      </section>

      <section className="section">
        <div className="container cta-split">
          <div>
            <div className="eyebrow">{BOOK_CTA_LABEL}</div>
            <h2 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}>
              Thirty minutes.
              <br />
              <em>Then you decide.</em>
            </h2>
            <p className="lede">
              Calendly holds the qualifier. If we keep going, you pick paid time above. {FD_NAME} — and the {FD_CHECK_LABEL}{" "}
              — stay on the product site.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href={CALENDLY_URL} rel="noreferrer" target="_blank">
                {BOOK_CTA_LABEL}
              </a>
              <a className="btn btn-outline" href={FD_CHECK_URL} rel="noreferrer" target="_blank">
                {FD_CHECK_LABEL}
              </a>
            </div>
          </div>
          <div className="frame consult-frame">
            <img
              src="/brand/consult-operator.webp"
              alt="Illustration: gold honeycomb boardroom"
              width={1400}
              height={930}
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  );
}
