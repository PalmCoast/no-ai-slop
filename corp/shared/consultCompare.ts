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
};

const C = CONSULT_COMPARE_CHECKED;
const OURS =
  "AgentHive Inc: a free 30-minute call, then $75 for 30 minutes, $150 an hour, or a 10-hour pack for $1,250 ($125 an hour, $625 up front, the rest when the hours start). Daniel Graham runs every session by video in your own accounts, one task at a time. AI Concierge is the $2,000-a-month retainer if you want someone every month.";
const OUR_SOURCE = `AgentHive Inc prices on agenthiveinc.com/consult, checked ${C}.`;

const PRICE_TABLE = {
  head: ["What you buy", "AgentHive Inc"],
  rows: [
    ["First call", "Free, 30 minutes"],
    ["30 minutes", "$75"],
    ["1 hour", "$150"],
    ["10-hour pack", "$1,250 ($625 up front)"],
    ["Monthly", "AI Concierge, $2,000"],
  ],
  note: `These are our published prices, checked ${C}.`,
};

function page(partial: Omit<ConsultComparePage, "sources" | "pickThem" | "pickUs"> & {
  pickThem?: ConsultComparePage["pickThem"];
  pickUs?: ConsultComparePage["pickUs"];
}): ConsultComparePage {
  return {
    ...partial,
    pickThem: partial.pickThem ?? {
      h2: "A short call is enough when",
      bullets: [
        "You have one task and want a yes or no",
        "You are not ready to book a full hour",
        "You want the price before any paid time",
      ],
    },
    pickUs: partial.pickUs ?? {
      h2: "Book paid time when",
      bullets: [
        "The task needs setup in your own accounts",
        "You want notes you keep after the call",
        "You want a pack or a monthly retainer",
      ],
    },
    sources: [OUR_SOURCE],
  };
}

