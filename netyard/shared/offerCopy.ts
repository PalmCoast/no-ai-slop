import { CONSULT_DISPLAY, FD_PRICE } from "./brand.ts";

/** Homepage offer copy. Prices are the live First Deploy AI prices already on /buy; no new prices. */
export const PROMISE_H2 = "One login per person, one shared drive, guest Wi-Fi kept off the office network. No Windows Server CALs.";
export const PROMISE_LEDE =
  "NetYard writes the plan for free. If you would rather not run the scripts yourself, First Deploy AI builds the network from that same written plan.";

export const WHAT_YOU_GET: { title: string; body: string }[] = [
  { title: "A directory Windows PCs join", body: "Samba Active Directory on Debian. Each person signs in with one password. No Microsoft CAL for the directory." },
  { title: "Shared drives by team", body: "File shares mapped by group, so the office sees office files and the field crew sees theirs." },
  { title: "Guest Wi-Fi on its own lane", body: "Separate VLANs for staff, guests, cameras, and gear when you ask for them, with a firewall matrix that says who can reach what." },
  { title: "Remote access", body: "A WireGuard VPN stub for people who work from the truck or from home." },
  { title: "A shopping list", body: "Switch, access points, server box, and UPS at street prices, next to the Windows Server license math." },
  { title: "Scripts and a runbook", body: "Debian install scripts, a user CSV, and a step-by-step runbook you can hand to whoever racks it." },
];

export const HOW_IT_WORKS: { title: string; body: string }[] = [
  { title: "Answer six questions", body: "Shop name, headcount, what the network has to do, what sits on the desks, where people work, and the gear budget." },
  { title: "Read your plan", body: "Addressing, directory, Wi-Fi, shopping list, and scripts. It is free and your answers stay in your browser." },
  { title: "Talk it through", body: `Book the free 30-minute call or ring ${CONSULT_DISPLAY}. We check the plan against your shop before anyone buys hardware.` },
  { title: "We build it from the plan", body: "Pay $875 to start. We set up the network from the written plan, then you pay the balance when it is done. $250/mo keeps a named operator on it after that." },
];

export const PRICE_CARD = {
  title: "Have First Deploy AI build it",
  price: "$1,750 setup",
  sub: "$875 to start, balance when it is done. Then $250/mo.",
  includes: [
    "We set up the network from your NetYard plan",
    "Samba directory, shares, guest Wi-Fi, and VPN configured and tested",
    "A named operator on the shop network for $250/mo after setup",
    "The plan, scripts, and runbook stay yours",
  ],
  fine: "Hardware is bought separately. Your plan's shopping list shows street prices.",
  priceLine: FD_PRICE,
};

export const OFFER_FAQS: { q: string; a: string }[] = [
  {
    q: "Will our Windows PCs really join a Samba domain?",
    a: "Yes. Samba has run as an Active Directory domain controller since version 4.0 in 2012. Windows 10 and 11 PCs join the domain, sign in, and receive Group Policy. You edit policies from a Windows PC with Microsoft's free RSAT tools.",
  },
  {
    q: "What can Samba not do?",
    a: "It does not host on-premises Exchange, a Microsoft Enterprise CA, or read-only domain controllers. Email stays in Google Workspace or Microsoft 365. If a Windows-only program has to run on a server, we plan around it on the call.",
  },
  {
    q: "Do we still need Windows Server CALs?",
    a: "Not for a Samba directory. Samba and Debian carry no client access license. Your Microsoft 365 or Google Workspace seats for email are a separate bill you already pay.",
  },
  {
    q: "Is the plan really free?",
    a: "Yes. The six questions, the plan, the shopping list, and the scripts cost nothing and need no account. Your answers stay in your browser.",
  },
  {
    q: "What does it cost to have you build it?",
    a: "$1,750 setup. You pay $875 to start and the balance when it is done. After that it is $250/mo for a named operator on the network. Hardware is separate and listed at street prices in your plan.",
  },
  {
    q: "When can you start?",
    a: "After the free 30-minute call. We look at your plan and your building first, then set a date with you. We do not promise a date before we have seen the job.",
  },
  {
    q: "We already have an old Windows server. Can you work with that?",
    a: "Tell us on the call what it runs today. We list what moves to Samba, what stays, and what goes to the cloud before you pay anything.",
  },
  {
    q: "Who do we talk to?",
    a: `Call ${CONSULT_DISPLAY} or book the free 30-minute call. You talk to the people who build it.`,
  },
];
