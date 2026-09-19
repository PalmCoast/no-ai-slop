import type { Config } from "@netlify/functions";
import { applyVote } from "../../shared/rep.ts";
import { computeTotals } from "../../shared/ask.ts";
import { readBoard, writeBoard } from "../lib/store.ts";

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  let body: { slug?: string; vote?: string };
  try {
    body = (await req.json()) as { slug?: string; vote?: string };
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const slug = (body.slug ?? "").trim();
  const vote = body.vote === "missed" ? "missed" : body.vote === "helpful" ? "helpful" : null;
  if (!slug || !vote) return Response.json({ error: "bad_vote" }, { status: 400 });
  const state = await readBoard();
  if (!state.questions.some((item) => item.slug === slug)) {
    return Response.json({ error: "unknown_question" }, { status: 404 });
  }
  state.questions = applyVote(state.questions, slug, vote);
  state.totals = {
    ...computeTotals(state.questions),
    offersStarted: state.totals.offersStarted,
    publicRepliesCopied: state.totals.publicRepliesCopied,
  };
  try {
    await writeBoard(state);
  } catch (error) {
    console.error("rate write failed", error);
  }
  const item = state.questions.find((row) => row.slug === slug);
  return Response.json({ slug, helpful: item?.helpful ?? 0, missed: item?.missed ?? 0 });
};

export const config: Config = {
  path: "/api/rate",
  method: "POST",
};
