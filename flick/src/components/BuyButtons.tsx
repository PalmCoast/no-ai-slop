import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startCheckout } from "../api";
import { setLicense } from "../lib/license";
import { formatUsd, PAID_PLANS, type PaidPlan } from "../../shared/plans";

export function BuyButtons({
  highlight = "monthly",
  size = "normal",
  only,
}: {
  highlight?: PaidPlan;
  size?: "normal" | "huge";
  only?: PaidPlan;
}) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState<PaidPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buy(plan: PaidPlan) {
    setBusy(plan);
    setError(null);
    try {
      const res = await startCheckout(plan);
      if (res.demo && res.licenseKey) {
        setLicense(res.licenseKey);
        navigate("/thanks?demo=1");
        return;
      }
      if (res.url) {
        window.location.assign(res.url);
        return;
      }
      setError("Checkout did not return a door. Try again.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed.");
    } finally {
      setBusy(null);
    }
  }

  const plans = only ? ([only] as const) : (["monthly", "founder"] as const);

  return (
    <div className={`buy-stack ${size}`}>
      <div className="buy-row">
        {plans.map((plan) => {
          const spec = PAID_PLANS[plan];
          const featured = plan === highlight;
          return (
            <button
              key={plan}
              type="button"
              className={`btn ${featured ? "amber" : "ghost"} ${size === "huge" ? "billboard-btn" : "big"}`}
              disabled={busy !== null}
              onClick={() => void buy(plan)}
            >
              {busy === plan ? "Continue to Stripe…" : `Get ${spec.name} · ${formatUsd(spec.cents)}${spec.cadence}`}
            </button>
          );
        })}
      </div>
      {error ? <p className="alert error">{error}</p> : null}
    </div>
  );
}
