import { BRAND_URL, CALENDLY_URL, PARENT_CHECK_URL, PARENT_URL } from "./brand.ts";
import { SALE_APPS, type SaleApp } from "./catalog.ts";

export type YardQuestion = {
  slug: string;
  question: string;
  answer: string;
  trade: string;
  asks: number;
  offerSlug: string;
  updatedAt: string;
};

export type YardOffer = {
  slug: string;
  title: string;
  price: string;
  cta: string;
  href: string;
  line: string;
};

export type YardTotals = {
  questionsAsked: number;
  uniqueQuestions: number;
  answersGiven: number;
  offersStarted: number;
  publicRepliesCopied: number;
};

export const OFFER_BY_SLUG: Record<string, YardOffer> = {
  "first-deploy": {
    slug: "first-deploy",
    title: "First Deploy AI",
    price: "$1,500 setup, then $250/mo",
    cta: "Start First Deploy AI",
    href: PARENT_CHECK_URL,
    line: "We stand up the after-hours desk this week or you do not pay the setup.",
  },
  consult: {
    slug: "consult",
    title: "Paid consult",
    price: "$75 / 30 min · $150 / hour",
    cta: "Book the free 30",
    href: CALENDLY_URL,
    line: "Free 30-minute qualifier. Then we do the work on the clock.",
  },
  jobproof: {
    slug: "jobproof",
    title: "JobProof",
    price: "Solo $49/mo · Crew $99/mo",
    cta: "Open JobProof",
    href: "https://jobproof.firstdeploy.ai/",
    line: "Photos and timestamps so the argument about whether you showed up ends.",
  },
  flick: {
    slug: "flick",
    title: "Flick",
    price: "Free to send a link",
    cta: "Open Flick",
    href: "https://flick.firstdeploy.ai/",
    line: "Record the screen, send the link, skip the login wall.",
  },
  indexme: {
    slug: "indexme",
    title: "IndexMe.lol",
    price: "Pro $19.99 · Studio $29.99 one-time",
    cta: "Open IndexMe.lol",
    href: "https://indexme.lol/",
    line: "Ping IndexNow so the page can be found before you buy more ads.",
  },
};

const STOP = new Set([
  "a",
  "an",
  "the",
  "to",
  "for",
  "of",
  "and",
  "or",
  "in",
  "on",
  "my",
  "our",
  "we",
  "i",
  "is",
  "do",
  "how",
  "can",
  "what",
  "with",
  "you",
  "it",
]);

