import { FormEvent, useMemo, useState } from "react";
import AskAiBar from "../components/AskAiBar";
import { HIVE_BOTS, type HiveBot } from "../../shared/bots";
import { HIVE_SITES } from "../../shared/portfolio";

const TICKER = [
  "Grok drafted outreach sequence · 4 min ago",
  "Sol shipped landing page revision · 9 min ago",
  "Ivy triaged 47 inbox items · 14 min ago",
  "Alder closed 2 HubSpot deals · 21 min ago",
  "Mara updated forecast model · 28 min ago",
  "Grok booked 3 intro calls · 33 min ago",
  "Nova fixed Core Web Vitals · 41 min ago",
  "Hank caught a missed after-hours call · 52 min ago",
];

export default function Home() {
  const [bot, setBot] = useState<HiveBot | null>(null);
  const [goal, setGoal] = useState("");
  const [email, setEmail] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const featured = useMemo(() => HIVE_SITES.filter((s) => s.featured), []);

  async function assign(e: FormEvent) {
    e.preventDefault();
    if (!bot || !goal.trim()) return;
    setLog([
      `→ ${bot.name} received the goal`,
      `→ Planning across ${bot.tools.slice(0, 2).join(" + ")}`,
      `→ Mission queued to the hive`,
    ]);
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "mission",
          bot: bot.name,
          email,
          goal,
        }).toString(),
      });
    } catch {
      /* Netlify Forms is production-only; still show the local accept. */
    }
    setSent(true);
  }

  return (
    <>
      <section className="hero">
        <div className="hero-media">
          <img src="/brand/queen-full.jpg" alt="AgentHive queen in gold honeycomb armor" />
        </div>
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="dot" /> The Hive is live · 12 Grok Bots ready
          </div>
          <h1 className="display">
            THE HIVE.
            <br />
            <em>We SWARM.</em>
          </h1>
          <p className="lede">
            Specialized Grok Bots take a goal in plain language, run it across your tools, and report back. First Deploy
            keeps the after-hours desk live. The Buzz and Rankings stay current because Grok refreshes them every week.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="https://firstdeploy.ai/">
              Start the 2-minute check
            </a>
            <a className="btn btn-outline" href="#roster">
              Meet the Swarm
            </a>
          </div>
          <p className="fine">
            Field operators: after-hours desk + live apps. $1,500 setup (live this week or you don’t pay), then $250/mo.
          </p>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[...TICKER, ...TICKER].map((item, i) => (
            <span key={i}>
              <span className="dot" style={{ display: "inline-block", marginRight: 8 }} />
              {item}
            </span>
          ))}
        </div>
      </div>

      <AskAiBar />

      <section className="section" id="roster">
        <div className="container">
          <div className="section-head">
            <h2>The Swarm Roster</h2>
            <p>Twelve specialists. Clear scope. Tools already in their hands. Click a worker to assign a mission.</p>
          </div>
          <div className="roster-grid">
            {HIVE_BOTS.map((worker) => (
              <button
                key={worker.name}
                className={`worker${worker.featured ? " featured" : ""}`}
                onClick={() => {
                  setBot(worker);
                  setSent(false);
                  setLog([]);
                  setGoal("");
                }}
              >
                <div className="worker-top">
                  <div className="avatar">{worker.initial}</div>
                  <div>
                    <h3>{worker.name}</h3>
                    <div className="role">{worker.role}</div>
                  </div>
                </div>
                <p className="muted" style={{ marginTop: 10 }}>
                  {worker.brief}
                </p>
                <div className="status-live">Available · {worker.tools.join(" · ")}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" id="how">
        <div className="container">
          <div className="section-head">
            <h2>How the Swarm works</h2>
            <p>No onboarding deck. No prompt engineering class.</p>
          </div>
          <div className="steps">
            <article className="panel">
              <div className="step-num">01</div>
              <h3>Pick a Grok Bot</h3>
              <p>Every specialist is scoped and already wired to the right tools.</p>
            </article>
            <article className="panel">
              <div className="step-num">02</div>
              <h3>Hand off a goal</h3>
              <p>Plain language. They plan the steps, open the tools, and start executing.</p>
            </article>
            <article className="panel">
              <div className="step-num">03</div>
              <h3>Get results 24/7</h3>
              <p>Work lands in Slack. The hive keeps compounding without you babysitting it.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Lives where you already work</h2>
            <p>Secure OAuth. The Swarm operates inside the apps your team already uses.</p>
          </div>
          <div className="integrations">
            {["Slack", "Microsoft Teams", "Gmail", "HubSpot", "Notion", "GitHub", "Stripe", "Canva", "Google Drive", "+ 3,000 more"].map(
              (name) => (
                <span key={name}>{name}</span>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="cta-split">
            <div>
              <div className="section-head">
                <h2>The live hive, ranked</h2>
                <p>
                  Grok scouts every public AgentHive app each week — Netlify sites, custom domains, and the lab repos —
                  and scores them on uptime, speed, and commercial weight.
                </p>
              </div>
              <div className="card-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                {featured.slice(0, 4).map((site) => (
                  <a key={site.slug} className="card" href={site.url} rel="noreferrer" target="_blank">
                    <h3>{site.name}</h3>
                    <p className="muted">{site.description}</p>
                  </a>
                ))}
              </div>
              <div className="hero-actions" style={{ marginTop: 18 }}>
                <a className="btn btn-primary" href="/rankings">
                  Open Rankings
                </a>
                <a className="btn btn-outline" href="/buzz">
                  Read The Buzz
                </a>
              </div>
            </div>
            <img className="hex-art" src="/brand/consult-swarm.jpg" alt="Consult the Swarm gold hex mark" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Built to be trusted</h2>
            <p>Security is the default, not an upsell. Bot Lock and HiveBriefcase exist so agents can prove who they are.</p>
          </div>
          <div className="trust-grid">
            {[
              ["Encrypted", "Data encrypted in transit and at rest. Keys stay in the vault."],
              ["Scoped permissions", "Each bot only touches the tools you grant. Revoke anytime."],
              ["Full audit log", "Every action logged and exportable. The hive does not freelance."],
              ["Zero training on you", "Private data is never used to train foundation models."],
            ].map(([title, body]) => (
              <article key={title} className="trust">
                <h3>{title}</h3>
                <p className="muted">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" id="consult">
        <div className="container">
          <div className="pricing-box">
            <h2>Need a person in the room?</h2>
            <p>Free 30-minute qualifier. Then paid time — or a fixed deploy if the leak is clear.</p>
            <p style={{ margin: "1rem 0 1.4rem" }}>$75 / 30 min · $150 / hour · 10-hour pack $1,250 (half up front)</p>
            <a className="btn btn-primary" href="https://firstdeploy.ai/consult">
              Book the free 30
            </a>
            <p className="fine" style={{ marginTop: 12 }}>
              Referrals and LLM-alignment work are billed too.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="container">
          <div className="pricing-box">
            <h2>Hire the Swarm</h2>
            <p>Launch rates locked for life on any plan started this month. Start with one Grok Bot free for 7 days.</p>
            <a className="btn btn-primary" href="#roster" style={{ marginTop: 16 }}>
              Start with one free
            </a>
            <p className="fine" style={{ marginTop: 12 }}>
              No lock-in · Cancel anytime · Stripe secured
            </p>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2>Open comments</h2>
            <p>From the hive — not a review farm.</p>
          </div>
          <div className="notes">
            <article className="note">
              <p className="who">
                <a href="https://firstdeploy.ai/">First Deploy</a> · ★★★★★
              </p>
              <blockquote>Cash product of the hive. After-hours desk and live apps. Operators actually buy this.</blockquote>
            </article>
            <article className="note">
              <p className="who">
                <a href="https://indexme.lol/">IndexMe</a> · ★★★★★
              </p>
              <blockquote>If they can’t find you, you lose money. We index hive pages before we spend more on ads.</blockquote>
            </article>
            <article className="note">
              <p className="who">Reed · AgentHive · ★★★★★</p>
              <blockquote>Daniel Graham runs the hive hands-on. Builder who still sits with the work.</blockquote>
            </article>
            <article className="note">
              <p className="who">
                <a href="https://jobproof-app-171.netlify.app/">JobProof</a> · ★★★★★
              </p>
              <blockquote>Sister app for the same crews. Proof the job happened — photos and timestamps.</blockquote>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-box">
            <h2>Ready to SWARM?</h2>
            <p>The Hive is live. Grok Bots are waiting for a goal.</p>
            <a className="btn btn-primary" href="#roster" style={{ marginTop: 16 }}>
              Recruit your first Grok Bot
            </a>
            <p className="fine" style={{ marginTop: 16 }}>
              24/7 AI Voice Line: <a href="tel:+15093572230">(509) 357-2230</a>
            </p>
          </div>
        </div>
      </section>

      <div className={`modal-overlay${bot ? " open" : ""}`} onClick={() => setBot(null)}>
        <div className="modal panel" onClick={(e) => e.stopPropagation()}>
          {bot ? (
            <>
              <h3>{bot.name}</h3>
              <p className="role">
                {bot.role} · {bot.tools.join(", ")}
              </p>
              <p style={{ margin: "0.8rem 0" }}>
                Give a plain-language goal. This Grok Bot plans, uses its tools, and queues the work to the hive.
              </p>
              <form className="form" onSubmit={assign}>
                <input type="hidden" name="form-name" value="mission" />
                <label>
                  Your email
                  <input
                    type="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                  />
                </label>
                <label>
                  Goal
                  <textarea
                    name="goal"
                    required
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Fill the pipeline with 10 qualified leads this week from our HubSpot ICP list and book intro calls."
                  />
                </label>
                {log.length ? (
                  <div className="muted">
                    {log.map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                    {sent ? <div>✓ Mission accepted. The swarm is on it.</div> : null}
                  </div>
                ) : null}
                <div className="hero-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setBot(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Assign & Run
                  </button>
                </div>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
