import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { confirmOrder } from "../api";
import { doorHref } from "../components/Catalog";
import { saveClaim } from "../storage";

export default function Thanks() {
  const [params] = useSearchParams();
  const name = (params.get("name") ?? "").trim();
  const query = (params.get("q") ?? "").trim();
  const demo = params.get("demo") === "1";
  const sessionId = params.get("session_id");
  const [state, setState] = useState<"working" | "ready" | "unpaid" | "missing">("working");

  useEffect(() => {
    let cancel = false;
    async function run() {
      if (!name || !query) {
        if (!cancel) setState("missing");
        return;
      }
      if (demo) {
        saveClaim({ shopName: name, query, demo: true, at: new Date().toISOString() });
        if (!cancel) setState("ready");
        return;
      }
      if (!sessionId) {
        if (!cancel) setState("unpaid");
        return;
      }
      try {
        const order = await confirmOrder(sessionId);
        if (cancel) return;
        if (order.paid) {
          saveClaim({ shopName: name, query, demo: false, at: new Date().toISOString() });
          setState("ready");
        } else {
          setState("unpaid");
        }
      } catch {
        if (!cancel) setState("unpaid");
      }
    }
    void run();
    return () => {
      cancel = true;
    };
  }, [demo, name, query, sessionId]);

  return (
    <div className="container page narrow">
      <h1>{state === "ready" ? "The aisle is published" : "Checking the payment"}</h1>
      {state === "ready" ? (
        <>
          <p className="lede">
            {name} is on the door. {demo ? "Stripe is not configured on this site, so this claim is a demo on this browser." : "Keep the Stripe receipt."}
          </p>
          <p>
            <Link className="btn" to={doorHref(name, query)}>
              Open {name}
            </Link>
          </p>
        </>
      ) : null}
      {state === "unpaid" ? <p className="lede">The payment is not confirmed yet. Return to publish and try the checkout again.</p> : null}
      {state === "missing" ? (
        <p className="lede">
          <Link to="/publish">Publish an aisle</Link> to land here with a shop name.
        </p>
      ) : null}
      {state === "working" && !demo ? <p className="lede">Asking Stripe whether the session is paid.</p> : null}
    </div>
  );
}
