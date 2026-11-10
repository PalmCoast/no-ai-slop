import { Link } from "react-router-dom";
import AuthorCard from "../components/AuthorCard";
import FaqList from "../components/FaqList";
import { CONCIERGE_FAQS } from "../../shared/faqs";
import {
  BOOK_HREF,
  CONSULT_DISPLAY,
  CONSULT_RATES,
  CONSULT_TEL,
  FD_NAME,
  FD_AUDIT_URL,
  FD_URL,
  HIVE_CONSULT_PATH,
} from "../../shared/brand";
import {
  CONCIERGE_BOOK_LABEL,
  CONCIERGE_NAME,
  CONCIERGE_PRICE,
  CONCIERGE_STRIPE_URL,
} from "../../shared/concierge";

const STEPS = [
  { title: "Free call", body: "15 to 30 minutes by phone. We work out whether the retainer, hourly time or First Deploy AI fits your team." },
  { title: "Intake", body: "Before kickoff: where your leadership loses time, the tools you already pay for, and what’s worth fixing first." },
  { title: "Audit and optimize", body: "We screen-share the messy work live and cut the broken and duplicate steps first." },
  { title: "Automate", body: "We build it together in the session and log every piece in your shared inventory, so the work stays yours." },
];

const GOOD_FIT = [
  "You lead a funded team that pays for AI, and it isn’t showing up in the work yet.",
  "One or two jobs eat leadership’s week: sales follow-up, scheduling, handoffs between teams, reporting.",
  "You’ll show up to two working sessions a month and do the work in them.",
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
            A senior AI operator on retainer for your leadership team. Two working sessions a month, help between them, and
            finished work your team can point to. For funded teams that already pay for AI and want it to look as good as the
            rest of the company.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={CONCIERGE_STRIPE_URL} rel="noreferrer" target="_blank">
              Start {CONCIERGE_NAME} — {CONCIERGE_PRICE}
            </a>
            <a className="btn btn-outline" href={BOOK_HREF}>
              {CONCIERGE_BOOK_LABEL}
            </a>
          </div>
          <p className="fine">
            <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY}</a>
          </p>
        </div>
      </section>

      <section className="section" id="how">
        <div className="container">
          <div className="section-head">
            <h2>How it works.</h2>
            <p>Same order every month: look at the work, clean it up, then automate it. AI goes in only once the process deserves it.</p>
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
            <p>Protected time on the calendar, a direct line between sessions, and a growing list of assets your team keeps.</p>
          </div>
          <div className="trust-grid consult-offers">
            <article className="trust">
              <p className="eyebrow">Sessions</p>
              <h3>2 × 45 minutes</h3>
              <p className="muted">Two working sessions a month by video call, screen-share. You leave with something usable the same day.</p>
            </article>
            <article className="trust">
              <p className="eyebrow">Between calls</p>
              <h3>Unlimited async</h3>
              <p className="muted">Message or text while the question is in front of you. A direct line, not a ticket queue.</p>
            </article>
            <article className="trust">
              <p className="eyebrow">The hub</p>
              <h3>Shared asset inventory</h3>
              <p className="muted">One shared hub with links, the schedule and a running list of every skill, automation and asset we build.</p>
            </article>
            <article className="trust">
              <p className="eyebrow">Before kickoff</p>
              <h3>Intake</h3>
              <p className="muted">Where time goes, the tools you already pay for, and the process list, so the first session starts on what matters most.</p>
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
              You’re not buying hours. You’re buying two working sessions a month that make the AI work ship, and a running
              list of assets your team won’t want to give up. Six seats, so every session gets full attention.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href={CONCIERGE_STRIPE_URL} rel="noreferrer" target="_blank">
                Start {CONCIERGE_NAME} — {CONCIERGE_PRICE}
              </a>
              <a className="btn btn-outline" href={BOOK_HREF}>
                {CONCIERGE_BOOK_LABEL}
              </a>
            </div>
            <p className="fine">Stripe subscription. Recurring {CONCIERGE_PRICE}. Cancel any month after the first 30 days.</p>
          </div>
          <article className="rate-card">
            <p className="eyebrow">Who it’s for</p>
            <p className="rate-amt">{CONCIERGE_PRICE}</p>
            <p className="muted">
              Founders, executives and department leads at funded teams of 30 to 200 who already pay for AI and want more to
              show for it. The work that eats the week, like sales follow-up, scheduling, handoffs between teams and reporting,
              gets done properly. You get a partner on the calls, not a PDF of prompts.
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
            <h2>What {CONCIERGE_PRICE} includes.</h2>
            <p>One price, on this page. We don’t quote anyone else’s rate.</p>
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
                    2 × 45-minute working sessions, unlimited async help between them, a shared asset inventory. Cancel any
                    month after the first 30 days.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="fine" style={{ marginTop: 12 }}>
            Against a full-time
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
            <a className="btn btn-outline" href={BOOK_HREF}>
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
              {FD_NAME} and the hourly packs stay open. The free call is where we tell you which one fits. We won’t push
              the retainer.
            </p>
          </div>
          <div className="trust-grid bridge-grid">
            <article className="trust">
              <p className="eyebrow">{FD_NAME}</p>
              <h3>$150 burn-audit hour</h3>
              <p className="muted">
                Find what’s burning your team’s AI agent spend first. Then the $1,250 operator pack ($625 deposit), or
                this retainer.
              </p>
              <a className="btn btn-outline" href={FD_AUDIT_URL} rel="noopener">
                Book the $150 hour
              </a>
            </article>
            <article className="trust">
              <p className="eyebrow">Hourly consult</p>
              <h3>{CONSULT_RATES}</h3>
              <p className="muted">Paid time, or a 10-hour pack at $1,250, when you don’t need a monthly rhythm.</p>
              <Link className="btn btn-outline" to={HIVE_CONSULT_PATH}>
                See hourly consult
              </Link>
            </article>
          </div>
          <p className="fine" style={{ marginTop: 18 }}>
            <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY}</a>
            {" · "}
            <a href={BOOK_HREF}>
              Free 15–30 minute bottleneck call
            </a>
          </p>
          <p style={{ marginTop: 18 }}>
            Compare this retainer with a full-time hire on{" "}
            <Link to="/concierge/vs-hiring">Concierge vs hiring</Link>. Hourly time stays on{" "}
            <Link to={HIVE_CONSULT_PATH}>consult</Link>. Want to find what’s burning your AI agent spend first? Start with the{" "}
            <a href={FD_URL}>{FD_NAME}</a> $150 burn-audit hour.
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
