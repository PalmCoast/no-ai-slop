import { Link } from "react-router-dom";
import AuthorCard from "../components/AuthorCard";
import FaqList from "../components/FaqList";
import { CONCIERGE_FAQS } from "../../shared/faqs";
import {
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
  CONCIERGE_COMPARE_CHECKED,
  CONCIERGE_PUBLISHED,
  CONCIERGE_STRIPE_URL,
} from "../../shared/concierge";

const STEPS = [
  { title: "Free call", body: "15 to 30 minutes on Calendly. We find out whether a retainer, hourly time, or First Deploy AI fits." },
  { title: "Intake", body: "Before kickoff: your time sinks, your tool stack, and the processes worth fixing first." },
  { title: "Audit and optimize", body: "Screen-share the messy task live. Cut broken and duplicate steps before any model touches it." },
  { title: "Automate", body: "Build the projects, skills and workflows in the sessions, and log every one in your shared inventory." },
];

const GOOD_FIT = [
  "You own or run the business and tried ChatGPT or Claude, and it didn’t stick.",
  "One or two tasks eat the week: sales follow-up, quoting, scheduling, ops handoffs, reporting.",
  "You will show up to two working sessions a month and do the work in them.",
  "You want a partner on the calls, not a PDF of prompts.",
];

const NOT_A_FIT = [
  "You want custom software built without limit. That is a scoped build or First Deploy AI.",
  "You want an agency that runs it all without you on the calls.",
  "You need someone to staff your team or sit in your office.",
  "You only have a one-off question. Hourly consult is cheaper for that.",
];

export default function Concierge() {
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
            <span className="dot" /> {CONCIERGE_NAME} · {CONCIERGE_PRICE}
          </div>
          <h1 className="display">
            Two sessions.
            <br />
            <em>The work ships.</em>
          </h1>
          <p className="lede">
            A {CONCIERGE_PRICE} fractional AI advisor for owners who tried ChatGPT and it didn’t stick. We audit the
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

      <section className="section" id="how">
        <div className="container">
          <div className="section-head">
            <h2>How it works.</h2>
            <p>Audit, optimize, automate. Same order every month. AI comes after the process is worth automating.</p>
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

      <section className="section section-alt" id="included">
        <div className="container">
          <div className="section-head">
            <h2>What you get.</h2>
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

      <section className="section section-alt" id="compare">
        <div className="container">
          <div className="section-head">
            <h2>What {CONCIERGE_PRICE} gets you, next to published fractional AI prices.</h2>
            <p>
              Asking prices from each firm’s own page, checked {CONCIERGE_COMPARE_CHECKED}. {CONCIERGE_NAME} sits below
              the floor of both published retainers.
            </p>
          </div>
          <div className="table-wrap">
            <table className="cost-table">
              <thead>
                <tr>
                  <th scope="col">Who</th>
                  <th scope="col">Monthly price</th>
                  <th scope="col">What the price covers</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>AgentHive Inc {CONCIERGE_NAME}</strong>
                    <small>
                      <a href={CONCIERGE_STRIPE_URL} rel="noreferrer" target="_blank">
                        Start {CONCIERGE_NAME}
                      </a>
                    </small>
                  </td>
                  <td>
                    <strong>{CONCIERGE_PRICE}</strong>
                  </td>
                  <td>
                    2 × 45-minute working sessions, unlimited async Slack or text, a shared asset inventory. Cancel any
                    month after the first 30 days.
                  </td>
                </tr>
                {CONCIERGE_PUBLISHED.map((row) => (
                  <tr key={row.source}>
                    <td>
                      <strong>{row.source}</strong>
                      <small className="muted">
                        Source: {row.source} page, &ldquo;{row.page}&rdquo;, checked {CONCIERGE_COMPARE_CHECKED}
                      </small>
                      <small>
                        <a href={CALENDLY_URL} rel="noreferrer" target="_blank">
                          Book a free call with AgentHive
                        </a>
                      </small>
                    </td>
                    <td>{row.price}</td>
                    <td>{row.terms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="fine" style={{ marginTop: 12 }}>
            Prices can change. Hours and scope differ by firm, so compare what each price covers. Against a full-time
            hire, see <Link to="/concierge/vs-hiring">Concierge vs hiring</Link>.
          </p>
        </div>
      </section>

      <section className="section" id="fit">
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
          <div className="hero-actions" style={{ marginTop: 18 }}>
            <a className="btn btn-primary" href={CONCIERGE_STRIPE_URL} rel="noreferrer" target="_blank">
              Start {CONCIERGE_NAME} — {CONCIERGE_PRICE}
            </a>
            <a className="btn btn-outline" href={CALENDLY_URL} rel="noreferrer" target="_blank">
              {CONCIERGE_BOOK_LABEL}
            </a>
          </div>
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
          <p style={{ marginTop: 18 }}>
            Compare this retainer with a full-time hire on{" "}
            <Link to="/concierge/vs-hiring">Concierge vs hiring</Link>. Hourly time stays on{" "}
            <Link to={HIVE_CONSULT_PATH}>consult</Link>. Shops that need the after-hours desk can start at{" "}
            <a href={FD_URL}>{FD_NAME}</a>.
          </p>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="container">
          <div className="section-head">
            <h2>Concierge questions</h2>
          </div>
          <FaqList items={CONCIERGE_FAQS} />
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
