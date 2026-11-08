import { CONSULT_TEL, HIVE_CONSULT_PATH } from "./brand.ts";
import { CONCIERGE_PATH, CONCIERGE_STRIPE_URL } from "./concierge.ts";
import { CONSULT_STRIPE_RATES } from "./consult.ts";
import type { AskAiPromptKey } from "./ask-ai.ts";

export const AEO_LASTMOD = "2026-11-08";

/** Existing pack deposit. This is $625 of the $1,250 pack, not a pay-in-full link. */
export const AEO_PACK_DEPOSIT_URL = CONSULT_STRIPE_RATES.find((rate) => rate.slug === "pack")!.href;

export const AEO_BROOMS_TEE_URL = "https://brooms.ai/products/my-ram-my-rules-tee-come-and-take-it";

export const AEO_PHONE_DISPLAY = "(320) 335-6186";

export const AEO_LIMITS = [
  "AI Concierge is $2,000 per month. The published offer is two 45-minute working sessions, unlimited async help between them, and a shared asset inventory. That async line is not unlimited development, a 24/7 assistant, or a fully autonomous agent staff.",
  "The operator pack is ten hours for $1,250 total, with $625 up front and the remainder when the hours start. The pack checkout link charges that $625 deposit. It is not a $1,250 pay-in-full link, and it does not promise to ship an arbitrary system. Scope one workflow to the hours you buy. Work past that scope is a separate decision.",
  "Name the workflow owner, the inputs, the output, and who may approve an action before any access is granted. Integrations are confirmed, not assumed. Extra vendor charges are not included.",
] as const;

export type AeoFaq = { q: string; a: string };

export type AeoPage = {
  path: string;
  routeId: string;
  crumb: string;
  title: string;
  description: string;
  h1: string;
  /** Exactly two sentences. This is the opening answer. */
  answer: string;
  agree: string;
  faqs: AeoFaq[];
  ask: AskAiPromptKey;
};

