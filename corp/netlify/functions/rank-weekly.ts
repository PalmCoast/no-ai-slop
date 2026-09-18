import type { Config } from "@netlify/functions";
import { scoutPortfolio } from "../lib/scout.ts";
import { writeRank } from "../lib/store.ts";

export default async () => {
  const sites = await scoutPortfolio();
  const payload = { generatedAt: new Date().toISOString(), sites };
  try {
    await writeRank(payload);
  } catch (error) {
    console.error("rank-weekly store write failed", error);
  }
  const live = sites.filter((s) => s.statusLabel === "live" || s.statusLabel === "slow").length;
  const down = sites.filter((s) => s.statusLabel === "down").length;
  return Response.json({ ok: true, live, down, total: sites.length, generatedAt: payload.generatedAt });
};

export const config: Config = {
  schedule: "@weekly",
};
