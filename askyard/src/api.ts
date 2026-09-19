import {
  emptyTotals,
  findMatch,
  offerFor,
  pickOfferSlug,
  rankedSeed,
  type YardOffer,
  type YardQuestion,
  type YardTotals,
} from "../shared/ask";

export type AskResponse = {
  question: YardQuestion;
  offer: YardOffer;
  totals: YardTotals;
  board: YardQuestion[];
};

export async function fetchBoard(): Promise<{ questions: YardQuestion[]; totals: YardTotals }> {
  try {
    const res = await fetch("/api/board");
    if (res.ok) {
      const data = (await res.json()) as { questions?: YardQuestion[]; totals?: YardTotals };
      if (data.questions?.length) {
        return {
          questions: data.questions,
          totals: data.totals ?? emptyTotals(),
        };
      }
    }
  } catch {
    // local seed
  }
  return { questions: rankedSeed(), totals: emptyTotals() };
}

export async function submitQuestion(question: string): Promise<AskResponse> {
  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    if (res.ok) return (await res.json()) as AskResponse;
  } catch {
    // local seed
  }
  const board = rankedSeed();
  const match = findMatch(question, board);
  if (match) {
    const next = { ...match, asks: match.asks + 1 };
    return {
      question: next,
      offer: offerFor(next.offerSlug),
      totals: emptyTotals(),
      board: board.map((row) => (row.slug === next.slug ? next : row)),
    };
  }
  const created: YardQuestion = {
    slug: "local-ask",
    question,
    answer:
      "Name the job in one sentence, pick the smallest tool that does that job, and put a price next to it. AskYard keeps the answer free. If you want it built, book the free 30 or start First Deploy AI.",
    trade: "general",
    asks: 1,
    offerSlug: pickOfferSlug(question),
    updatedAt: new Date().toISOString(),
  };
  return {
    question: created,
    offer: offerFor(created.offerSlug),
    totals: emptyTotals(),
    board: [created, ...board],
  };
}

export async function tally(kind: "offer" | "copy"): Promise<YardTotals | null> {
  try {
    const res = await fetch("/api/tally", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
    });
    if (res.ok) {
      const data = (await res.json()) as { totals?: YardTotals };
      return data.totals ?? null;
    }
  } catch {
    return null;
  }
  return null;
}
