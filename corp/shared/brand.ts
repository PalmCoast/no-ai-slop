export const BRAND_NAME = "AgentHive Inc";
export const LEGAL_NAME = "AGENTHIVEINCCOM LLC";
export const BRAND_PLACE = "Palm Coast, Florida";
export const BRAND_URL = "https://agenthiveinc.com";
export const CONTACT_EMAIL = "daniel@agenthiveinc.com";
export const CONSULT_TEL = "+13203356186";
export const CONSULT_DISPLAY = "+1 320-335-6186";
/** Header/footer display format, matching firstdeploy.ai. Always labeled as the live AI demo line. */
export const PHONE_DISPLAY = "(320) 335-6186";
export const CONSULT_DISPLAY_SEO = "+1-320-335-6186";
/** Sitemap lastmod for PAGE_SEO routes and sitemaps.xml. Not shown in page copy. */
export const CONTENT_LASTMOD = "2026-11-27";
export const FD_NAME = "First Deploy AI";
export const FD_URL = "https://firstdeploy.ai/";
export const FD_CHECK_URL = "https://firstdeploy.ai/#check";
export const FD_CONSULT_URL = "https://firstdeploy.ai/consult";
export const HIVE_CONSULT_PATH = "/consult";
export const HIVE_CONSULT_URL = "https://agenthiveinc.com/consult";
/** B2B reset 2026-11-24: free 30-minute Architecture & Spend Triage -> $2,500 sprint (5 business days) -> $3,500/mo retainer. */
/** Free 30-minute Architecture & Spend Triage booking (Google Calendar appointment page). */
export const TRIAGE_NAME = "Architecture & Spend Triage";
/** Google Appointment Schedule. Only used as the /triage 302 target, not as a public CTA href. */
export const TRIAGE_SCHEDULE_URL = "https://calendar.google.com/calendar/appointments/schedules/AcZssZ08PSsZYPUrigPxN1Ax27CJh01QY8fjWo1mGYVhlX5vh0QUTqBzXF4NSNwDyLw487B8fNegD8JV";
/** Public booking CTA path. /triage 302s to TRIAGE_SCHEDULE_URL so clicks can be attributed in PostHog. */
export const BOOK_HREF = "/triage";
export const TRIAGE_URL = `${BRAND_URL}/triage`;
export function triageFrom(pathname: string, slot: string): string {
  const page = pathname === "/" ? "home" : pathname.replace(/^\/+|\/+$/g, "").replace(/\//g, "-") || "home";
  return `${page}-${slot}`;
}
export function triageLinkProps(from: string) {
  return { href: BOOK_HREF, "data-ph-cta": "triage" as const, "data-ph-from": from };
}
/** Tracked booking path (2026-11-27): /go/triage logs go_click + triage_click server-side, then 302s to TRIAGE_SCHEDULE_URL. */
export const TRIAGE_GO_HREF = "/go/triage";
export function triageGoHref(from: string): string {
  return `${TRIAGE_GO_HREF}?from=${encodeURIComponent(from)}`;
}
/** Homepage triage buttons route through /go/triage. Other pages keep /triage. */
export function triageGoLinkProps(from: string) {
  return { href: triageGoHref(from), "data-ph-cta": "triage" as const, "data-ph-from": from };
}
/** Stripe Payment Link for the $2,500 Agent Audit & Stabilization Sprint. Destination of /go/sprint. */
export const SPRINT_STRIPE_URL = "https://buy.stripe.com/6oU14n2Es6CTfTf7ea2ZO1V";
export const SPRINT_GO_HREF = "/go/sprint";
export const SPRINT_NAME = "Agent Audit & Stabilization Sprint";
export const SPRINT_PRICE = "$2,500";
export const SPRINT_PRICE_AMOUNT = "2500.00";
/** Legacy names kept so older imports compile; they now point at the sprint. */
export const FD_AUDIT_STRIPE_URL = SPRINT_STRIPE_URL;
export const FD_AUDIT_URL = HIVE_CONSULT_PATH;
/** B2B invoice swap 2026-11-27: no self-serve checkout; every buy CTA books the free triage. */
export const TRIAGE_CTA_LABEL = "Book a free 30-minute triage";
export const INVOICE_LINE = "The sprint and retainer are invoiced after the call.";
/** $625 deposit link for the Deploy Agent go-live sprint (Deploy Agent keeps its own price). */
export const FD_PACK_URL = "https://buy.stripe.com/7sY9ATenabXd7mJ7ea2ZO1i";
export const FD_CONCIERGE_URL = "https://agenthiveinc.com/concierge";
/** Retired 2026-11-26: firstdeploy.ai/deploy-agent/ 301s to /consult. Kept name so older imports compile. */
export const FD_DEPLOY_AGENT_URL = FD_CONSULT_URL;
/** Freight Ops AI Agent two-week proof page on First Deploy AI (AI visibility packet 2026-11-20). */
export const FD_FREIGHT_URL = "https://firstdeploy.ai/freight-ops-ai-agent/";
export const FD_WHAT = "a $2,500 fixed-price sprint that cuts AI agent spend and stops loops, drift and redundant runs in 5 business days";
export const FD_PRICE = "a free 30-minute Architecture & Spend Triage, then a $2,500 sprint delivered in 5 business days, then a $3,500/mo retainer";
export const FD_OFFER =
  "Start with a free 30-minute Architecture & Spend Triage. The $2,500 Agent Audit & Stabilization Sprint fixes it in 5 business days. The $3,500/mo Fractional AI Ops retainer keeps it fixed.";
export const FD_PRICE_LINE =
  "The path: a free 30-minute Architecture & Spend Triage, then the $2,500 Agent Audit & Stabilization Sprint (5 business days), then the $3,500/mo Fractional AI Ops retainer.";
/** Same path as HTML with the live links, for prerendered bodies. */
export const FD_PRICE_LINE_HTML = `The path: a <a href="${BOOK_HREF}" data-ph-cta="triage" data-ph-from="prerender">free 30-minute Architecture & Spend Triage</a>, then the <a href="${HIVE_CONSULT_PATH}">$2,500 Agent Audit &amp; Stabilization Sprint</a> (5 business days), then the <a href="/concierge">$3,500/mo Fractional AI Ops retainer</a>.`;
export const FD_PROMISE = "Fixed price, done in your accounts, with before and after numbers";
export const FD_CTA_LABEL = "See First Deploy AI";
export const BOOK_CTA_LABEL = "Book the free 30-minute Architecture & Spend Triage";
export const FREE_30_LABEL = "Free triage";
export const FD_CHECK_LABEL = "2-minute check";
export const CONSULT_RATES = "free 30-minute Architecture & Spend Triage · $2,500 sprint · $3,500/mo retainer";
export const HERO_H1 = "Your agents are spending money while you sleep.";
export const HERO_WHAT =
  "We find the loops, repeat calls and drift in your Claude, Cursor or custom agent stack, then fix them in 5 days. Start with a free bill teardown.";
export const HERO_WHY = "";
export const FOOTER_LINE = "AgentHive Inc · Palm Coast, FL · firstdeploy.ai";
export const INDEXME_NAME = "IndexMe.lol";
export const INDEXME_URL = "https://indexme.lol/";
export const INDEXME_BLURB = "honest IndexNow indexing desk";

export const SEAT_CIRCUIT_NAME = "Seat & Circuit";
export const SEAT_CIRCUIT_URL = "https://infrastructure.agenthiveinc.com/";
export const FLICK_URL = "https://flick.firstdeploy.ai/";

/** Picks storefront: the one place for everything we sell or earn a fee on. */
export const PICKS_PATH = "/picks/";
export const PICKS_URL = `${BRAND_URL}/picks/`;
export const PICKS_LABEL = "Picks";

/** AgentHiveInc.com footer money path (B2B reset 2026-11-24). */
export const BILL_PAGE_PATH = "/send-your-bill";

export const MONEY_FOOTER_LINKS = [
  { href: BOOK_HREF, label: FREE_30_LABEL },
  { href: BILL_PAGE_PATH, label: "Send your AI bill" },
  { href: HIVE_CONSULT_PATH, label: "Sprint, $2,500" },
  { href: "/concierge", label: "Retainer, $3,500/mo" },
  { href: FD_URL, label: FD_NAME },
] as const;

/**
 * "Featured on" strip: directory listings for AgentHive Inc products (same badges as the firstdeploy.ai footer).
 */
export const FEATURED_ON = [
  { href: "https://twelve.tools", label: "Featured on Twelve Tools" },
  {
    href: "https://fazier.com",
    label: "Fazier badge",
    img: "https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=light",
    width: 120,
    height: 26,
  },
  {
    href: "https://launchaf.com/products/product-107",
    label: "Featured on LaunchAF",
    img: "https://launchaf.com/api/badge/light?v=launchaf-blue-2026-2",
    width: 200,
    height: 56,
  },
] as const;

/** Product names on their own footer row. B2B only; merch and deals live on Brooms.ai. */
export const PRODUCT_FOOTER_LINKS = [
  { href: "https://firstdeploy.ai", label: "First Deploy AI" },
  { href: HIVE_CONSULT_PATH, label: "Agent Audit & Stabilization Sprint" },
  { href: "/concierge", label: "Fractional AI Ops Retainer" },
  { href: FD_FREIGHT_URL, label: "Freight Ops AI Agent" },
  { href: "https://burnbook.firstdeploy.ai/", label: "Burn Book" },
  { href: "https://cardbutler.firstdeploy.ai/", label: "Card Butler" },
] as const;

/** The one allowed consumer link: merch and gear live on Brooms.ai, footer only. */
export const BROOMS_URL = "https://brooms.ai/";

export const LINKEDIN_URL = "https://www.linkedin.com/company/agenthiveinc";
/** Organization sameAs (AI visibility packet 2026-11-17). Company profiles only; Daniel's personal LinkedIn stays on the Person node. */
export const ORG_SAME_AS = [
  "https://x.com/AgentHiveAI",
  LINKEDIN_URL,
  "https://clutch.co/profile/agenthive",
  "https://www.goodfirms.co/company/agenthive-inc",
  "https://firstdeploy.ai/",
  "https://indexme.lol/",
] as const;
export const DANIEL_LINKEDIN_URL = "https://www.linkedin.com/in/daniel-graham-92057a15";
export const ADDRESS_LOCALITY = "Palm Coast";
export const ADDRESS_REGION = "FL";
export const ADDRESS_COUNTRY = "US";
export const ADDRESS_LINE = "Palm Coast, FL";
