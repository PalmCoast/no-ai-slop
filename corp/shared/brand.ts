export const BRAND_NAME = "AgentHive Inc";
export const LEGAL_NAME = "AGENTHIVEINCCOM LLC";
export const BRAND_PLACE = "Palm Coast, Florida";
export const BRAND_URL = "https://agenthiveinc.com";
export const CONTACT_EMAIL = "daniel@agenthiveinc.com";
export const CONSULT_TEL = "+13203356186";
export const CONSULT_DISPLAY = "+1 320-335-6186";
export const CONSULT_DISPLAY_SEO = "+1-320-335-6186";
export const CONTENT_LASTMOD = "2026-09-21";
export const FD_NAME = "First Deploy AI";
export const FD_URL = "https://firstdeploy.ai/";
export const FD_CHECK_URL = "https://firstdeploy.ai/#check";
export const FD_CONSULT_URL = "https://firstdeploy.ai/consult";
export const HIVE_CONSULT_PATH = "/consult";
export const HIVE_CONSULT_URL = "https://agenthiveinc.com/consult";
export const FD_PRICE = "$1,750 setup (50% to start or pay in full), then $250/mo";
export const FD_PROMISE = "Live this week on the same written plan we run for active client builds";
export const FD_CTA_LABEL = "Start First Deploy";
export const BOOK_CTA_LABEL = "Book the free 30";
export const FREE_30_LABEL = "Free 30";
export const FD_CHECK_LABEL = "2-minute check";
export const CONSULT_RATES = "$75 / 30 min · $150 / hour";
export const HERO_H1 = "AgentHive Inc embeds working AI in field operations.";
export const HERO_WHAT =
  "Start with First Deploy AI: after-hours booking + live apps for dirt, plants, and shops.";
export const HERO_WHY = "Night calls go unanswered. Quotes live on a whiteboard. The crew waits on the owner.";
export const FOOTER_LINE = "AgentHive Inc · Palm Coast, FL · firstdeploy.ai";
export const OTHER_HIVES = "Not agenthive.io (insurance) or agenthive.co.";
export const INDEXME_NAME = "IndexMe.lol";
export const INDEXME_URL = "https://indexme.lol/";
export const INDEXME_BLURB = "honest IndexNow indexing desk";
export const CALENDLY_URL = "https://calendly.com/coltsinsider/30min";
export const SEAT_CIRCUIT_NAME = "Seat & Circuit";
export const SEAT_CIRCUIT_URL = "https://infrastructure.agenthiveinc.com/";
export const FLICK_URL = "https://flick.firstdeploy.ai/";
export const JOBPROOF_URL = "https://jobproof.firstdeploy.ai/";

/** AgentHiveInc.com footer money path: FD-first, max 5, no product catalog. */
export const MONEY_FOOTER_LINKS = [
  { href: FD_URL, label: FD_NAME },
  { href: FD_CHECK_URL, label: FD_CHECK_LABEL },
  { href: CALENDLY_URL, label: FREE_30_LABEL, external: true },
  { href: HIVE_CONSULT_PATH, label: "Consult" },
  { href: SEAT_CIRCUIT_URL, label: SEAT_CIRCUIT_NAME },
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
    href: "https://launchaf.com/products/product-105",
    label: "Featured on LaunchAF",
    img: "https://launchaf.com/api/badge/light?v=launchaf-blue-2026-2",
    width: 200,
    height: 56,
  },
] as const;

/** Product names on their own footer row. Money links above stay unchanged. */
export const PRODUCT_FOOTER_LINKS = [
  { href: "https://firstdeploy.ai", label: "First Deploy" },
  { href: "/concierge", label: "AI Concierge" },
  { href: "https://netyard.firstdeploy.ai", label: "NetYard" },
] as const;

export const LINKEDIN_URL = "https://www.linkedin.com/company/agenthiveinc";
export const DANIEL_LINKEDIN_URL = "https://www.linkedin.com/in/daniel-graham-92057a15";
export const STREET_ADDRESS = "95 Barrington Drive";
export const ADDRESS_LOCALITY = "Palm Coast";
export const ADDRESS_REGION = "FL";
export const POSTAL_CODE = "32137";
export const ADDRESS_COUNTRY = "US";
export const ADDRESS_LINE = "95 Barrington Drive, Palm Coast, FL 32137";
