import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";

const ACTS = [
  {
    act: "Act I",
    title: "Ship the marquee",
    body: "Flick is live. Record, publish, watch. The watch page has no login. That is the wedge, and it stays that way.",
  },
  {
    act: "Act II",
    title: "Sell founder seats",
    body: "Marquee is $99 once while it still feels like opening night. Cap the window by copy, not a fake countdown.",
  },
  {
    act: "Act III",
    title: "Default to Lights",
    body: "Lights at $19/month is the house seat. Street pass stays as a taste: one short publish. Every paid dollar is for the share link, never for the right to watch.",
  },
];

const CUE = [
  { n: "01", title: "Payments live", note: "Stripe Checkout is on. Watchers never see it. Street pass still works with no card." },
  { n: "02", title: "Founder blast", note: "Personal notes, not a product dump. One Flick that is the pitch. Link the Marquee card." },
  { n: "03", title: "Public board", note: "Home, Pricing, Launch, Marketing are the campaign. Product Hunt / X / communities get the same three sentences." },
  { n: "04", title: "Watch the gate", note: "Track publishes, checkout starts, paid licenses. If people download and never pay, the street pass is doing its job." },
];

export function Launch() {
  return (
    <Layout marquee>
      <p className="now-showing">Launch plan · opening night rundown</p>
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
        <p className="marquee-tag">THREE ACTS. NO FAKE TIMELINE.</p>
      </section>

      <ol className="program">
        {ACTS.map((a) => (
          <li key={a.act} className="program-act">
            <p className="kicker">{a.act}</p>
            <h2>{a.title}</h2>
            <p className="muted">{a.body}</p>
          </li>
        ))}
      </ol>

      <section className="cue-sheet">
        <h2 className="display">Cue sheet</h2>
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
          Open the payment gate
        </Link>
        <Link className="btn ghost billboard-btn" to="/marketing">
          Marketing plan
        </Link>
      </div>
    </Layout>
  );
}
