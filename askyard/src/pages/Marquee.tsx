import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchMarquee, placeBid } from "../api";
import { centsToDollars, MARQUEE_FLOOR_CENTS, MARQUEE_MAX_CENTS, type MarqueeListing } from "../../shared/marquee";
import { MARQUEE_NAME, MARQUEE_TAGLINE, MARQUEE_URL } from "../../shared/brand";

export default function Marquee() {
  const [params] = useSearchParams();
  const [listings, setListings] = useState<MarqueeListing[]>([]);
  const [minNext, setMinNext] = useState(centsToDollars(MARQUEE_FLOOR_CENTS));
  const [name, setName] = useState("");
  const [bid, setBid] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("cancelled") === "1" ? "Checkout closed. The crown is still for sale." : null,
  );

  useEffect(() => {
    fetchMarquee().then((data) => {
      setListings(data.listings);
      setMinNext(data.minNextBid);
      setBid((current) => current || data.minNextBid.replace(/[^0-9.]/g, ""));
    });
  }, []);

  const crown = listings[0];

  async function onBid(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError("Put the name you want in lights.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await placeBid(name.trim(), bid);
      if (result.error) {
        setError(result.message ?? "Bid too low.");
        if (result.listings) setListings(result.listings);
        return;
      }
      if (result.listings) setListings(result.listings);
      window.location.assign(result.url);
    } catch {
      setError("Desk is busy. Try the bid again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section marquee-page">
      <div className="container">
        <div className="lights" aria-hidden="true">
          <div className="lights-track">
            {(listings.length ? listings : [{ name: MARQUEE_NAME, slug: "x", bidCents: 0, paidAt: "" }])
              .concat(listings)
              .map((row, i) => (
                <span key={`${row.slug}-${i}`}>{row.name}</span>
              ))}
          </div>
        </div>
        <div className="section-head" style={{ maxWidth: 720 }}>
          <div className="eyebrow">{MARQUEE_URL.replace("https://", "").replace(/\/$/, "")}</div>
          <h1 className="display">{MARQUEE_TAGLINE}</h1>
          <p className="lede">
            Founders would die for the name in lights. You type the dollar amount. The highest bid sits at #1. The next
            one who wants it more buys the crown. You drop. No refunds. That is the product.
          </p>
        </div>

        {crown ? (
          <div className="crown-card">
            <p className="eyebrow">Current crown</p>
            <p className="crown-name">{crown.name}</p>
            <p className="price">{centsToDollars(crown.bidCents)}</p>
            {crown.demo ? <p className="fine">Demo bid. Live card checkout when Stripe is on.</p> : null}
          </div>
        ) : null}

        <div className="cta-split" style={{ marginTop: 28, alignItems: "start" }}>
          <form className="panel form" onSubmit={onBid}>
            <h2>Buy the lights. Name the price.</h2>
            <p className="muted">
              Floor {centsToDollars(MARQUEE_FLOOR_CENTS)}. Next bid is {minNext} or more. Cap{" "}
              {centsToDollars(MARQUEE_MAX_CENTS)} so a typo cannot empty a card. Not a fixed Stripe Price. You type it.
            </p>
            <label htmlFor="marquee-name">Name in lights</label>
            <input
              id="marquee-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name, your shop, your fund"
              maxLength={80}
              autoComplete="name"
            />
            <label htmlFor="marquee-bid">Your bid (USD)</label>
            <input
              id="marquee-bid"
              value={bid}
              onChange={(e) => setBid(e.target.value)}
              inputMode="decimal"
              placeholder={minNext}
            />
            {error ? <p className="fine">{error}</p> : <p className="fine">Checkout charges exactly what you typed. Floor $20.</p>}
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? "Opening checkout…" : `Bid ${bid || minNext}`}
            </button>
          </form>
          <div>
            <ol className="marquee-chart">
              {listings.map((row, index) => (
                <li key={row.slug} className={index === 0 ? "on-top" : undefined}>
                  <span className="rank-num">{String(index + 1).padStart(2, "0")}</span>
                  <span>
                    <strong>{row.name}</strong>
                    {row.demo ? <em> · demo</em> : null}
                  </span>
                  <span className="price">{centsToDollars(row.bidCents)}</span>
                </li>
              ))}
            </ol>
            <p className="fine" style={{ marginTop: 14 }}>
              Search your public record first on <Link to="/rep">the meter</Link>. The chart is paid vanity. The meter is
              the lookup.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
