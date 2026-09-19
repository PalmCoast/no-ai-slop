import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="display">This page is not on AskYard</h1>
        <p className="lede">Ask a question, open the ranked board, or see the apps for sale.</p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/">
            Ask
          </Link>
          <Link className="btn btn-outline" to="/board">
            Board
          </Link>
          <Link className="btn btn-outline" to="/rep">
            Reputation meter
          </Link>
          <Link className="btn btn-outline" to="/marquee">
            Marquee lights
          </Link>
        </div>
      </div>
    </section>
  );
}
