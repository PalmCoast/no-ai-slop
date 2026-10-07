// Free AI credits, trials and startup programs.
// Every entry was checked against the provider's own page on VERIFIED_ON.
// Offers change. If a page stops showing an offer, remove the entry instead of guessing.

export const VERIFIED_ON = "2026-10-07";

export type CreditCategory = "Startup program" | "Free tier" | "Research & education";
export type CreditTool =
  | "LLM API"
  | "Cloud"
  | "Hosting"
  | "Database"
  | "Vector DB"
  | "Voice & speech"
  | "GPU compute"
  | "Coding"
  | "Analytics"
  | "Workspace";

export type CreditOffer = {
  id: string;
  provider: string;
  offer: string;
  amount: string;
  qualifies: string;
  url: string;
  category: CreditCategory;
  tools: CreditTool[];
  lastVerified: string;
};

export const CREDIT_CATEGORIES: CreditCategory[] = ["Startup program", "Free tier", "Research & education"];
export const CREDIT_TOOLS: CreditTool[] = [
  "LLM API",
  "Cloud",
  "Hosting",
  "Database",
  "Vector DB",
  "Voice & speech",
  "GPU compute",
  "Coding",
  "Analytics",
  "Workspace",
];

const v = VERIFIED_ON;

export const AI_CREDIT_OFFERS: CreditOffer[] = [
  {
    id: "anthropic-claude-startups",
    provider: "Anthropic",
    offer: "Claude Startups program",
    amount: "$1,000 Claude API credits, a free year of Claude Team, and up to $45K in partner offers",
    qualifies: "Approved startup founders, subject to Anthropic's Startup Program Terms",
    url: "https://claude.com/programs/startups",
    category: "Startup program",
    tools: ["LLM API"],
    lastVerified: v,
  },
  {
    id: "openai-startups",
    provider: "OpenAI",
    offer: "OpenAI for Startups",
    amount: "API credits unlocked through eligible VC partners (amount set per program)",
    qualifies: "Startups backed by an eligible VC partner; ask your VC how to unlock credits",
    url: "https://openai.com/business/why-openai/startups/",
    category: "Startup program",
    tools: ["LLM API"],
    lastVerified: v,
  },
  {
    id: "openai-researcher-access",
    provider: "OpenAI",
    offer: "Researcher Access Program",
    amount: "Up to $1,000 in API credits, valid 12 months",
    qualifies: "Researchers, with priority for limited financial and institutional resources; reviewed every 3 months",
    url: "https://openai.com/form/researcher-access-program/",
    category: "Research & education",
    tools: ["LLM API"],
    lastVerified: v,
  },
  {
    id: "google-startups-cloud-funded",
    provider: "Google Cloud",
    offer: "Google for Startups Cloud Program",
    amount: "$200,000 in Cloud credits, or up to $350,000 for AI-first startups",
    qualifies: "Seed to Series A startups",
    url: "https://cloud.google.com/startup",
    category: "Startup program",
    tools: ["Cloud", "LLM API", "GPU compute"],
    lastVerified: v,
  },
  {
    id: "google-startups-cloud-prefunded",
    provider: "Google Cloud",
    offer: "Google for Startups Cloud Program (pre-funded)",
    amount: "$2,000 in credits to build an MVP",
    qualifies: "Pre-funded startups",
    url: "https://cloud.google.com/startup",
    category: "Startup program",
    tools: ["Cloud", "LLM API"],
    lastVerified: v,
  },
  {
    id: "gemini-api-free-tier",
    provider: "Google",
    offer: "Gemini API free tier",
    amount: "Free of charge on the Standard free tier, with rate limits",
    qualifies: "Anyone with a Google AI Studio API key",
    url: "https://ai.google.dev/gemini-api/docs/pricing",
    category: "Free tier",
    tools: ["LLM API"],
    lastVerified: v,
  },
  {
    id: "aws-activate-founders",
    provider: "AWS",
    offer: "AWS Activate Founders",
    amount: "$1,000 in Activate Credits to start; select participants up to $5,000",
    qualifies: "Self-funded, pre-Series B, founded in the last 10 years, AWS account on a paid plan",
    url: "https://aws.amazon.com/startups/credits",
    category: "Startup program",
    tools: ["Cloud", "GPU compute"],
    lastVerified: v,
  },
  {
    id: "aws-activate-portfolio",
    provider: "AWS",
    offer: "AWS Activate Portfolio",
    amount: "Up to $200,000 in Activate Credits",
    qualifies: "Pre-Series B startups with an Org ID from an Activate Provider (VC or accelerator)",
    url: "https://aws.amazon.com/startups/credits",
    category: "Startup program",
    tools: ["Cloud", "GPU compute"],
    lastVerified: v,
  },
  {
    id: "microsoft-for-startups",
    provider: "Microsoft",
    offer: "Microsoft for Startups",
    amount: "Startup credits on Azure, up to $150K over time",
    qualifies: "Startups that apply on the website; credits grow as the startup shows progress",
    url: "https://www.microsoft.com/en-us/startups",
    category: "Startup program",
    tools: ["Cloud", "LLM API"],
    lastVerified: v,
  },
  {
    id: "vercel-for-startups",
    provider: "Vercel",
    offer: "Vercel for Startups",
    amount: "Up to $30,000 in Flexible Commitment Amount, plus Enterprise-tier access",
    qualifies: "Eligible startup teams",
    url: "https://vercel.com/startups",
    category: "Startup program",
    tools: ["Hosting"],
    lastVerified: v,
  },
  {
    id: "cloudflare-for-startups",
    provider: "Cloudflare",
    offer: "Cloudflare for Startups",
    amount: "$10K, $100K, or $350K in credits for a year, by tier",
    qualifies: "$10K tier: bootstrapped or under $1M raised. Higher tiers by funding and partner",
    url: "https://www.cloudflare.com/startups/",
    category: "Startup program",
    tools: ["Hosting", "Cloud"],
    lastVerified: v,
  },
  {
    id: "elevenlabs-grants",
    provider: "ElevenLabs",
    offer: "ElevenLabs Grants",
    amount: "12 months of platform access with 33,000,000 characters",
    qualifies: "Startups under 25 employees with a monetized product use case; no agencies or consultancies",
    url: "https://elevenlabs.io/startup-grants",
    category: "Startup program",
    tools: ["Voice & speech"],
    lastVerified: v,
  },
  {
    id: "pinecone-startups",
    provider: "Pinecone",
    offer: "Pinecone Startup Program",
    amount: "Usage credits and discounts (amount not published)",
    qualifies: "Fewer than 100 employees, Series A or earlier",
    url: "https://www.pinecone.io/startup-program/",
    category: "Startup program",
    tools: ["Vector DB"],
    lastVerified: v,
  },
  {
    id: "together-accelerator",
    provider: "Together AI",
    offer: "Together AI Startup Accelerator",
    amount: "Up to $15K, $30K, or $50K in platform credits, by funding tier",
    qualifies: "Selection-based. $15K tier: up to $5M raised",
    url: "https://www.together.ai/startup-accelerator",
    category: "Startup program",
    tools: ["LLM API", "GPU compute"],
    lastVerified: v,
  },
  {
    id: "groq-free-plan",
    provider: "Groq",
    offer: "GroqCloud free plan",
    amount: "Free API access with per-model rate limits",
    qualifies: "Anyone with a GroqCloud account",
    url: "https://console.groq.com/docs/rate-limits",
    category: "Free tier",
    tools: ["LLM API"],
    lastVerified: v,
  },
  {
    id: "cohere-trial-key",
    provider: "Cohere",
    offer: "Cohere trial API key",
    amount: "Free evaluation key, limited to 1,000 API calls a month",
    qualifies: "Anyone with a Cohere account",
    url: "https://docs.cohere.com/docs/rate-limits",
    category: "Free tier",
    tools: ["LLM API"],
    lastVerified: v,
  },
  {
    id: "mistral-pro-education",
    provider: "Mistral AI",
    offer: "Pro Education plan",
    amount: "Pro for $14.99/mo, up to 12 months",
    qualifies: "Verified students at accredited higher-ed institutions who have not used the product before",
    url: "https://mistral.ai/pricing",
    category: "Research & education",
    tools: ["LLM API", "Coding"],
    lastVerified: v,
  },
  {
    id: "posthog-startups",
    provider: "PostHog",
    offer: "PostHog for Startups",
    amount: "$50,000 in PostHog credits for 12 months, plus partner perks",
    qualifies: "Early-stage teams; criteria on the application page",
    url: "https://posthog.com/startups",
    category: "Startup program",
    tools: ["Analytics"],
    lastVerified: v,
  },
  {
    id: "neon-startups",
    provider: "Neon",
    offer: "Neon Startup Program",
    amount: "Up to $1,000 in Neon credits (self-funded) or up to $200K in Neon and Databricks credits (VC-backed)",
    qualifies: "Self-funded under $1M raised, or VC-backed with $1M+ or a recognized accelerator",
    url: "https://neon.com/startups",
    category: "Startup program",
    tools: ["Database"],
    lastVerified: v,
  },
  {
    id: "supabase-free",
    provider: "Supabase",
    offer: "Supabase Free plan",
    amount: "$0/mo: 500 MB database, 50,000 monthly active users, 1 GB file storage",
    qualifies: "Anyone. Free projects pause after 1 week of inactivity",
    url: "https://supabase.com/pricing",
    category: "Free tier",
    tools: ["Database", "Hosting"],
    lastVerified: v,
  },
  {
    id: "mongodb-startups",
    provider: "MongoDB",
    offer: "MongoDB for Startups",
    amount: "Atlas credits and Voyage AI tokens, tiered by stage (amount not published)",
    qualifies: "Bootstrapped through VC-backed startups",
    url: "https://www.mongodb.com/solutions/startups",
    category: "Startup program",
    tools: ["Database", "Vector DB"],
    lastVerified: v,
  },
  {
    id: "modal-startups",
    provider: "Modal",
    offer: "Modal for Startups",
    amount: "Free GPU credits (one-time grant); every account also gets $30/month of free compute",
    qualifies: "Startups new to Modal, VC-backed through Modal's partners or $1M+ raised",
    url: "https://modal.com/startups",
    category: "Startup program",
    tools: ["GPU compute"],
    lastVerified: v,
  },
  {
    id: "nvidia-inception",
    provider: "NVIDIA",
    offer: "NVIDIA Inception",
    amount: "Free program: partner cloud credits, preferred pricing, technical training",
    qualifies: "Startups building with AI",
    url: "https://www.nvidia.com/en-us/startups/",
    category: "Startup program",
    tools: ["GPU compute", "Cloud"],
    lastVerified: v,
  },
  {
    id: "digitalocean-startups",
    provider: "DigitalOcean",
    offer: "DigitalOcean for Startups",
    amount: "Credits for 12 months (amount varies)",
    qualifies: "Startups that apply; GPU credit packages by invitation",
    url: "https://www.digitalocean.com/startups",
    category: "Startup program",
    tools: ["Cloud", "GPU compute"],
    lastVerified: v,
  },
  {
    id: "deepgram-free-credit",
    provider: "Deepgram",
    offer: "Deepgram free credit",
    amount: "$200 credit, then pay as you go",
    qualifies: "New Deepgram accounts",
    url: "https://deepgram.com/pricing",
    category: "Free tier",
    tools: ["Voice & speech"],
    lastVerified: v,
  },
  {
    id: "assemblyai-free",
    provider: "AssemblyAI",
    offer: "AssemblyAI free start",
    amount: "Free to start, no credit card required",
    qualifies: "New AssemblyAI accounts",
    url: "https://www.assemblyai.com/pricing",
    category: "Free tier",
    tools: ["Voice & speech"],
    lastVerified: v,
  },
  {
    id: "github-copilot-free",
    provider: "GitHub",
    offer: "GitHub Copilot Free",
    amount: "$0 plan with limited chat and agent usage",
    qualifies: "Anyone with a GitHub account",
    url: "https://github.com/features/copilot/plans",
    category: "Free tier",
    tools: ["Coding"],
    lastVerified: v,
  },
  {
    id: "github-copilot-pro-teachers-oss",
    provider: "GitHub",
    offer: "Copilot Pro for teachers and open source maintainers",
    amount: "Copilot Pro at no cost",
    qualifies: "Verified teachers and maintainers of popular open source projects",
    url: "https://docs.github.com/en/copilot/how-tos/copilot-on-github/set-up-copilot/enable-copilot/set-up-for-teachers-and-os-maintainers",
    category: "Research & education",
    tools: ["Coding"],
    lastVerified: v,
  },
  {
    id: "cursor-hobby",
    provider: "Cursor",
    offer: "Cursor Hobby plan",
    amount: "Free, no credit card, limited Agent requests",
    qualifies: "Anyone",
    url: "https://cursor.com/pricing",
    category: "Free tier",
    tools: ["Coding"],
    lastVerified: v,
  },
  {
    id: "notion-startups",
    provider: "Notion",
    offer: "Notion for Startups",
    amount: "Business plan free for up to 6 months (worth up to $12,000)",
    qualifies: "Startups that apply through the startup offer",
    url: "https://www.notion.com/startups",
    category: "Startup program",
    tools: ["Workspace"],
    lastVerified: v,
  },
];

