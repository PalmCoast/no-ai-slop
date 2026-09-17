export type HiveBot = {
  name: string;
  role: string;
  initial: string;
  tools: string[];
  brief: string;
  featured?: boolean;
};

export const HIVE_BOTS: HiveBot[] = [
  {
    name: "Grok",
    role: "CMO / Growth",
    initial: "G",
    tools: ["Canva", "X", "Mailchimp", "HubSpot"],
    brief: "Writes The Buzz every week and ranks the live apps. Outreach, creative, and community.",
    featured: true,
  },
  {
    name: "Alder",
    role: "CEO / Strategy",
    initial: "A",
    tools: ["HubSpot", "Notion", "Slack"],
    brief: "Investor communications, GTM, and the call on what ships next.",
  },
  {
    name: "Sol",
    role: "CPO / CTO",
    initial: "S",
    tools: ["GitHub", "Netlify", "Linear"],
    brief: "Product and stack. HiveBriefcase, Bot Lock, and the deploys that stay up.",
  },
  {
    name: "Ivy",
    role: "Chief of Staff",
    initial: "I",
    tools: ["Gmail", "Calendar", "Slack"],
    brief: "Sprint planning, inbox, and context between sessions so nothing drops.",
  },
  {
    name: "Mara",
    role: "Revenue Ops",
    initial: "M",
    tools: ["Stripe", "HubSpot", "Sheets"],
    brief: "Pipeline hygiene, Stripe events, forecast that matches the bank.",
  },
  {
    name: "Nova",
    role: "Content & SEO",
    initial: "N",
    tools: ["Notion", "Canva", "Webflow"],
    brief: "Pages that index. Core Web Vitals. Copy that a human would actually send.",
  },
  {
    name: "Sage",
    role: "Research",
    initial: "S",
    tools: ["Perplexity", "Drive", "Notion"],
    brief: "Source the brief. Cite the link. Kill the rumor.",
  },
  {
    name: "Ric",
    role: "Support",
    initial: "R",
    tools: ["Intercom", "Gmail", "Slack"],
    brief: "Tickets to done. No canned empathy. Just the fix.",
  },
  {
    name: "Finn",
    role: "Finance",
    initial: "F",
    tools: ["QuickBooks", "Stripe", "Sheets"],
    brief: "Books, payouts, and the number on the invoice.",
  },
  {
    name: "Lex",
    role: "Legal / Compliance",
    initial: "L",
    tools: ["DocuSign", "Drive", "Notion"],
    brief: "Contracts, Florida LLC filings, and agent permission scope.",
  },
  {
    name: "Bea",
    role: "People",
    initial: "B",
    tools: ["BambooHR", "Calendar", "Slack"],
    brief: "Who is on which cell of the hive, and when they are free.",
  },
  {
    name: "Hank",
    role: "Field Ops",
    initial: "H",
    tools: ["ServiceTitan", "Maps", "SMS"],
    brief: "The after-hours desk. Missed calls, quotes, and the crew on the dirt.",
  },
];
