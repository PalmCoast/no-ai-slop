import { Link } from "react-router-dom";
import FaqList from "../components/FaqList";
import BillForm from "../components/BillForm";
import { CONSULT_FAQS } from "../../shared/faqs";
import {
  BOOK_CTA_LABEL,
  triageGoLinkProps,
  triageLinkProps,
  CONSULT_DISPLAY,
  CONSULT_TEL,
  FD_NAME,
  FD_URL,
  INVOICE_LINE,
  TRIAGE_CTA_LABEL,
} from "../../shared/brand";
import { LADDER_HTML } from "../../shared/b2bCopy";
import { CONCIERGE_NAME, CONCIERGE_PATH, CONCIERGE_PRICE } from "../../shared/concierge";

const FIXES = [
  {
    title: "Loops and runaway retries",
    body: "An agent that retries a failing tool call all night, or two routines that trigger each other. We find them in the run logs and stop them.",
  },
  {
    title: "Drift and redundant runs",
    body: "Scheduled jobs that kept running after the project ended, or three bots doing the same check. We cut them and write down what each one is for.",
  },
  {
    title: "The wrong model on the wrong job",
    body: "Frontier models doing sorting work with no caching. We route the cheap work to cheap models and keep the hard work where it belongs.",
  },
  {
    title: "Context that grows every run",
    body: "Agents that re-read long histories, whole documents and old tool output on every call. We trim what they carry.",
  },
  {
    title: "No caps, no owner",
    body: "Seats and API keys with no limits and nobody watching. We set caps and alerts and name an owner for each one.",
  },
  {
    title: "A report you can hand up",
    body: "What we changed, before and after spend, and what still needs an owner, in plain language your CFO can read.",
  },
] as const;

const DAYS = [
  { title: "Day 1: access and inventory", body: "Kickoff call, scoped access you grant and can revoke, and an inventory of every agent, routine, seat and API key: owner, schedule, model, cost." },
  { title: "Days 2 to 4: fixes", body: "We fix what is burning money in your accounts, with your approval on anything that changes production. Caps and alerts go in." },
  { title: "Day 5: the report", body: "A written report with before and after spend, what we changed, what we left running, and what to watch next." },
  { title: "After: keep it fixed", body: `Stop there, or move to the ${CONCIERGE_PRICE} retainer and we watch spend and failures every business day.` },
] as const;