export type PartnerOffer = { id: string; name: string; blurb: string; url: string; cta: string };

// Our own offers. Shown apart from the provider list and labeled "Our partners".
export const AI_CREDIT_PARTNERS: PartnerOffer[] = [
  {
    id: "micro1-data-partner",
    name: "micro1 data partnerships (referral)",
    blurb:
      "micro1 buys company data packages (SOPs, knowledge bases, project histories) for AI training. We refer companies and may earn a referral fee.",
    url: "https://www.micro1.ai/company-referral",
    cta: "See the micro1 program",
  },
  {
    id: "jobproof",
    name: "JobProof",
    blurb: "Photo proof of every job for trade crews: before and after photos with the time and who took them. Solo $49/mo.",
    url: "https://jobproof.firstdeploy.ai/?src=aicredits",
    cta: "Open JobProof",
  },
  {
    id: "agenthive-consult",
    name: "AgentHive consult",
    blurb: "Got the credits and need it built? Book a consult and we'll scope the agent with you.",
    url: "https://agenthiveinc.com/consult?src=aicredits",
    cta: "Book a consult",
  },
];

export const AI_CREDITS_FAQ: Array<{ q: string; a: string }> = [
  {
    q: "Are these AI credits really free?",
    a: "Yes. Each offer is run by the provider itself. You apply or sign up on the provider's site. AskYard does not sell or resell credits.",
  },
  {
    q: "How do I redeem an offer?",
    a: "Open the official link, check the eligibility rules on that page, and apply or sign up there. Approval and amounts are up to the provider.",
  },
  {
    q: "How current is this list?",
    a: `Every offer was checked against the provider's own page on ${VERIFIED_ON}. Offers change; the provider's page is the final word.`,
  },
  {
    q: "Which startup programs give the most AI credits?",
    a: "Google for Startups Cloud lists up to $350,000 for AI-first startups, Cloudflare up to $350K, AWS Activate Portfolio up to $200,000, and Microsoft for Startups up to $150K. Most top tiers need VC or accelerator backing.",
  },
  {
    q: "What if I'm bootstrapped?",
    a: "Look at AWS Activate Founders ($1,000 to $5,000), Google's $2,000 pre-funded tier, Cloudflare's $10K tier, Neon's self-funded tier, and the free tiers from Gemini, Groq, Cohere, Supabase, and Cursor.",
  },
];
