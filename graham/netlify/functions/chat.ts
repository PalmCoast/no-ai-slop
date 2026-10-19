import type { Config } from "@netlify/functions";
import { answerAs } from "../../shared/answer.ts";
import { DISCLOSURE } from "../../shared/public.ts";
import { json } from "../lib/http.ts";

export default async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  let body: { question?: string; disclosure?: string };
  try {
    body = (await req.json()) as { question?: string; disclosure?: string };
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const question = (body.question ?? "").trim();
  if (question.length < 2) return json({ error: "question_too_short" }, 400);
  if (question.length > 280) return json({ error: "question_too_long" }, 400);
  const disclosure = (body.disclosure ?? "").trim().slice(0, 120) || DISCLOSURE;
  return json({ answer: answerAs(question, disclosure) });
};

export const config: Config = { path: "/api/chat", method: "POST" };
