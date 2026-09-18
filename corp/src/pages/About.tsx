import AskAiBar from "../components/AskAiBar";
import {
  BRAND_NAME,
  BRAND_PLACE,
  BRAND_URL,
  CONSULT_DISPLAY,
  CONSULT_TEL,
  CONTACT_EMAIL,
  FD_CONSULT_URL,
  FD_NAME,
  LEGAL_NAME,
  ADDRESS_LINE,
  VOICE_DISPLAY,
  VOICE_TEL,
} from "../../shared/brand";

export default function About() {
  return (
    <>
      <section className="section">
        <div className="container portrait-grid">
          <div className="frame">
            <img src="/brand/queen-portrait.jpg" alt="AgentHive Inc queen — gold honeycomb crown and armor" />
          </div>
          <div>
            <div className="eyebrow">
              {BRAND_NAME} · {LEGAL_NAME} · {BRAND_PLACE}
            </div>
            <h1 className="display" style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)" }}>
              About {BRAND_NAME}
            </h1>
            <p className="lede">
              {BRAND_NAME} is a Palm Coast AI consultant shop. Daniel Graham embeds working AI in real operations —
              prompts, stack, and hard code — then leaves it running. {FD_NAME} is the product. Consulting is how you
              buy time in the room.
            </p>
            <p className="muted">
              Legal name {LEGAL_NAME}. Public site{" "}
              <a href={BRAND_URL}>agenthiveinc.com</a>. {ADDRESS_LINE}.
            </p>
          </div>
        </div>
      </section>

      <AskAiBar />

      <section className="section section-alt" id="contact">
        <div className="container">
          <div className="section-head">
            <h2>Contact</h2>
            <p>Email, the consult line, and the Palm Coast shop address.</p>
          </div>
          <div className="trust-grid">
            <article className="trust">
              <h3>Email</h3>
              <p className="muted">
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </p>
            </article>
            <article className="trust">
              <h3>Consult</h3>
              <p className="muted">
                {FD_NAME}{" "}
                <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY}</a>
              </p>
            </article>
            <article className="trust">
              <h3>AgentHive voice</h3>
              <p className="muted">
                <a href={`tel:${VOICE_TEL}`}>{VOICE_DISPLAY}</a>
              </p>
            </article>
            <article className="trust">
              <h3>Address</h3>
              <p className="muted">{ADDRESS_LINE}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="trust-grid">
            {[
              ["Live", "Shipped to production"],
              ["2025", "Founded"],
              ["FL", BRAND_PLACE],
              ["25yr", "Enterprise IT behind it"],
            ].map(([k, v]) => (
              <article key={k} className="trust">
                <h2 style={{ color: "var(--gold)" }}>{k}</h2>
                <p className="muted">{v}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container cta-split">
          <article className="panel">
            <p className="eyebrow">DG</p>
            <h2>Daniel Graham</h2>
            <p className="role">Chairman & Founder</p>
            <p style={{ marginTop: 12 }}>
              25 years of enterprise IT across Eli Lilly, Humana, and Southwire. SAFe 5.1 certified. Built {BRAND_NAME}{" "}
              on a simple rule: AI should ship, earn, and solve a real leak.
            </p>
            <p className="muted" style={{ marginTop: 12 }}>
              Philosophy: Ship fast. Learn in public. Build AI that earns while you sleep. No lock-in, no fluff, no free
              audits.
            </p>
            <div className="hero-actions" style={{ marginTop: 18 }}>
              <a className="btn btn-primary" href={FD_CONSULT_URL}>
                Book a discovery call
              </a>
              <a className="btn btn-outline" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
            </div>
          </article>
          <article className="panel">
            <h2>The desk</h2>
            <p className="muted" style={{ margin: "0.6rem 0 1rem" }}>
              Human founder. Daniel signs every contract. Named inboxes stay on {BRAND_URL.replace("https://", "")}.
            </p>
            <ul className="takeaways">
              <li>
                Daniel Graham — <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </li>
              <li>
                Consult — {FD_NAME} <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY}</a>
              </li>
              <li>
                AgentHive voice — <a href={`tel:${VOICE_TEL}`}>{VOICE_DISPLAY}</a>
              </li>
              <li>Alder, CEO — alder@agenthiveinc.com</li>
              <li>Sol, CPO/CTO — sol@agenthiveinc.com</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container cta-split">
          <div>
            <h2>What {BRAND_NAME} is building now</h2>
            <p className="muted" style={{ margin: "0.8rem 0 1rem" }}>
              {FD_NAME} is the cash product. HiveBriefcase is portable identity and micropayments for agents. Bot Lock is
              the control plane.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="https://firstdeploy.ai/">
                {FD_NAME}
              </a>
              <a className="btn btn-outline" href="https://hivebriefcase.netlify.app/">
                HiveBriefcase
              </a>
            </div>
          </div>
          <div className="frame">
            <img src="/brand/hive-fleet.jpg" alt="Gold honeycomb tunnel with a swarm of craft" />
          </div>
        </div>
      </section>
    </>
  );
}
