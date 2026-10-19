/**
 * No-link consult comparison pages (Oct 19, 2026).
 * Competitor names appear only on these pages. Sources are plain text with a checked date: no links to any
 * competitor or source domain. Every CTA points to us (free 30 on Calendly, +1 320-335-6186, /consult#pricing).
 * Only facts read from each firm's own public page on the checked date. Never repeat a competitor's trial or
 * refund offer, never invent stats, never name clients.
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
  /** Link label for use off the comparison pages (no competitor names). */
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
  "AgentHive Inc: a free 30-minute call, then $75 for 30 minutes, $150 an hour, or a 10-hour pack for $1,250 ($125 an hour, $625 up front, the rest when the hours start). Paid on Stripe, no contract. Daniel Graham runs every session by video in your own accounts, one task at a time, for owners anywhere in the US. AI Concierge is the $2,000-a-month retainer if you want someone every month.";

const OUR_SOURCE = `AgentHive Inc: agenthiveinc.com/consult (prices, how it works, FAQ), checked ${C}.`;

const SRC_NORTH_STAR = `North Star AI Consultation: northstarconsult.ai/pricing ("Last updated: October 10, 2026"), checked ${C}.`;
const SRC_AIE = `AIessentials: aiessentials.us, AI Consulting & Team Training page (prices and FAQ), checked ${C}.`;
const SRC_CARLO = `Carlo Sansonetti: carlosansonetti.com home page (services, starting prices, Fractional AI Officer minimum), checked ${C}.`;
const SRC_HORIZON = `Horizon: horizonworks.ai blog, "How Much Does AI Consulting Cost in 2026?" (February 2026), checked ${C}.`;

