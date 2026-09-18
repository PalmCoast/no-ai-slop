import AskAiBar from "../components/AskAiBar";

export default function About() {
  return (
    <>
      <section className="section">
        <div className="container portrait-grid">
          <div className="frame">
            <img src="/brand/queen-portrait.jpg" alt="AgentHive queen — gold honeycomb crown and armor" />
          </div>
          <div>
            <div className="eyebrow">Florida LLC · Est. 2025 · Palm Coast</div>
            <h1 className="display" style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)" }}>
              We ship the thing
              <br />
              <em>you can sell.</em>
            </h1>
            <p className="lede">
              AgentHive is an AI-native product studio. Daniel Graham embeds working AI in real operations — prompts,
              stack, and hard code — then leaves it running. First Deploy is the product. Consulting is how you buy time
              in the room.
            </p>
            <p className="muted">
              Proof: live apps inside commercial field ops, a public Netlify portfolio, and a swarm that still answers
              the phone at <a href="tel:+15093572230">(509) 357-2230</a>.
            </p>
          </div>
        </div>
      </section>

      <AskAiBar />

      <section className="section section-alt">
        <div className="container">
          <div className="trust-grid">
            {[
              ["Live", "Shipped to production, not a slide"],
              ["2025", "Founded"],
              ["FL", "Palm Coast, Florida"],
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

      <section className="section">
        <div className="container cta-split">
          <article className="panel">
            <p className="eyebrow">DG</p>
            <h2>Daniel Graham</h2>
            <p className="role">Chairman & Founder</p>
            <p style={{ marginTop: 12 }}>
              25 years of enterprise IT across Eli Lilly, Humana, and Southwire. SAFe 5.1 certified. Built AgentHive on
              a simple rule: AI should ship, earn, and solve a real leak — not sit in a deck.
            </p>
            <p className="muted" style={{ marginTop: 12 }}>
              Philosophy: Ship fast. Learn in public. Build AI that earns while you sleep. No lock-in, no fluff, no free
              audits.
            </p>
            <div className="hero-actions" style={{ marginTop: 18 }}>
              <a className="btn btn-primary" href="https://hire-daniel-graham.netlify.app/">
                Hire Daniel
              </a>
              <a className="btn btn-outline" href="https://firstdeploy.ai/consult">
                Book a discovery call
              </a>
            </div>
          </article>
          <article className="panel">
            <h2>The AI-native desk</h2>
            <p className="muted" style={{ margin: "0.6rem 0 1rem" }}>
              Human founder. Four Grok executives with named inboxes. Daniel signs every contract.
            </p>
            <ul className="takeaways">
              <li>Alder, CEO — alder@agenthiveinc.com</li>
              <li>Sol, CPO/CTO — sol@agenthiveinc.com</li>
              <li>Grok, CMO (xAI) — grok@agenthiveinc.com</li>
              <li>Ivy, Chief of Staff — ivy@agenthiveinc.com</li>
              <li>Daniel Graham — daniel@agenthiveinc.com</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container cta-split">
          <div>
            <h2>What the hive is building now</h2>
            <p className="muted" style={{ margin: "0.8rem 0 1rem" }}>
              HiveBriefcase is portable identity and micropayments for agents: W3C DIDs, verifiable credentials, encrypted
              vault, Base L2 settlement. Bot Lock is the control plane. First Deploy is the cash product.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="https://hivebriefcase.netlify.app/">
                HiveBriefcase
              </a>
              <a className="btn btn-outline" href="https://bot-lock.netlify.app/">
                Bot Lock
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
