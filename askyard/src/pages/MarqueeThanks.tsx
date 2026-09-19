import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { confirmMarquee } from "../api";
import { centsToDollars, type MarqueeListing } from "../../shared/marquee";
import { MARQUEE_NAME } from "../../shared/brand";

export default function MarqueeThanks() {
  const [params] = useSearchParams();
  const demo = params.get("demo") === "1";
  const sessionId = params.get("session_id");
  const named = params.get("name");
  const [listings, setListings] = useState<MarqueeListing[]>([]);

  useEffect(() => {
    void confirmMarquee(sessionId, demo).then((data) => setListings(data.listings));
  }, [demo, sessionId]);

  const crown = listings[0];

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="eyebrow">{demo ? "Demo bid in" : "Paid"}</div>
        <h1 className="display">You bought the lights.</h1>
        <p className="lede">
          {named ? `${named} is on ${MARQUEE_NAME}.` : `Your name is on ${MARQUEE_NAME}.`} The next founder who wants it
          more can take the crown. You drop. That is the auction.
        </p>
        {crown ? (
          <div className="crown-card">
            <p className="eyebrow">#1 right now</p>
            <p className="crown-name">{crown.name}</p>
            <p className="price">{centsToDollars(crown.bidCents)}</p>
          </div>
        ) : null}
        <div className="hero-actions" style={{ marginTop: 22 }}>
          <Link className="btn btn-primary" to="/marquee">
            Back to the chart
          </Link>
          <Link className="btn btn-outline" to="/rep">
            Check the meter
          </Link>
        </div>
      </div>
    </section>
  );
}
