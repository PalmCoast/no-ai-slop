import { BRAND_URL, CONTACT_EMAIL, FD_NAME, FD_URL } from "./brand.ts";
import type { Faq } from "./faqs.ts";

/**
 * Switch offers: the two published answering services a trade shop prices
 * against First Deploy AI most often. Competitor figures are read from the
 * vendor's own pages on SWITCH_CHECKED. Nothing here is a guess; if a vendor
 * does not print a number, the page says so.
 *
 * Offer mechanics on purpose reuse the live First Deploy $875 Stripe Payment
 * Link ("Start with $875" on firstdeploy.ai). A switcher pays that $875 and
 * the $875 balance is waived, so no new Stripe price or product is needed.
 * Attribution rides on client_reference_id via /go/switch-<slug>.
 */
export const SWITCH_PATH = "/switch";
export const SWITCH_URL = `${BRAND_URL}${SWITCH_PATH}`;
export const SWITCH_CHECKED = "October 19, 2026";
export const SWITCH_PUBLISHED_ISO = "2026-10-19";
export const SWITCH_ENDS = "November 30, 2026";
export const SWITCH_ENDS_ISO = "2026-11-30";

export const FD_SETUP_LIST = 1_750;
export const FD_SETUP_START = 875;
export const FD_MONTHLY = 250;
/** Switch setup: the $875 start payment, balance waived. */
export const SWITCH_SETUP = FD_SETUP_START;
export const SWITCH_SETUP_LABEL = "$875";
export const SWITCH_MONTHLY_LABEL = "$250/mo";
export const SWITCH_YEAR_ONE = SWITCH_SETUP + FD_MONTHLY * 12;
export const SWITCH_YEAR_TWO = FD_MONTHLY * 12;
export const FD_LIST_YEAR_ONE = FD_SETUP_LIST + FD_MONTHLY * 12;

/** Live First Deploy $875 start link. Same Stripe Payment Link firstdeploy.ai/go/deposit resolves to. */
export const FD_DEPOSIT_STRIPE_URL = "https://buy.stripe.com/9B68wP92Qe5layV8ie2ZO1w";
export const SWITCH_PROOF_EMAIL = CONTACT_EMAIL;

export const SWITCH_GUARANTEE =
  "If we miss the go-live date written in your plan, the $875 comes back. All of it.";

export const SWITCH_TERMS: string[] = [
  `Pay the $875 start on the same Stripe checkout every ${FD_NAME} shop uses. For a switcher the $875 balance is waived. Nothing more is due at completion.`,
  `${SWITCH_MONTHLY_LABEL} from go-live, invoiced monthly. No calls counted, no minutes metered, no overage line. Cancel the monthly any time and the line goes dark.`,
  `Proof is one email: a current invoice or account screenshot from the service you are leaving, or a dated quote from the last 90 days, sent to ${SWITCH_PROOF_EMAIL} before the written plan is signed.`,
  `The written plan has to start by ${SWITCH_ENDS}. After that date the setup is the published $1,750 again.`,
  SWITCH_GUARANTEE,
];

export type CompetitorPlan = { plan: string; price: string; includes: string; over: string };
export type MathRow = { label: string; yearOne: string; yearTwo: string; note: string };
export type Source = { label: string; url: string };

export type SwitchOffer = {
  slug: "smith-ai" | "ruby";
  path: string;
  competitor: string;
  competitorShort: string;
  pageTitle: string;
  description: string;
  h1: string;
  eyebrow: string;
  lede: string;
  what: string;
  plans: CompetitorPlan[];
  plansNote: string;
  beats: { h: string; p: string }[];
  math: MathRow[];
  mathNote: string;
  whenTheyWin: string;
  extra: { h: string; p: string };
  faqs: Faq[];
  sources: Source[];
  compareUrl: string;
};

const smithPlans: CompetitorPlan[] = [
  { plan: "AI Receptionist Free", price: "$0/mo", includes: "25 calls a month", over: "$3.00 per call after 25" },
  {
    plan: "AI Receptionist Pro",
    price: "$150/mo",
    includes: "75 calls a month at $2.00 a call. 150- and 300-call steps on the same page. “Set it up yourself with dedicated support.”",
    over: "$2.50 per extra call on the 75 step",
  },
  {
    plan: "AI Receptionist Enterprise",
    price: "$500/mo",
    includes: "300 calls a month at $1.67 a call. “We build and run a custom solution for you.” Full-service setup, custom AI prompting.",
    over: "$2.17 per extra call on the 300 step",
  },
];

