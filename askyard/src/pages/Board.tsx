import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchBoard } from "../api";
import { emptyTotals, rankedSeed, type YardQuestion, type YardTotals } from "../../shared/ask";

const TRADES = ["all", "plumber", "teacher", "receptionist", "earth mover", "shop", "general"] as const;

export default function Board() {
  const [board, setBoard] = useState<YardQuestion[]>(rankedSeed());
  const [totals, setTotals] = useState<YardTotals>(emptyTotals());
  const [filter, setFilter] = useState<(typeof TRADES)[number]>("all");

  useEffect(() => {
    fetchBoard().then((data) => {
      setBoard(data.questions);
      setTotals(data.totals);
    });
  }, []);

  const visible = board.filter((item) => filter === "all" || item.trade === filter);

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow">Public board</div>
          <h1 className="display">Ranked by how often people ask</h1>
          <p className="lede">
            {totals.questionsAsked.toLocaleString()} asks across {totals.uniqueQuestions} questions. The count stays on
            the card so a new visitor can see what the yard already needed.
          </p>
        </div>
        <div className="filters">
          {TRADES.map((key) => (
            <button key={key} className={`filter${filter === key ? " on" : ""}`} onClick={() => setFilter(key)}>
              {key}
            </button>
          ))}
        </div>
        <div className="rank-grid">
          {visible.map((item, index) => (
            <Link key={item.slug} className="rank-card" to={`/q/${item.slug}`}>
              <div className="rank-num">{String(index + 1).padStart(2, "0")}</div>
              <div>
                <div className="rank-top">
                  <h3>{item.question}</h3>
                  <span className="pill">{item.trade}</span>
                </div>
                <p className="muted">{item.answer.slice(0, 180)}…</p>
              </div>
              <div className="ask-count">
                {item.asks.toLocaleString()}
                <small>asks</small>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
