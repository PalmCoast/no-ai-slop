import { Link } from "react-router-dom";
import type { YardOffer, YardQuestion } from "../../shared/ask";
import { tally } from "../api";

export default function OfferPanel({
  question,
  offer,
  onTally,
}: {
  question: YardQuestion;
  offer: YardOffer;
  onTally?: (totalsKind: "offer") => void;
}) {
  return (
    <div className="answer">
      <p className="eyebrow">Free answer · asked {question.asks} times</p>
      <h2>{question.question}</h2>
      <p>{question.answer}</p>
      <div className="offer">
        <p className="eyebrow">Do it in the app</p>
        <h3>{offer.title}</h3>
        <p className="muted">{offer.line}</p>
        <p className="price">{offer.price}</p>
        {offer.slug === "first-deploy" ? (
          <p className="fine">
            <a href="https://firstdeploy.ai/">First Deploy AI</a> — firstdeploy.ai — $1,500 setup, then $250/month.
          </p>
        ) : null}
        <div className="hero-actions">
          <a
            className="btn btn-primary"
            href={offer.href}
            rel="noreferrer"
            target="_blank"
            onClick={() => {
              void tally("offer");
              onTally?.("offer");
            }}
          >
            {offer.cta}
          </a>
          <Link className="btn btn-outline" to={`/q/${question.slug}`}>
            Open this answer
          </Link>
        </div>
      </div>
    </div>
  );
}
