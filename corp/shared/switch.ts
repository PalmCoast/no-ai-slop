import { BRAND_URL, FD_NAME } from "./brand.ts";
import type { Faq } from "./faqs.ts";

/**
 * Public desk offer. This file is imported by the site, so it holds our
 * price and our terms only. Competitor names and their price tables are
 * intel: they are not stored here.
 *
 * The monthly and the year-one total are set under every paid plan checked
 * on 2026-10-19. The ceilings live in corp/tests/switch.test.ts.
 */
export const SWITCH_PATH = "/switch";
export const SWITCH_URL = `${BRAND_URL}${SWITCH_PATH}`;
export const SWITCH_PUBLISHED_ISO = "2026-10-19";
export const SWITCH_ENDS = "November 30, 2026";
export const SWITCH_ENDS_ISO = "2026-11-30";

/** Published First Deploy price, after the offer window. */
export const FD_SETUP_LIST = 1_750;
export const FD_SETUP_START = 875;
export const FD_MONTHLY = 250;

/** Offer price. No setup fee. Flat monthly, under the paid plans we checked. */
export const SWITCH_MONTHLY = 125;
export const SWITCH_SETUP = 0;
export const SWITCH_SETUP_LABEL = "$0";
export const SWITCH_MONTHLY_LABEL = "$125/mo";
export const SWITCH_YEAR_ONE = SWITCH_SETUP + SWITCH_MONTHLY * 12;
export const SWITCH_YEAR_TWO = SWITCH_MONTHLY * 12;
export const FD_LIST_YEAR_ONE = FD_SETUP_LIST + FD_MONTHLY * 12;

export const SWITCH_TITLE = "After-hours desk: $125/mo, no setup fee | AgentHive Inc";
export const SWITCH_DESCRIPTION =
  "First Deploy AI answers after hours for $125 a month. No setup fee on plans started by November 30, 2026.";
export const SWITCH_H1 = "The after-hours desk. $125 a month. No setup fee.";
export const SWITCH_LEDE = `${FD_NAME} answers in your shop's name, on your number, after hours. Built for you, tested against hard callers, then ${SWITCH_MONTHLY_LABEL}. No per-call rate. No minutes. No setup fee on a plan started by ${SWITCH_ENDS}.`;

export const SWITCH_GUARANTEE =
  "You pay nothing until the desk is live. Miss the go-live date written in your plan and the first month is on us.";

export const SWITCH_TERMS: string[] = [
  `${SWITCH_MONTHLY_LABEL} from go-live, invoiced monthly. No setup fee on a plan started by ${SWITCH_ENDS}. No calls counted, no minutes metered, no overage line. Cancel any time and the line goes dark.`,
  `A plan started by ${SWITCH_ENDS} stays at ${SWITCH_MONTHLY_LABEL}. After that date, a new plan is the published price: $1,750 setup, then $250 a month.`,
  SWITCH_GUARANTEE,
  `Year one is $${SWITCH_YEAR_ONE.toLocaleString("en-US")}. Year two is $${SWITCH_YEAR_TWO.toLocaleString("en-US")}. The monthly does not step up.`,
];

export const SWITCH_POINTS: { h: string; p: string }[] = [
  {
    h: "Built for you",
    p: "We write the greeting, the questions, and the emergency rules, put them on your number, and run practice calls against angry, confused, and emergency callers before the desk goes live.",
  },
  {
    h: "One number every month",
    p: "A long call and a short call cost the same. The bill is $125. Nothing is counted, and nothing is added at the end of the month.",
  },
  {
    h: "Cancel any time",
    p: "Turn the monthly off and the line goes dark that month. There is no notice period.",
  },
];

export const SWITCH_FAQS: Faq[] = [
  {
    q: "What does $125 a month include?",
    a: `${FD_NAME} builds the after-hours desk in your shop's name, on your number, tests it against hard callers, and runs it. Tuning after go-live is included. There is no per-call rate and no minute meter.`,
  },
  {
    q: "Is there a setup fee?",
    a: `Not on a plan started by ${SWITCH_ENDS}. After that date the published price is $1,750 setup, then $250 a month.`,
  },
  {
    q: "When does the monthly start?",
    a: "When the desk goes live, on the date in your written plan. Nothing is billed before that.",
  },
  {
    q: "What if you miss the go-live date?",
    a: SWITCH_GUARANTEE,
  },
  {
    q: "Can I cancel?",
    a: "Yes. Cancel the monthly any time and the line goes dark that month.",
  },
];
