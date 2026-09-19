import { getStore } from "@netlify/blobs";
import {
  computeTotals,
  rankQuestions,
  SEED_QUESTIONS,
  type YardQuestion,
  type YardTotals,
} from "../../shared/ask.ts";
import type { HuntHit } from "../../shared/hunt.ts";

type BoardState = {
  questions: YardQuestion[];
  totals: YardTotals;
};

function store() {
  return getStore({ name: "askyard", consistency: "strong" });
}

export async function readBoard(): Promise<BoardState> {
  try {
    const data = (await store().get("board.json", { type: "json" })) as BoardState | null;
    if (data?.questions?.length) {
      const merged = mergeSeed(data.questions);
      return { questions: rankQuestions(merged), totals: { ...computeTotals(merged), ...data.totals } };
    }
  } catch {
    // fall through to seed
  }
  const questions = rankQuestions(SEED_QUESTIONS);
  return { questions, totals: computeTotals(questions, { offersStarted: 18, publicRepliesCopied: 41 }) };
}

export async function writeBoard(state: BoardState): Promise<void> {
  await store().setJSON("board.json", {
    questions: rankQuestions(state.questions),
    totals: state.totals,
  });
}

export async function readHunt(): Promise<HuntHit[] | null> {
  try {
    const data = (await store().get("hunt.json", { type: "json" })) as { hits?: HuntHit[] } | null;
    return data?.hits ?? null;
  } catch {
    return null;
  }
}

export async function writeHunt(hits: HuntHit[]): Promise<void> {
  await store().setJSON("hunt.json", { generatedAt: new Date().toISOString(), hits });
}

function mergeSeed(stored: YardQuestion[]): YardQuestion[] {
  const bySlug = new Map(stored.map((item) => [item.slug, item]));
  for (const seed of SEED_QUESTIONS) {
    const current = bySlug.get(seed.slug);
    if (!current) {
      bySlug.set(seed.slug, seed);
      continue;
    }
    bySlug.set(seed.slug, {
      ...seed,
      ...current,
      asks: Math.max(seed.asks, current.asks),
      answer: current.answer || seed.answer,
    });
  }
  return [...bySlug.values()];
}