export const CONSULT_COMPARE_PAGES: ConsultComparePage[] = [
  page({
    path: "/consult/ai-help-30-minute-blocks",
    neutral: "30-minute blocks",
    crumb: "30-minute blocks",
    title: "AI help in 30-minute blocks, then $75 | AgentHive Inc",
    description: "AgentHive Inc sells 30 minutes for $75 and an hour for $150, after a free 30-minute call. US-wide, by video.",
    h1: "AI help in 30-minute blocks",
    lede: "You can buy 30 minutes at a time. The first call is free. Paid time after that is $75 for 30 minutes or $150 an hour.",
    sections: [
      { h2: "What we charge", paras: [OURS] },
      { h2: "The blocks", table: PRICE_TABLE },
    ],
    faqs: [
      {
        q: "Can I buy less than an hour?",
        a: "Yes. After the free 30-minute call, a paid block is $75 for 30 minutes or $150 for an hour.",
      },
      {
        q: "Where do I start?",
        a: "Call +1 320-335-6186. Bring the one task you most want off your plate.",
      },
    ],
  }),
  page({
    path: "/consult/ai-consultant-vs-agency-vs-fractional",
    neutral: "Hourly, a pack, or monthly",
    crumb: "Hourly, a pack, or monthly",
    title: "Hourly AI help, a 10-hour pack, or a monthly retainer | AgentHive Inc",
    description: "Three ways to buy time from AgentHive Inc: $75 / 30 min, a $1,250 pack, or AI Concierge at $2,000/mo.",
    h1: "Hourly help, a pack, or a monthly retainer",
    lede: "Pick the shape of the work. A single block, a 10-hour pack, or two sessions every month. The prices below are ours.",
    sections: [
      {
        h2: "Three ways to buy",
        bullets: [
          "30 minutes for $75, or an hour for $150, after a free 30-minute call",
          "10 hours for $1,250, with $625 up front",
          "AI Concierge at $2,000 a month: two 45-minute sessions, async notes, and a shared inventory",
        ],
      },
      { h2: "The prices", table: PRICE_TABLE },
    ],
    faqs: [
      {
        q: "Which option is for a one-off task?",
        a: "The free 30-minute call, then $75 or $150 if the task needs paid time.",
      },
      {
        q: "Which option is for every month?",
        a: "AI Concierge is $2,000 a month. Hourly time stays open if you only need a few hours.",
      },
    ],
  }),
  page({
    path: "/consult/ai-consultant-hourly-rate",
    neutral: "Our hourly rate",
    crumb: "Our hourly rate",
    title: "Our AI consultant hourly rate: $150, or $75 for 30 minutes | AgentHive Inc",
    description: "AgentHive Inc charges $150 an hour, $75 for 30 minutes, or $125 an hour inside a 10-hour pack.",
    h1: "Our hourly rate",
    lede: "A paid hour is $150. Thirty minutes is $75. A 10-hour pack is $1,250, which is $125 an hour.",
    sections: [
      { h2: "How the rate is sold", paras: [OURS] },
      {
        h2: "What the hour is for",
        bullets: [
          "One task on a shared screen",
          "Setup in your own accounts",
          "Notes you keep: what was set up, where it lives, and the next step",
        ],
      },
    ],
    faqs: [
      {
        q: "Is the hour cheaper in a pack?",
        a: "Yes. Ten hours are $1,250, which is $125 an hour. You pay $625 up front and the rest when the hours start.",
      },
      {
        q: "Do I have to buy an hour first?",
        a: "No. The first 30 minutes are free. After that you can buy 30 minutes for $75.",
      },
    ],
  }),
  page({
    path: "/consult/free-ai-consultation",
    neutral: "The free 30",
    crumb: "The free 30",
    title: "What our free 30-minute AI call covers | AgentHive Inc",
    description: "The AgentHive Inc free 30-minute call tells you if the task fits, the first step, and whether paid time is needed.",
    h1: "What the free 30 minutes should leave you with",
    lede: "The first call is 30 minutes and free. You should leave knowing whether the task fits, what the first step is, and what paid time would cost.",
    sections: [
      {
        h2: "What we cover on that call",
        bullets: [
          "The task you brought, in your words",
          "A plain yes or no on whether AI fits it",
          "The first step, and a rough count of paid hours if you want them",
          "Our prices: $75 for 30 minutes, $150 an hour, or $1,250 for 10 hours",
        ],
      },
      { h2: "If you continue", paras: [OURS] },
    ],
    faqs: [
      {
        q: "Is the first call free?",
        a: "Yes. Thirty minutes. If it is not a fit, that is the end of it.",
      },
      {
        q: "How do I book it?",
        a: "Call +1 320-335-6186. Bring one task.",
      },
    ],
  }),
  page({
    path: "/consult/ai-audit-cost",
    neutral: "A paid hour instead of a named audit",
    crumb: "A paid hour",
    title: "What we charge instead of a separate AI audit | AgentHive Inc",
    description: "AgentHive Inc does not sell a separate audit fee. A free 30-minute call, then $75 or $150 if you want the work set up.",
    h1: "We do not sell a separate audit fee",
    lede: "There is no standalone audit price on this page. We start with a free 30-minute call. If you want the work done, paid time is $75 for 30 minutes or $150 an hour.",
    sections: [
      {
        h2: "What you can buy",
        bullets: [
          "Free 30-minute call: fit, first step, and an hour estimate",
          "$75 for 30 minutes or $150 for an hour of setup in your accounts",
          "$1,250 for 10 hours when the job needs more than one session",
        ],
      },
      { h2: "The prices", table: PRICE_TABLE },
    ],
    faqs: [
      {
        q: "Do you charge an audit fee?",
        a: "No. The first 30 minutes are free. Paid time after that is $75 per 30 minutes or $150 an hour.",
      },
      {
        q: "Can I get a written plan?",
        a: "Yes. Paid work comes with notes you keep. A 10-hour pack is $1,250 when the job needs several sessions.",
      },
    ],
  }),
];

export function consultComparePageFor(path: string): ConsultComparePage | undefined {
  return CONSULT_COMPARE_PAGES.find((page) => page.path === path);
}
