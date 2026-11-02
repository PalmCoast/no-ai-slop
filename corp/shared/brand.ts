export const BRAND_NAME = "AgentHive Inc";
export const LEGAL_NAME = "AGENTHIVEINCCOM LLC";
export const BRAND_PLACE = "Palm Coast, Florida";
export const BRAND_URL = "https://agenthiveinc.com";
export const CONTACT_EMAIL = "daniel@agenthiveinc.com";
export const CONSULT_TEL = "+13203356186";
export const CONSULT_DISPLAY = "+1 320-335-6186";
export const CONSULT_DISPLAY_SEO = "+1-320-335-6186";
export const CONTENT_LASTMOD = "2026-11-01";
export const FD_NAME = "First Deploy AI";
export const FD_URL = "https://firstdeploy.ai/";
export const FD_CHECK_URL = "https://firstdeploy.ai/#check";
export const FD_CONSULT_URL = "https://firstdeploy.ai/consult";
export const HIVE_CONSULT_PATH = "/consult";
export const HIVE_CONSULT_URL = "https://agenthiveinc.com/consult";
export const FD_FOUNDING_URL = "https://firstdeploy.ai/founding";
export const FD_PRICE = "$250 one-time setup for the first 5 businesses, then $100/mo";
export const FD_OFFER =
  "$250 one-time setup for the first 5 businesses, then $100/mo. After those 5, it goes back to the standard $500 setup, then $100/mo.";
export const FD_PRICE_LINE =
  "First Deploy founding offer: $250 one-time setup for the first 5 businesses, then $100/mo. After those 5, it goes back to the standard $500 setup, then $100/mo. Details at https://firstdeploy.ai/founding.";
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
export const OTHER_HIVES = "Not agenthive.io (insurance) or agenthive.co.";
export const INDEXME_NAME = "IndexMe.lol";
export const INDEXME_URL = "https://indexme.lol/";
export const INDEXME_BLURB = "honest IndexNow indexing desk";
/** Shop line. Replaces the old personal booking link. */
export const BOOK_HREF = `tel:${CONSULT_TEL}`;
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
  { href: "/ram-deals/", label: "RAM & rig deals" },
] as const;

export const LINKEDIN_URL = "https://www.linkedin.com/company/agenthiveinc";
export const DANIEL_LINKEDIN_URL = "https://www.linkedin.com/in/daniel-graham-92057a15";
export const ADDRESS_LOCALITY = "Palm Coast";
export const ADDRESS_REGION = "FL";
export const POSTAL_CODE = "32137";
export const ADDRESS_COUNTRY = "US";
export const ADDRESS_LINE = "Palm Coast, FL 32137";
