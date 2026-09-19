import type { Config } from "@netlify/functions";
import { readBoard } from "../lib/store.ts";

export default async () => {
  const state = await readBoard();
  return Response.json(state, {
    headers: { "Cache-Control": "public, max-age=30" },
  });
};

export const config: Config = {
  path: "/api/board",
  method: "GET",
};
