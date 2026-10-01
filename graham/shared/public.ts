export const BEING = "Graham";
export const OPERATOR = "Daniel Graham";
export const SHOP = "AgentHive Inc";
export const PLACE = "Palm Coast, Florida";
export const DISCLOSURE = "This is Graham, Daniel's line.";
export const CONSULT_DISPLAY = "+1 320-335-6186";
export const CONSULT_TEL = "+13203356186";
export const CALENDLY_URL = "https://calendly.com/coltsinsider/30min";
export const CONTACT_EMAIL = "daniel@agenthiveinc.com";
export const PRICE_LABEL = "$1,750 setup (50% to start or pay in full), then $250/mo";
export const SETUP_USD = 1750;
export const MONTHLY_USD = 250;
export const TEMPLATE_SOURCE = "spacexai-team-bots-2026-09-28";

export const FORWARD_RULE =
  "Unknown callers hit Graham. A number on the contacts list still rings the cell. A mill script is blocked. A country code is not a reason.";

/** Numbers the public site may show. The cell itself stays off this page. */
export const PUBLIC_CONTACTS: { name: string; phones: string[] }[] = [
  { name: "First Deploy consult", phones: [CONSULT_TEL] },
];

export const PILLARS = [
  {
    id: "context",
    name: "Context",
    job: "The voice, the price list, and the apps already shipped under AgentHive Inc.",
  },
  {
    id: "plugins",
    name: "Plugins",
    job: "Calendar, mail, contacts, and the shops. Each person connects their own account.",
  },
  {
    id: "credentials",
    name: "Credentials",
    job: "Keys stay with the operator. A shared template never carries them.",
  },
  {
    id: "memory",
    name: "Memory",
    job: "Notes, holds, and alerts from the line. Private to that desk.",
  },
] as const;

export const ROUTINES = [
  {
    id: "screen",
    when: "On every forwarded call",
    does: "Ring the contacts list. Block a mill script. Book, note, or alert.",
  },
  {
    id: "morning",
    when: "Weekday morning",
    does: "List overnight alerts, notes, and holds before the first coffee.",
  },
  {
    id: "monday",
    when: "Monday",
    does: "Three things worth owning, each with a price and a reason. That is the GuyThread drop.",
  },
] as const;

export const MONDAY_DROP = [
  {
    lane: "Style",
    thing: "Navy suit, white shirt, brown loafers",
    price: "$250–$400 off the rack",
    reason: "Outdoor October wedding. Add a charcoal overcoat if it runs past sunset.",
  },
  {
    lane: "Gift",
    thing: "A chef's knife or a cast-iron Dutch oven",
    price: "About $100",
    reason: "Anniversary, and she cooks. Ask what she already owns before you buy one.",
  },
  {
    lane: "Fantasy",
    thing: "Start Puka",
    price: "Half-PPR flex",
    reason: "More targets and more upside this week than Jacobs. Recheck injury news before kickoff.",
  },
] as const;
