import { Link } from "react-router-dom";
import { SEED_QUESTIONS } from "../../shared/ask";
import { shortAnswer } from "../../shared/seo";

export default function BoardQa({ heading = "Shop-floor questions" }: { heading?: string }) {
  return (
    <div className="board-qa-wrap">
      <h2>{heading}</h2>
      <dl className="board-qa">
        {SEED_QUESTIONS.map((q) => (
          <div key={q.slug}>
            <dt>
              <Link to={`/q/${q.slug}`}>{q.question}</Link>
            </dt>
            <dd>{shortAnswer(q.answer)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
