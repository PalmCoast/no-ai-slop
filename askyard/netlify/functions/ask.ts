import type { Config } from "@netlify/functions";
import {
  bumpQuestion,
  computeTotals,
  findMatch,
  offerFor,
  pickOfferSlug,
  rankQuestions,
  slugifyQuestion,
  type YardQuestion,
} from "../../shared/ask.ts";
import { draftAnswer } from "../lib/draft.ts";
import { readBoard, writeBoard } from "../lib/store.ts";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  let body: { question?: string };
  try {
    body = (await req.json()) as { question?: string };
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const question = (body.question ?? "").trim();
  if (question.length < 8) {
    return Response.json({ error: "question_too_short" }, { status: 400 });
  }
  if (question.length > 280) {
    return Response.json({ error: "question_too_long" }, { status: 400 });
  }

  const state = await readBoard();
  const match = findMatch(question, state.questions);
  let item: YardQuestion;
  if (match) {
    const nextBoard = bumpQuestion(state.questions, match.question);
    item = nextBoard.find((row) => row.slug === match.slug) ?? match;
    if (!item.answer) {
      item = { ...item, answer: await draftAnswer(item.question), offerSlug: pickOfferSlug(item.question) };
    }
    state.questions = nextBoard.map((row) => (row.slug === item.slug ? item : row));
  } else {
    const answer = await draftAnswer(question);
    const slug = slugifyQuestion(question);
    item = {
      slug,
      question,
      answer,
      trade: "general",
      asks: 1,
      offerSlug: pickOfferSlug(question),
      updatedAt: new Date().toISOString(),
    };
    const used = new Set(state.questions.map((row) => row.slug));
    if (used.has(item.slug)) {
      let i = 2;
      while (used.has(`${slug}-${i}`)) i += 1;
      item.slug = `${slug}-${i}`;
    }
    state.questions = [...state.questions, item];
  }

  state.questions = rankQuestions(state.questions);
  state.totals = {
    ...computeTotals(state.questions),
    offersStarted: state.totals.offersStarted,
    publicRepliesCopied: state.totals.publicRepliesCopied,
  };
  try {
    await writeBoard(state);
  } catch (error) {
    console.error("ask store write failed", error);
  }

  return Response.json({
    question: item,
    offer: offerFor(item.offerSlug),
    totals: state.totals,
    board: state.questions,
  });
};

export const config: Config = {
  path: "/api/ask",
  method: "POST",
};
