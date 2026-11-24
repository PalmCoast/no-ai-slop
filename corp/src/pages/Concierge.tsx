import { Link } from "react-router-dom";
import AuthorCard from "../components/AuthorCard";
import FaqList from "../components/FaqList";
import { CONCIERGE_FAQS } from "../../shared/faqs";
import { BOOK_HREF, CONSULT_TEL, PHONE_DISPLAY, FD_NAME, FD_URL, HIVE_CONSULT_PATH } from "../../shared/brand";
import { CONCIERGE_BOOK_LABEL, CONCIERGE_NAME, CONCIERGE_PRICE, CONCIERGE_GO_HREF } from "../../shared/concierge";

const STEPS = [
  { title: "Free triage", body: "15 minutes. We look at your bill and your stack and tell you whether to start with the sprint or go straight to the retainer." },
  { title: "Stabilize first", body: "Most teams start with the $2,500 sprint so the retainer begins on a clean, inventoried stack." },
  { title: "Monitoring goes live", body: "Spend and failure alerts on every agent, routine and key we inventoried, routed to us and to the owner you name." },
  { title: "Every month", body: "We fix what breaks, cut what creeps back, and send a spend and reliability report your leadership can read." },
];

const INCLUDED = [
  { k: "Monitoring", h: "Spend and failures", p: "We watch agent spend, failed runs, loops and retries across the stack we inventoried, every business day." },
  { k: "Response", h: "1 business day", p: "Anything we flag or you send gets a reply within 1 business day. Spend spikes and broken production jobs go first." },
  { k: "Reporting", h: "Monthly report", p: "Spend by agent and by team, what failed and why, what we changed, and what we recommend next." },
  { k: "Between reports", h: "Async help", p: "Questions by message or email while they are in front of you. A direct line to the person who did the work, not a ticket queue." },
];

const GOOD_FIT = [
  "You run AI agents, coding assistants or scheduled routines across a team of 30 to 200.",
  "Your AI bill moved last quarter and nobody can say exactly why.",
  "You want one accountable person watching spend and failures, without hiring a full-time AI ops lead.",
  "You want changes approved by your team, not made behind your back.",
];

const NOT_A_FIT = [
  "You want unlimited custom software built. That is a scoped build.",
  "You want a 24/7 pager. Our response time is 1 business day.",
  "You need someone to staff your team or sit in your office.",
  "You only want a one-time clean-up. The $2,500 sprint is the right buy.",
];

function StartButton({ from, label }: { from: string; label: string }) {
  return (
    <a
      className="btn btn-primary"
      href={CONCIERGE_GO_HREF}
      data-product="retainer3500"
      data-utm-source="dir"
      data-utm-medium="page"
      data-utm-content={from}
    >
      {label}
    </a>
  );
}

export default function Concierge() {
  return (
    <>
      <section className="hero consult-hero">
        <div className="hero-media">
          <img src="/brand/consult-operator.webp" alt="Illustration: gold honeycomb boardroom" width={1400} height={930} />
        </div>
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="dot" /> {CONCIERGE_NAME} · {CONCIERGE_PRICE}
          </div>
          <h1 className="display" style={{ fontSize: "clamp(1.85rem, 4.2vw, 3.1rem)", lineHeight: 1.12 }}>Someone watching your AI spend and failures, every business day.</h1>
          <p className="lede">
            For CTOs and COOs at funded teams of 30 to 200. Daniel Graham monitors your agents, routines and keys, answers
            within 1 business day, and sends a monthly report. Fractional AI ops for less than a part-time hire.
          </p>
          <div className="hero-actions">
            <StartButton from="ah-retainer-hero" label={`Start the retainer, ${CONCIERGE_PRICE}`} />
            <a className="btn btn-outline" href={BOOK_HREF}>
              {CONCIERGE_BOOK_LABEL}
            </a>
          </div>
          <p className="fine">
            70+ live AI apps in production. Month to month. Demo line <a href={`tel:${CONSULT_TEL}`}>{PHONE_DISPLAY}</a>.
          </p>
        </div>
      </section>

      <section className="section" id="included">
        <div className="container">
          <div className="section-head">
            <h2>What you get.</h2>
            <p>Active monitoring with a defined response time, not two calls a month.</p>
          </div>
          <div className="trust-grid consult-offers">
            {INCLUDED.map((item) => (
              <article key={item.h} className="trust">
                <p className="eyebrow">{item.k}</p>
                <h3>{item.h}</h3>
                <p className="muted">{item.p}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" id="how">
        <div className="container">
          <div className="section-head">
            <h2>How it works.</h2>
            <p>Stabilize once, then keep it stable.</p>
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
              You’re not buying hours. You’re buying an operator who owns the bill and the failures, with a response time in
              writing.
            </p>
            <div className="hero-actions">
              <StartButton from="ah-retainer-price" label={`Start the retainer, ${CONCIERGE_PRICE}`} />
              <Link className="btn btn-outline" to={HIVE_CONSULT_PATH}>
                Start with the $2,500 sprint
              </Link>
            </div>
            <p className="fine">Stripe subscription, billed monthly. Cancel any month.</p>
          </div>
          <article className="rate-card">
            <p className="eyebrow">Who it’s for</p>
            <p className="rate-amt">{CONCIERGE_PRICE}</p>
            <p className="muted">
              Engineering and operations leaders at funded teams of 30 to 200 who already pay for models, seats and agents and
              want one person accountable for what they cost and whether they work.
            </p>
            <p className="muted">Not included: unlimited custom software, a 24/7 pager, or staffing your team.</p>
          </article>
        </div>
      </section>

      <section className="section section-alt" id="fit">
        <div className="container">
          <div className="trust-grid bridge-grid">
            <article className="trust">
              <p className="eyebrow">Good fit</p>
              <ul className="cost-list">
                {GOOD_FIT.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="trust">
              <p className="eyebrow">Not a fit</p>
              <ul className="cost-list">
                {NOT_A_FIT.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
          <p className="fine" style={{ marginTop: 18 }}>
            Weighing it against a full-time hire? See <Link to="/concierge/vs-hiring">the retainer vs hiring</Link>. The same
            ladder runs on <a href={FD_URL}>{FD_NAME}</a>.
          </p>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="container">
          <div className="section-head">
            <h2>Questions</h2>
          </div>
          <FaqList items={CONCIERGE_FAQS} />
          <AuthorCard />
        </div>
      </section>
    </>
  );
}
