import { Link } from "react-router-dom";
import AskAiBar from "../components/AskAiBar";
import {
  BRAND_NAME,
  BRAND_URL,
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
  CONCIERGE_APPROVAL_LINE,
  CONCIERGE_BOOK_LABEL,
  CONCIERGE_NAME,
  CONCIERGE_PRICE,
  CONCIERGE_PRICE_AMOUNT,
  CONCIERGE_STRIPE_URL,
  CONCIERGE_URL,
  PILOT_BUY_LABEL,
  PILOT_BUY_URL,
  PILOT_MONTHLY_AMOUNT,
  PILOT_NAME,
  PILOT_PRICE,
  PILOT_SEATS,
  PILOT_SETUP_AMOUNT,
} from "../../shared/concierge";

const CONCIERGE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: `${BRAND_NAME} ${CONCIERGE_NAME}`,
  url: CONCIERGE_URL,
  image: `${BRAND_URL}/brand/consult-operator.jpg`,
  provider: {
    "@type": "Organization",
    name: BRAND_NAME,
    url: `${BRAND_URL}/`,
    email: CONTACT_EMAIL,
    telephone: "+1-320-335-6186",
  },
  description:
    "An always-on AI assistant for busy owners. It sorts the inbox, drafts replies, keeps the calendar and chases follow-ups. Nothing goes out without your approval.",
  offers: [
    {
      "@type": "Offer",
      name: CONCIERGE_NAME,
      price: CONCIERGE_PRICE_AMOUNT,
      priceCurrency: "USD",
      url: CONCIERGE_STRIPE_URL,
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: `${PILOT_NAME} (${PILOT_SEATS} seats)`,
      price: PILOT_SETUP_AMOUNT,
      priceCurrency: "USD",
      description: `${PILOT_PRICE}. Setup fee, then $${PILOT_MONTHLY_AMOUNT} per month.`,
      url: `${CONCIERGE_URL}#pilot`,
      availability: "https://schema.org/LimitedAvailability",
    },
  ],
};

