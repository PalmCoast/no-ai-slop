import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";

const STEPS = [
  {
    step: "01",
    title: "Ship the product",
    body: "Flick is live. Record, publish, watch. The watch page has no login. That is the wedge, and it stays that way.",
  },
  {
    step: "02",
    title: "Sell Marquee",
    body: "Marquee is $99 once while founder pricing is still up. Cap the window by copy, not a fake countdown.",
  },
  {
    step: "03",
    title: "Default to Lights",
    body: "Lights at $19/month is the default paid plan. Street stays as a taste: one short publish. Every paid dollar is for the share link, never for the right to watch.",
  },
];

const CUE = [
  { n: "01", title: "Payments live", note: "Stripe Checkout is on. Watchers never see it. Street still works with no card." },
  { n: "02", title: "Founder blast", note: "Personal notes, not a product dump. One Flick that is the pitch. Link the Marquee card." },
  { n: "03", title: "Public board", note: "Home, Pricing, Launch, Marketing are the campaign. Product Hunt / X / communities get the same three sentences." },
  { n: "04", title: "Watch conversions", note: "Track publishes, checkout starts, paid licenses. If people download and never pay, Street is doing its job." },
];

export function Launch() {
  return (
    <Layout marquee>
      <p className="now-showing">Launch plan · how we ship</p>
      <section className="billboard compact">
        <div className="chaser" aria-hidden="true">
          {Array.from({ length: 40 }, (_, i) => (
            <i key={i} style={{ animationDelay: `${(i % 8) * 0.12}s` }} />
          ))}
        </div>
        <p className="kicker lights-kicker">Rundown</p>
        <h1 className="marquee-title smaller">
          <span>LAUNCH</span>
        </h1>
        <p className="marquee-tag">THREE STEPS. NO FAKE TIMELINE.</p>
      </section>

      <ol className="program">
        {STEPS.map((a) => (
          <li key={a.step} className="program-act">
            <p className="kicker">{a.step}</p>
            <h2>{a.title}</h2>
            <p className="muted">{a.body}</p>
          </li>
        ))}
      </ol>

      <section className="cue-sheet">
        <h2 className="display">Checklist</h2>
        <div className="cue-grid">
          {CUE.map((c) => (
            <article key={c.n} className="card">
              <p className="kicker">{c.n}</p>
              <h3>{c.title}</h3>
              <p className="muted">{c.note}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="hero-actions">
        <Link className="btn amber billboard-btn" to="/pricing">
          See pricing
        </Link>
        <Link className="btn ghost billboard-btn" to="/marketing">
          Marketing plan
        </Link>
      </div>
    </Layout>
  );
}