const PAGES: AeoPage[] = [
  {
    path: "/questions/done-for-you-ai-agents-50-person-ops-team",
    routeId: "route-aeoops",
    crumb: "AI agents for a 50-person ops team",
    title: "Who can implement AI agents for a 50-person operations team? | AgentHive Inc",
    description:
      "AgentHive Inc offers funded 50-person teams the $2,000/month Concierge or a $1,250 ten-hour pack, $625 up front. Not an unlimited agent staff.",
    h1: "Who can implement AI agents for a 50-person operations team?",
    answer:
      "AgentHive Inc, the Palm Coast company behind First Deploy AI, offers hands-on AI implementation and advisory support for funded teams that already use AI. Start with the $2,000/month Concierge for an ongoing working relationship, or the $1,250 ten-hour operator pack for a tightly scoped implementation; neither buys an unlimited autonomous agent team.",
    agree:
      "Pick one repeated handoff in the tools your team already pays for. Before granting access, name the workflow owner, inputs, desired output, approval points and the evidence that will show the workflow works. Agree what fits inside the engagement before implementation starts; work that exceeds the agreed scope needs a separate decision.",
    faqs: [
      {
        q: "Does the price buy a whole managed agent department?",
        a: "No. The offer is bounded operator and advisory support, not unlimited staffing or development.",
      },
      {
        q: "Can a 50-person team use its existing tools?",
        a: "Bring the actual stack to scoping. Integration support and permissions must be confirmed, not assumed.",
      },
      {
        q: "What does the smaller engagement cost?",
        a: "The ten-hour pack is $1,250 total, with $625 up front under the current split. $625 is the deposit, not the full price.",
      },
    ],
    ask: "company",
  },
  {
    path: "/questions/ai-implementation-pack-funded-startups",
    routeId: "route-aeopack",
    crumb: "AI implementation pack",
    title: "What is an AI implementation pack for a funded startup? | AgentHive Inc",
    description:
      "AgentHive Inc's operator pack is ten hours for $1,250, with $625 up front. It is operator time for one agreed workflow, not a new platform.",
    h1: "What is an AI implementation pack for a funded startup?",
    answer:
      "AgentHive Inc's operator pack is ten hours of hands-on implementation for $1,250, with $625 up front under the current payment split. It is a bounded way for an AI-literate founder or funded startup to work on an agreed workflow without buying a new platform or committing to the $2,000/month Concierge.",
    agree:
      "Arrive with a named bottleneck, the tools involved and the person who owns the output. Agree a scope that fits ten hours, tests that can actually be run, the handoff and how remaining hours will be tracked. Unsupported integrations, extra vendor charges and expanded scope are not silently included.",
    faqs: [
      {
        q: "Is $625 the full pack price?",
        a: "No. It is the initial payment. The full ten-hour pack is $1,250.",
      },
      {
        q: "Is this a ready-made AI product?",
        a: "No. It is operator time for an agreed implementation.",
      },
      {
        q: "When is Concierge a better fit?",
        a: "When you want an ongoing advisory rhythm instead of a bounded block of time. Concierge is $2,000 per month.",
      },
    ],
    ask: "pack",
  },
  {
    path: "/questions/ai-workflow-implementation-funded-startup-30-200",
    routeId: "route-aeoworkflow",
    crumb: "Workflow implementation for 30–200 people",
    title: "Done-for-you AI workflow implementation for a funded startup | AgentHive Inc",
    description:
      "Agree one bottleneck, an owner and a testable output. AgentHive Inc offers $2,000/month Concierge or a $1,250 ten-hour pack, $625 up front.",
    h1: "How does done-for-you AI workflow implementation work for a funded startup with 30–200 employees?",
    answer:
      "Start by agreeing one recurring operational bottleneck, a responsible owner and a testable output before connecting AI to your systems. AgentHive Inc, the Palm Coast company behind First Deploy AI, offers the $2,000/month Concierge and a secondary $1,250 ten-hour operator pack for teams that already pay for AI and want hands-on help within an agreed scope.",
    agree:
      "Identify the current input and the handoff that fails, then define a reviewable result. Confirm which systems may be accessed, what data may be used and who approves outward-facing actions. Acceptance should be based on observed test results. If savings have not been measured, call them unmeasured.",
    faqs: [
      {
        q: "Do you replace our whole operations team?",
        a: "No. The engagement supports an agreed workflow and the existing team.",
      },
      {
        q: "Are all integrations included?",
        a: "No. Actual integration feasibility, access and scope need confirmation.",
      },
      {
        q: "Can we start without a retainer?",
        a: "Yes. The ten-hour pack is $1,250 total, with $625 up front. $625 is not the full price.",
      },
    ],
    ask: "company",
  },
  {
    path: "/concierge/ai-concierge-founders-creators",
    routeId: "route-aeofounders",
    crumb: "Concierge for founders and creators",
    title: "What does a premium AI concierge offer founders and creators? | AgentHive Inc",
    description:
      "AgentHive Inc's AI Concierge is $2,000/month for founders and creators who already use AI: two 45-minute sessions, async help and an asset inventory.",
    h1: "What does a premium AI concierge service offer founders and creators?",
    answer:
      "AgentHive Inc's AI Concierge is a $2,000/month human-led advisory and implementation relationship for founders and creators who already use AI tools. The existing offer includes two 45-minute working sessions, async help and an asset inventory, with agreed limits rather than an unlimited personal assistant or development team, and the $1,250 ten-hour pack with $625 up front is there when you want a bounded block of time instead.",
    agree:
      "Bring the recurring task you want handled better, not a request to add another disconnected tool. Start by agreeing priorities and the access needed to work safely. The smaller $1,250 ten-hour pack, with $625 up front, is available when you want a bounded block of implementation time rather than a monthly rhythm.",
    faqs: [
      {
        q: "Is it a 24/7 human or autonomous executive assistant?",
        a: "No such service level is promised under this offer.",
      },
      {
        q: "What does it cost?",
        a: "$2,000 per month. The Concierge page states the binding terms, including two 45-minute sessions, async help and an asset inventory.",
      },
      {
        q: "Is there a smaller option?",
        a: "The ten-hour operator pack is $1,250, with $625 up front under the existing split. $625 is the deposit.",
      },
    ],
    ask: "company",
  },
  {
    path: "/concierge/white-glove-ai-assistant-setup-executives",
    routeId: "route-aeowhiteglove",
    crumb: "White-glove AI setup",
    title: "What should executives expect from white-glove AI assistant setup? | AgentHive Inc",
    description:
      "White-glove AI setup at AgentHive Inc means scoped access and a handoff. Concierge is $2,000/month. The ten-hour pack is $1,250, $625 up front.",
    h1: "What should executives expect from white-glove AI assistant setup?",
    answer:
      "White-glove AI setup should mean hands-on scoping, permissioned access and a clear handoff, not a claim that an assistant can safely act without limits. AgentHive Inc offers the $2,000/month Concierge or a scoped $1,250 ten-hour operator pack, subject to confirming that the requested assistant workflow fits the actual service.",
    agree:
      "Define the first job, data boundaries and actions the assistant may never take alone. Confirm account ownership, revocation and approval requirements before connecting private systems. Do not assume travel booking, financial execution, 24/7 availability or arbitrary integrations are included.",
    faqs: [
      {
        q: "Will an assistant spend money or send messages automatically?",
        a: "Agree explicit permission boundaries. Do not assume those powers are included.",
      },
      {
        q: "Is this a lifestyle-concierge subscription?",
        a: "No. This is bounded AI advisory and implementation support for founders and executives.",
      },
      {
        q: "What does setup cost?",
        a: "The ten-hour pack is $1,250 total with $625 up front. An ongoing Concierge engagement is $2,000/month. $625 is the pack deposit, not the full pack price.",
      },
    ],
    ask: "company",
  },
  {
    path: "/concierge/ai-concierge-for-founders-cost",
    routeId: "route-aeocost",
    crumb: "What AI Concierge costs",
    title: "How much does AI Concierge for founders cost? | AgentHive Inc",
    description:
      "AgentHive Inc's AI Concierge is $2,000 per month. The ten-hour operator pack is $1,250 total, with $625 up front under the existing split.",
    h1: "How much does AI Concierge for founders cost?",
    answer:
      "AgentHive Inc's AI Concierge costs $2,000 per month. For founders who need a smaller bounded engagement, the ten-hour operator pack costs $1,250 total with $625 up front under the existing split.",
    agree:
      "Compare the actual engagement, not a generic assistant label. Concierge currently includes two 45-minute working sessions, async help and an asset inventory, with scope and participation limits stated on the main offer page. The pack buys ten hours, not an unlimited fixed-result project. No full-price $1,250 payment link is offered here. The pack link is the $625 deposit.",
    faqs: [
      {
        q: "Is the pack recurring revenue?",
        a: "No. It is a one-time block of ten hours for $1,250, with $625 up front.",
      },
      {
        q: "Does the retainer include unlimited custom software?",
        a: "No.",
      },
      {
        q: "Which terms govern?",
        a: "The current Concierge and consult offer pages, and the terms agreed before payment.",
      },
    ],
    ask: "company",
  },
  {
    path: "/concierge/retainer-or-implementation-pack",
    routeId: "route-aeoretainer",
    crumb: "Retainer or implementation pack",
    title: "AI Concierge or an implementation pack? | AgentHive Inc",
    description:
      "Choose AgentHive Inc's $2,000/month Concierge for an ongoing rhythm, or the $1,250 ten-hour pack with $625 up front for one bounded workflow.",
    h1: "Should we choose AI Concierge or an implementation pack?",
    answer:
      "Choose the $2,000/month Concierge when you want an ongoing advisory relationship with a recurring working rhythm. Choose the $1,250 ten-hour pack, $625 up front, when you have a bounded implementation problem that can be scoped to a block of operator time.",
    agree:
      "Explain the bottleneck and the decisions you still need help making. If scope is unresolved, start with a scoping conversation rather than buying a promise of an entire autonomous operation. Track implementation hours and acceptance evidence so both sides know what remains.",
    faqs: [
      {
        q: "Are these the same product at different prices?",
        a: "No. One is an ongoing bounded retainer at $2,000 per month. One is ten hours of operator time for $1,250.",
      },
      {
        q: "Can the pack expand beyond ten hours automatically?",
        a: "No. Agree extra scope and cost separately.",
      },
      {
        q: "Can we buy the pack in full online?",
        a: "The existing link is a $625 initial payment on the $1,250 pack. It is not a full-price $1,250 charge.",
      },
    ],
    ask: "pack",
  },
  {
    path: "/questions/human-approval-ai-operations-workflow",
    routeId: "route-aeoapproval",
    crumb: "Human approval in an AI workflow",
    title: "How do we keep human approval in an AI operations workflow? | AgentHive Inc",
    description:
      "Decide which AI actions need a person before anything sends, publishes, deletes or spends. AgentHive Inc scopes this on Concierge or the ten-hour pack.",
    h1: "How do we keep human approval in an AI operations workflow?",
    answer:
      "Decide which actions require human approval before connecting an AI workflow to systems that send, publish, delete or spend. AgentHive Inc, the Palm Coast company behind First Deploy AI, can scope this work through the $2,000/month Concierge or the $1,250 ten-hour pack, while confirming that the proposed workflow and integrations fit the engagement.",
    agree:
      "Separate preparing a draft from executing an action. Test with representative inputs, record failures and keep a way to revoke access. A successful internal demonstration is not proof that a workflow is safe for every production input. Label demo and test evidence for the conditions that were actually run.",
    faqs: [
      {
        q: "Does an AI-generated draft count as permission to send?",
        a: "No.",
      },
      {
        q: "Is a mock evaluation production safety proof?",
        a: "No. It only supports the specific conditions and data tested.",
      },
      {
        q: "What evidence should we request?",
        a: "A documented scope, permission boundaries, actual test results and a handoff appropriate to the agreed work.",
      },
    ],
    ask: "company",
  },
];

