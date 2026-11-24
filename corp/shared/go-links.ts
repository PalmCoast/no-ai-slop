// First-party click tracker map for agenthiveinc.com/go/<name>.
// Same pattern as firstdeploy.ai/go/<name>: log the click, then 302 to the
// exact destination with tracking params appended at redirect time.
// Stripe Payment Links: every URL below was verified active at the advertised
// price in /workspace/buy-path-audit-2026-09-28/REPORT.md (2026-09-28),
// then rechecked with curl -sI (no browser, redirects not followed) on 2026-11-23.
// Flick builds its Checkout server-side, so /go sends the
// buyer to the product page that holds the working plan buttons.
export type GoLink = { url: string; kind: "stripe" | "page"; label: string };

export const GO_LINKS: Record<string, GoLink> = {
  // B2B reset 2026-11-24: new ladder. Rechecked with curl -sI only (no browser, redirects not followed).
  sprint: { url: "https://buy.stripe.com/6oU14n2Es6CTfTf7ea2ZO1V", kind: "stripe", label: "Agent Audit & Stabilization Sprint — $2,500" },
  retainer: { url: "https://buy.stripe.com/eVq5kD3Iw4uLePbfKG2ZO1W", kind: "stripe", label: "Fractional AI Ops Retainer — $3,500/mo" },
  // First Deploy pricing section.
  "first-deploy": { url: "https://firstdeploy.ai/#pay", kind: "page", label: "First Deploy — pricing" },
  // /go/concierge was the $2,000/mo AI Concierge. That offer is retired; old links land on the retainer page.
  concierge: { url: "https://agenthiveinc.com/concierge", kind: "page", label: "Fractional AI Ops Retainer page (old Concierge link)" },
  "indexme-pro": { url: "https://buy.stripe.com/4gMcN52Ese5ldL7cyu2ZO1a", kind: "stripe", label: "IndexMe Pro — $19.99 once" },
  "indexme-studio": { url: "https://buy.stripe.com/aFa00jfre2mD8qN5622ZO1b", kind: "stripe", label: "IndexMe Studio — $29.99 once" },
  flick: { url: "https://flick.firstdeploy.ai/", kind: "page", label: "Flick — Lights $19/mo · Marquee $99 once" },
  // /go/ads-sprint (retired $297 Ad Sprint, then the retired $150 audit) now lands on the sprint page.
  // Tests check the redirect target only; do not fetch these URLs.
  "ads-sprint": { url: "https://agenthiveinc.com/consult", kind: "page", label: "Sprint page (retired Ad Sprint / $150 audit traffic)" },
  "ads-engine": { url: "https://buy.stripe.com/4gM9ATa6U2mD36tbuq2ZO1M", kind: "stripe", label: "AI Ad Sprint monthly — $997/mo" },
  // Live on Palm Coast AI, 2026-11-10: price_1UaJ40FJWYd4pYuxxNJ078sT, unit_amount 75000.
  "burn-book": { url: "https://buy.stripe.com/7sYcN5a6Ud1hcH3eGC2ZO1O", kind: "stripe", label: "Burn Book board packet — $750 once" },
  // /go/consult-30 was the $75 30-minute consult; retired, lands on the sprint page.
  "consult-30": { url: "https://agenthiveinc.com/consult", kind: "page", label: "Sprint page (retired $75 consult link)" },
  // Deploy Agent keeps its $625 deposit on the $1,250 go-live sprint.
  deposit: { url: "https://buy.stripe.com/7sY9ATenabXd7mJ7ea2ZO1i", kind: "stripe", label: "Deploy Agent go-live sprint deposit — $625 ($1,250)" },
  pack: { url: "https://buy.stripe.com/7sY9ATenabXd7mJ7ea2ZO1i", kind: "stripe", label: "Deploy Agent go-live sprint deposit — $625 ($1,250)" },
  // ainexus360.com offers. Buttons on that site should point here once approved.
  "ainexus-tier1": { url: "https://buy.stripe.com/dRm8wPgvif9pfTfaqm2ZO0S", kind: "stripe", label: "AI Nexus 360 — AI Readiness & Waste Audit (Tier 1)" },
  "ainexus-tier2": { url: "https://buy.stripe.com/fZueVd2EsbXd22p2XU2ZO0T", kind: "stripe", label: "AI Nexus 360 — Audit + 90-Day Execution Review (Tier 2) $6,500" },
};

export const cleanToken = (s: unknown, max = 40): string =>
  String(s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, max);

/** Build the redirect target for a /go click. `from` is already cleaned. */
export function goTarget(name: string, from: string): string | null {
  const link = GO_LINKS[name];
  if (!link) return null;
  const dest = new URL(link.url);
  const src = from.startsWith("x") ? "x" : "agenthiveinc.com";
  if (link.kind === "stripe") {
    dest.searchParams.set("client_reference_id", `ah_${from}_${name}`.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 200));
  }
  dest.searchParams.set("utm_source", src);
  dest.searchParams.set("utm_medium", "hub");
  dest.searchParams.set("utm_campaign", name);
  dest.searchParams.set("utm_content", from);
  return dest.toString();
}
