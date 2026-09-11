import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { claimCheckout } from "../api";
import { Layout } from "../components/Layout";
import { getLicense, setLicense } from "../lib/license";

export function Thanks() {
  const [params] = useSearchParams();
  const demo = params.get("demo") === "1";
  const sessionId = params.get("session_id") ?? "";
  const [key, setKey] = useState<string | null>(getLicense());
  const [plan, setPlan] = useState<string>(demo ? "demo" : "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (demo) {
      setKey(getLicense());
      setPlan("demo");
      return;
    }
    if (!sessionId) return;
    let cancelled = false;
    claimCheckout(sessionId)
      .then((res) => {
        if (cancelled) return;
        setLicense(res.licenseKey);
        setKey(res.licenseKey);
        setPlan(res.plan);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [demo, sessionId]);

  return (
    <Layout marquee>
      <p className="now-showing">You are on the board</p>
      <section className="billboard compact">
        <div className="chaser" aria-hidden="true">
          {Array.from({ length: 40 }, (_, i) => (
            <i key={i} style={{ animationDelay: `${(i % 8) * 0.12}s` }} />
          ))}
        </div>
        <p className="kicker lights-kicker">{plan === "founder" ? "Marquee" : plan === "demo" ? "Rehearsal" : "Lights"}</p>
        <h1 className="marquee-title smaller">
          <span>YOU'RE IN</span>
        </h1>
        <p className="marquee-tag">PUBLISH IS UNLOCKED ON THIS DEVICE.</p>
        {error ? <p className="alert error">{error}</p> : null}
        {key ? (
          <p className="license-show">
            License <code>{key}</code>
          </p>
        ) : sessionId ? (
          <p className="muted">Hanging the letters…</p>
        ) : (
          <p className="muted">No checkout session on this page. If you already paid, open Pricing and we will not double-charge — paste is not needed; the key lives in this browser.</p>
        )}
        <div className="hero-actions">
          <Link className="btn amber billboard-btn" to="/record">
            Record like a boss
          </Link>
          <Link className="btn ghost billboard-btn" to="/pricing">
            Back to the gate
          </Link>
        </div>
      </section>
    </Layout>
  );
}