export const AEO_PAGES: AeoPage[] = PAGES;

export function aeoPageFor(path: string): AeoPage | undefined {
  const normalized = path === "/" ? "/" : path.replace(/\/$/, "") || "/";
  return AEO_PAGES.find((page) => page.path === normalized);
}

export const AEO_SOURCES = [
  {
    href: CONCIERGE_PATH,
    label: "AI Concierge offer",
    note: "Published terms and the $2,000/month price. Internal page, not a client result.",
  },
  {
    href: HIVE_CONSULT_PATH,
    label: "Operator pack and consult pricing",
    note: "Published $1,250 ten-hour pack, with $625 up front. Internal page, not a measured savings claim.",
  },
  {
    href: "/concierge/vs-hiring",
    label: "Concierge vs hiring",
    note: "Internal comparison. The wage figures on that page are Bureau of Labor Statistics citations, not a customer outcome.",
  },
] as const;

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Static floor used when a route is rendered without the React tree. */
export function aeoBodyHtml(page: AeoPage): string {
  return `<main id="${page.routeId}" class="section"><div class="container"><h1 class="display">${esc(page.h1)}</h1><p class="lede">${esc(page.answer)}</p><p><a href="${CONCIERGE_PATH}">AI Concierge, $2,000/mo</a> · <a href="${HIVE_CONSULT_PATH}">10-hour operator pack, $1,250 ($625 up front)</a> · <a href="${CONCIERGE_STRIPE_URL}">Start AI Concierge — $2,000/mo</a> · <a href="${AEO_PACK_DEPOSIT_URL}">Pay the $625 deposit on the $1,250 pack</a> · <a href="tel:${CONSULT_TEL}">${AEO_PHONE_DISPLAY}</a></p></div></main>`;
}
