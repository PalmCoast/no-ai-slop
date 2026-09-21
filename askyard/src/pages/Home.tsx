import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import ReputationBar from "../components/ReputationBar";
import OfferPanel from "../components/OfferPanel";
import RateAnswer from "../components/RateAnswer";
import { fetchBoard, submitQuestion } from "../api";
import {
  BRAND_NAME,
  BRAND_PARENT,
  BRAND_PLACE,
  CONSULT_DISPLAY,
  CONSULT_TEL,
  FD_PRICE,
  FD_PROMISE,
  HERO_H1,
  HERO_WHAT,
  MARQUEE_NAME,
  PARENT_URL,
  TAGLINE,
} from "../../shared/brand";
import BoardQa from "../components/BoardQa";
import IdentityFacts from "../components/IdentityFacts";
import { FEATURED_APPS } from "../../shared/catalog";
import { emptyTotals, offerFor, rankedSeed, type YardQuestion, type YardTotals } from "../../shared/ask";

const TRADES = ["plumbers", "teachers", "receptionists", "earth movers", "anyone else"];

export default function Home() {
  const seed = useMemo(() => rankedSeed(), []);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<YardQuestion | null>(null);
  const [board, setBoard] = useState<YardQuestion[]>(seed);
  const [totals, setTotals] = useState<YardTotals>(emptyTotals());

  useEffect(() => {
    fetchBoard().then((data) => {
      setBoard(data.questions);
      setTotals(data.totals);
    });
  }, []);

  async function onAsk(event: FormEvent) {
    event.preventDefault();
    const question = query.trim();
    if (question.length < 8) {
      setError("Give us a full question. Eight characters is the floor.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await submitQuestion(question);
      setCurrent(result.question);
      setBoard(result.board);
      setTotals(result.totals);
    } catch {
      setError("The desk is busy. Try again, or pick a ranked question below.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="hero">
        <div className="hero-media">
          <img src="/brand/hero-yard.jpg" alt="Plumber, receptionist, teacher, and earth mover around a yard table" />
        </div>
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="dot" /> {BRAND_NAME} · {BRAND_PLACE} · a {BRAND_PARENT} product
          </div>
          <h1 className="display">{HERO_H1}</h1>
          <p className="lede">{HERO_WHAT}</p>
          <IdentityFacts />
          <p className="fine" style={{ marginBottom: "0.4rem" }}>
            Built for {TRADES.join(", ")}.
          </p>
          <form className="ask-box" onSubmit={onAsk}>
            <label htmlFor="yard-ask">Your question</label>
            <div className="ask-row">
              <input
                id="yard-ask"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="How do I stop missing night calls?"
                maxLength={280}
                autoComplete="off"
              />
              <button className="btn btn-primary" type="submit" disabled={busy}>
                {busy ? "Answering…" : "Get a free answer"}
              </button>
            </div>
            {error ? <p className="fine">{error}</p> : <p className="fine">Then we make an offer to do it. No account.</p>}
          </form>
          {current ? (
            <>
              <OfferPanel
                question={current}
                offer={offerFor(current.offerSlug)}
                onTally={() => setTotals((t) => ({ ...t, offersStarted: t.offersStarted + 1 }))}
              />
              <RateAnswer slug={current.slug} helpful={current.helpful} missed={current.missed} />
            </>
          ) : null}
        </div>
      </section>

      <ReputationBar />

      <section className="section" style={{ paddingTop: "1.5rem", paddingBottom: 0 }}>
        <div className="container">
          <Link className="check-banner" to="/check">
            <span className="eyebrow">Shop check</span>
            <strong>What AI knows about your shop</strong>
            <span>Paste a name or a URL. Free. No login. The card points at IndexMe.</span>
          </Link>
        </div>
      </section>

      <section className="section" style={{ paddingTop: "2rem" }}>
        <div className="container">
          <div className="card-grid">
            <Link className="card" to="/rep">
              <p className="eyebrow">Instant lookup</p>
              <h3>Reputation meter</h3>
              <p className="muted">
                Search a name. See if something rough landed in public. Chrome toolbar if you want it in the address bar.
              </p>
              <p className="price">Free lookup</p>
            </Link>
            <Link className="card" to="/marquee">
              <p className="eyebrow">{MARQUEE_NAME}</p>
              <h3>Your name in lights</h3>
              <p className="muted">
                Pay to sit at #1. You type the bid. The next founder who wants it more buys the crown. You drop.
              </p>
              <p className="price">You name the bid · floor $20</p>
            </Link>
            <a className="card" href="/extension/popup.html">
              <p className="eyebrow">Chrome</p>
              <h3>Toolbar for your name</h3>
              <p className="muted">
                Load unpacked. Look yourself up. If a new public hit appears, the meter moves the next time you search.
              </p>
              <p className="price">Free extension</p>
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Running totals</h2>
            <p>The board keeps a public count so you can see what people actually ask, not what a vendor wants to sell.</p>
          </div>
          <div className="totals">
            <div className="total">
              <b>{totals.questionsAsked.toLocaleString()}</b>
              <span>questions asked</span>
            </div>
            <div className="total">
              <b>{totals.uniqueQuestions.toLocaleString()}</b>
              <span>unique questions</span>
            </div>
            <div className="total">
              <b>{totals.answersGiven.toLocaleString()}</b>
              <span>answers given</span>
            </div>
            <div className="total">
              <b>{totals.offersStarted.toLocaleString()}</b>
              <span>do-it offers opened</span>
            </div>
            <div className="total">
              <b>{totals.publicRepliesCopied.toLocaleString()}</b>
              <span>public replies copied</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt" id="board">
        <div className="container">
          <div className="section-head">
            <h2>Most asked</h2>
            <p>Ranked by how many times people asked. Open one, or ask your own above.</p>
          </div>
          <div className="rank-grid">
            {board.slice(0, 6).map((item, index) => (
              <Link key={item.slug} className="rank-card" to={`/q/${item.slug}`}>
                <div className="rank-num">{String(index + 1).padStart(2, "0")}</div>
                <div>
                  <div className="rank-top">
                    <h3>{item.question}</h3>
                    <span className="pill">{item.trade}</span>
                  </div>
                  <p className="muted">{item.answer.slice(0, 140)}…</p>
                </div>
                <div className="ask-count">
                  {item.asks.toLocaleString()}
                  <small>asks</small>
                </div>
              </Link>
            ))}
          </div>
          <p className="fine" style={{ marginTop: 18 }}>
            Full ranked board on <Link to="/board">/board</Link>. Paid desk:{" "}
            <a href={PARENT_URL}>First Deploy AI</a>.
          </p>
          <BoardQa heading="Every board question" />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Turn and burn. Low cost.</h2>
            <p>
              {BRAND_PARENT} is {FD_PRICE}. {FD_PROMISE}. Smaller tools live on the shelf if the leak is smaller than
              the night phone.
            </p>
          </div>
          <div className="card-grid">
            {FEATURED_APPS.map((app) => (
              <a key={app.slug} className="card" href={app.url} rel="noreferrer" target="_blank">
                <p className="eyebrow">{app.who}</p>
                <h3>{app.name}</h3>
                <p className="muted">{app.blurb}</p>
                <p className="price">{app.price}</p>
              </a>
            ))}
          </div>
          <p className="fine" style={{ marginTop: 18 }}>
            Every live app is on <Link to="/apps">apps for sale</Link>.
          </p>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container cta-split">
          <div>
            <div className="eyebrow">Public answers</div>
            <h2 className="display" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>
              Find people already asking. Answer them for free.
            </h2>
            <p className="lede">
              Copy a plain reply with a link back to AskYard. That is how the name lands in ChatGPT, Claude, Perplexity,
              Gemini, and Grok without buying ads.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/hunt">
                Open the hunt
              </Link>
              <a className="btn btn-outline" href={`tel:${CONSULT_TEL}`}>
                {CONSULT_DISPLAY}
              </a>
            </div>
          </div>
          <div className="frame">
            <img src="/brand/clipboard.jpg" alt="Clipboard on a job site asking how to stop missing night calls" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-box">
            <h2>{TAGLINE}</h2>
            <p className="muted" style={{ marginTop: 8 }}>
              Ask is free. The work is {FD_PRICE}. {FD_PROMISE}.
            </p>
            <div className="hero-actions" style={{ justifyContent: "center", marginTop: 18 }}>
              <a className="btn btn-primary" href="#yard-ask">
                Ask now
              </a>
              <a className="btn btn-outline" href={PARENT_URL}>
                First Deploy AI
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
