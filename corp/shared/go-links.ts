// First-party click tracker map for agenthiveinc.com/go/<name>.
// Same pattern as firstdeploy.ai/go/<name>: log the click, then 302 to the
// exact destination with tracking params appended at redirect time.
// Stripe Payment Links: every URL below was verified active at the advertised
// price in /workspace/buy-path-audit-2026-09-28/REPORT.md (2026-09-28).
// Flick and HillMirror build their Checkout server-side, so /go sends the
// buyer to the product page that holds the working plan buttons.
export type GoLink = { url: string; kind: "stripe" | "page"; label: string };

export const GO_LINKS: Record<string, GoLink> = {
  // First Deploy has its own tracker; /go/first-deploy hands off to it.
  "first-deploy": { url: "https://firstdeploy.ai/go/start", kind: "page", label: "First Deploy — $1,750 setup + $250/mo" },
  concierge: { url: "https://buy.stripe.com/6oUeVd7YM3qH0Ylbuq2ZO1u", kind: "stripe", label: "AI Concierge — $2,000/mo" },
  "jobproof-solo": { url: "https://buy.stripe.com/5kQfZhcf29P536tbuq2ZO1f", kind: "stripe", label: "JobProof Solo — $49/mo" },
  "jobproof-crew": { url: "https://buy.stripe.com/bJe14n7YMaT95eB6a62ZO1e", kind: "stripe", label: "JobProof Crew — $99/mo" },
  "indexme-pro": { url: "https://buy.stripe.com/4gMcN52Ese5ldL7cyu2ZO1a", kind: "stripe", label: "IndexMe Pro — $19.99 once" },
  "indexme-studio": { url: "https://buy.stripe.com/aFa00jfre2mD8qN5622ZO1b", kind: "stripe", label: "IndexMe Studio — $29.99 once" },
  flick: { url: "https://flick.firstdeploy.ai/", kind: "page", label: "Flick — Lights $19/mo · Marquee $99 once" },
  hillmirror: { url: "https://hillmirror-firstdeploy.netlify.app/", kind: "page", label: "HillMirror — from $4.99" },
};

export const cleanToken = (s: unknown, max = 40): string =>
  String(s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, max);

/** `?src=audit` marks an agent/audit run: /go answers 200 with the target instead of redirecting. */
export const isAuditSrc = (src: string | null | undefined): boolean => /^audit/i.test(String(src ?? ""));

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
