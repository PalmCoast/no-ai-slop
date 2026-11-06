export type FestGroup = "desk" | "house" | "credit";

export type FestLink = {
  name: string;
  url: string;
  group: FestGroup;
  line: string;
};

export const GROUP_LABEL: Record<FestGroup, string> = {
  desk: "The desk",
  house: "The house",
  credit: "They linked first",
};

/**
 * Public pages only. Titles and prices were read from those pages or from
 * the AgentHive catalog in this repo. Every url is an outbound link.
 */
export const FEST_LINKS: FestLink[] = [
  {
    name: "IndexMe.lol",
    url: "https://indexme.lol/",
    group: "desk",
    line: "IndexNow, sitemap and robots checks, and the search console steps. Pro $19.99. Studio $29.99. One time.",
  },
  {
    name: "Free desk",
    url: "https://indexme.lol/desk/",
    group: "desk",
    line: "The IndexNow check, with no signup.",
  },
  {
    name: "IndexMe vs IndexMeNow",
    url: "https://indexme.lol/vs/indexmenow/",
    group: "desk",
    line: "Different tools, similar names. The comparison stays on IndexMe.",
  },
  {
    name: "IndexMe vs IndexPlease",
    url: "https://indexme.lol/vs/indexplease/",
    group: "desk",
    line: "The IndexNow desk next to auto-indexing plans. Written on IndexMe.",
  },
  {
    name: "TagParrot alternative",
    url: "https://indexme.lol/vs/tagparrot/",
    group: "desk",
    line: "TagParrot is closed. The note on what to do next stays on IndexMe.",
  },
  {
    name: "About IndexMe",
    url: "https://indexme.lol/about",
    group: "desk",
    line: "Who publishes the desk: AgentHive Inc.",
  },
  {
    name: "AgentHive Inc",
    url: "https://agenthiveinc.com/",
    group: "house",
    line: "Palm Coast shop that publishes IndexMe and First Deploy AI.",
  },
  {
    name: "Daniel Graham",
    url: "https://agenthiveinc.com/about",
    group: "house",
    line: "About the founder, AgentHive Inc, Palm Coast.",
  },
  {
    name: "First Deploy AI",
    url: "https://firstdeploy.ai/",
    group: "house",
    line: "After-hours answering for trade shops. $1,750 setup, then $250 a month.",
  },
  {
    name: "Consult",
    url: "https://agenthiveinc.com/consult",
    group: "house",
    line: "Free 30 minutes, then $75 / 30 min or $150 / hour.",
  },
  {
    name: "NetYard",
    url: "https://netyard.firstdeploy.ai/",
    group: "house",
    line: "A shop network without Microsoft Server.",
  },
  {
    name: "Flick",
    url: "https://flick.firstdeploy.ai/",
    group: "house",
    line: "Record a screen in the browser and share a link.",
  },
  {
    name: "JobProof",
    url: "https://jobproof.firstdeploy.ai/",
    group: "house",
    line: "Job photo proof for trade crews. $49 a month.",
  },
  {
    name: "AI Nexus 360",
    url: "https://ainexus360.com/",
    group: "house",
    line: "A five-day AI readiness and waste audit. $2,500.",
  },
  {
    name: "Seat & Circuit",
    url: "https://infrastructure.agenthiveinc.com/",
    group: "house",
    line: "Infrastructure audit, $1,500, plus telecom oversight.",
  },
  {
    name: "Bot Lock",
    url: "https://bot-lock.netlify.app/",
    group: "house",
    line: "Policy gates and an audit log for AI agents.",
  },
  {
    name: "AgentHive on LinkedIn",
    url: "https://www.linkedin.com/company/agenthiveinc",
    group: "house",
    line: "The company page. Posts from the shop land here.",
  },
  {
    name: "LaunchAF",
    url: "https://launchaf.com/products/product-106",
    group: "credit",
    line: "LaunchAF's listing of the IndexMe desk. They wrote it up. This card is the link back.",
  },
];