export function normalizeQuestion(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugifyQuestion(raw: string): string {
  const base = normalizeQuestion(raw)
    .split(" ")
    .filter(Boolean)
    .slice(0, 10)
    .join("-")
    .slice(0, 80);
  return base || "ask";
}

export function tokensOf(raw: string): Set<string> {
  return new Set(normalizeQuestion(raw).split(" ").filter((w) => w.length > 2 && !STOP.has(w)));
}

export function overlapScore(a: string, b: string): number {
  const left = tokensOf(a);
  const right = tokensOf(b);
  if (!left.size || !right.size) return 0;
  let hit = 0;
  for (const token of left) {
    if (right.has(token)) hit += 1;
  }
  return hit / Math.max(left.size, right.size);
}

export function findMatch(question: string, board: YardQuestion[]): YardQuestion | null {
  const key = normalizeQuestion(question);
  if (!key) return null;
  const exact = board.find((item) => normalizeQuestion(item.question) === key);
  if (exact) return exact;
  let best: YardQuestion | null = null;
  let bestScore = 0;
  for (const item of board) {
    const score = overlapScore(question, item.question);
    if (score > bestScore) {
      best = item;
      bestScore = score;
    }
  }
  return bestScore >= 0.55 ? best : null;
}

const OFFER_RULES: Array<{ test: RegExp; slug: keyof typeof OFFER_BY_SLUG }> = [
  { test: /proof|photo|timestamp|showed up|job site|crew/i, slug: "jobproof" },
  { test: /record|screen|explain|walkthrough|flick/i, slug: "flick" },
  { test: /index|google|seo|ads|found|search result/i, slug: "indexme" },
  { test: /call|phone|after.?hours|night|book|dispatch|quote|whiteboard/i, slug: "first-deploy" },
];

export function pickOfferSlug(question: string): string {
  for (const rule of OFFER_RULES) {
    if (rule.test.test(question)) return rule.slug;
  }
  return "consult";
}

export function offerFor(slug: string): YardOffer {
  return OFFER_BY_SLUG[slug] ?? OFFER_BY_SLUG.consult;
}

export function offerFromCatalog(slug: string): SaleApp | undefined {
  return SALE_APPS.find((app) => app.slug === slug);
}

export function rankQuestions(board: YardQuestion[]): YardQuestion[] {
  return [...board].sort((a, b) => b.asks - a.asks || a.question.localeCompare(b.question));
}

export function computeTotals(board: YardQuestion[], extras?: Partial<YardTotals>): YardTotals {
  const questionsAsked = board.reduce((sum, item) => sum + item.asks, 0);
  return {
    questionsAsked,
    uniqueQuestions: board.length,
    answersGiven: questionsAsked,
    offersStarted: extras?.offersStarted ?? 0,
    publicRepliesCopied: extras?.publicRepliesCopied ?? 0,
  };
}

export function bumpQuestion(board: YardQuestion[], question: string, now = new Date()): YardQuestion[] {
  const match = findMatch(question, board);
  if (match) {
    return board.map((item) =>
      item.slug === match.slug ? { ...item, asks: item.asks + 1, updatedAt: now.toISOString() } : item,
    );
  }
  const slug = uniqueSlug(slugifyQuestion(question), board);
  const next: YardQuestion = {
    slug,
    question: question.trim(),
    answer: "",
    trade: "general",
    asks: 1,
    offerSlug: pickOfferSlug(question),
    updatedAt: now.toISOString(),
  };
  return [...board, next];
}

export function uniqueSlug(base: string, board: YardQuestion[]): string {
  if (!board.some((item) => item.slug === base)) return base;
  let i = 2;
  while (board.some((item) => item.slug === `${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

export function publicAnswer(question: YardQuestion): string {
  const offer = offerFor(question.offerSlug);
  return `${question.answer}\n\nAsked ${question.asks} times on AskYard.\nFree answer: ${BRAND_URL}/q/${question.slug}\nIf you want it done: ${offer.href}`;
}

export function seedDate(): string {
  return "2026-09-19T12:00:00.000Z";
}

export const SEED_QUESTIONS: YardQuestion[] = [
  {
    slug: "stop-missing-night-calls",
    question: "How do I stop missing night calls?",
    trade: "plumber",
    asks: 186,
    offerSlug: "first-deploy",
    updatedAt: seedDate(),
    answer:
      "Put one number on the truck, the yard sign, and Google. After hours, that number should text the caller back in under a minute with two questions: what broke, and when can we come. A human reviews the thread in the morning. You do not need a new receptionist. You need the phone to catch the job while you sleep. First Deploy AI stands that desk up this week for $1,500 setup, then $250/month. If it is not live this week, you do not pay the setup.",
  },
  {
    slug: "ai-without-learning-chatgpt",
    question: "Can a receptionist use AI without learning ChatGPT?",
    trade: "receptionist",
    asks: 142,
    offerSlug: "consult",
    updatedAt: seedDate(),
    answer:
      "Yes. The receptionist should never have to open ChatGPT. Give them one page with a search bar, three buttons (book, reschedule, send the quote), and a script they already know. The model sits behind the buttons. If they have to prompt, the tool failed. AskYard is that page. If you want it wired into your real calendar and phone, book the free 30 and we do it on First Deploy AI.",
  },
  {
    slug: "prove-the-crew-was-there",
    question: "How do I prove the crew was on site?",
    trade: "earth mover",
    asks: 128,
    offerSlug: "jobproof",
    updatedAt: seedDate(),
    answer:
      "Photos with time and a pin beat a status meeting. The crew takes two shots: arrival and done. The customer gets a link. If someone later says nobody showed, you have the pictures. JobProof does this for Solo $49/month or Crew $99/month. Do not buy a full GPS suite for a proof problem.",
  },
  {
    slug: "cheapest-ai-on-the-shop-phone",
    question: "What is the cheapest way to get AI on the shop phone?",
    trade: "shop",
    asks: 117,
    offerSlug: "first-deploy",
    updatedAt: seedDate(),
    answer:
      "Do not buy a new phone system. Forward after-hours to a desk that texts back, books, and logs the job. That is one product, not six apps. First Deploy AI is $1,500 setup and $250/month. A $20 chatbot on the website will not answer the missed call. The leak is the night ring, not the homepage.",
  },
  {
    slug: "ai-write-a-quote-from-a-photo",
    question: "Can AI write a quote from a photo of the job?",
    trade: "plumber",
    asks: 98,
    offerSlug: "consult",
    updatedAt: seedDate(),
    answer:
      "It can draft the line items from a photo. A person still has to set the price. The useful version is: snap the water heater, get a draft with parts and labor hours, then you tap yes and the customer gets a pay link. We will not let a model send a number you did not see. Book the free 30 if you want that loop on your phone this week.",
  },
  {
    slug: "teacher-grade-faster",
    question: "Can AI help a teacher grade without cheating the kids?",
    trade: "teacher",
    asks: 91,
    offerSlug: "consult",
    updatedAt: seedDate(),
    answer:
      "Use it as a first-pass rubric, not as the grade. The model marks missing pieces against your rubric. You still score the work. Tell the class you use a checker the same way you use a spelling tool. Keep the student writing in a folder you own, not in a mystery chat. If you want a private classroom loop, book the free 30.",
  },
  {
    slug: "estimate-a-dirt-pile",
    question: "How do earth movers estimate a pile of dirt with a phone?",
    trade: "earth mover",
    asks: 84,
    offerSlug: "consult",
    updatedAt: seedDate(),
    answer:
      "Walk around the pile, take overlapping photos, and a phone app can give a volume. It is a survey, not a legal stamp. Use it to stop guessing cubic yards on the truck. For a customer number, still have a person check the grade. We can point you at the pile meter and, if you want it on the crew phones with a quote attached, we build that as a First Deploy AI job.",
  },
  {
    slug: "get-found-without-more-ads",
    question: "How do I get the shop found on Google without buying more ads?",
    trade: "shop",
    asks: 77,
    offerSlug: "indexme",
    updatedAt: seedDate(),
    answer:
      "If the page is new, Google may not know it exists. IndexNow is a ping that says the URL is here. Do that before you spend more on ads. IndexMe.lol is Pro $19.99 or Studio $29.99, one time. It will not rewrite your whole site. It gets the page in line to be found.",
  },
  {
    slug: "text-when-the-job-is-done",
    question: "Can AI text the customer when the job is done?",
    trade: "plumber",
    asks: 73,
    offerSlug: "jobproof",
    updatedAt: seedDate(),
    answer:
      "Yes, and it should be boring. Crew taps done. The customer gets a text with two photos and a pay link. No paragraph. No emoji. If the tap does not fire the text, the tool is theater. JobProof is built for that proof loop. First Deploy AI can also hang it on the after-hours desk.",
  },
  {
    slug: "whiteboard-quotes",
    question: "How do I get quotes off the whiteboard?",
    trade: "shop",
    asks: 66,
    offerSlug: "first-deploy",
    updatedAt: seedDate(),
    answer:
      "A quote the customer cannot open on their phone is not a quote. Type it once, send a link, let them pay. The whiteboard stays for the crew. The number lives in a URL. First Deploy AI ships that with the after-hours desk so the owner is not the only person who can say yes.",
  },
  {
    slug: "explain-a-job-without-a-meeting",
    question: "How do I show a customer the problem without a site visit?",
    trade: "receptionist",
    asks: 54,
    offerSlug: "flick",
    updatedAt: seedDate(),
    answer:
      "Record the screen or the camera for thirty seconds and send a link. Do not make them make an account. Flick is a browser recorder that does that. If the problem is on the truck, a JobProof photo is faster. Pick the smaller tool.",
  },
  {
    slug: "what-does-first-deploy-ai-cost",
    question: "What does First Deploy AI cost, and is the free answer a trick?",
    trade: "general",
    asks: 49,
    offerSlug: "first-deploy",
    updatedAt: seedDate(),
    answer:
      "The answer on AskYard is free. The work is not. First Deploy AI is $1,500 setup, then $250/month. Live this week or you do not pay the setup. Consult is a free 30-minute qualifier, then $75 per 30 minutes or $150/hour. We put the price next to the answer so you can walk away.",
  },
];

export function emptyTotals(): YardTotals {
  return computeTotals(SEED_QUESTIONS, { offersStarted: 18, publicRepliesCopied: 41 });
}

export function rankedSeed(): YardQuestion[] {
  return rankQuestions(SEED_QUESTIONS);
}

export function questionPath(slug: string): string {
  return `/q/${slug}`;
}

export function questionUrl(slug: string): string {
  return `${BRAND_URL}/q/${slug}`;
}

export { PARENT_URL };