export default function Consult() {
  return (
    <>
      <section className="hero consult-hero">
        <div className="hero-media">
          <img src="/brand/consult-operator.webp" alt="Illustration: gold honeycomb boardroom" width={1400} height={930} />
        </div>
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="dot" /> Agent Audit &amp; Stabilization Sprint
          </div>
          <h1 className="display" style={{ fontSize: "clamp(1.85rem, 4.2vw, 3.1rem)", lineHeight: 1.12 }}>Cut agent spend and stop the loops. $2,500, 5 business days.</h1>
          <p className="lede">
            A fixed-price sprint for CTOs and COOs whose AI bill keeps climbing. Daniel Graham audits your agents, routines
            and seats, fixes what is burning money in your accounts, and hands back a before-and-after report.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" {...triageGoLinkProps("consult-hero")}>
              {TRIAGE_CTA_LABEL}
            </a>
          </div>
          <BillForm from="consult-hero" />
          <p className="fine">
            70+ live AI apps in production. Not sure yet? The 30-minute Architecture & Spend Triage is free. <a href="#pricing">See pricing</a>
          </p>
        </div>
      </section>

      <section className="section" id="what-you-get">
        <div className="container">
          <div className="section-head">
            <h2>What we fix</h2>
            <p>The same handful of problems show up in almost every team’s AI stack. They are cheap to fix once someone looks.</p>
          </div>
          <div className="trust-grid consult-get">
            {FIXES.map((item) => (
              <article key={item.title} className="trust">
                <h3>{item.title}</h3>
                <p className="muted">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" id="how-it-works">
        <div className="container">
          <div className="section-head">
            <h2>How the 5 days run</h2>
            <p>The clock starts at kickoff. You approve anything that touches production.</p>
          </div>
          <ol className="steps steps-4">
            {DAYS.map((step, i) => (
              <li key={step.title} className="trust">
                <p className="step-num">{i + 1}</p>
                <h3>{step.title}</h3>
                <p className="muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="container">
          <div className="section-head">
            <h2>Pricing</h2>
            <p>Three steps, one price each. No hours to track.</p>
          </div>
          <article className="price-card" id="rates">
            <p className="eyebrow">Work with Daniel Graham</p>
            <p className="price-card__lead">
              <span className="rate-amt">$2,500</span> fixed, 5 business days
            </p>
            <ul className="price-card__rows">
              <li>
                <span>
                  Architecture &amp; Spend Triage
                  <small className="muted"> 30 minutes. Where the money is most likely going, and whether the sprint pays for itself.</small>
                </span>
                <strong>Free</strong>
                <a className="btn btn-outline" {...triageLinkProps("consult-offers")}>
                  Book →
                </a>
              </li>
              <li>
                <span>
                  Agent Audit &amp; Stabilization Sprint
                  <small className="muted"> Inventory, fixes in your accounts, caps and alerts, before-and-after report.</small>
                </span>
                <strong>$2,500</strong>
                <a className="btn btn-primary" {...triageGoLinkProps("ah-consult-pricing-sprint")}>
                  {TRIAGE_CTA_LABEL}
                </a>
              </li>
              <li>
                <span>
                  {CONCIERGE_NAME}
                  <small className="muted"> Monitoring of spend and failures, 1-business-day response, monthly report, async help.</small>
                </span>
                <strong>{CONCIERGE_PRICE}</strong>
                <a className="btn btn-outline" {...triageGoLinkProps("ah-consult-pricing-retainer")}>
                  {TRIAGE_CTA_LABEL}
                </a>
              </li>
            </ul>
            <p className="fine">{INVOICE_LINE} The retainer is month to month.</p>
          </article>
          <div className="continuity-bridge">
            <p>
              Want someone watching it every month? See the <Link to={CONCIERGE_PATH}>{CONCIERGE_NAME}</Link>. The same
              ladder runs on <a href={FD_URL}>{FD_NAME}</a>.
            </p>
            <Link className="btn btn-outline" to={CONCIERGE_PATH}>
              See the retainer
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="ladder">
        <div className="container cx">
          <div dangerouslySetInnerHTML={{ __html: LADDER_HTML }} />
          <p>
            <a href="/send-your-bill" data-ph-cta="send-bill" data-ph-from="consult-ladder">
              Send your AI bill for a free teardown
            </a>
          </p>
        </div>
      </section>

      <section className="section section-alt" id="faq">
        <div className="container">
          <div className="section-head">
            <h2>Questions CTOs and COOs ask</h2>
          </div>
          <FaqList items={CONSULT_FAQS} />
        </div>
      </section>

      <section className="section">
        <div className="container cta-split">
          <div>
            <div className="eyebrow">Free, 30 minutes</div>
            <h2 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}>
              Bring last month’s bill.
              <br />
              <em>Leave knowing where it went.</em>
            </h2>
            <p className="lede">
              We look at your bill and your stack and tell you where the waste most likely is, and whether the sprint will pay
              for itself. If it won’t, we say so.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" {...triageLinkProps("consult-final")}>
                {BOOK_CTA_LABEL}
              </a>
              <a className="btn btn-outline" href={`tel:${CONSULT_TEL}`}>
                Call {CONSULT_DISPLAY}
              </a>
            </div>
          </div>
          <div className="frame consult-frame">
            <img src="/brand/consult-operator.webp" alt="Illustration: gold honeycomb boardroom" width={1400} height={930} loading="lazy" />
          </div>
        </div>
      </section>
    </>
  );
}
