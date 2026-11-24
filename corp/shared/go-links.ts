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
  // First Deploy has its own tracker; /go/first-deploy hands off to it.
  "first-deploy": { url: "https://firstdeploy.ai/go/start", kind: "page", label: "First Deploy — $150 burn-audit hour" },
  concierge: { url: "https://buy.stripe.com/6oUeVd7YM3qH0Ylbuq2ZO1u", kind: "stripe", label: "AI Concierge — $2,000/mo" },
  "indexme-pro": { url: "https://buy.stripe.com/4gMcN52Ese5ldL7cyu2ZO1a", kind: "stripe", label: "IndexMe Pro — $19.99 once" },
  "indexme-studio": { url: "https://buy.stripe.com/aFa00jfre2mD8qN5622ZO1b", kind: "stripe", label: "IndexMe Studio — $29.99 once" },
  flick: { url: "https://flick.firstdeploy.ai/", kind: "page", label: "Flick — Lights $19/mo · Marquee $99 once" },
  // /go/ads-sprint was the $297 AI Ad Sprint checkout. On 2026-11-21 that offer was retired;
  // this route now points at the $150 burn-audit hour so existing CTAs keep UTMs and client_reference_id.
  // Tests check the redirect target only; do not fetch these URLs.
  "ads-sprint": { url: "https://buy.stripe.com/eVq9ATbaY6CT6iF7ea2ZO1g", kind: "stripe", label: "AI Consult — $150 burn-audit hour (Ad Sprint traffic retarget)" },
  "ads-engine": { url: "https://buy.stripe.com/4gM9ATa6U2mD36tbuq2ZO1M", kind: "stripe", label: "AI Ad Sprint monthly — $997/mo" },
  // Live on Palm Coast AI, 2026-11-10: price_1UaJ40FJWYd4pYuxxNJ078sT, unit_amount 75000.
  "burn-book": { url: "https://buy.stripe.com/7sYcN5a6Ud1hcH3eGC2ZO1O", kind: "stripe", label: "Burn Book board packet — $750 once" },
  // Added 2026-11-23 so Design can swap remaining raw Payment Links.
  // /go/consult-30 = $75 30-minute consult (ZO1h). /go/deposit and /go/pack = $625 pack deposit (ZO1i).
  "consult-30": { url: "https://buy.stripe.com/fZufZh92Qf9p5eB2XU2ZO1h", kind: "stripe", label: "AI Consult — $75 / 30 minutes" },
  deposit: { url: "https://buy.stripe.com/7sY9ATenabXd7mJ7ea2ZO1i", kind: "stripe", label: "Implementation pack deposit — $625 ($1,250 pack)" },
  pack: { url: "https://buy.stripe.com/7sY9ATenabXd7mJ7ea2ZO1i", kind: "stripe", label: "Implementation pack deposit — $625 ($1,250 pack)" },
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
  if (name === "first-deploy") {
    // firstdeploy.ai/go/start logs `from` and sets client_reference_id + UTMs itself.
    dest.searchParams.set("from", from);
    return dest.toString();
  }
  if (link.kind === "stripe") {
    dest.searchParams.set("client_reference_id", `ah_${from}_${name}`.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 200));
  }
  dest.searchParams.set("utm_source", src);
  dest.searchParams.set("utm_medium", "hub");
  dest.searchParams.set("utm_campaign", name);
  dest.searchParams.set("utm_content", from);
  return dest.toString();
}