export default function Concierge() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(CONCIERGE_SCHEMA) }} />
      <section className="hero consult-hero">
        <div className="hero-media">
          <img
            src="/brand/consult-operator.jpg"
            alt="Male founder-operator at the gold honeycomb boardroom — signet ring and bee tattoo"
          />
        </div>
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="dot" /> {CONCIERGE_NAME} · always-on AI assistant
          </div>
          <h1 className="display">
            Your inbox, calendar and follow-ups.
            <br />
            <em>Handled.</em>
          </h1>
          <p className="lede">
            An always-on AI assistant that works inside your business. It sorts your inbox, drafts replies in your
            voice, keeps your calendar and chases quotes and invoices. <strong>{CONCIERGE_APPROVAL_LINE}</strong> It
            drafts, flags and reminds. You tap yes.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href={CALENDLY_URL} rel="noreferrer" target="_blank">
              {CONCIERGE_BOOK_LABEL}
            </a>
            <a className="btn btn-outline" href="#pilot">
              {PILOT_NAME} · {PILOT_SEATS} seats
            </a>
          </div>
          <p className="fine">Connects to Gmail, Google Calendar, Stripe and your CRM.</p>
          <p className="fine">
            <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY}</a>
            {" · "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </div>
      </section>

      <AskAiBar />

      <section className="section" id="what">
        <div className="container">
          <div className="section-head">
            <h2>What it does every day.</h2>
            <p>It learns your prices, people, customers and the way you talk, so you stop explaining things twice.</p>
          </div>
          <div className="trust-grid">
            <article className="trust">
              <p className="eyebrow">Inbox</p>
              <h3>Sorted and drafted</h3>
              <p className="muted">“Needs you,” “drafted for you” and “FYI.” Replies are written in your voice, ready to approve.</p>
            </article>
            <article className="trust">
              <p className="eyebrow">Calendar</p>
              <h3>Kept for you</h3>
              <p className="muted">Finds open times, proposes them and books once you say yes.</p>
            </article>
            <article className="trust">
              <p className="eyebrow">Follow-ups</p>
              <h3>Chased on time</h3>
              <p className="muted">Quotes, invoices and “just checking in” notes get drafted on schedule instead of forgotten.</p>
            </article>
            <article className="trust">
              <p className="eyebrow">Answers</p>
              <h3>From your own records</h3>
              <p className="muted">Ask “what did we last tell the Johnsons?” and get it from your email, calendar, Stripe and CRM.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="pilot">
        <div className="container cta-split">
          <div>
            <div className="eyebrow">
              {PILOT_NAME} · {PILOT_SEATS} seats
            </div>
            <h2 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}>
              Your cell rings first.
              <br />
              <em>Whatever you miss, your chief of staff picks up.</em>
            </h2>
            <p className="lede">
              It texts you who called, what they want, and a reply ready to send, and it handles your inbox and
              calendar. Nothing goes out until you text YES.
            </p>
            <p className="lede">Works on any phone. One flat price, set up for you in 48 hours.</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href={PILOT_BUY_URL} rel="noreferrer" target="_blank">
                {PILOT_BUY_LABEL}
              </a>
            </div>
            <p className="fine">Limited to {PILOT_SEATS} pilot seats.</p>
          </div>
          <article className="rate-card">
            <p className="eyebrow">Pilot price</p>
            <p className="rate-amt">{PILOT_PRICE}</p>
            <p className="muted">One-time setup, then $299 a month. Set up for you in 48 hours.</p>
            <p className="muted">{CONCIERGE_NAME} stays at {CONCIERGE_PRICE}.</p>
          </article>
        </div>
      </section>

      <section className="section" id="day">
        <div className="container">
          <div className="section-head">
            <h2>A day with it.</h2>
            <p>For busy owner-operators with a full inbox.</p>
          </div>
          <div className="trust-grid bridge-grid">
            <article className="trust">
              <p className="eyebrow">Before</p>
              <p className="muted">
                You get back from job sites at 7 pm to 60 unread emails, three estimate requests and a supplier invoice
                you can’t find. Last week’s quotes never got a follow-up.
              </p>
            </article>
            <article className="trust">
              <p className="eyebrow">After</p>
              <p className="muted">
                By morning the inbox is sorted. Estimate replies are drafted with open times filled in, and older quotes
                have a follow-up waiting. You clear it all from your phone in 15 minutes.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="price">
        <div className="container cta-split">
          <div>
            <div className="eyebrow">{CONCIERGE_NAME}</div>
            <h2 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}>
              {CONCIERGE_PRICE}.
              <br />
              <em>Set up and tuned for you.</em>
            </h2>
            <p className="lede">
              Setup, connected tools and ongoing tuning are included. I run my own company this way every day, and I
              keep improving yours each month.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href={CALENDLY_URL} rel="noreferrer" target="_blank">
                {CONCIERGE_BOOK_LABEL}
              </a>
              <a className="btn btn-outline" href={CONCIERGE_STRIPE_URL} rel="noreferrer" target="_blank">
                Start {CONCIERGE_NAME} — {CONCIERGE_PRICE}
              </a>
            </div>
            <p className="fine">Stripe subscription. Recurring {CONCIERGE_PRICE}. Cancel any month after the first 30 days.</p>
          </div>
          <article className="rate-card">
            <p className="eyebrow">How we work together</p>
            <p className="rate-amt">{CONCIERGE_PRICE}</p>
            <p className="muted">Two 45-minute working sessions a month, plus text or Slack between them.</p>
            <p className="muted">{CONCIERGE_APPROVAL_LINE}</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Other options.</h2>
          </div>
          <div className="trust-grid bridge-grid">
            <article className="trust">
              <p className="eyebrow">{FD_NAME}</p>
              <h3>{FD_PRICE}</h3>
              <p className="muted">After-hours desk and a fixed deploy for field operators.</p>
              <a className="btn btn-outline" href={FD_URL} rel="noreferrer" target="_blank">
                {FD_NAME}
              </a>
            </article>
            <article className="trust">
              <p className="eyebrow">Hourly consult</p>
              <h3>{CONSULT_RATES}</h3>
              <p className="muted">Paid time, or a 10-hour pack at $1,250.</p>
              <Link className="btn btn-outline" to={HIVE_CONSULT_PATH}>
                See hourly consult
              </Link>
            </article>
          </div>
          <p className="fine" style={{ marginTop: 18 }}>
            <a href={CALENDLY_URL} rel="noreferrer" target="_blank">
              {CONCIERGE_BOOK_LABEL}
            </a>
            {" · "}
            <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY}</a>
            {" · "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </div>
      </section>
    </>
  );
}
