/**
 * Consult guide pages.
 * Copy states AgentHive Inc prices only. No other firm's name and no market range we did not publish.
 */
export const CONSULT_COMPARE_CHECKED = "October 19, 2026";
export const CONSULT_COMPARE_CHECKED_ISO = "2026-10-19";

export type ConsultCompareSection = {
  h2: string;
  paras?: string[];
  bullets?: string[];
  table?: { head: string[]; rows: string[][]; note?: string };
};

export type ConsultComparePage = {
  path: string;
  crumb: string;
  neutral: string;
  title: string;
  description: string;
  h1: string;
  lede: string;
  sections: ConsultCompareSection[];
  pickThem: { h2: string; bullets: string[] };
  pickUs: { h2: string; bullets: string[] };
  faqs: { q: string; a: string }[];
  sources: string[];
  /** Visible "checked" date. Defaults to CONSULT_COMPARE_CHECKED. */
  checked?: string;
  /** Article dateModified (ISO). Defaults to CONSULT_COMPARE_CHECKED_ISO. datePublished stays the shared ISO. */
  dateModified?: string;
  /** Hero buttons. Defaults to the free 30, pricing and call buttons. */
  actions?: { label: string; href: string }[];
};

/** Old-ladder compare pages were removed 2026-11-24 (see git history before b2b-reset-2026-11-24). */
const ALL_CONSULT_COMPARE_PAGES: ConsultComparePage[] = [];

export function consultComparePageFor(path: string): ConsultComparePage | undefined {
  return CONSULT_COMPARE_PAGES.find((page) => page.path === path);
}

/**
 * B2B reset 2026-11-24: every compare page priced the retired $75 / $150 / $1,250 consult ladder.
 * All of them 301 to /consult now (scripts/write-route-html.ts). Source kept for history.
 */
export const RETIRED_CONSULT_PATHS: string[] = [
  "/consult/ai-consultant-cost",
  "/consult/ai-help-30-minute-blocks",
  "/consult/ai-consultant-vs-agency-vs-fractional",
  "/consult/ai-consultant-hourly-rate",
  "/consult/free-ai-consultation",
  "/consult/ai-audit-cost",
];
/** Old page data, not routed. */
export const RETIRED_CONSULT_COMPARE_DATA = ALL_CONSULT_COMPARE_PAGES;
export const CONSULT_COMPARE_PAGES: ConsultComparePage[] = [];
