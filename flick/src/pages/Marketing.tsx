import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";

const PILLARS = [
  {
    title: "Promise",
    copy: "Skip the meeting. Record in the browser. Send a link. They watch when they have five minutes.",
  },
  {
    title: "Wedge",
    copy: "Watching is free forever and never asks for an account. Loom-class tools tax the viewer. Flick does not.",
  },
  {
    title: "Gate",
    copy: "You pay to publish, not to exist. Street pass is a taste. Lights is the house. Marquee is opening night.",
  },
];

const CHANNELS = [
  { name: "The pitch Flick", note: "One 90-second clip of the product, sent as the campaign. The medium is the message." },
  { name: "Founder notes", note: "Twenty people who run meetings they hate. Personal. Marquee link. No newsletter yet." },
  { name: "Public square", note: "X, Product Hunt, indie hacker threads. Same three sentences. Link the marquee, not a blog." },
  { name: "In the product", note: "Home is a billboard. Pricing, Launch, and Marketing are first-class routes, not PDFs." },
];

export function Marketing() {
  return (
    <Layout marquee>
      <p className="now-showing">Marketing plan · the campaign board</p>
      <section className="billboard compact">
        <div className="chaser" aria-hidden="true">
          {Array.from({ length: 40 }, (_, i) => (
            <i key={i} style={{ animationDelay: `${(i % 8) * 0.12}s` }} />
          ))}
        </div>
        <p className="kicker lights-kicker">Campaign</p>
        <h1 className="marquee-title smaller">
          <span>CAMPAIGN</span>
        </h1>
        <p className="marquee-tag">SKIP THE MEETING. SEND A FLICK.</p>
      </section>

      <section className="pillars">
        {PILLARS.map((p) => (
          <article key={p.title} className="card">
            <h3>{p.title}</h3>
            <p className="muted">{p.copy}</p>
          </article>
        ))}
      </section>

      <section>
        <h2 className="display">Who it is for</h2>
        <p className="lede">
          People who owe someone an explanation and do not want another calendar hold: founders, PMs, support leads, anyone
          who currently records a Loom and apologizes for the login wall on the other end.
        </p>
      </section>

      <section className="cue-sheet">
        <h2 className="display">Channels</h2>
        <div className="cue-grid">
          {CHANNELS.map((c) => (
            <article key={c.name} className="card">
              <h3>{c.name}</h3>
              <p className="muted">{c.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card copy-block">
        <p className="kicker">Steal this</p>
        <h2>Three sentences</h2>
        <blockquote>
          Flick is a Loom that does not make your viewer sign up. Record in the browser, send a link, they hit play. You pay
          for the publish. They never do.
        </blockquote>
      </section>

      <div className="hero-actions">
        <Link className="btn amber billboard-btn" to="/pricing">
          Payment gate
        </Link>
        <Link className="btn ghost billboard-btn" to="/launch">
          Launch rundown
        </Link>
      </div>
    </Layout>
  );
}
