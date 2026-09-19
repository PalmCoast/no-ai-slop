import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="display">This page is not on NetYard</h1>
        <p className="lede">Start the wizard, open the plan, or compare Samba with Microsoft Server.</p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/">
            Stand up
          </Link>
          <Link className="btn btn-outline" to="/tools">
            Tools
          </Link>
          <Link className="btn btn-outline" to="/compare">
            Vs Server
          </Link>
        </div>
      </div>
    </section>
  );
}
