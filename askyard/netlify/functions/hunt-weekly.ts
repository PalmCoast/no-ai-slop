import type { Config } from "@netlify/functions";
import { fetchHuntHits } from "../../shared/hunt.ts";
import { writeHunt } from "../lib/store.ts";

export default async () => {
  const hits = await fetchHuntHits();
  try {
    await writeHunt(hits);
  } catch (error) {
    console.error("hunt-weekly store write failed", error);
  }
  return Response.json({ ok: true, hits: hits.length });
};

export const config: Config = {
  schedule: "@daily",
};
