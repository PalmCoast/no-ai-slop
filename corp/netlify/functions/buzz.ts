import type { Config } from "@netlify/functions";
import { BUZZ_SEED } from "../../shared/buzz-seed.ts";
import { readBuzz } from "../lib/store.ts";

export default async () => {
  const stored = await readBuzz();
  return Response.json(stored ?? BUZZ_SEED, {
    headers: { "Cache-Control": "public, max-age=300" },
  });
};

export const config: Config = {
  path: "/api/buzz",
  method: "GET",
};
