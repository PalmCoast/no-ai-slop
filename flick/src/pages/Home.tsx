import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";

export function Home() {
  return (
    <Layout>
      <section className="hero">
        <div>
          <p className="kicker">Async video</p>
          <h1>Skip the meeting.</h1>
          <p className="lede">
            Record your screen, talk over it, and send a link. The other person watches when they have five minutes. No account
            to view, no extension, no calendar invite.
          </p>
          <div className="hero-actions">
            <Link className="btn amber big" to="/record">
              Record a Flick
            </Link>
            <Link className="btn ghost" to="/library">
              Open library
            </Link>
          </div>
          <p className="fine">Runs in Chrome, Edge, or Firefox. Screen, camera, or a demo scene if you just want to try the share link.</p>
        </div>
        <div className="product" aria-hidden="true">
          <div className="product-stage">
            <div className="word">Draft for design</div>
            <div className="orb" />
          </div>
          <div className="product-bar">
            <span className="rec-dot" />
            <span>0:12</span>
            <span>Screen + camera</span>
          </div>
        </div>
      </section>
      <section className="pillars">
        <article className="card">
          <h3>Record in the browser</h3>
          <p className="muted">Screen, camera, or both. A camera bubble sits on the recording. Mic meter so you know they will hear you.</p>
        </article>
        <article className="card">
          <h3>Copy a link</h3>
          <p className="muted">Upload is chunked to Netlify Blobs. You get a short URL. Download the file locally either way.</p>
        </article>
        <article className="card">
          <h3>They hit play</h3>
          <p className="muted">The watch page is a player with speed control. No signup wall, no “request access.”</p>
        </article>
      </section>
    </Layout>
  );
}
