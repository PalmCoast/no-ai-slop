import { CONCIERGE_NAME, CONCIERGE_PRICE } from "./concierge.ts";
import { CONSULT_RATES } from "./brand.ts";

export type Faq = { q: string; a: string };

export const CONSULT_FAQS: Faq[] = [
  {
    q: "What happens on the free 30-minute call?",
    a: "You describe the task that eats your week. Daniel Graham tells you plainly whether AI is a good fit for it, what he would do first, and roughly how many paid hours it takes. If it is not a fit, he says so and you owe nothing.",
  },
  {
    q: "Do I need to be technical?",
    a: "No. You know the business; Daniel handles the setup. Sessions are in plain language, on a shared screen, inside the tools you already use.",
  },
  {
    q: "What kind of work fits paid hours?",
    a: "One clear task at a time: drafting quotes or replies, sorting an inbox, turning notes into documents, connecting two apps, setting up an AI assistant for your team, or picking which tools are worth paying for. Bigger builds are scoped on the call before any money changes hands.",
  },
  {
    q: "Who owns what gets built?",
    a: "You do. Work is set up in your accounts with your logins, and any tool subscription is in your name. If we stop working together, everything stays with you.",
  },
  {
    q: "Is my customer data safe?",
    a: "We decide together which data goes into which tool before anything is connected, and private details stay out of tools that are not approved for them. You keep the admin access.",
  },
  {
    q: "How does billing work?",
    a: `The first 30 minutes are free. After that, paid time is ${CONSULT_RATES}, paid on Stripe after the free call. The 10-hour pack is $1,250 ($125 an hour): $625 up front, the remainder when the hours start.`,
  },
  {
    q: "Is it remote or on-site?",
    a: "Remote. Daniel Graham is based in Palm Coast, Florida, and every call and session runs by video, so owners anywhere in the US can book. This page does not sell an on-site visit.",
  },
  {
    q: "What if I need help every month?",
    a: `${CONCIERGE_NAME} is the ${CONCIERGE_PRICE} retainer: two 45-minute sessions a month, unlimited async Slack or text, and a shared asset inventory. The hourly rates stay available if you only need a few hours.`,
  },
];

export const CONSULT_COST_FAQS: Faq[] = [
  {
    q: "How much does an AI consultant cost for a small business?",
    a: "Guides published by AI firms in 2026 put independent AI advice at roughly $100 to $350 an hour and a monthly advisor at $1,500 to $8,000. These are asking prices from the firms' own pages, not survey averages. AgentHive Inc charges $75 for 30 minutes, $150 an hour, or $1,250 for 10 hours, after a free 30-minute call.",
  },
  {
    q: "Is hourly or a fixed project better?",
    a: "Hourly fits when the task is small or you want to learn alongside the work. A fixed project fits one defined build with a clear finish line. If you are not sure, the free 30-minute call is where that gets decided.",
  },
  {
    q: "Why does the 10-hour pack cost less per hour?",
    a: "The pack is $1,250 for 10 hours, which works out to $125 an hour instead of $150. You pay $625 up front and the remainder when the hours start.",
  },
  {
    q: "Where do the comparison numbers come from?",
    a: `Each range is quoted from the named firm's own public page, with a link, checked on October 19, 2026. Prices change, so check the source before you compare.`,
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
  {
    q: "How does $2,000/mo compare with other fractional AI advisors?",
    a: "Firms that publish their prices ask more. Holistic Consulting lists $3,500, $6,500 and $9,500 a month. SmallBizStrategy.ai lists $3,000 to $6,000 a month. The iternal.ai guide puts a fractional AI advisor at $1,500 to $8,000 a month. All checked October 19, 2026. AI Concierge is $2,000 a month.",
  },
  {
    q: "Why not hire someone full time?",
    a: "Twelve months of AI Concierge is $24,000. The Bureau of Labor Statistics median annual wage for software developers was $135,980 in May 2025, wages only. The Concierge vs hiring page has the full comparison.",
  },
  {
    q: "What if a monthly retainer is the wrong fit?",
    a: `Hourly consult stays open: ${CONSULT_RATES}, or a 10-hour pack for $1,250. Shops whose calls or quotes leak after hours can start with First Deploy AI. The free call is where we say which one fits.`,
  },
  {
    q: "How do I start?",
    a: "Book a free 15 to 30 minute call on Calendly, or start the subscription on Stripe. Intake comes before the first session so it starts on the real problem.",
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
