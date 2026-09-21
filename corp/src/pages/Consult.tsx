import AskAiBar from "../components/AskAiBar";
import {
  BOOK_CTA_LABEL,
  BRAND_NAME,
  BRAND_URL,
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
  HIVE_CONSULT_URL,
} from "../../shared/brand";
import { CONSULT_STRIPE_RATES } from "../../shared/consult";

const CONSULT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: `${BRAND_NAME} AI consulting`,
  url: HIVE_CONSULT_URL,
  image: `${BRAND_URL}/brand/consult-operator.jpg`,
  provider: {
    "@type": "Organization",
    name: BRAND_NAME,
    url: `${BRAND_URL}/`,
    telephone: ["+1-320-335-6186", "+1-509-357-2230"],
  },
  description: `AI consulting that ships. Free 30-minute qualifier, then ${CONSULT_RATES}, or a 10-hour pack at $1,250.`,
  offers: [
    { "@type": "Offer", name: "Free 30-minute qualifier", price: "0.00", priceCurrency: "USD" },
    { "@type": "Offer", name: "30 minutes", price: "75.00", priceCurrency: "USD" },
    { "@type": "Offer", name: "1 hour", price: "150.00", priceCurrency: "USD" },
    { "@type": "Offer", name: "10-hour pack", price: "1250.00", priceCurrency: "USD" },
  ],
};

export default function Consult() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(CONSULT_SCHEMA) }} />
      <section className="hero consult-hero">
        <div className="hero-media">
          <img
            src="/brand/consult-operator.jpg"
            alt="Male founder-operator at the gold honeycomb boardroom — signet ring and bee tattoo"
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
            Not another deck. Free 30-minute qualifier. Then paid time — or a fixed deploy if the leak is clear. Already
            done inside a live commercial earth-moving operation.
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
            Need the after-hours desk instead?{" "}
            <a href={FD_URL} rel="noreferrer" target="_blank">
              {FD_NAME} — {FD_PRICE} → firstdeploy.ai
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
              src="/brand/consult-operator.jpg"
              alt="Male operator in the gold honeycomb war room, honeycomb signet and bee tattoo"
            />
          </div>
        </div>
      </section>
    </>
  );
}
