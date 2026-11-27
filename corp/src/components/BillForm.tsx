import { useState, type FormEvent } from "react";
import { BILL_NDA_LABEL, BILL_SUBMIT } from "../../shared/b2bCopy";

/**
 * AI-bill form (B2B invoice swap 2026-11-27). Netlify Forms "ai-bill" (declared statically in
 * public/__forms.html so Netlify detects it); notifications go to hivesales@agentmail.to.
 * Fires PostHog bill_form_submit on success. ph.js skips our own traffic (edge __PH_SKIP, QA UAs).
 * Labels follow COPY.md (approved 2026-11-27).
 */
export default function BillForm({ from }: { from: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [err, setErr] = useState("");
  const [sentTo, setSentTo] = useState("");

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const form = ev.currentTarget;
    const file = (form.elements.namedItem("bill") as HTMLInputElement | null)?.files?.[0];
    if (file && file.size > 8 * 1024 * 1024) {
      setErr("That file is over 8 MB. Try a CSV or a smaller PDF.");
      setState("error");
      return;
    }
    setState("sending");
    // Test routing: ?formtest=1 or an @agentmail.to email goes to the separate "ai-bill-test" form,
    // whose only notification is hivesales@agentmail.to (real "ai-bill" also notifies daniel@).
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim().toLowerCase();
    const isTest = new URLSearchParams(location.search).get("formtest") === "1" || email.endsWith("@agentmail.to");
    if (isTest) {
      data.set("form-name", "ai-bill-test");
      data.set("is_test", "1");
    }
    try {
      const res = await fetch("/", { method: "POST", body: data });
      if (!res.ok) throw new Error(String(res.status));
      setSentTo(String(data.get("email") || "").trim());
      setState("sent");
      try {
        const ph = (window as unknown as { posthog?: { capture?: (e: string, p: object, o?: object) => void } }).posthog;
        ph?.capture?.("bill_form_submit", { from, page: location.pathname, has_file: !!file, is_test: isTest }, { send_instantly: true });
      } catch {
        /* analytics never blocks the form */
      }
    } catch {
      setErr("That didn't send. Email the bill to daniel@agenthiveinc.com instead.");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="billform" id="bill" data-ph-from={from}>
        <p className="bf-ok" role="status">
          Got it. Your teardown video and savings estimate will arrive at {sentTo || "your email"} within 48 hours. If we need
          anything else, we will ask within one business day. Want to talk it through?{" "}
          <a href="/go/triage?from=bill-confirm" data-ph-cta="triage" data-ph-from="bill-confirm">
            Book a Free Triage
          </a>
        </p>
      </div>
    );
  }
  return (
    <form
      className="billform"
      id="bill"
      name="ai-bill"
      method="POST"
      action="/?bill=sent"
      encType="multipart/form-data"
      data-netlify="true"
      data-ph-from={from}
      onSubmit={onSubmit}
    >
      <input type="hidden" name="form-name" value="ai-bill" />
      <input type="hidden" name="is_test" value="0" />
      <input type="hidden" name="from" value={from} />
      <p hidden>
        <label>
          Leave empty <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <label>
        Work email
        <input type="email" name="email" required autoComplete="email" />
      </label>
      <label>
        Last month’s AI bill
        <input type="file" name="bill" required accept=".pdf,.csv,.txt,.png,.jpg,.jpeg,.xlsx" />
      </label>
      <label className="bf-check">
        <input type="checkbox" name="nda" value="yes" required /> {BILL_NDA_LABEL}
      </label>
      <p className="bf-fine">Redact org IDs, API keys and account numbers first. Used only for your teardown and deleted within 7 days of delivery.</p>
      <button type="submit" className="btn btn-primary" disabled={state === "sending"}>
        {BILL_SUBMIT}
      </button>
      {state === "error" ? (
        <p className="bf-err" role="alert">
          {err}
        </p>
      ) : null}
    </form>
  );
}
