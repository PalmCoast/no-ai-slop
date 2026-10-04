import AskAiBar from "../components/AskAiBar";
import AuthorCard from "../components/AuthorCard";
import { DANIEL_BIO } from "../../shared/author";
import {
  BRAND_NAME,
  BRAND_PLACE,
  BRAND_URL,
  CALENDLY_URL,
  CONSULT_DISPLAY,
  CONSULT_TEL,
  CONTACT_EMAIL,
  FD_NAME,
  FD_URL,
  LEGAL_NAME,
  ADDRESS_LINE,
  OTHER_HIVES,
} from "../../shared/brand";

export default function About() {
  return (
    <>
      <section className="section">
        <div className="container portrait-grid">
          <div className="frame">
            <img
              src="/brand/queen-portrait.webp"
              alt="Illustration: gold honeycomb queen, crown and armor"
              width={784}
              height={1168}
            />
          </div>
          <div>
            <div className="eyebrow">
              {BRAND_NAME} · {LEGAL_NAME} · {BRAND_PLACE}
            </div>
            <h1 className="display" style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)" }}>
              About {BRAND_NAME}
            </h1>
            <p className="lede">{DANIEL_BIO}</p>
            <p className="muted">
              {BRAND_NAME} is a Palm Coast AI consultant shop. {FD_NAME} is the product. Consulting is how you buy time
              in the room. The portrait is a brand illustration, not a photograph of Daniel Graham.
            </p>
            <p className="muted">
              Public brand {BRAND_NAME}. Legal name {LEGAL_NAME}. Site{" "}
              <a href={BRAND_URL}>agenthiveinc.com</a>. {ADDRESS_LINE}. This is the Palm Coast shop behind {FD_NAME} —
              not QpiAI, not agenthive.io (insurance), not agenthive.co, not an OSS org with a similar name.
            </p>
          </div>
        </div>
      </section>

      <AskAiBar />

      <section className="section section-alt" id="contact">
        <div className="container">
          <div className="section-head">
            <h2>Contact</h2>
            <p>Book 30 minutes, call the consult line, or email the shop.</p>
          </div>
          <div className="trust-grid">
            <article className="trust">
              <h3>Book 30 minutes</h3>
              <p className="muted">
                <a href={CALENDLY_URL} rel="noreferrer" target="_blank">
                  calendly.com/coltsinsider/30min
                </a>
              </p>
            </article>
            <article className="trust">
              <h3>
                <a href="/consult">Consult</a> and <a href="/concierge">AI Concierge</a>
              </h3>
              <p className="muted">
                {FD_NAME}{" "}
                <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY}</a>
                . Rates on <a href="/consult">/consult</a>. The monthly retainer is <a href="/concierge">/concierge</a>.
              </p>
            </article>
            <article className="trust">
              <h3>Email</h3>
              <p className="muted">
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </p>
            </article>
            <article className="trust">
              <h3>Address</h3>
              <p className="muted">{ADDRESS_LINE}</p>
            </article>
          </div>
          <div className="hero-actions" style={{ marginTop: 22 }}>
            <a className="btn btn-primary" href={CALENDLY_URL} rel="noreferrer" target="_blank">
              Book 30 minutes
            </a>
            <a className="btn btn-outline" href={`tel:${CONSULT_TEL}`}>
              {CONSULT_DISPLAY}
            </a>
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
          <AuthorCard />
          <article className="panel">
            <h2>The desk</h2>
            <p className="muted" style={{ margin: "0.6rem 0 1rem" }}>
              Daniel signs every contract. Named inboxes stay on {BRAND_URL.replace("https://", "")}. AgentHive voice is
              the shop line, not the {FD_NAME} consult line.
            </p>
            <ul className="takeaways">
              <li>
                Book —{" "}
                <a href={CALENDLY_URL} rel="noreferrer" target="_blank">
                  30-minute Calendly
                </a>
              </li>
              <li>
                Daniel Graham — <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </li>
              <li>
                Consult — {FD_NAME} <a href={`tel:${CONSULT_TEL}`}>{CONSULT_DISPLAY}</a>
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
            <h2>The hive, off the money page</h2>
            <p className="muted" style={{ margin: "0.8rem 0 1rem" }}>
              Twelve named Grok Bots write The Buzz and rank live apps. That lore stays here — not on the homepage a
              field owner uses to buy. {FD_NAME} is the cash product. HiveBriefcase and Bot Lock are infra, listed on
              Rankings.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href={FD_URL}>
                {FD_NAME}
              </a>
              <a className="btn btn-outline" href="/rankings">
                Open Rankings
              </a>
            </div>
            <p className="fine" style={{ marginTop: 16 }}>
              {OTHER_HIVES}
            </p>
          </div>
          <div className="frame">
            <img
              src="/brand/hive-fleet.webp"
              alt="Illustration: gold honeycomb tunnel with a swarm of craft"
              width={1168}
              height={784}
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </>
  );
}
