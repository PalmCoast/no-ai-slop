import AuthorCard from "../components/AuthorCard";
import FaqList from "../components/FaqList";
import { BOOK_CTA_LABEL, CALENDLY_URL, CONSULT_DISPLAY, CONSULT_TEL, FD_NAME, FD_URL } from "../../shared/brand";
import {
  SWITCH_ENDS,
  SWITCH_FAQS,
  SWITCH_GUARANTEE,
  SWITCH_H1,
  SWITCH_LEDE,
  SWITCH_MONTHLY_LABEL,
  SWITCH_POINTS,
  SWITCH_SETUP_LABEL,
  SWITCH_TERMS,
  SWITCH_YEAR_ONE,
  SWITCH_YEAR_TWO,
} from "../../shared/switch";

const yearOne = SWITCH_YEAR_ONE.toLocaleString("en-US");
const yearTwo = SWITCH_YEAR_TWO.toLocaleString("en-US");

export default function Switch() {
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
            <span className="dot" /> {`Through ${SWITCH_ENDS}`}
          </div>
          <h1 className="display" style={{ fontSize: "clamp(1.9rem, 4.2vw, 3.1rem)", lineHeight: 1.12 }}>
            {SWITCH_H1}
          </h1>
          <p className="lede">{SWITCH_LEDE}</p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={CALENDLY_URL} rel="noreferrer" target="_blank">
              {BOOK_CTA_LABEL}
            </a>
            <a className="btn btn-outline" href={`tel:${CONSULT_TEL}`}>
              {`Hear the desk: ${CONSULT_DISPLAY}`}
            </a>
          </div>
          <p className="fine">{SWITCH_GUARANTEE}</p>
        </div>
      </section>

      <section className="section" id="offer">
        <div className="container">
          <div className="section-head">
            <h2>The offer</h2>
            <p>
              {`A plan started by ${SWITCH_ENDS} is ${SWITCH_SETUP_LABEL} setup and ${SWITCH_MONTHLY_LABEL}. Year one is $${yearOne}. Year two is $${yearTwo}.`}
            </p>
          </div>
          <div className="trust-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <article className="rate-card">
              <p className="eyebrow">Setup</p>
              <p className="rate-amt">{SWITCH_SETUP_LABEL}</p>
              <p className="muted">
                {`No setup fee on a plan started by ${SWITCH_ENDS}. The greeting, the questions, the emergency rules, and the practice calls are included. Published setup after that date is $1,750.`}
              </p>
            </article>
            <article className="rate-card">
              <p className="eyebrow">Then</p>
              <p className="rate-amt">{SWITCH_MONTHLY_LABEL}</p>
              <p className="muted">
                From go-live. Flat. No calls counted, no minutes metered. Tuning and changes included. Cancel any time.
              </p>
            </article>
            <article className="rate-card">
              <p className="eyebrow">If we are late</p>
              <p className="rate-amt">First month on us</p>
              <p className="muted">{SWITCH_GUARANTEE}</p>
            </article>
          </div>
          <h3 style={{ marginTop: "1.6rem" }}>Terms, in full</h3>
          <ol className="takeaways">
            {SWITCH_TERMS.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-alt" id="desk">
        <div className="container">
          <div className="section-head">
            <h2>What the $125 covers</h2>
            <p>{`${FD_NAME} is the after-hours desk for trade shops. The price on this page is the whole desk.`}</p>
          </div>
          <div className="trust-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {SWITCH_POINTS.map((point) => (
              <article key={point.h} className="trust">
                <h3>{point.h}</h3>
                <p className="muted">{point.p}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-box">
            <h2>Hear it, then start the plan</h2>
            <p>
              {`Call ${CONSULT_DISPLAY} and the desk answers. The free 30 is where the written plan gets a go-live date. ${SWITCH_MONTHLY_LABEL} starts that day. Nothing before it.`}
            </p>
            <div className="hero-actions" style={{ justifyContent: "center" }}>
              <a className="btn btn-primary" href={CALENDLY_URL} rel="noreferrer" target="_blank">
                {BOOK_CTA_LABEL}
              </a>
              <a className="btn btn-outline" href={`tel:${CONSULT_TEL}`}>
                {CONSULT_DISPLAY}
              </a>
            </div>
            <p className="fine" style={{ marginTop: 14 }}>
              {`Through ${SWITCH_ENDS}. The published price stays on `}
              <a href={FD_URL}>firstdeploy.ai</a>.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="faq">
        <div className="container">
          <div className="section-head">
            <h2>Questions</h2>
          </div>
          <FaqList items={SWITCH_FAQS} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <AuthorCard linked />
        </div>
      </section>
    </>
  );
}
