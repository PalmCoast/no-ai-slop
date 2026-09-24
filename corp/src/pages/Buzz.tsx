import { useEffect, useState } from "react";
import { BUZZ_SEED, type BuzzEdition } from "../../shared/buzz-seed";

export default function Buzz() {
  const [edition, setEdition] = useState<BuzzEdition>(BUZZ_SEED);
  const [source, setSource] = useState<"live" | "seed">("seed");

  useEffect(() => {
    fetch("/api/buzz")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("buzz unavailable"))))
      .then((data: BuzzEdition) => {
        setEdition(data);
        setSource(data.method === "weekly-bot" ? "live" : "seed");
      })
      .catch(() => {
        setEdition(BUZZ_SEED);
        setSource("seed");
      });
  }, []);

  return (
    <section className="section">
      <div className="container">
        <div className="buzz-hero">
          <div>
            <div className="eyebrow">Weekly AI and infra briefing</div>
            <h1 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}>
              The Buzz
            </h1>
            <h2 style={{ margin: "0.8rem 0 0.4rem" }}>{edition.headline}</h2>
            <p className="lede">{edition.dek}</p>
            <p className="fine">
              {edition.author} · week of {edition.weekOf} · {source === "live" ? "live bot edition" : "seeded floor, bot refreshes weekly"} ·{" "}
              {new Date(edition.generatedAt).toUTCString()}
            </p>
          </div>
          <img className="hex-art" src="/brand/mark-crown.jpg" alt="Crowned geometric bee mark" />
        </div>

        <div className="panel" style={{ margin: "2rem 0" }}>
          <h2>What matters this week</h2>
          <ol className="takeaways">
            {edition.takeaways.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>

        <div className="section-head">
          <h2>Source stories</h2>
          <p>Every claim has a URL. Grok does not invent briefings from vibes.</p>
        </div>
        <div className="stories">
          {edition.stories.map((story) => (
            <article key={story.url} className="story">
              <p className="who">
                {story.source} · {story.tags.join(" · ")}
              </p>
              <h3>
                <a href={story.url} rel="noreferrer" target="_blank">
                  {story.title}
                </a>
              </h3>
              <p className="muted">{story.why}</p>
            </article>
          ))}
        </div>

        <p className="muted" style={{ marginTop: 24 }}>
          {edition.hiveNote}
        </p>

        <div className="panel" style={{ margin: "2rem 0" }}>
          <h2>Spiking in the hive: HILLMIRROR</h2>
          <p className="muted">
            They file. You follow. 911 House filings ranked delay-adjusted vs SPY. Board, Copy Desk $24.99/mo,
            roster of 535.
          </p>
          <div className="hero-actions" style={{ marginTop: 12 }}>
            <a
              className="btn btn-primary"
              href="https://hillmirror-firstdeploy.netlify.app/board"
              rel="noreferrer"
              target="_blank"
            >
              See the board
            </a>
            <a
              className="btn btn-outline"
              href="https://hillmirror-firstdeploy.netlify.app/me"
              rel="noreferrer"
              target="_blank"
            >
              Unlock $9.99/mo
            </a>
          </div>
        </div>

        <div className="panel" style={{ margin: "2rem 0" }}>
          <h2>Get the weekly briefing in your inbox</h2>
          <form name="buzz" method="POST" data-netlify="true" netlify-honeypot="bot-field">
            <input type="hidden" name="form-name" value="buzz" />
            <p className="muted" hidden>
              <label>
                Do not fill this out: <input name="bot-field" />
              </label>
            </p>
            <div className="hero-actions" style={{ marginTop: 12 }}>
              <input
                type="email"
                name="email"
                required
                placeholder="you@shop.com"
                aria-label="Email for The Buzz"
                style={{ padding: "0.65rem 0.9rem", borderRadius: 8, border: "1px solid var(--line)", minWidth: 240 }}
              />
              <button className="btn btn-primary" type="submit">
                Send the Buzz
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
