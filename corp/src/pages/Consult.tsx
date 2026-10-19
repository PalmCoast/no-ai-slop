import { Link } from "react-router-dom";
import FaqList from "../components/FaqList";
import { CONSULT_FAQS } from "../../shared/faqs";
import {
  BOOK_CTA_LABEL,
  CALENDLY_URL,
  CONSULT_DISPLAY,
  CONSULT_TEL,
  FD_NAME,
  FD_PRICE,
  FD_URL,
} from "../../shared/brand";
import { CONSULT_COST_PATH, CONSULT_STRIPE_RATES } from "../../shared/consult";
import { CONCIERGE_NAME, CONCIERGE_PATH, CONCIERGE_PRICE } from "../../shared/concierge";

const WHAT_YOU_GET = [
  {
    title: "A straight answer, free",
    body: "Thirty minutes on the task that eats your week. You hear whether AI fits it, what would come first, and about how many hours it takes. If it does not fit, you hear that too.",
  },
  {
    title: "The work, done with you",
    body: "Paid hours go to setting things up, not to slides. Daniel builds on a shared screen while you watch, so you see how it works as it comes together.",
  },
  {
    title: "Everything in your accounts",
    body: "Tools, automations and assistants live under your logins. Any subscription is in your name, with the monthly cost known before you sign up.",
  },
  {
    title: "One task at a time",
    body: "We finish and test one job before starting the next, so every session leaves something working behind.",
  },
  {
    title: "Notes you keep",
    body: "What was set up, where it lives, and the next step, written in plain language so your team can follow it.",
  },
  {
    title: "Someone who builds",
    body: "Daniel Graham has 25 years in enterprise IT and telecom and builds and runs AgentHive Inc's own products, including First Deploy AI.",
  },
] as const;

const STEPS = [
  { title: "Book the free 30", body: "Pick a time on Calendly. Bring the one task you most want off your plate." },
  { title: "Get a plan on the call", body: "You hear what we would do first and roughly how many hours it takes, before you pay anything." },
  { title: "Choose your time", body: "Buy 30 minutes, an hour, or the 10-hour pack on Stripe. No contract." },
  { title: "We build it together", body: "Sessions run by video in your accounts. Keep going, add hours, or stop when the job is done." },
] as const;

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
            <span className="dot" /> AI consulting for small business owners
          </div>
          <h1 className="display">
            Hand over the AI job.
            <br />
            <em>We set it up with you.</em>
          </h1>
          <p className="lede">
            Tell Daniel Graham the task that eats your week. On a free 30-minute call you find out if AI can take it.
            If it can, paid hours go to building it in your own accounts until it runs.
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
            Free 30 minutes · then $75 / 30 min · $150 / hour · 10-hour pack $1,250 ($625 up front).{" "}
            <a href="#pricing">See pricing</a>
          </p>
        </div>
      </section>

      <section className="section" id="what-you-get">
        <div className="container">
          <div className="section-head">
            <h2>What you get</h2>
            <p>Hands-on AI help for owners who want the work done, not a report about it.</p>
          </div>
          <div className="trust-grid consult-get">
            {WHAT_YOU_GET.map((item) => (
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
            <h2>How it works</h2>
            <p>Four steps. You can stop after any of them.</p>
          </div>
          <ol className="steps steps-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="trust">
                <p className="step-num">{i + 1}</p>
                <h3>{step.title}</h3>
                <p className="muted">{step.body}</p>
              </li>
            ))}
          </ol>
          <div className="hero-actions" style={{ marginTop: 22 }}>
            <a className="btn btn-primary" href={CALENDLY_URL} rel="noreferrer" target="_blank">
              {BOOK_CTA_LABEL}
            </a>
          </div>
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="container">
          <div className="section-head">
            <h2>Pricing</h2>
            <p>Start free. Pay only for the time you use.</p>
          </div>
          <article className="price-card" id="rates">
            <p className="eyebrow">AI consulting with Daniel Graham</p>
            <p className="price-card__lead">
              <span className="rate-amt">Free</span> first 30 minutes
            </p>
            <ul className="price-card__rows">
              <li>
                <span>Free 30-minute call</span>
                <strong>$0</strong>
                <a className="btn btn-primary" href={CALENDLY_URL} rel="noreferrer" target="_blank">
                  {BOOK_CTA_LABEL}
                </a>
              </li>
              {CONSULT_STRIPE_RATES.map((rate) => (
                <li key={rate.slug}>
                  <span>
                    {rate.name}
                    <small className="muted"> {rate.note}</small>
                  </span>
                  <strong>{rate.amount}</strong>
                  <a className="btn btn-outline" href={rate.href} rel="noreferrer" target="_blank">
                    {rate.cta}
                  </a>
                </li>
              ))}
            </ul>
            <p className="fine">
              Paid on Stripe. No contract. The 10-hour pack works out to $125 an hour.
            </p>
          </article>
          <p className="fine" style={{ marginTop: 18 }}>
            How do these rates compare? See{" "}
            <Link to={CONSULT_COST_PATH}>what an AI consultant costs</Link>, with the ranges other firms publish.
          </p>
          <div className="continuity-bridge">
            <p>
              Need someone every month? <Link to={CONCIERGE_PATH}>{CONCIERGE_NAME}</Link> is the {CONCIERGE_PRICE}{" "}
              retainer. Need an after-hours phone desk instead? <a href={FD_URL}>{FD_NAME}</a> is {FD_PRICE}.
            </p>
            <Link className="btn btn-outline" to={CONCIERGE_PATH}>
              See the monthly retainer
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="faq">
        <div className="container">
          <div className="section-head">
            <h2>Questions owners ask</h2>
          </div>
          <FaqList items={CONSULT_FAQS} />
        </div>
      </section>

      <section className="section" id="ai-consultant-cost">
        <div className="container">
          <p>
            AI consulting from Palm Coast, Florida (Flagler County), by video for owners anywhere in the US. Read{" "}
            <Link to={CONSULT_COST_PATH}>what an AI consultant costs</Link> before you book. Related:{" "}
            <Link to={CONCIERGE_PATH}>{CONCIERGE_NAME}</Link>, a{" "}
            <a href="https://ainexus360.com/">fixed-fee audit</a> at AI Nexus 360,{" "}
            <a href="https://infrastructure.agenthiveinc.com/">telco and network work</a> at Seat &amp; Circuit, and{" "}
            <Link to="/concierge/vs-hiring">Concierge vs hiring</Link>.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container cta-split">
          <div>
            <div className="eyebrow">{BOOK_CTA_LABEL}</div>
            <h2 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}>
              Bring one task.
              <br />
              <em>Leave with a plan.</em>
            </h2>
            <p className="lede">
              Thirty minutes, free. If AI can take the job, you will know what it costs to set up before you pay.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href={CALENDLY_URL} rel="noreferrer" target="_blank">
                {BOOK_CTA_LABEL}
              </a>
              <a className="btn btn-outline" href={`tel:${CONSULT_TEL}`}>
                Call {CONSULT_DISPLAY}
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
