import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CALENDLY_URL, CONSULT_DISPLAY } from "../../shared/brand";
import { offerById } from "../../shared/offers";

type Order = {
  paid?: boolean;
  demo?: boolean;
  offer?: string | null;
  shop?: string | null;
  email?: string | null;
  message?: string;
};

export default function Thanks() {
  const [params] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const session = params.get("session_id");
    if (!session) {
      setOrder({ paid: false, message: "No Stripe session on this URL. If you paid, check the receipt email." });
      return;
    }
    fetch(`/api/order?session_id=${encodeURIComponent(session)}`)
      .then((res) => res.json() as Promise<Order>)
      .then(setOrder)
      .catch(() => setOrder({ paid: false, message: "Could not confirm the session yet. Keep the Stripe receipt." }));
  }, [params]);

  const offer = order?.offer ? offerById(order.offer) : undefined;

  return (
    <section className="section">
      <div className="container narrow">
        <h1 className="display">{order?.paid ? "Payment landed." : "Checking Stripe…"}</h1>
        <p className="lede">
          {order?.paid
            ? `${offer?.name ?? "NetYard"} is paid${order.shop ? ` for ${order.shop}` : ""}. We rack from the plan you already generated.`
            : (order?.message ?? "Give Stripe a second.")}
        </p>
        {order?.email ? <p className="fine">Receipt goes to {order.email}.</p> : null}
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/plan">
            Open the plan
          </Link>
          <a className="btn btn-outline" href={CALENDLY_URL} rel="noreferrer" target="_blank">
            Book the kickoff
          </a>
          <a className="btn btn-outline" href={`tel:+13203356186`}>
            {CONSULT_DISPLAY}
          </a>
        </div>
      </div>
    </section>
  );
}
