export type Skill = {
  id: string;
  name: string;
  job: string;
  href: string;
  price?: string;
};

/** Apps already in the shop, absorbed as skills of the one being. */
export const SKILLS: Skill[] = [
  {
    id: "guythread",
    name: "GuyThread",
    job: "Three things worth owning. Each one has a price and a reason.",
    href: "https://guythread.firstdeploy.ai/",
    price: "$9/mo",
  },
  {
    id: "askyard",
    name: "AskYard",
    job: "A free answer for the person on the job, then the offer to do the work.",
    href: "https://askyard.firstdeploy.ai/",
    price: "Answers free",
  },
  {
    id: "netyard",
    name: "NetYard",
    job: "A small-shop network on Debian. No Windows Server quote.",
    href: "https://netyard.firstdeploy.ai/",
    price: "Plan free",
  },
  {
    id: "sonaris",
    name: "Sonaris",
    job: "The voice layer when the browser voice is not the one they want heard.",
    href: "https://sonaris-voice.netlify.app/",
    price: "$29 once",
  },
  {
    id: "stateside",
    name: "Stateside",
    job: "US-authorized IT jobs. Veterans see a posting first.",
    href: "https://stateside-jobs.netlify.app/",
    price: "$10 a posting",
  },
  {
    id: "latch",
    name: "Latch",
    job: "One task on the screen when the day is too loud.",
    href: "https://latch.agenthiveinc.com/",
    price: "Timer free · record $29",
  },
  {
    id: "braid",
    name: "Braid",
    job: "One file, one hash, a stamp you can hand a client.",
    href: "https://github.com/PalmCoast/no-ai-slop/tree/main/braid",
    price: "Local stamp free · hosted stamp $29",
  },
  {
    id: "first-deploy",
    name: "First Deploy AI",
    job: "The paid desk. After-hours booking and the live apps.",
    href: "https://firstdeploy.ai/",
    price: "$1,750 setup, then $250/mo",
  },
  {
    id: "marquee",
    name: "Marquee",
    job: "A name in lights. They type the bid.",
    href: "https://askyard.firstdeploy.ai/marquee",
    price: "Floor $20",
  },
  {
    id: "buzz",
    name: "The Buzz",
    job: "The weekly briefing from the AgentHive desk.",
    href: "https://agenthiveinc.com/",
  },
];

export type Plugin = {
  id: string;
  name: string;
  job: string;
  /** on = Graham runs it with no secret. plugin = the operator connects their own account. */
  mode: "on" | "plugin";
};

export const PLUGINS: Plugin[] = [
  { id: "contacts", name: "Contacts", job: "The list that still rings the cell.", mode: "on" },
  { id: "calendly", name: "Calendly", job: "The live 30-minute book on Daniel's calendar.", mode: "on" },
  { id: "browser-voice", name: "Browser voice", job: "Speaks the answer in the room, no key.", mode: "on" },
  { id: "caption-reel", name: "Caption reel", job: "Cuts a vertical answer the operator can send.", mode: "on" },
  { id: "calendar", name: "Google Calendar", job: "Writes the hold onto the operator's calendar.", mode: "plugin" },
  { id: "gmail", name: "Gmail", job: "Sends the urgent ping and the message the caller left.", mode: "plugin" },
  { id: "agentmail", name: "AgentMail", job: "Reed's inbox and any agent mailbox the operator owns.", mode: "plugin" },
  { id: "drive", name: "Google Drive", job: "Files the being is allowed to read. Nothing else.", mode: "plugin" },
  { id: "asana", name: "Asana", job: "Turns a note into a task with a name.", mode: "plugin" },
  { id: "stripe", name: "Stripe", job: "The setup invoice when a client stands a being up.", mode: "plugin" },
  { id: "granola", name: "Granola", job: "Decisions already made in the room.", mode: "plugin" },
  { id: "spinach", name: "Spinach", job: "The call that already happened, and what was decided.", mode: "plugin" },
  { id: "elevenlabs", name: "ElevenLabs", job: "The operator's own voice sample, on their account.", mode: "plugin" },
  { id: "canva", name: "Canva", job: "A designed still when the reel needs one.", mode: "plugin" },
  { id: "higgsfield", name: "Higgsfield", job: "A generated clip when the operator asks for one on their account.", mode: "plugin" },
  { id: "posthog", name: "PostHog", job: "What the live apps are actually doing.", mode: "plugin" },
];
