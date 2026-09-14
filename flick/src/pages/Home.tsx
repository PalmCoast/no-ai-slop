import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { BuyButtons } from "../components/BuyButtons";

export function Home() {
  return (
    <Layout marquee>
      <p className="now-showing">Now showing · useflick.netlify.app</p>
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
          Record your screen, talk over it, send a link. They hit play when they have five minutes. Watching is always
          free. You pay to publish — Lights or Marquee.
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

      <section className="pillars">
        <article className="card">
          <h3>Record in the browser</h3>
          <p className="muted">Screen, camera, or both. A camera bubble sits on the recording. No extension. No desktop app.</p>
        </article>
        <article className="card">
          <h3>Publish a link</h3>
          <p className="muted">Street: one short clip. Lights $19/mo and Marquee $99 once unlock longer publishes and unlimited share links.</p>
        </article>
        <article className="card">
          <h3>They hit play</h3>
          <p className="muted">The watch page is a player with speed control. No signup wall, no “request access.” That is the product.</p>
        </article>
      </section>

      <section className="underbill" id="lights">
        <p className="kicker">Upgrade to publish</p>
        <h2 className="display">Publish your next Flick.</h2>
        <p className="muted">Download is always free. Paying buys the share link — watchers never pay.</p>
        <BuyButtons size="huge" />
      </section>
    </Layout>
  );
}
