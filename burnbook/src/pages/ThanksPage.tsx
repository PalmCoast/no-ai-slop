import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { formatUsd } from "../../shared/money.ts";
import { BuyLink } from "../components/BuyLink.tsx";
import { savePaid } from "../lib/store.ts";

type Status = "loading" | "paid" | "unpaid" | "unconfigured" | "missing" | "error";

type OrderBody = {
  paid?: boolean;
  configured?: boolean;
  amountTotal?: number | null;
  message?: string;
};

export function ThanksPage() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id")?.trim() ?? "";
  const [status, setStatus] = useState<Status>(sessionId ? "loading" : "missing");
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    let cancel = false;
    void (async () => {
      try {
        const res = await fetch(`/api/order?session_id=${encodeURIComponent(sessionId)}`);
        const body = (await res.json()) as OrderBody;
        if (cancel) return;
        if (!res.ok) {
          setStatus("error");
          return;
        }
        if (body.paid) {
          savePaid(sessionId);
          setAmount(typeof body.amountTotal === "number" ? body.amountTotal : null);
          setStatus("paid");
          return;
        }
        setStatus(body.configured === false ? "unconfigured" : "unpaid");
      } catch {
        if (!cancel) setStatus("error");
      }
    })();
    return () => {
      cancel = true;
    };
  }, [sessionId]);

  return (
    <article data-page="thanks" className="page-head">
      <h1>Payment</h1>
      {status === "loading" ? <p>Checking the Stripe session.</p> : null}
      {status === "paid" ? (
        <>
          <p>
            Paid in full
            {amount !== null ? `, ${formatUsd(amount / 100)}` : ""}. The packet is unlocked in this browser.
          </p>
          <p>
            <Link to="/packet">Open the packet</Link>
          </p>
        </>
      ) : null}
      {status === "unpaid" ? (
        <>
          <p>Stripe has this session, and it is not paid.</p>
          <BuyLink>Buy the packet, $750</BuyLink>
        </>
      ) : null}
      {status === "unconfigured" ? (
        <p>
          The charge went to Stripe. This site cannot confirm the session until the Stripe secret is set on the Netlify
          site. Your receipt is in the email Stripe sends. The payment link is the same $750 price.
        </p>
      ) : null}
      {status === "missing" ? (
        <>
          <p>This page confirms a Stripe session. There isn’t one on the link.</p>
          <BuyLink>Buy the packet, $750</BuyLink>
        </>
      ) : null}
      {status === "error" ? (
        <>
          <p>Stripe did not return that session.</p>
          <BuyLink>Buy the packet, $750</BuyLink>
        </>
      ) : null}
    </article>
  );
}
