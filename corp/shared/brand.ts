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
export const CONTENT_LASTMOD = "2026-11-01";
export const FD_NAME = "First Deploy AI";
export const FD_URL = "https://firstdeploy.ai/";
export const FD_CHECK_URL = "https://firstdeploy.ai/#check";
export const FD_CONSULT_URL = "https://firstdeploy.ai/consult";
export const HIVE_CONSULT_PATH = "/consult";
export const HIVE_CONSULT_URL = "https://agenthiveinc.com/consult";
/** Current First Deploy path (2026-11-10): $150 audit -> $1,250 pack ($625 deposit) -> $2,000/mo Concierge. */
/** Stripe Payment Link for the $150 burn-audit hour. Destination of /go/ads-sprint. */
export const FD_AUDIT_STRIPE_URL = "https://buy.stripe.com/eVq9ATbaY6CT6iF7ea2ZO1g";
/** Live CTA href. /go/ads-sprint already 302s to FD_AUDIT_STRIPE_URL (same $150 audit). */
export const FD_AUDIT_URL = "/go/ads-sprint";
/** Stripe Payment Link for the $625 pack deposit. No /go route exists yet (needs Atlas). */
export const FD_PACK_URL = "https://buy.stripe.com/7sY9ATenabXd7mJ7ea2ZO1i";
export const FD_CONCIERGE_URL = "https://agenthiveinc.com/concierge";
export const FD_DEPLOY_AGENT_URL = "https://firstdeploy.ai/deploy-agent/";
/** Freight Ops AI Agent two-week proof page on First Deploy AI (AI visibility packet 2026-11-20). */
export const FD_FREIGHT_URL = "https://firstdeploy.ai/freight-ops-ai-agent/";
export const FD_WHAT = "a $150 burn-audit hour that finds what\u2019s burning your team\u2019s AI agent spend";
export const FD_PRICE = "$150 burn-audit hour, then a $1,250 operator pack ($625 deposit) or Concierge at $2,000/mo";
export const FD_OFFER =
  "Start with the $150 burn-audit hour. Then fix it with the $1,250 operator pack ($625 deposit), or keep it running with Concierge at $2,000/mo.";
export const FD_PRICE_LINE =
  "First Deploy AI path: a $150 burn-audit hour, then the $1,250 operator pack ($625 deposit), then Concierge at $2,000/mo.";
/** Same path as HTML with the live checkout links, for prerendered bodies. */
export const FD_PRICE_LINE_HTML = `First Deploy AI path: a <a href="${FD_AUDIT_URL}" data-product="audit150" data-utm-source="dir" data-utm-medium="page" data-utm-content="ah-prerender-audit">$150 burn-audit hour</a>, then the <a href="${FD_PACK_URL}" data-product="pack1250" data-utm-source="dir" data-utm-medium="page" data-utm-content="ah-prerender-pack">$1,250 operator pack ($625 deposit)</a>, then <a href="/concierge">Concierge at $2,000/mo</a>.`;
export const FD_PROMISE = "Built and run for you on a written plan";
export const FD_CTA_LABEL = "Start First Deploy";
export const BOOK_CTA_LABEL = "Book the free 30";
export const FREE_30_LABEL = "Free 30";
export const FD_CHECK_LABEL = "2-minute check";
export const CONSULT_RATES = "$75 / 30 min · $150 / hour";
export const HERO_H1 = "Finished work your leadership can point to.";
export const HERO_WHAT =
  "A senior operator on the calls, not a PDF of prompts. We build it with you, in your accounts, and you keep the assets. Start with a free 30-minute call.";
export const HERO_WHY = "";
export const FOOTER_LINE = "AgentHive Inc · Palm Coast, FL · firstdeploy.ai";
export const INDEXME_NAME = "IndexMe.lol";
export const INDEXME_URL = "https://indexme.lol/";
export const INDEXME_BLURB = "honest IndexNow indexing desk";
/** Free 30-minute qualifier booking. Shop / demo line stays CONSULT_TEL. */
export const BOOK_HREF = "https://calendar.google.com/calendar/appointments/schedules/AcZssZ08PSsZYPUrigPxN1Ax27CJh01QY8fjWo1mGYVhlX5vh0QUTqBzXF4NSNwDyLw487B8fNegD8JV";
export const SEAT_CIRCUIT_NAME = "Seat & Circuit";
export const SEAT_CIRCUIT_URL = "https://infrastructure.agenthiveinc.com/";
export const FLICK_URL = "https://flick.firstdeploy.ai/";

/** Picks storefront: the one place for everything we sell or earn a fee on. */
export const PICKS_PATH = "/picks/";
export const PICKS_URL = `${BRAND_URL}/picks/`;
export const PICKS_LABEL = "Picks";

/** AgentHiveInc.com footer money path: /picks first, max 5. */
export const MONEY_FOOTER_LINKS = [
  { href: PICKS_PATH, label: PICKS_LABEL },
  { href: "/ads", label: "AI Ad Sprint" },
  { href: "/concierge", label: "AI Concierge" },
  { href: HIVE_CONSULT_PATH, label: "Consult" },
  { href: BOOK_HREF, label: FREE_30_LABEL },
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

/** Product names on their own footer row. Money links above stay unchanged. */
export const PRODUCT_FOOTER_LINKS = [
  { href: PICKS_PATH, label: "Picks" },
  { href: "/ads", label: "AI Ad Sprint" },
  { href: "/concierge", label: "AI Concierge" },
  { href: FD_DEPLOY_AGENT_URL, label: "Deploy Agent" },
  { href: FD_FREIGHT_URL, label: "Freight Ops AI Agent" },
  { href: "https://firstdeploy.ai", label: "First Deploy" },
  { href: "https://burnbook.firstdeploy.ai/", label: "Burn Book" },
  { href: "https://cardbutler.firstdeploy.ai/", label: "Card Butler" },
  { href: "/ram-deals/", label: "RAM & rig deals" },
] as const;

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
