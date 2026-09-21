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
import { applyVote, buildReport, type RepReport } from "../shared/rep";
import { fallbackCheck, type CheckReport } from "../shared/check";
import {
  applyBid,
  minNextBidCents,
  centsToDollars,
  parseBid,
  rankMarquee,
  SEED_MARQUEE,
  type MarqueeListing,
} from "../shared/marquee";

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

export async function lookupRep(query: string): Promise<RepReport> {
  try {
    const res = await fetch(`/api/rep?q=${encodeURIComponent(query)}`);
    if (res.ok) return (await res.json()) as RepReport;
  } catch {
    // local seed
  }
  const { questions } = await fetchBoard();
  return buildReport({ query, board: questions });
}

export async function rateAnswer(
  slug: string,
  vote: "helpful" | "missed",
): Promise<{ helpful: number; missed: number }> {
  try {
    const res = await fetch("/api/rate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, vote }),
    });
    if (res.ok) return (await res.json()) as { helpful: number; missed: number };
  } catch {
    // local seed
  }
  const board = applyVote(rankedSeed(), slug, vote);
  const item = board.find((row) => row.slug === slug);
  return { helpful: item?.helpful ?? 0, missed: item?.missed ?? 0 };
}

const MARQUEE_KEY = "askyard-marquee";

function localMarquee(): MarqueeListing[] {
  try {
    const raw = localStorage.getItem(MARQUEE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { listings?: MarqueeListing[] };
      if (parsed.listings?.length) return rankMarquee(parsed.listings);
    }
  } catch {
    // seed
  }
  return rankMarquee(SEED_MARQUEE);
}

export type MarqueeState = {
  listings: MarqueeListing[];
  minNextBidCents: number;
  minNextBid: string;
};

export async function fetchMarquee(): Promise<MarqueeState> {
  try {
    const res = await fetch("/api/marquee");
    if (res.ok) {
      const data = (await res.json()) as MarqueeState;
      if (data.listings?.length) return data;
    }
  } catch {
    // local seed
  }
  const listings = localMarquee();
  const min = minNextBidCents(listings);
  return { listings, minNextBidCents: min, minNextBid: centsToDollars(min) };
}

export async function placeBid(
  name: string,
  bid: string,
): Promise<{ url: string; demo?: boolean; listings?: MarqueeListing[]; error?: string; message?: string }> {
  try {
    const res = await fetch("/api/marquee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bid }),
    });
    const data = (await res.json()) as {
      url?: string;
      demo?: boolean;
      listings?: MarqueeListing[];
      error?: string;
      message?: string;
    };
    if (res.ok && data.url) return data as { url: string; demo?: boolean; listings?: MarqueeListing[] };
    if (data.error) return { url: "", error: data.error, message: data.message };
  } catch {
    // local demo
  }
  const listings = localMarquee();
  const parsed = parseBid(bid, listings);
  if ("error" in parsed) return { url: "", error: "bid_too_low", message: parsed.error };
  const next = applyBid(listings, { name, bidCents: parsed.cents, demo: true });
  try {
    localStorage.setItem(MARQUEE_KEY, JSON.stringify({ listings: next }));
  } catch {
    // ignore
  }
  return {
    demo: true,
    url: `/marquee/thanks?demo=1&name=${encodeURIComponent(name)}`,
    listings: next,
  };
}

export async function runShopCheck(query: string): Promise<CheckReport> {
  try {
    const res = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = (await res.json().catch(() => null)) as { report?: CheckReport; error?: string } | null;
    if (res.ok && data?.report) return data.report;
    if (data?.error && res.status === 400) throw new Error(data.error);
  } catch (error) {
    if (error instanceof Error && error.message && !(error instanceof TypeError)) throw error;
  }
  const local = fallbackCheck(query);
  if ("error" in local) throw new Error(local.error);
  return local;
}

export async function confirmMarquee(sessionId: string | null, demo: boolean): Promise<MarqueeState> {
  try {
    const params = new URLSearchParams();
    if (demo) params.set("demo", "1");
    if (sessionId) params.set("session_id", sessionId);
    const res = await fetch(`/api/marquee/confirm?${params.toString()}`);
    if (res.ok) {
      const data = (await res.json()) as { listings?: MarqueeListing[] };
      if (data.listings?.length) {
        const min = minNextBidCents(data.listings);
        return { listings: data.listings, minNextBidCents: min, minNextBid: centsToDollars(min) };
      }
    }
  } catch {
    // local
  }
  return fetchMarquee();
}
