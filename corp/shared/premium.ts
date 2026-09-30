export type PremiumSite = {
  slug: string;
  name: string;
  url: string;
  price: string;
  line: string;
  mark?: string;
};

/** Sites AgentHive Inc will put its name in front of. Prices match the live pages. */
export const PREMIUM_SITES: PremiumSite[] = [
  {
    slug: "first-deploy",
    name: "First Deploy AI",
    url: "https://firstdeploy.ai/",
    price: "$1,500 setup, then $250/mo",
    line: "After-hours desk and live apps for dirt, plants, and shops. Live this week on a written plan.",
    mark: "/brand/mark.svg",
  },
  {
    slug: "askyard",
    name: "AskYard",
    url: "https://askyard.firstdeploy.ai/",
    price: "Answers free",
    line: "A plain answer for the shop, the classroom, or the yard. The paid work is First Deploy AI.",
    mark: "/brand/marks/askyard.svg",
  },
  {
    slug: "netyard",
    name: "NetYard",
    url: "https://netyard.firstdeploy.ai/",
    price: "Plan free · rack $1,500, then $250/mo",
    line: "Six questions. Samba on Debian, a shopping list, and the install scripts.",
    mark: "/brand/marks/netyard.svg",
  },
  {
    slug: "indexme",
    name: "IndexMe.lol",
    url: "https://indexme.lol/",
    price: "Pro $19.99 · Studio $29.99",
    line: "Get the page found before you spend more on ads.",
  },
  {
    slug: "jobproof",
    name: "JobProof",
    url: "https://jobproof.firstdeploy.ai/",
    price: "Solo $49/mo · Crew $99/mo",
    line: "Photos and timestamps that the job happened.",
  },
  {
    slug: "marquee",
    name: "Marquee",
    url: "https://marquee.firstdeploy.ai/",
    price: "You name the bid · floor $20",
    line: "Your name in lights. Highest bid sits at number one.",
  },
  {
    slug: "sonaris",
    name: "Sonaris",
    url: "https://sonaris-voice.netlify.app/",
    price: "$29 once",
    line: "Talk out loud. It captions, waits, and answers in a voice you pick.",
    mark: "/brand/marks/sonaris.svg",
  },
  {
    slug: "latch",
    name: "Latch",
    url: "https://latch.agenthiveinc.com/",
    price: "Timer free · record $29 once",
    line: "One task, a timer you can see coming, and a stop when it is too much.",
    mark: "/brand/marks/latch.svg",
  },
  {
    slug: "stateside",
    name: "Stateside Jobs",
    url: "https://stateside-jobs.netlify.app/",
    price: "Free for seekers · $10 a posting",
    line: "US-authorized IT jobs. Veterans get first look.",
    mark: "/brand/marks/stateside.svg",
  },
];
