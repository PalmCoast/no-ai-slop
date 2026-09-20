import { useState } from "react";
import { Link } from "react-router-dom";
import { CALENDLY_URL, FD_PROMISE } from "../../shared/brand";
import { OFFERS, type Offer } from "../../shared/offers";
import { loadAnswers } from "../storage";

export default function Buy() {
  const shop = loadAnswers()?.businessName ?? "";
  return (
    <section className="section">
      <div className="container">
        <h1 className="display">Pay for the rack, not another Server license.</h1>
        <p className="lede">
          The wizard and scripts stay free. Stripe takes the setup, the monthly desk, or consult time. {FD_PROMISE}.
        </p>
        <div className="card-grid">
          {OFFERS.map((offer) => (
            <OfferCard key={offer.id} offer={offer} shop={shop} />
          ))}
        </div>
        <p className="fine" style={{ marginTop: "1.2rem" }}>
          Free 30-minute qualifier first:{" "}
          <a href={CALENDLY_URL} rel="noreferrer" target="_blank">
            book on Calendly
          </a>
          . Then pay here.
        </p>
      </div>
    </section>
  );
}

function OfferCard({ offer, shop }: { offer: Offer; shop: string }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function pay() {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer: offer.id, shop }),
      });
      const data = (await res.json()) as { url?: string; demo?: boolean; message?: string };
      if (data.url) {
        window.location.assign(data.url);
        return;
      }
      if (offer.fallbackHref) {
        window.location.assign(offer.fallbackHref);
        return;
      }
      setNote(data.message ?? "Stripe is not live on this preview yet.");
    } catch {
      if (offer.fallbackHref) {
        window.location.assign(offer.fallbackHref);
        return;
      }
      setNote("Checkout did not start. Try again, or book the free 30.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="card">
      <h2>{offer.name}</h2>
      <p className="price">{offer.amountLabel}</p>
      <p>{offer.blurb}</p>
      <div className="copy-row">
        <button type="button" className="btn btn-primary" onClick={pay} disabled={busy}>
          {busy ? "Opening Stripe…" : offer.cta}
        </button>
      </div>
      {note ? <p className="fine">{note}</p> : null}
    </article>
  );
}

export function RackCta({ shop }: { shop?: string }) {
  return (
    <article className="card">
      <h3>Want us to rack it?</h3>
      <p>First Deploy AI stands the LAN this week. Pay setup on Stripe, then $250/mo for the desk.</p>
      <div className="copy-row">
        <Link className="btn btn-primary" to="/buy">
          Pay on Stripe
        </Link>
        {shop ? <span className="fine">Plan for {shop}</span> : null}
      </div>
    </article>
  );
}
