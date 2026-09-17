import type { Config } from "@netlify/functions";
import { compileBuzz } from "../lib/buzz.ts";
import { writeBuzz } from "../lib/store.ts";

export default async () => {
  const edition = await compileBuzz();
  try {
    await writeBuzz(edition);
  } catch (error) {
    console.error("buzz-weekly store write failed", error);
  }
  return Response.json({ ok: true, weekOf: edition.weekOf, method: edition.method, stories: edition.stories.length });
};

export const config: Config = {
  schedule: "@weekly",
};
