import { PREMIUM_SITES } from "../../shared/premium";

export default function Premium() {
  return (
    <section className="section">
      <div className="container">
        <div className="promo-stage">
          <video
            className="promo-film"
            poster="/promo/shelf-poster.png"
            src="/promo/shelf.mp4"
            autoPlay
            muted
            loop
            playsInline
            controls
          />
        </div>
        <div className="section-head" style={{ marginTop: "2rem" }}>
          <div className="eyebrow">
            <span className="dot" /> AgentHive Inc · Palm Coast
          </div>
          <h1 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", marginTop: "1rem" }}>
            Premium sites
          </h1>
          <p className="lede">
            These are the sites we put our name in front of. One shop. The price sits on the same card as the work.
          </p>
        </div>
        <div className="card-grid shelf-grid">
          {PREMIUM_SITES.map((site) => (
            <a key={site.slug} className="card shelf-card" href={site.url} rel="noreferrer" target="_blank">
              {site.mark ? <img className="shelf-mark" src={site.mark} alt="" width={40} height={40} /> : null}
              <h2>{site.name}</h2>
              <p className="shelf-price">{site.price}</p>
              <p className="muted">{site.line}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
