import { Link } from "react-router-dom";
import AuthorCard from "../components/AuthorCard";
import FaqList from "../components/FaqList";
import { BOOK_CTA_LABEL, CALENDLY_URL, CONSULT_DISPLAY, CONSULT_TEL, FD_NAME, FD_URL } from "../../shared/brand";
import {
  SWITCH_CHECKED,
  SWITCH_ENDS,
  SWITCH_GUARANTEE,
  SWITCH_MONTHLY_LABEL,
  SWITCH_OFFERS,
  SWITCH_PATH,
  SWITCH_PROOF_EMAIL,
  SWITCH_SETUP_LABEL,
  SWITCH_TERMS,
  switchGoPath,
  type SwitchOffer as Offer,
} from "../../shared/switch";

export default function SwitchOffer({ offer }: { offer: Offer }) {
  const other = SWITCH_OFFERS.find((o) => o.slug !== offer.slug);
  const checkout = switchGoPath(offer.slug, `switch-${offer.slug}-hero`);
  const checkoutBottom = switchGoPath(offer.slug, `switch-${offer.slug}-price`);

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
            <span className="dot" /> {offer.eyebrow}
          </div>
          <h1 className="display" style={{ fontSize: "clamp(1.9rem, 4.2vw, 3.1rem)", lineHeight: 1.12 }}>
            {offer.h1}
          </h1>
          <p className="lede">{offer.lede}</p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={checkout}>
              Switch for {SWITCH_SETUP_LABEL}
            </a>
            <a className="btn btn-outline" href={CALENDLY_URL} rel="noreferrer" target="_blank">
              {BOOK_CTA_LABEL}
            </a>
          </div>
          <p className="fine">
            {SWITCH_GUARANTEE} Offer runs through {SWITCH_ENDS}. Hear the desk first:{" "}
            <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY}</a>.
          </p>
        </div>
      </section>

      <section className="section" id="offer">
        <div className="container">
          <div className="section-head">
            <h2>The switch offer</h2>
            <p>
              {FD_NAME} is published at $1,750 setup, then {SWITCH_MONTHLY_LABEL}. A {offer.competitor} shop that
              switches by {SWITCH_ENDS} pays half the setup and the same flat monthly.
            </p>
          </div>
          <div className="trust-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <article className="rate-card">
              <p className="eyebrow">Setup for switchers</p>
              <p className="rate-amt">{SWITCH_SETUP_LABEL}</p>
              <p className="muted">
                Published setup is $1,750. You pay the $875 start and the $875 balance is waived. Script, emergency
                rules, practice calls, go-live date in a written plan.
              </p>
            </article>
            <article className="rate-card">
              <p className="eyebrow">Then</p>
              <p className="rate-amt">{SWITCH_MONTHLY_LABEL}</p>
              <p className="muted">
                From go-live. Flat. No calls counted, no minutes metered. Tuning and changes included. Cancel any
                time.
              </p>
            </article>
            <article className="rate-card">
              <p className="eyebrow">If we are late</p>
              <p className="rate-amt">$875 back</p>
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

      <section className="section section-alt" id="theirs">
        <div className="container">
          <div className="section-head">
            <h2>{`What ${offer.competitor} publishes`}</h2>
            <p>{offer.what}</p>
          </div>
          <div className="table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>{offer.competitor} plan</th>
                  <th>Price</th>
                  <th>Includes</th>
                  <th>Over the allowance</th>
                </tr>
              </thead>
              <tbody>
                {offer.plans.map((plan) => (
                  <tr key={plan.plan}>
                    <th>{plan.plan}</th>
                    <td>{plan.price}</td>
                    <td>{plan.includes}</td>
                    <td>{plan.over}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted">{offer.plansNote}</p>
        </div>
      </section>

      <section className="section" id="beats">
        <div className="container">
          <div className="section-head">
            <h2>Where the switch is better</h2>
            <p>Four things a {offer.competitor} shop gets on day one of the desk.</p>
          </div>
          <div className="trust-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
            {offer.beats.map((beat) => (
              <article key={beat.h} className="trust">
                <h3>{beat.h}</h3>
                <p className="muted">{beat.p}</p>
              </article>
            ))}
          </div>
          <article className="panel" style={{ marginTop: "1.2rem" }}>
            <p className="eyebrow">Switchers only</p>
            <h3>{offer.extra.h}</h3>
            <p className="muted" style={{ marginTop: 8 }}>
              {offer.extra.p}
            </p>
          </article>
        </div>
      </section>

      <section className="section section-alt" id="math">
        <div className="container">
          <div className="section-head">
            <h2>Twelve months, side by side</h2>
            <p>{offer.mathNote}</p>
          </div>
          <div className="table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th> </th>
                  <th>Year one</th>
                  <th>Year two</th>
                  <th>What the number is</th>
                </tr>
              </thead>
              <tbody>
                {offer.math.map((row) => (
                  <tr key={row.label}>
                    <th>{row.label}</th>
                    <td>{row.yearOne}</td>
                    <td>{row.yearTwo}</td>
                    <td>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3>{`When ${offer.competitor} is the better choice`}</h3>
          <p>{offer.whenTheyWin}</p>
          <p className="fine" style={{ marginTop: 12 }}>
            Full plan-by-plan comparison, with no offer attached:{" "}
            <a href={offer.compareUrl} rel="noreferrer">
              {`${FD_NAME} vs ${offer.competitor}`}
            </a>{" "}
            on firstdeploy.ai.
          </p>
        </div>
      </section>

      <section className="section" id="start">
        <div className="container">
          <div className="cta-box">
            <h2>{`Switch from ${offer.competitor} this month`}</h2>
            <p>
              Call <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY}</a> and hear the desk the way your customers would.
              Then email your {offer.competitor} invoice or quote to{" "}
              <a href={`mailto:${SWITCH_PROOF_EMAIL}`}>{SWITCH_PROOF_EMAIL}</a> and pay the {SWITCH_SETUP_LABEL} start.
              The balance is waived. {SWITCH_MONTHLY_LABEL} from go-live.
            </p>
            <div className="hero-actions" style={{ justifyContent: "center", marginTop: 18, marginBottom: 0 }}>
              <a className="btn btn-primary" href={checkoutBottom}>
                Switch for {SWITCH_SETUP_LABEL}
              </a>
              <a className="btn btn-outline" href={CALENDLY_URL} rel="noreferrer" target="_blank">
                {BOOK_CTA_LABEL}
              </a>
            </div>
            <p className="fine" style={{ marginTop: 16 }}>
              Through {SWITCH_ENDS}. {FD_NAME} details and the published price stay on{" "}
              <a href={FD_URL}>firstdeploy.ai</a>.
              {other ? (
                <>
                  {" "}
                  Coming from {other.competitor} instead? <Link to={other.path}>That offer is here</Link>. Both offers:{" "}
                  <Link to={SWITCH_PATH}>agenthiveinc.com/switch</Link>.
                </>
              ) : null}
            </p>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="faq">
        <div className="container">
          <div className="section-head">
            <h2>Switch questions</h2>
          </div>
          <FaqList items={offer.faqs} />
        </div>
      </section>

      <section className="section" id="sources">
        <div className="container">
          <h2>Sources</h2>
          <ul className="takeaways">
            {offer.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} rel="noreferrer">
                  {source.label}
                </a>
                . Read {SWITCH_CHECKED}.
              </li>
            ))}
          </ul>
          <p className="muted">
            Vendor prices change. Each figure above is tied to the page it came from and the date it was read. If{" "}
            {offer.competitor} prints a different number today, their page wins and this one gets corrected.
          </p>
          <div style={{ marginTop: "1.5rem" }}>
            <AuthorCard linked />
          </div>
        </div>
      </section>
    </>
  );
}
