import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container pricing-box">
        <h1>This cell is empty.</h1>
        <p className="muted">That path is not an AgentHive Inc page. Home, The Buzz, and Rankings are live.</p>
        <div className="hero-actions" style={{ justifyContent: "center", marginTop: 18 }}>
          <Link className="btn btn-primary" to="/">
            Home
          </Link>
          <Link className="btn btn-outline" to="/rankings">
            Rankings
          </Link>
          <Link className="btn btn-outline" to="/buzz">
            The Buzz
          </Link>
        </div>
      </div>
    </section>
  );
}
