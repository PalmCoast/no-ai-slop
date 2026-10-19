import { Link } from "react-router-dom";
import AuthorCard from "../components/AuthorCard";
import { BOOK_CTA_LABEL, CALENDLY_URL, CONSULT_DISPLAY, CONSULT_TEL, FD_NAME, FD_URL } from "../../shared/brand";
import {
  SWITCH_CHECKED,
  SWITCH_ENDS,
  SWITCH_GUARANTEE,
  SWITCH_MONTHLY_LABEL,
  SWITCH_OFFERS,
  SWITCH_PROOF_EMAIL,
  SWITCH_SETUP_LABEL,
  SWITCH_TERMS,
  SWITCH_YEAR_ONE,
} from "../../shared/switch";

const yearOne = SWITCH_YEAR_ONE.toLocaleString("en-US");

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
            <span className="dot" /> Switch offers · through {SWITCH_ENDS}
          </div>
          <h1 className="display" style={{ fontSize: "clamp(1.9rem, 4.2vw, 3.1rem)", lineHeight: 1.12 }}>
            Paying Smith.ai or Ruby to answer the phone? Switch for {SWITCH_SETUP_LABEL}.
          </h1>
          <p className="lede">
            {FD_NAME} is the after-hours desk for trade shops: built in your shop’s name, on your number, tested
            against hard callers, then run for {SWITCH_MONTHLY_LABEL} with no call count and no minute meter. Published
            setup is $1,750. A shop leaving Smith.ai or Ruby pays {SWITCH_SETUP_LABEL} and the balance is waived.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={`tel:${CONSULT_TEL}`}>
              Hear the desk: {CONSULT_DISPLAY}
            </a>
            <a className="btn btn-outline" href={CALENDLY_URL} rel="noreferrer" target="_blank">
              {BOOK_CTA_LABEL}
            </a>
          </div>
          <p className="fine">{SWITCH_GUARANTEE}</p>
        </div>
      </section>

      <section className="section" id="offers">
        <div className="container">
          <div className="section-head">
            <h2>Pick the service you are leaving</h2>
            <p>
              Each page shows what that service publishes, read {SWITCH_CHECKED}, next to the switch offer, and says
              plainly when staying is the better call.
            </p>
          </div>
          <div className="card-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
            {SWITCH_OFFERS.map((offer) => (
              <Link key={offer.slug} className="card" to={offer.path}>
                <p className="eyebrow">Switch from {offer.competitor}</p>
                <h3>{offer.h1}</h3>
                <p className="muted">{offer.lede}</p>
                <p className="fine" style={{ marginTop: 10 }}>
                  See the {offer.competitor} offer →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" id="terms">
        <div className="container">
          <div className="section-head">
            <h2>One set of terms for both</h2>
            <p>
              {`Year one on the switch offer is $${yearOne}: ${SWITCH_SETUP_LABEL} once, then ${SWITCH_MONTHLY_LABEL} for twelve months. Year two is $3,000.`}
            </p>
          </div>
          <ol className="takeaways">
            {SWITCH_TERMS.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ol>
          <p className="fine" style={{ marginTop: 16 }}>
            Proof goes to <a href={`mailto:${SWITCH_PROOF_EMAIL}`}>{SWITCH_PROOF_EMAIL}</a>. The published price and the
            full product page stay on <a href={FD_URL}>firstdeploy.ai</a>. Not on Smith.ai or Ruby? The desk is still
            $1,750 setup, then {SWITCH_MONTHLY_LABEL}, and the free 30 is still free.
          </p>
        </div>
      </section>

      <section className="section" id="why">
        <div className="container">
          <div className="section-head">
            <h2>Why a switcher pays half</h2>
            <p>The build is cheaper when the calls already exist.</p>
          </div>
          <div className="trust-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <article className="trust">
              <h3>Your call history is the script</h3>
              <p className="muted">
                A shop on Smith.ai or Ruby has a month of real calls, transcripts, and messages. We write the greeting,
                the questions, and the emergency rules from those, not from a blank page.
              </p>
            </article>
            <article className="trust">
              <h3>Your forwarding already works</h3>
              <p className="muted">
                You already forward after hours. On go-live night the only change is where the line points. No new
                number, nothing to print.
              </p>
            </article>
            <article className="trust">
              <h3>You know what you are replacing</h3>
              <p className="muted">
                You have a bill with a per-call or per-minute line on it. The desk replaces it with one flat number,
                and you can hear the desk before you pay by calling <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY}</a>
                .
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <AuthorCard linked />
        </div>
      </section>
    </>
  );
}
