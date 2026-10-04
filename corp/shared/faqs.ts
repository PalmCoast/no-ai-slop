import { CONCIERGE_NAME, CONCIERGE_PRICE } from "./concierge.ts";
import { CONSULT_RATES } from "./brand.ts";

export type Faq = { q: string; a: string };

export const CONSULT_FAQS: Faq[] = [
  {
    q: "What happens in the free 30?",
    a: "The free 30 is a qualifier on Calendly. We use it to see if there is paid work. Then you pick paid time, or a fixed deploy if the leak is clear.",
  },
  {
    q: "How does billing work?",
    a: `After the free 30, paid time is ${CONSULT_RATES}. A 10-hour pack is $1,250, with $625 up front. You pay the paid time on Stripe.`,
  },
  {
    q: "Is the consult remote or on-site?",
    a: "Daniel Graham is in Palm Coast, Florida. The qualifier and the paid sessions are Calendly calls. This page does not sell an on-site visit.",
  },
  {
    q: "What if I need someone every month?",
    a: `${CONCIERGE_NAME} is the ${CONCIERGE_PRICE} retainer: two 45-minute sessions a month, unlimited async Slack or text, and a shared asset inventory.`,
  },
  {
    q: "Do you consult from Palm Coast?",
    a: "Yes. Daniel Graham is based in Palm Coast, Florida, in Flagler County. Owners outside Palm Coast book the same Calendly call, so the session is remote.",
  },
];

export const CONCIERGE_FAQS: Faq[] = [
  {
    q: "What is included in AI Concierge?",
    a: "Two 45-minute sessions a month on Zoom, screen-share. Unlimited async Slack or text. A shared inventory in Notion or Drive of every skill, automation, and asset we build. Intake before kickoff covers time sinks, the tool stack, and the process list.",
  },
  {
    q: "What does AI Concierge cost?",
    a: `${CONCIERGE_PRICE}, billed monthly. You’re not buying hours. The retainer is month to month.`,
  },
  {
    q: "How does cancellation work?",
    a: "Cancel any month after the first 30 days.",
  },
  {
    q: "What is not included?",
    a: "Unlimited custom software, staffing your team, or a black-box agency that runs without you.",
  },
  {
    q: "Who is the fractional AI advisor for?",
    a: "Owners and COOs who already tried ChatGPT or Claude and it didn’t stick, and want a partner on the calls rather than a PDF of prompts.",
  },
];

export const BLS_CHECKED = "October 4, 2026";
export const SOFTWARE_DEVELOPER_WAGE = 135_980;
export const SOFTWARE_DEVELOPER_SOURCE =
  "https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm";
export const IT_MANAGER_WAGE = 175_140;
export const IT_MANAGER_SOURCE = "https://www.bls.gov/ooh/management/computer-and-information-systems-managers.htm";
export const CONCIERGE_TWELVE_MONTHS = 24_000;

const developerWage = SOFTWARE_DEVELOPER_WAGE.toLocaleString("en-US");
const managerWage = IT_MANAGER_WAGE.toLocaleString("en-US");
const year = CONCIERGE_TWELVE_MONTHS.toLocaleString("en-US");

export const HIRING_FAQS: Faq[] = [
  {
    q: "How much does AI Concierge cost for a year?",
    a: `${CONCIERGE_NAME} is ${CONCIERGE_PRICE}. Twelve months at that rate is $${year}. It is month to month. Cancel any month after the first 30 days.`,
  },
  {
    q: "What wage does the Bureau of Labor Statistics publish for a software developer?",
    a: `The median annual wage for software developers was $${developerWage} in May 2025. That figure is wages, not benefits, tools, or recruiting. Source: ${SOFTWARE_DEVELOPER_SOURCE} — checked ${BLS_CHECKED}.`,
  },
  {
    q: "Is there a BLS wage for an AI consultant?",
    a: `These BLS pages do not list an occupation named AI consultant. The closest published medians cited here are software developers ($${developerWage}) and computer and information systems managers ($${managerWage}), both May 2025.`,
  },
  {
    q: "When is hiring in-house the better fit?",
    a: "When you need a person on payroll who does the work every day. AI Concierge is two 45-minute sessions a month plus async Slack or text, not a full-time employee.",
  },
  {
    q: "When is a large agency the better fit?",
    a: "When you need several specialists at once and a statement of work. This page does not quote an agency price.",
  },
];
