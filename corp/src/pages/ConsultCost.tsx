import { Link } from "react-router-dom";
import FaqList from "../components/FaqList";
import { CONSULT_COST_FAQS } from "../../shared/faqs";
import { BOOK_CTA_LABEL, BOOK_HREF, CONSULT_DISPLAY, CONSULT_TEL, HIVE_CONSULT_PATH } from "../../shared/brand";
import { CONSULT_COST_CHECKED } from "../../shared/consult";
import { CONCIERGE_NAME, CONCIERGE_PATH, CONCIERGE_PRICE } from "../../shared/concierge";

const OURS = [
  { item: "First call", price: "Free (30 minutes)" },
  { item: "30 minutes", price: "$75" },
  { item: "1 hour", price: "$150" },
  { item: "10-hour pack", price: "$1,250 ($125 an hour, $625 up front)" },
  { item: "Monthly retainer", price: `${CONCIERGE_PRICE} (${CONCIERGE_NAME})` },
] as const;

export default function ConsultCost() {
  return (
    <>
      <section className="section">
        <div className="container">
          <p className="fine">
            <Link to={HIVE_CONSULT_PATH}>Consult</Link> / What an AI consultant costs
          </p>
          <div className="eyebrow">
            <span className="dot" /> Pricing guide · checked {CONSULT_COST_CHECKED}
          </div>
          <h1 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}>
            What an AI consultant costs a growing company
          </h1>
          <p className="lede">
            AgentHive Inc charges $75 for 30 minutes, $150 an hour, or $1,250 for a 10-hour pack, after a free
            30-minute call. This page lists those prices. It does not quote another firm.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={BOOK_HREF}>
              {BOOK_CTA_LABEL}
            </a>
            <Link className="btn btn-outline" to={`${HIVE_CONSULT_PATH}#pricing`}>
              See our pricing
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="our-prices">
        <div className="container">
          <div className="section-head">
            <h2>Our prices</h2>
            <p>The same prices as the consult page. Paid on Stripe, no contract.</p>
          </div>
          <div className="table-wrap">
            <table className="cost-table">
              <thead>
                <tr>
                  <th scope="col">What you buy</th>
                  <th scope="col">AgentHive Inc price</th>
                </tr>
              </thead>
              <tbody>
                {OURS.map((row) => (
                  <tr key={row.item}>
                    <td>{row.item}</td>
                    <td>{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="how-we-compare">
        <div className="container">
          <div className="section-head">
            <h2>How our rates line up</h2>
          </div>
          <div className="trust-grid">
            <article className="trust">
              <h3>Hourly</h3>
              <p className="muted">
                A paid hour is $150. A 30-minute block is $75 when the question is small.
              </p>
            </article>
            <article className="trust">
              <h3>Short sessions</h3>
              <p className="muted">
                You can buy 30 minutes for $75 when the question is small, instead of committing to a full project.
              </p>
            </article>
            <article className="trust">
              <h3>The pack</h3>
              <p className="muted">
                Ten hours for $1,250 is $125 an hour, with $625 up front, for a defined build you want to work through
                in one block.
              </p>
            </article>
            <article className="trust">
              <h3>Monthly</h3>
              <p className="muted">
                <Link to={CONCIERGE_PATH}>{CONCIERGE_NAME}</Link> is {CONCIERGE_PRICE} when you want two working sessions
                every month.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="container">
          <div className="section-head">
            <h2>Cost questions</h2>
          </div>
          <FaqList items={CONSULT_COST_FAQS} />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="cta-box">
            <h2>Find out what your task would cost.</h2>
            <p className="lede">
              Bring one task to a free 30-minute call. You leave knowing whether AI fits and about how many hours it
              takes.
            </p>
            <div className="hero-actions" style={{ justifyContent: "center" }}>
              <a className="btn btn-primary" href={BOOK_HREF}>
                {BOOK_CTA_LABEL}
              </a>
              <a className="btn btn-outline" href={`tel:${CONSULT_TEL}`}>
                Call {CONSULT_DISPLAY}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
