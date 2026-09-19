import type { Config } from "@netlify/functions";
import { computeTotals } from "../../shared/ask.ts";
import { readBoard, writeBoard } from "../lib/store.ts";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  let body: { kind?: string };
  try {
    body = (await req.json()) as { kind?: string };
  } catch {
    body = {};
  }
  const state = await readBoard();
  if (body.kind === "copy") {
    state.totals.publicRepliesCopied += 1;
  } else {
    state.totals.offersStarted += 1;
  }
  state.totals = {
    ...computeTotals(state.questions),
    offersStarted: state.totals.offersStarted,
    publicRepliesCopied: state.totals.publicRepliesCopied,
  };
  try {
    await writeBoard(state);
  } catch (error) {
    console.error("tally write failed", error);
  }
  return Response.json({ totals: state.totals });
};

export const config: Config = {
  path: "/api/tally",
  method: "POST",
};
