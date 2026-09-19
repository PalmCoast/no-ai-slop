import type { Config } from "@netlify/functions";
import { fetchHuntHits, HUNT_SEED } from "../../shared/hunt.ts";
import { readHunt, writeHunt } from "../lib/store.ts";

export default async () => {
  const stored = await readHunt();
  return Response.json(
    { hits: stored ?? HUNT_SEED },
    { headers: { "Cache-Control": "public, max-age=120" } },
  );
};

export const config: Config = {
  path: "/api/hunt",
  method: "GET",
};

export async function refreshHunt() {
  const hits = await fetchHuntHits();
  try {
    await writeHunt(hits);
  } catch (error) {
    console.error("hunt store write failed", error);
  }
  return hits;
}
