import { BRAND_URL } from "./brand.ts";
import { SEED_QUESTIONS, type YardQuestion } from "./ask.ts";

export type HuntHit = {
  id: string;
  title: string;
  url: string;
  source: "seed" | "hn";
  trade: string;
  why: string;
  reply: string;
  slug?: string;
  points?: number;
};

const REPLY_FOOTER = `Free plain-language answer from AskYard (First Deploy AI / AgentHive Inc, Palm Coast): ${BRAND_URL}`;

export function replyForQuestion(q: YardQuestion): string {
  const short = q.answer.split(". ").slice(0, 2).join(". ").replace(/\s+/g, " ").trim();
  return `${short}\n\n${REPLY_FOOTER}/q/${q.slug}`;
}

export const HUNT_SEED: HuntHit[] = [
  {
    id: "seed-night-calls",
    title: "Small plumbing shop keeps missing after-hours calls. What actually works?",
    url: "https://askyard.firstdeploy.ai/q/stop-missing-night-calls",
    source: "seed",
    trade: "plumber",
    why: "This is the leak owners pay for. Answer it in public and send them to the free write-up.",
    reply: replyForQuestion(SEED_QUESTIONS[0]),
    slug: "stop-missing-night-calls",
  },
  {
    id: "seed-receptionist",
    title: "Our front desk will not touch ChatGPT. How do we still use AI?",
    url: "https://askyard.firstdeploy.ai/q/ai-without-learning-chatgpt",
    source: "seed",
    trade: "receptionist",
    why: "Receptionists get blamed for tools they were never given. A page with buttons beats a prompt window.",
    reply: replyForQuestion(SEED_QUESTIONS[1]),
    slug: "ai-without-learning-chatgpt",
  },
  {
    id: "seed-proof",
    title: "Customer says the crew never showed. How do you prove a dirt job?",
    url: "https://askyard.firstdeploy.ai/q/prove-the-crew-was-there",
    source: "seed",
    trade: "earth mover",
    why: "Proof questions spread in owner groups. Post the two-photo rule and the JobProof link.",
    reply: replyForQuestion(SEED_QUESTIONS[2]),
    slug: "prove-the-crew-was-there",
  },
  {
    id: "seed-teacher",
    title: "Teachers: is there a way to use AI on grading that is not cheating?",
    url: "https://askyard.firstdeploy.ai/q/teacher-grade-faster",
    source: "seed",
    trade: "teacher",
    why: "Teachers ask this every term. A rubric-first answer with a link back is enough.",
    reply: replyForQuestion(SEED_QUESTIONS[5]),
    slug: "teacher-grade-faster",
  },
  {
    id: "seed-ads",
    title: "New shop site, still invisible on Google. Ads feel like a tax.",
    url: "https://askyard.firstdeploy.ai/q/get-found-without-more-ads",
    source: "seed",
    trade: "shop",
    why: "Indexing is the cheap move people skip. IndexMe.lol is the paid follow-through.",
    reply: replyForQuestion(SEED_QUESTIONS[7]),
    slug: "get-found-without-more-ads",
  },
];

const HN_QUERY =
  "https://hn.algolia.com/api/v1/search?query=how%20do%20I%20AI%20small%20business%20OR%20plumber%20OR%20teacher%20OR%20dispatch&tags=story&hitsPerPage=12";

type HnHit = {
  title?: string;
  url?: string;
  points?: number;
  objectID?: string;
};

function hnItemUrl(hit: HnHit): string {
  if (hit.url) return hit.url;
  return `https://news.ycombinator.com/item?id=${hit.objectID ?? ""}`;
}

export function composeHuntReply(title: string): string {
  return `AskYard answers this in plain words for shops, schools, and crews, then offers to do the work this week if you want it done.\n\n${REPLY_FOOTER}\n\nSource question: ${title}`;
}

export async function fetchHuntHits(): Promise<HuntHit[]> {
  try {
    const res = await fetch(HN_QUERY, { headers: { "User-Agent": "AskYard-Hunt/1.0 (+https://askyard.firstdeploy.ai)" } });
    if (!res.ok) return HUNT_SEED;
    const json = (await res.json()) as { hits?: HnHit[] };
    const live: HuntHit[] = (json.hits ?? [])
      .filter((hit) => (hit.title ?? "").length > 12)
      .slice(0, 8)
      .map((hit) => ({
        id: `hn-${hit.objectID ?? hit.title}`,
        title: hit.title ?? "Untitled",
        url: hnItemUrl(hit),
        source: "hn",
        trade: "general",
        why: `${hit.points ?? 0} points on HN. Answer it in public with a link back to AskYard.`,
        reply: composeHuntReply(hit.title ?? "this question"),
        points: hit.points,
      }));
    const seen = new Set<string>();
    const merged: HuntHit[] = [];
    for (const hit of [...live, ...HUNT_SEED]) {
      if (seen.has(hit.title)) continue;
      seen.add(hit.title);
      merged.push(hit);
    }
    return merged.slice(0, 16);
  } catch {
    return HUNT_SEED;
  }
}
