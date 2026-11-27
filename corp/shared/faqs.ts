import { CONCIERGE_NAME, CONCIERGE_PRICE } from "./concierge.ts";

export type Faq = { q: string; a: string };

/** /consult is the $2,500 Agent Audit & Stabilization Sprint page (B2B reset 2026-11-24). */
export const CONSULT_FAQS: Faq[] = [
  {
    q: "What happens on the free 30-minute Architecture & Spend Triage?",
    a: "You bring last month’s AI bill and a rough picture of your stack. Daniel Graham tells you where the waste most likely is and whether the $2,500 sprint will pay for itself. If it won’t, he says so and you owe nothing.",
  },
  {
    q: "What does the $2,500 sprint include?",
    a: "An inventory of every agent, routine, seat and API key; fixes for loops, drift, redundant runs and oversized models in your accounts; spend caps and alerts; and a written before-and-after report. Fixed price, delivered in 5 business days from kickoff.",
  },
  {
    q: "What access do you need?",
    a: "Scoped, read-first access you grant and can revoke: the billing views and the agent or routine configs in question. Anything that changes production waits for your approval.",
  },
  {
    q: "Who owns the work?",
    a: "You do. Changes are made in your accounts, the report is yours, and nothing runs on our infrastructure.",
  },
  {
    q: "How does billing work?",
    a: "The triage is free. The sprint is $2,500, invoiced after your triage call (Stripe invoice or ACH). The Fractional AI Ops retainer is $3,500 a month, month to month after the first 3 months.",
  },
  {
    q: "Is it remote?",
    a: "Yes. Daniel Graham is based in Palm Coast, Florida, and works with teams anywhere in the US by video, message and email.",
  },
  {
    q: "What happens after the sprint?",
    a: `Stop there and keep the report, or move to the ${CONCIERGE_NAME} at ${CONCIERGE_PRICE}: monitoring of spend and failures, a 1-business-day response time, a monthly report and async help.`,
  },
];

/** Kept for the retired /consult/ai-consultant-cost page source (route now 301s to /consult). */
export const CONSULT_COST_FAQS: Faq[] = [
  {
    q: "What does AgentHive Inc charge?",
    a: "A free 30-minute Architecture & Spend Triage, a $2,500 fixed-price Agent Audit & Stabilization Sprint delivered in 5 business days, and a $3,500/mo Fractional AI Ops retainer.",
  },
];

export const CONCIERGE_FAQS: Faq[] = [
  {
    q: "What is included in the Fractional AI Ops Retainer?",
    a: "Active monitoring of agent spend and failures, a 1-business-day response time on anything we flag or you send, a monthly spend and reliability report, and async help by message or email.",
  },
  {
    q: "What does it cost?",
    a: `${CONCIERGE_PRICE}, billed monthly on Stripe. Month to month.`,
  },
  {
    q: "Do I need the sprint first?",
    a: "Most teams start with the $2,500 sprint so monitoring starts on a clean, inventoried stack. If your stack is already tidy, the free triage is where we decide.",
  },
  {
    q: "What is the response time?",
    a: "1 business day. Spend spikes and broken production jobs go to the front. It is not a 24/7 pager.",
  },
  {
    q: "What is not included?",
    a: "Unlimited custom software, a 24/7 on-call pager, or staffing your team. Bigger builds are scoped separately.",
  },
  {
    q: "How do I start?",
    a: "Book the free 30-minute Architecture & Spend Triage, or start the subscription and we send intake the same business day.",
  },
];

export const BLS_CHECKED = "October 4, 2026";
export const SOFTWARE_DEVELOPER_WAGE = 135_980;
export const SOFTWARE_DEVELOPER_SOURCE =
  "https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm";
export const IT_MANAGER_WAGE = 175_140;
export const IT_MANAGER_SOURCE = "https://www.bls.gov/ooh/management/computer-and-information-systems-managers.htm";
export const CONCIERGE_TWELVE_MONTHS = 42_000;

const developerWage = SOFTWARE_DEVELOPER_WAGE.toLocaleString("en-US");
const managerWage = IT_MANAGER_WAGE.toLocaleString("en-US");
const year = CONCIERGE_TWELVE_MONTHS.toLocaleString("en-US");

export const HIRING_FAQS: Faq[] = [
  {
    q: "How much does the retainer cost for a year?",
    a: `The ${CONCIERGE_NAME} is ${CONCIERGE_PRICE}. Twelve months at that rate is $${year}. It is month to month.`,
  },
  {
    q: "What wage does the Bureau of Labor Statistics publish for a software developer?",
    a: `The median annual wage for software developers was $${developerWage} in May 2025. That figure is wages, not benefits, tools, or recruiting. Source: ${SOFTWARE_DEVELOPER_SOURCE} — checked ${BLS_CHECKED}.`,
  },
  {
    q: "Is there a BLS wage for an AI ops lead?",
    a: `These BLS pages do not list an occupation named AI ops. The closest published medians cited here are software developers ($${developerWage}) and computer and information systems managers ($${managerWage}), both May 2025.`,
  },
  {
    q: "When is hiring in-house the better fit?",
    a: "When you need a person on payroll building AI every day. The retainer is monitoring, a 1-business-day response, a monthly report and async help, not a full-time employee.",
  },
  {
    q: "When is a large agency the better fit?",
    a: "When you need several specialists at once and a statement of work. This page does not quote an agency price.",
  },
];
