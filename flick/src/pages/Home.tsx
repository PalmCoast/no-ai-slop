import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { BuyButtons } from "../components/BuyButtons";

export function Home() {
  return (
    <Layout marquee>
      <p className="now-showing">Watch is free · you pay to publish</p>
      <section className="billboard" aria-label="Flick intro">
        <div className="chaser" aria-hidden="true">
          {Array.from({ length: 48 }, (_, i) => (
            <i key={i} style={{ animationDelay: `${(i % 8) * 0.12}s` }} />
          ))}
        </div>
        <p className="kicker lights-kicker">Async video · no account to watch</p>
        <h1 className="marquee-title">
          <span>FLICK</span>
        </h1>
        <p className="marquee-tag">SKIP THE MEETING.</p>
        <p className="lede billboard-lede">
          Record your screen, talk over it, send a link. They hit play when they have five minutes. Watch is always
          free. Publishing a share link is Lights or Marquee.
        </p>
        <div className="hero-actions">
          <Link className="btn amber billboard-btn" to="/record">
            Record a Flick
          </Link>
          <Link className="btn ghost billboard-btn" to="/pricing">
            See pricing
          </Link>
        </div>
      </section>

      <section className="doors" aria-label="Site sections">
        <Link className="door gold" to="/pricing">
          <span className="door-label">01</span>
          <h2>Pricing</h2>
          <p>Street is one short publish. Lights is $19/month. Marquee is $99 once. Watchers never pay.</p>
          <span className="door-cta">See plans →</span>
        </Link>
        <Link className="door" to="/marketing">
          <span className="door-label">02</span>
          <h2>Marketing plan</h2>
          <p>The wedge is free watching. The campaign is “skip the meeting.” Copy, channels, and the launch week board.</p>
          <span className="door-cta">Read the campaign →</span>
        </Link>
        <Link className="door" to="/launch">
          <span className="door-label">03</span>
          <h2>Launch plan</h2>
          <p>Ship the product, sell Marquee, then default to Lights. A checklist, not a spreadsheet.</p>
          <span className="door-cta">Open the rundown →</span>
        </Link>
      </section>

      <section className="pillars">
        <article className="card">
          <h3>Record in the browser</h3>
          <p className="muted">Screen, camera, or both. A camera bubble sits on the recording. No extension. No desktop app.</p>
        </article>
        <article className="card">
          <h3>Publish a link</h3>
          <p className="muted">That is what you pay for. Street: one clip, two minutes. Lights and Marquee: fifteen minutes, unlimited links.</p>
        </article>
        <article className="card">
          <h3>They hit play</h3>
          <p className="muted">The watch page is a player with speed control. No signup wall, no “request access.” That is the product.</p>
        </article>
      </section>

      <section className="underbill" id="lights">
        <p className="kicker">Plans</p>
        <h2 className="display">Pay to publish.</h2>
        <p className="muted">Download is always free. Paying buys the share link, not the right to watch someone else’s Flick.</p>
        <BuyButtons size="huge" />
      </section>
    </Layout>
  );
}