export const CONSULT_COMPARE_PAGES: ConsultComparePage[] = [
  {
    path: "/consult/north-star-ai-consultation-alternative",
    neutral: "$100 an hour vs 30-minute blocks",
    crumb: "North Star AI Consultation alternative",
    title: "North Star AI Consultation alternative: $100/hr vs 30-minute blocks | AgentHive Inc",
    description:
      "North Star AI Consultation charges $100 an hour online. AgentHive Inc sells 30-minute blocks at $75 and $150 hours, by video, US-wide. Checked Oct 19, 2026.",
    h1: "North Star AI Consultation alternative: $100 an hour vs 30-minute blocks",
    lede: "North Star and AgentHive Inc both do hands-on AI work for small businesses. North Star is cheaper per hour. AgentHive Inc lets you buy 30 minutes at a time and pay up front on Stripe. Here is what each one publishes.",
    sections: [
      {
        h2: `What North Star publishes (checked ${C})`,
        bullets: [
          "Coaching, team training, tool reviews, and done-for-you setup at $100 an hour, online.",
          "Work is quoted before it starts and billed after by invoice. No long-term contracts.",
          "A retainer is a monthly block of hours at the same $100 an hour.",
          "Its pricing page calls the rate low for the Bay Area on purpose.",
        ],
      },
      { h2: "What AgentHive Inc offers", paras: [OURS] },
      {
        h2: "Side by side",
        table: {
          head: ["", "North Star AI Consultation", "AgentHive Inc"],
          rows: [
            ["First call", "", "Free 30 minutes (Calendly, by video)"],
            ["Hourly", "$100 an hour, online", "$150 an hour, or $75 for 30 minutes"],
            ["Bigger block", "Monthly block of hours at $100 an hour", "10 hours for $1,250 ($125 an hour)"],
            ["How you pay", "Invoice after the work", "Stripe, before the session. No contract"],
            ["Monthly option", "Retainer of hours", "AI Concierge, $2,000 a month"],
          ],
          note: `North Star figures from its own pricing page, checked ${C}.`,
        },
      },
    ],
    pickThem: {
      h2: "Pick North Star if",
      bullets: [
        "You want the lower hourly rate",
        "You are in the Bay Area and like that",
        "You would rather be invoiced after the work",
      ],
    },
    pickUs: {
      h2: "Pick AgentHive Inc if",
      bullets: [
        "You want to buy 30 minutes at a time",
        "You want the work set up in your own accounts by video",
        "You want a 10-hour pack at $125 an hour or a fixed monthly retainer",
      ],
    },
    faqs: [
      {
        q: "Is North Star cheaper than AgentHive Inc?",
        a: `Per hour, yes. North Star publishes $100 an hour online; AgentHive Inc charges $150 an hour, $75 for 30 minutes, or $125 an hour in a 10-hour pack. Checked ${C}.`,
      },
      {
        q: "How does a first call with AgentHive Inc work?",
        a: "It is a free 30-minute call, booked on Calendly and run by video.",
      },
      {
        q: "Where do I start with AgentHive Inc?",
        a: "Book the free 30 or call +1 320-335-6186. Bring the one task you most want off your plate.",
      },
    ],
    sources: [SRC_NORTH_STAR, OUR_SOURCE],
  },
  {
    path: "/consult/ai-consultant-vs-agency-vs-fractional",
    neutral: "Consultant vs agency vs fractional AI officer",
    crumb: "Consultant vs agency vs fractional",
    title: "AI consultant vs AI agency vs fractional AI officer: 2026 prices | AgentHive Inc",
    description:
      "What an hourly AI consultant, an AI agency, and a fractional AI officer publish as entry prices, side by side and dated Oct 19, 2026. Pick the model before the firm.",
    h1: "AI consultant vs AI agency vs fractional AI officer: what each costs a small business (2026)",
    lede: "Three ways to buy AI help, and they price differently. An hourly consultant sells time. An agency usually starts with a paid audit and then a build. A fractional AI officer sells a senior person part-time, often with a minimum term. Here are published entry prices from each model, dated.",
    sections: [
      {
        h2: `Published entry prices (checked ${C})`,
        table: {
          head: ["Model", "Example", "Published entry price"],
          rows: [
            ["Hourly consultant", "North Star AI Consultation", "$100 an hour online"],
            ["Hourly consultant", "AgentHive Inc", "Free 30-minute call, then $75 per 30 minutes or $150 an hour"],
            ["Audit, then training", "AIessentials", "$1,500 AI audit and written roadmap; $150 an hour advice available"],
            ["Agency (audit, build, maintain)", "Horizon", "Audit from $299 for 1 to 15 employees; maintenance from $500 a month, required on every engagement"],
            ["Fractional AI officer", "Carlo Sansonetti", "AI Opportunity Audit from $4,500; Fractional AI Officer has a 6-month minimum"],
            ["Monthly advisor", "AgentHive Inc AI Concierge", "$2,000 a month, two 45-minute sessions plus async Slack or text"],
          ],
          note: "Each price is from the firm's own public page on the date above. These are asking prices, not survey averages.",
        },
      },
      {
        h2: "How to pick the model",
        bullets: [
          "One clear task, like drafting quotes or sorting an inbox: an hourly consultant is usually enough.",
          "Several departments and no idea where to start: a paid audit may be worth it before any build.",
          "You want someone senior to own AI for months: a fractional officer or a monthly advisor.",
          "You want to try before committing: start with a free call, then the smallest paid block.",
        ],
      },
      { h2: "Where AgentHive Inc fits", paras: [OURS] },
    ],
    pickThem: {
      h2: "Pick an agency or fractional officer if",
      bullets: [
        "You want a written plan across the whole business before anything is built",
        "You need a team to build several systems at once",
        "You want one senior person accountable for AI over six months or more",
      ],
    },
    pickUs: {
      h2: "Pick hourly time with AgentHive Inc if",
      bullets: [
        "You have one task in mind and want it set up in your own accounts",
        "You want no audit fee and no minimum term",
        "You want to stop when the job is done",
      ],
    },
    faqs: [
      {
        q: "What is a fractional AI officer?",
        a: "A senior person who owns AI inside your business part-time. Carlo Sansonetti's site describes it this way and lists a 6-month minimum for that service, checked " + C + ".",
      },
      {
        q: "Do I need an audit before hiring an AI consultant?",
        a: "Not for a single task. AgentHive Inc gives you a plan on the free call: what we would do first and roughly how many hours it takes, before you pay anything.",
      },
      {
        q: "What does AgentHive Inc charge?",
        a: "A free 30-minute call, then $75 per 30 minutes, $150 an hour, or a 10-hour pack for $1,250. AI Concierge is $2,000 a month.",
      },
    ],
    sources: [SRC_NORTH_STAR, SRC_AIE, SRC_HORIZON, SRC_CARLO, OUR_SOURCE],
  },
  {
    path: "/consult/ai-consultant-hourly-rate",
    neutral: "AI consultant hourly rate",
    crumb: "AI consultant hourly rate",
    title: "AI consultant hourly rate in 2026: what $75, $100, $150 and $350 buy | AgentHive Inc",
    description:
      "AI consultant hourly rates firms publish in 2026, from $100 to $350 an hour, and what an hour at each level is for. Our 30-minute block is $75. Checked Oct 19, 2026.",
    h1: "AI consultant hourly rate in 2026: what $75, $100, $150 and $350 an hour buy",
    lede: "Small-business AI consultants that publish rates mostly land between $100 and $350 an hour. The rate matters less than what one hour produces. Here are the published numbers and a plain guide to what each band is for.",
    sections: [
      {
        h2: `Published hourly rates (checked ${C})`,
        table: {
          head: ["Rate", "Who publishes it", "What it covers on their page"],
          rows: [
            ["$75 per 30 minutes", "AgentHive Inc", "Hands-on time by video in your own accounts"],
            ["$100 an hour", "North Star AI Consultation", "Online coaching, training, tool reviews, and setup"],
            ["$125 an hour", "AgentHive Inc", "Inside the 10-hour pack ($1,250)"],
            ["$150 an hour", "AgentHive Inc; AIessentials", "Our standard hour; AIessentials lists $150 an hour for advice"],
            ["$150 to $350 an hour", "AIessentials", "Its own statement of general market rates for AI consultants"],
          ],
          note: "Each figure is from the publisher's own page. Rates change, so check before you compare.",
        },
      },
      {
        h2: "What an hour is for",
        bullets: [
          "30 minutes: one question answered properly, or one small setup finished, like an email assistant or a template.",
          "One hour: a working session on one task, with notes you keep on what was set up and the next step.",
          "A 10-hour pack: a short project across several sessions, such as connecting two apps and training the team on it.",
          "Higher hourly bands usually buy strategy across a whole business. That can be worth it, but it is a different job.",
        ],
      },
      { h2: "What AgentHive Inc charges", paras: [OURS] },
    ],
    pickThem: {
      h2: "Pay a higher or lower rate elsewhere if",
      bullets: [
        "You want the lowest published hourly rate (North Star lists $100)",
        "You want firm-wide strategy from a larger team",
        "You prefer to be billed after the work",
      ],
    },
    pickUs: {
      h2: "Pick AgentHive Inc if",
      bullets: [
        "You want to start with a $75 half hour",
        "You want hands-on setup, not a report",
        "You want the price on the page and no contract",
      ],
    },
    faqs: [
      {
        q: "How much does an AI consultant charge per hour?",
        a: `Firms that publish rates range from $100 an hour (North Star AI Consultation) to $150 an hour (AgentHive Inc, AIessentials). AIessentials puts general market rates at $150 to $350 an hour. Checked ${C}.`,
      },
      {
        q: "Can I buy less than an hour?",
        a: "Yes. AgentHive Inc sells 30 minutes for $75 after a free 30-minute call.",
      },
      {
        q: "Is there a cheaper rate for more hours?",
        a: "The 10-hour pack is $1,250, which works out to $125 an hour. You pay $625 up front and the rest when the hours start.",
      },
    ],
    sources: [SRC_NORTH_STAR, SRC_AIE, OUR_SOURCE],
  },
  {
    path: "/consult/free-ai-consultation",
    neutral: "Free AI consultation",
    crumb: "Free AI consultation",
    title: "Free AI consultation: what a good free 30 minutes should leave you with | AgentHive Inc",
    description:
      "A buyer's checklist for what that call should give you, and what ours covers. Checked Oct 19, 2026.",
    h1: "Free AI consultation: what a good free 30 minutes should leave you with",
    lede: "AgentHive Inc starts with a free 30-minute call. A first call is only useful if you leave with something. Here is what to expect from it.",
    sections: [
      {
        h2: `How our first call works (checked ${C})`,
        bullets: [
          "AgentHive Inc: a free 30-minute call on Calendly, by video.",
        ],
      },
      {
        h2: "A buyer's checklist for the free 30",
        bullets: [
          "A straight yes or no on whether AI fits the task you brought",
          "The first step, in plain words, not a list of tools",
          "A rough hour or price estimate before you pay anything",
          "Who would do the work, and where it would live (your accounts, or theirs)",
          "No pressure to buy on the call",
        ],
      },
      {
        h2: "What our free 30 covers",
        paras: [
          "Bring the one task you most want off your plate. On the call you hear whether AI can take it, what we would do first, and roughly how many hours it takes, before you pay anything. If you go ahead, paid time is set up in your own accounts by video.",
          OURS,
        ],
      },
    ],
    pickThem: {
      h2: "Someone else may fit better if",
      bullets: [
        "You want a paid audit as the next step",
        "You want an in-person or regional consultant",
        "You want the lowest hourly rate after the call",
      ],
    },
    pickUs: {
      h2: "Book ours if",
      bullets: [
        "You have one task in mind",
        "You want paid time in 30-minute blocks afterward",
        "You want the work done in your own accounts",
      ],
    },
    faqs: [
      {
        q: "Is a free AI consultation really free?",
        a: "Ours is. The 30-minute call costs nothing. Paid time starts only if you choose to buy it.",
      },
      {
        q: "What should I bring to a free AI consultation?",
        a: "One task that eats your week, the apps you already use, and roughly how often the task comes up.",
      },
      {
        q: "What happens after the free call?",
        a: "If AI fits, you can buy 30 minutes for $75, an hour for $150, or a 10-hour pack for $1,250 on Stripe. No contract.",
      },
    ],
    sources: [SRC_NORTH_STAR, SRC_AIE, SRC_CARLO, OUR_SOURCE],
  },
  {
    path: "/consult/ai-audit-cost",
    neutral: "AI audit cost",
    crumb: "AI audit cost",
    title: "AI audit cost for a small business: $299 vs $1,500 vs $4,500 vs a free call | AgentHive Inc",
    description:
      "Published AI audit prices for small businesses (from $299, $1,500, from $4,500) and when one paid hour on a single task is enough instead. Checked Oct 19, 2026.",
    h1: "Do you need a paid AI audit first? $299 vs $1,500 vs $4,500 vs a free call",
    lede: "Several AI firms start every engagement with a paid audit. That can be worth it for a business with many moving parts. For one clear task, a free call and a paid hour is often enough. Here are the published audit prices and how to decide.",
    sections: [
      {
        h2: `Published audit prices (checked ${C})`,
        table: {
          head: ["Firm", "Audit price", "What their page says you get"],
          rows: [
            ["Horizon", "From $299 (1 to 15 employees)", "Interviews, a process map, an opportunity matrix, and an ROI report"],
            ["AIessentials", "$1,500", "A workflow review and a written roadmap ranked by return"],
            ["Carlo Sansonetti", "From $4,500", "A two-week look and a short written plan in priority order"],
            ["AgentHive Inc", "No audit fee", "A free 30-minute call with a first step and an hour estimate"],
          ],
          note: "Each price is from the firm's own page. Horizon lists higher audit prices for larger companies.",
        },
      },
      {
        h2: "When a paid audit is worth it",
        bullets: [
          "Several teams or departments, each with different tools",
          "You do not know which task to start with",
          "You need a written plan to show partners or a board",
        ],
      },
      {
        h2: "When one paid hour is enough",
        bullets: [
          "You already know the task that eats your week",
          "The work lives in tools you already pay for",
          "You want something working before you spend on a plan",
        ],
      },
      { h2: "What AgentHive Inc charges", paras: [OURS] },
    ],
    pickThem: {
      h2: "Buy an audit elsewhere if",
      bullets: [
        "You want a ranked, written plan across the whole business first",
        "You expect a larger build afterward",
        "You need an ROI report for someone else to approve",
      ],
    },
    pickUs: {
      h2: "Skip the audit with AgentHive Inc if",
      bullets: [
        "You have one task in mind",
        "You want to pay for time only as you use it",
        "You want the setup in your own accounts",
      ],
    },
    faqs: [
      {
        q: "How much does an AI audit cost a small business?",
        a: `Published prices we found start at $299 (Horizon, 1 to 15 employees), $1,500 (AIessentials), and from $4,500 (Carlo Sansonetti). Checked ${C}.`,
      },
      {
        q: "Does AgentHive Inc charge for an audit?",
        a: "No. We start with a free 30-minute call and give you a first step and an hour estimate. Paid time is $75 per 30 minutes or $150 an hour.",
      },
      {
        q: "Can I get a written plan from AgentHive Inc?",
        a: "Yes. Paid work comes with notes you keep: what was set up, where it lives, and the next step. For a bigger job, a 10-hour pack ($1,250) covers several sessions.",
      },
    ],
    sources: [SRC_HORIZON, SRC_AIE, SRC_CARLO, OUR_SOURCE],
  },
];

export function consultComparePageFor(path: string): ConsultComparePage | undefined {
  return CONSULT_COMPARE_PAGES.find((page) => page.path === path);
}