const rubyPlans: CompetitorPlan[] = [
  { plan: "Call Ruby 50", price: "$250/mo", includes: "50 receptionist minutes", over: "$5.40 per extra minute" },
  { plan: "Call Ruby 100", price: "$395/mo", includes: "100 receptionist minutes", over: "$4.50 per extra minute" },
  { plan: "Call Ruby 200", price: "$720/mo", includes: "200 receptionist minutes", over: "$4.40 per extra minute" },
  { plan: "Call Ruby 350", price: "$1,210/mo", includes: "350 receptionist minutes", over: "$4.25 per extra minute" },
  { plan: "Call Ruby 500", price: "$1,725/mo", includes: "500 receptionist minutes", over: "$4.00 per extra minute" },
];

const yearOne = SWITCH_YEAR_ONE.toLocaleString("en-US");
const yearTwo = SWITCH_YEAR_TWO.toLocaleString("en-US");

export const SWITCH_OFFERS: SwitchOffer[] = [
  {
    slug: "smith-ai",
    path: `${SWITCH_PATH}/smith-ai`,
    competitor: "Smith.ai",
    competitorShort: "Smith.ai",
    pageTitle: "Switch from Smith.ai: $875 setup, $250/mo flat | AgentHive Inc",
    description:
      "Leaving Smith.ai? First Deploy AI builds and runs your after-hours desk: $875 setup for switchers, then $250/mo flat, no per-call rate. Through Nov 30, 2026.",
    h1: "Switch from Smith.ai. Half the setup, and nobody counts your calls.",
    eyebrow: "Smith.ai switch · $875 setup · $250/mo flat",
    lede: `Smith.ai’s AI Receptionist bills per call and does the setup for you only on the $500/mo Enterprise tier. ${FD_NAME} builds the whole desk, tests it, and runs it for $250 a month with no call count. Switchers start at $875 instead of $1,750 through ${SWITCH_ENDS}.`,
    what: `Smith.ai sells a 24/7 AI receptionist with a monthly call allowance. Free is 25 calls. Pro is $150 a month for 75 calls and you set it up yourself with their support. Enterprise is $500 a month for 300 calls and includes full-service setup and custom prompting. Extra calls bill per call. Cancelling takes 30 days’ notice. Read on ${SWITCH_CHECKED} from smith.ai/pricing/ai-receptionist.`,
    plans: smithPlans,
    plansNote:
      "Smith.ai also sells live human receptionist plans from $300 a month for 30 calls on a separate page. This offer compares the AI Receptionist, which is the product trade shops price against First Deploy AI.",
    beats: [
      {
        h: "Built for you at the Pro price, not the Enterprise price",
        p: "Smith.ai writes your prompts and runs the setup on Enterprise, $500 a month. First Deploy AI writes the script, sets it on your number, runs practice calls against angry, confused, and emergency callers, and tunes it after go-live. That is the $250 desk.",
      },
      {
        h: "No per-call rate",
        p: "A busy storm week on Smith.ai Pro is 75 calls, then $2.50 a call. On First Deploy AI the week costs what every week costs. Your bill is $250.",
      },
      {
        h: "Cancel any time, not 30 days out",
        p: "Smith.ai needs 30 days’ notice. Turn the First Deploy AI monthly off and the line goes dark that month.",
      },
      {
        h: "A person who built it",
        p: "Need the greeting changed or a new emergency rule? You call the operator who wrote the plan. Tuning is in the $250.",
      },
    ],
    math: [
      {
        label: "Smith.ai AI Receptionist Pro, 75 calls",
        yearOne: "$1,800",
        yearTwo: "$1,800",
        note: "$150 × 12. Only if you never pass 75 calls a month and you do the setup yourself.",
      },
      {
        label: "Smith.ai AI Receptionist Enterprise, 300 calls",
        yearOne: "$6,000",
        yearTwo: "$6,000",
        note: "$500 × 12. The tier where Smith.ai builds and runs it for you.",
      },
      {
        label: `${FD_NAME}, switch offer`,
        yearOne: `$${yearOne}`,
        yearTwo: `$${yearTwo}`,
        note: `$875 setup once, then $250 × 12. Built and run for you. No call count. Published setup is $1,750 (year one $${FD_LIST_YEAR_ONE.toLocaleString("en-US")}).`,
      },
    ],
    mathNote:
      "Twelve months at each published monthly, no overage assumed. Smith.ai’s 150-call Pro step shows a per-call rate on their page, not a monthly total, so it is not invented here.",
    whenTheyWin:
      "Stay on Smith.ai if you take fewer than 75 calls a month, you are fine writing and tuning the prompts yourself, and you want the free 25-call tier before you pay. Stay if a hard call should hand off to Smith.ai’s live receptionist network. First Deploy AI takes the details, flags the emergency, and sends it to you. It does not staff a live network.",
    extra: {
      h: "Bring your Smith.ai call history",
      p: "Smith.ai gives you recordings, transcripts, and summaries. Export a month and send it with your proof. We write your greeting, questions, and emergency rules from the calls you actually get, not from a template.",
    },
    faqs: [
      {
        q: "How much does it cost to switch from Smith.ai to First Deploy AI?",
        a: `$875 setup for switchers through ${SWITCH_ENDS}, then $250 a month from go-live. The published setup is $1,750. Year one on the switch offer is $${yearOne}. There is no per-call charge.`,
      },
      {
        q: "What counts as proof that I am on Smith.ai?",
        a: `A current Smith.ai invoice, a screenshot of your Smith.ai account, or a Smith.ai quote dated in the last 90 days, emailed to ${SWITCH_PROOF_EMAIL} before the written plan is signed.`,
      },
      {
        q: "Do I keep my phone number?",
        a: "Yes. You forward your own line to the desk after hours or when you don’t pick up. Nothing new to print on the truck. If Smith.ai gave you a dedicated number, you stop forwarding to it.",
      },
      {
        q: "Is there a call limit on First Deploy AI?",
        a: "No. The $250 a month is the desk, not a call allowance. Smith.ai AI Receptionist plans include 25, 75, or 300 calls a month and bill extra calls per call, as printed on their pricing page.",
      },
      {
        q: "What if First Deploy AI is late?",
        a: SWITCH_GUARANTEE,
      },
    ],
    sources: [
      { label: "Smith.ai AI Receptionist pricing", url: "https://smith.ai/pricing/ai-receptionist" },
      { label: "Smith.ai AI Receptionist product page", url: "https://smith.ai/ai-receptionist" },
      { label: `${FD_NAME} pricing`, url: FD_URL },
    ],
    compareUrl: "https://firstdeploy.ai/vs/smith-ai",
  },
  {
    slug: "ruby",
    path: `${SWITCH_PATH}/ruby`,
    competitor: "Ruby",
    competitorShort: "Ruby",
    pageTitle: "Switch from Ruby: $875 setup, $250/mo with no minutes | AgentHive Inc",
    description:
      "Leaving Ruby? First Deploy AI answers after-hours calls in your shop’s name for $250/mo flat. No minutes, no overage. $875 setup for switchers through Nov 30.",
    h1: "Switch from Ruby. Same $250, and the meter is gone.",
    eyebrow: "Ruby switch · $875 setup · $250/mo, no minutes",
    lede: `Ruby’s $250 buys 50 receptionist minutes, billed in 60-second steps rounded up, hold time included, then $5.40 a minute. ${FD_NAME}’s $250 is the whole after-hours desk. Switchers start at $875 instead of $1,750 through ${SWITCH_ENDS}.`,
    what: `Ruby is a live virtual receptionist service sold in monthly minute bundles. Call Ruby 50 is $250 a month for 50 receptionist minutes with a $5.40 overage minute. The bundles step up to 500 minutes at $1,725 and beyond. Ruby’s terms bill in 60-second increments, round each call up to the next minute, and count hold time. Their plans page says there are no fees for activation, onboarding, or setup. Read on ${SWITCH_CHECKED} from Ruby’s billing-plan help page and terms of use.`,
    plans: rubyPlans,
    plansNote:
      "Ruby publishes larger bundles up to 2,500 minutes at $7,875 a month. Website chat is a separate plan. The home-services trades Ruby names on its plans page are roofers, plumbers, HVAC, landscapers, and contractors.",
    beats: [
      {
        h: "No minutes, no rounding, no overage",
        p: "A nine-minute no-heat call at 2 a.m. and a thirty-second wrong number cost the same on First Deploy AI: nothing extra. On Ruby both are rounded up and both come off the bundle.",
      },
      {
        h: "$250 is the whole desk, not 50 minutes",
        p: "Fifty receptionist minutes is about a dozen four-minute intake calls. A shop that takes 60 after-hours calls a month at four minutes lands on Call Ruby 200 at $720, plus 40 overage minutes at $4.40. First Deploy AI is $250 that month and every month.",
      },
      {
        h: "Your rules, written down, then tested",
        p: "The desk asks what you would ask: name, callback number read back, address, what is wrong, how soon. Your emergency rules are in the plan. We run practice calls against hard callers before your customers hear it.",
      },
      {
        h: "Keeps your number",
        p: "Forward your own line after hours or when you miss a call. There is no new number to print, and no need to keep paying for a number you stopped using.",
      },
    ],
    math: [
      {
        label: "Call Ruby 50",
        yearOne: "$3,000",
        yearTwo: "$3,000",
        note: "$250 × 12. Fifty receptionist minutes a month, then $5.40 a minute.",
      },
      {
        label: "Call Ruby 100",
        yearOne: "$4,740",
        yearTwo: "$4,740",
        note: "$395 × 12. One hundred minutes, then $4.50 a minute.",
      },
      {
        label: "Call Ruby 200",
        yearOne: "$8,640",
        yearTwo: "$8,640",
        note: "$720 × 12. Two hundred minutes, then $4.40 a minute.",
      },
      {
        label: `${FD_NAME}, switch offer`,
        yearOne: `$${yearOne}`,
        yearTwo: `$${yearTwo}`,
        note: `$875 setup once, then $250 × 12. No minutes. Published setup is $1,750 (year one $${FD_LIST_YEAR_ONE.toLocaleString("en-US")}).`,
      },
    ],
    mathNote:
      "Twelve months at each published base price, no overage minutes assumed. Ruby’s overage rates are printed next to each bundle on their billing-plan page.",
    whenTheyWin:
      "Stay on Ruby if you want a live person on every call, day and night, and you use what comes with that: bilingual answering, HIPAA-compliant service, payment collection, or outbound calls. Ruby staffs people. First Deploy AI is an AI desk that takes the details, flags the emergency, and sends it to you.",
    extra: {
      h: "Bring your Ruby call log",
      p: "Ruby’s app shows every call and message. Send a month with your proof. We write your emergency rules from the night calls you actually got, and we size the questions to the jobs you actually book.",
    },
    faqs: [
      {
        q: "How much does it cost to switch from Ruby to First Deploy AI?",
        a: `$875 setup for switchers through ${SWITCH_ENDS}, then $250 a month from go-live. The published setup is $1,750. Year one on the switch offer is $${yearOne}, with no minute bundle and no overage.`,
      },
      {
        q: "Does First Deploy AI charge by the minute?",
        a: "No. The $250 a month is the desk. Ruby bills receptionist minutes in 60-second increments, rounded up, including hold time, with an overage rate per bundle, as stated in Ruby’s terms and billing-plan page.",
      },
      {
        q: "Is First Deploy AI a live person?",
        a: "No. It is an AI desk that answers in your shop’s name, says the call is recorded, gets the caller’s details, flags emergencies by your rules, and sends you the call. If you need a human on every call, Ruby is the better fit.",
      },
      {
        q: "What counts as proof that I am on Ruby?",
        a: `A current Ruby invoice, a screenshot of your Ruby account, or a Ruby quote dated in the last 90 days, emailed to ${SWITCH_PROOF_EMAIL} before the written plan is signed.`,
      },
      {
        q: "What if First Deploy AI is late?",
        a: SWITCH_GUARANTEE,
      },
    ],
    sources: [
      {
        label: "Ruby, “Am I on the right billing plan?”",
        url: "https://rubyhelpcenter.helpjuice.com/en_US/billing-plans/am-i-on-the-right-billing-plan",
      },
      { label: "Ruby terms of use (receptionist minutes)", url: "https://www.ruby.com/terms/" },
      { label: "Ruby plans and pricing", url: "https://www.ruby.com/plans-and-pricing/" },
      { label: `${FD_NAME} pricing`, url: FD_URL },
    ],
    compareUrl: "https://firstdeploy.ai/vs/ruby",
  },
];

export function switchOffer(slug: SwitchOffer["slug"]): SwitchOffer {
  const offer = SWITCH_OFFERS.find((o) => o.slug === slug);
  if (!offer) throw new Error(`Unknown switch offer ${slug}`);
  return offer;
}

/** Tracked checkout path for a switch offer. The /go function appends client_reference_id and UTMs. */
export function switchGoPath(slug: SwitchOffer["slug"], from = "switch"): string {
  return `/go/switch-${slug}?from=${from}`;
}
