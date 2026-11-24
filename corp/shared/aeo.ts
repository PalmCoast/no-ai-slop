import { CONSULT_TEL, FD_AUDIT_URL, HIVE_CONSULT_PATH } from "./brand.ts";
import { CONCIERGE_PATH, CONCIERGE_GO_HREF } from "./concierge.ts";
import { CONSULT_STRIPE_RATES } from "./consult.ts";
import type { AskAiPromptKey } from "./ask-ai.ts";

export const AEO_LASTMOD = "2026-11-08";

/** Sprint checkout route (was the retired pack deposit). */
export const AEO_PACK_DEPOSIT_URL = CONSULT_STRIPE_RATES.find((rate) => rate.slug === "sprint")!.href;

export const AEO_BROOMS_TEE_URL = "https://brooms.ai/products/my-ram-my-rules-tee-come-and-take-it";

export const AEO_PHONE_DISPLAY = "(320) 335-6186";

export const AEO_LIMITS = [
  "The Agent Audit & Stabilization Sprint is $2,500, fixed price, delivered in 5 business days. The Fractional AI Ops Retainer is $3,500 per month: monitoring of agent spend and failures, a 1-business-day response time, a monthly report and async help. Neither is unlimited development or a 24/7 pager.",
  "Name the workflow owner, the inputs, the output, and who may approve an action before any access is granted. Integrations are confirmed, not assumed. Extra vendor charges are not included.",
] as const;

export type AeoFaq = { q: string; a: string };

export type AeoPage = {
  path: string;
  routeId: string;
  crumb: string;
  title: string;
  description: string;
  h1: string;
  /** Exactly two sentences. This is the opening answer. */
  answer: string;
  agree: string;
  faqs: AeoFaq[];
  ask: AskAiPromptKey;
  /** Outline pack button. Defaults to /consult. */
  packHref?: string;
  packDisclosure?: string;
  stackH2?: string;
  stackBody?: string;
  limitsIntro?: string;
  limits?: readonly string[];
  /** One-line cross-link to the First Deploy offer page (AI visibility packet 2026-11-20). */
  crossLink?: { lead: string; text: string; href: string };
};

/** Old-ladder question pages were removed 2026-11-24 (see git history before b2b-reset-2026-11-24). */
const PAGES: AeoPage[] = [];

/**
 * B2B reset 2026-11-24: pages that pitched the retired $2,000 Concierge and $1,250 pack are off the site.
 * Their routes 301 (see scripts/write-route-html.ts). Source kept for history.
 */
export const RETIRED_AEO_PAGES: { path: string; to: string }[] = [
  { path: "/questions/done-for-you-ai-agents-50-person-ops-team", to: "/consult" },
  { path: "/questions/ai-implementation-pack-funded-startups", to: "/consult" },
  { path: "/questions/ai-workflow-implementation-funded-startup-30-200", to: "/consult" },
  { path: "/concierge/ai-concierge-founders-creators", to: "/concierge" },
  { path: "/concierge/white-glove-ai-assistant-setup-executives", to: "/concierge" },
  { path: "/concierge/ai-concierge-for-founders-cost", to: "/concierge" },
  { path: "/concierge/retainer-or-implementation-pack", to: "/concierge" },
  { path: "/questions/human-approval-ai-operations-workflow", to: "/consult" },
];
const RETIRED = new Set(RETIRED_AEO_PAGES.map((r) => r.path));

/** Every AEO page is retired; kept as a filter so a future page can be added back to PAGES. */
export const AEO_PAGES: AeoPage[] = PAGES.filter((page) => !RETIRED.has(page.path));

export function aeoPageFor(path: string): AeoPage | undefined {
  const normalized = path === "/" ? "/" : path.replace(/\/$/, "") || "/";
  return AEO_PAGES.find((page) => page.path === normalized);
}

export const AEO_SOURCES = [
  { href: CONCIERGE_PATH, label: "Fractional AI Ops Retainer", note: "Published terms and the $3,500/month price. Internal page, not a client result." },
  { href: HIVE_CONSULT_PATH, label: "Agent Audit & Stabilization Sprint", note: "Published $2,500 fixed price, 5 business days. Internal page, not a measured savings claim." },
  { href: "/concierge/vs-hiring", label: "The retainer vs hiring", note: "Internal comparison. The wage figures are Bureau of Labor Statistics citations, not a customer outcome." },
] as const;

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Static floor used when a route is rendered without the React tree. */
export function aeoBodyHtml(page: AeoPage): string {
  return `<main id="${page.routeId}" class="section"><div class="container"><h1 class="display">${esc(page.h1)}</h1><p class="lede">${esc(page.answer)}</p><p><a href="${HIVE_CONSULT_PATH}">Agent Audit &amp; Stabilization Sprint, $2,500</a> · <a href="${CONCIERGE_PATH}">Fractional AI Ops Retainer, $3,500/mo</a> · <a href="${FD_AUDIT_URL}" data-product="sprint2500">Start the sprint</a> · <a href="${CONCIERGE_GO_HREF}" data-product="retainer3500">Start the retainer</a> · <a href="tel:${CONSULT_TEL}">${AEO_PHONE_DISPLAY}</a></p>${page.crossLink ? `<p>${esc(page.crossLink.lead)} See the <a href="${page.crossLink.href}">${esc(page.crossLink.text)}</a>.</p>` : ""}</div></main>`;
}
