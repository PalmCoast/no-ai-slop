import { normalizeQuestion, slugifyQuestion, type YardQuestion } from "./ask.ts";
import { BRAND_NAME, BRAND_PARENT, MARQUEE_NAME } from "./brand.ts";

export type RepHit = {
  title: string;
  url: string;
  source: "askyard" | "hn";
  tone: "good" | "watch" | "neutral";
};

export type RepReport = {
  query: string;
  slug: string;
  score: number;
  label: "strong" | "steady" | "quiet" | "watch";
  summary: string;
  helpful: number;
  missed: number;
  watchCount: number;
  hits: RepHit[];
  lookedUpAt: string;
};

const WATCH = /\b(scam|fraud|lawsuit|sued|felony|stolen|ripoff|rip-off|complaint|bbb|class action)\b/i;
const GOOD = /\b(helpful|honest|showed up|on time|recommend|fixed|live this week)\b/i;

export function parseRepQuery(raw: string): string {
  return normalizeQuestion(raw).slice(0, 80);
}

export function meterLabel(score: number, watchCount: number): RepReport["label"] {
  if (watchCount > 0 && score < 55) return "watch";
  if (score >= 80) return "strong";
  if (score >= 60) return "steady";
  return "quiet";
}

export function scoreFromVotes(helpful: number, missed: number, watchCount: number, publicHits: number): number {
  const votes = helpful + missed;
  const voteScore = votes === 0 ? 50 : Math.round((helpful / votes) * 100);
  const watchPenalty = Math.min(25, watchCount * 8);
  const coverage = Math.min(10, publicHits * 2);
  return Math.max(5, Math.min(99, voteScore + coverage - watchPenalty));
}

export function toneFor(title: string): RepHit["tone"] {
  if (WATCH.test(title)) return "watch";
  if (GOOD.test(title)) return "good";
  return "neutral";
}

export function hitsFromAnswers(query: string, board: YardQuestion[]): RepHit[] {
  const key = parseRepQuery(query);
  if (!key) return [];
  const tokens = new Set(key.split(" ").filter((w) => w.length > 2));
  return board
    .filter((item) => {
      const blob = `${item.question} ${item.answer} ${item.offerSlug}`.toLowerCase();
      if (blob.includes(key)) return true;
      let n = 0;
      for (const token of tokens) if (blob.includes(token)) n += 1;
      return n >= Math.min(2, tokens.size);
    })
    .slice(0, 6)
    .map((item) => ({
      title: `${item.question} · asked ${item.asks} times`,
      url: `/q/${item.slug}`,
      source: "askyard" as const,
      tone: (item.missed ?? 0) > (item.helpful ?? 0) ? "watch" : "good",
    }));
}

export function votesFor(query: string, board: YardQuestion[]): { helpful: number; missed: number } {
  const related = hitsFromAnswers(query, board);
  const slugs = new Set(related.map((hit) => hit.url.replace("/q/", "")));
  let helpful = 0;
  let missed = 0;
  for (const item of board) {
    if (!slugs.has(item.slug)) continue;
    helpful += item.helpful ?? 0;
    missed += item.missed ?? 0;
  }
  if (related.length === 0 && /askyard|first deploy|agenthive/i.test(query)) {
    for (const item of board) {
      helpful += item.helpful ?? 0;
      missed += item.missed ?? 0;
    }
  }
  return { helpful, missed };
}

export function applyVote(board: YardQuestion[], slug: string, vote: "helpful" | "missed"): YardQuestion[] {
  return board.map((item) => {
    if (item.slug !== slug) return item;
    if (vote === "helpful") return { ...item, helpful: (item.helpful ?? 0) + 1 };
    return { ...item, missed: (item.missed ?? 0) + 1 };
  });
}

export function buildReport(input: {
  query: string;
  board: YardQuestion[];
  publicHits?: RepHit[];
  now?: Date;
}): RepReport {
  const query = parseRepQuery(input.query);
  const answerHits = hitsFromAnswers(query, input.board);
  const publicHits = input.publicHits ?? [];
  const hits = [...answerHits, ...publicHits].slice(0, 10);
  const { helpful, missed } = votesFor(query, input.board);
  const watchCount = hits.filter((hit) => hit.tone === "watch").length;
  const score = scoreFromVotes(helpful, missed, watchCount, publicHits.length);
  const label = meterLabel(score, watchCount);
  return {
    query: input.query.trim(),
    slug: slugifyQuestion(query || "lookup"),
    score,
    label,
    summary: summaryFor(label, input.query.trim(), watchCount, helpful),
    helpful,
    missed,
    watchCount,
    hits,
    lookedUpAt: (input.now ?? new Date()).toISOString(),
  };
}

function summaryFor(label: RepReport["label"], name: string, watchCount: number, helpful: number): string {
  const who = name || "this name";
  if (label === "watch") {
    return `${who}: ${watchCount} public hit${watchCount === 1 ? "" : "s"} flagged for a closer look. Read the sources. This is a lookup, not a verdict.`;
  }
  if (label === "strong") {
    return `${who} looks strong on AskYard. ${helpful} people marked related answers as helpful.`;
  }
  if (label === "steady") {
    return `${who} has a steady public record. No roast wall. If something new lands, this meter moves.`;
  }
  return `${who} is quiet in public so far. That can be new, small, or careful. Search again after you ask, and install the toolbar if you want a ping when a new hit appears.`;
}

export const REP_TOOLBAR_BLURB =
  `${BRAND_NAME} Rep is a Chrome toolbar. Search a name, see the meter. If something rough is posted in public, you see the source the next time you look. Less RateMy. More Ahrefs-for-your-name. ${MARQUEE_NAME} is the paid lights if you then want to sit at the top.`;

export const KNOWN_LOOKUPS = [BRAND_NAME, BRAND_PARENT, "AgentHive Inc", "JobProof", "IndexMe.lol"];
