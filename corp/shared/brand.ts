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
export const FD_AUDIT_URL = "https://buy.stripe.com/eVq9ATbaY6CT6iF7ea2ZO1g";
export const FD_PACK_URL = "https://buy.stripe.com/7sY9ATenabXd7mJ7ea2ZO1i";
export const FD_CONCIERGE_URL = "https://agenthiveinc.com/concierge";
export const FD_WHAT = "a $150 burn-audit hour that finds what\u2019s burning your team\u2019s AI agent spend";
export const FD_PRICE = "$150 burn-audit hour, then a $1,250 operator pack ($625 deposit) or Concierge at $2,000/mo";
export const FD_OFFER =
  "Start with the $150 burn-audit hour. Then fix it with the $1,250 operator pack ($625 deposit), or keep it running with Concierge at $2,000/mo.";
export const FD_PRICE_LINE =
  "First Deploy AI path: a $150 burn-audit hour, then the $1,250 operator pack ($625 deposit), then Concierge at $2,000/mo.";
/** Same path as HTML with the live checkout links, for prerendered bodies. */
export const FD_PRICE_LINE_HTML = `First Deploy AI path: a <a href="${FD_AUDIT_URL}">$150 burn-audit hour</a>, then the <a href="${FD_PACK_URL}">$1,250 operator pack ($625 deposit)</a>, then <a href="/concierge">Concierge at $2,000/mo</a>.`;
export const FD_PROMISE = "Built and run for you on a written plan";
export const FD_CTA_LABEL = "Start First Deploy";
export const BOOK_CTA_LABEL = "Book the free 30";
export const FREE_30_LABEL = "Free 30";
export const FD_CHECK_LABEL = "2-minute check";
export const CONSULT_RATES = "$75 / 30 min · $150 / hour";
export const HERO_H1 = "A done-for-you AI operator for teams that move fast.";
export const HERO_WHAT =
  "For funded companies and 30–200 person teams that already pay for software. We build it to your brand, run it, and hand you the finished result.";
export const HERO_WHY = "New ads every week. A senior operator on call. Your brand looking finished everywhere a buyer sees it.";
export const FOOTER_LINE = "AgentHive Inc · Palm Coast, FL · firstdeploy.ai";
export const INDEXME_NAME = "IndexMe.lol";
export const INDEXME_URL = "https://indexme.lol/";
export const INDEXME_BLURB = "honest IndexNow indexing desk";
/** Free 30-minute qualifier booking. Shop / demo line stays CONSULT_TEL. */
export const BOOK_HREF = "https://calendly.com/coltsinsider/30min";
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
  { href: "https://firstdeploy.ai", label: "First Deploy" },
  { href: "https://burnbook.firstdeploy.ai/", label: "Burn Book" },
  { href: "https://cardbutler.firstdeploy.ai/", label: "Card Butler" },
  { href: "/ram-deals/", label: "RAM & rig deals" },
] as const;

export const LINKEDIN_URL = "https://www.linkedin.com/company/agenthiveinc";
export const DANIEL_LINKEDIN_URL = "https://www.linkedin.com/in/daniel-graham-92057a15";
export const ADDRESS_LOCALITY = "Palm Coast";
export const ADDRESS_REGION = "FL";
export const ADDRESS_COUNTRY = "US";
export const ADDRESS_LINE = "Palm Coast, FL";
