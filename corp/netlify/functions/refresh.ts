import type { Config } from "@netlify/functions";
import { compileBuzz } from "../lib/buzz.ts";
import { scoutPortfolio } from "../lib/scout.ts";
import { writeBuzz, writeRank } from "../lib/store.ts";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  const secret = typeof Netlify !== "undefined" ? Netlify.env.get("HIVE_REFRESH_SECRET") : process.env.HIVE_REFRESH_SECRET;
  if (secret) {
    const header = req.headers.get("x-hive-secret");
    if (header !== secret) return new Response("Unauthorized", { status: 401 });
  }
  const [edition, sites] = await Promise.all([compileBuzz(), scoutPortfolio()]);
  try {
    await writeBuzz(edition);
    await writeRank({ generatedAt: new Date().toISOString(), sites });
  } catch (error) {
    console.error("refresh store write failed", error);
  }
  return Response.json({
    ok: true,
    buzz: { weekOf: edition.weekOf, method: edition.method },
    rank: { total: sites.length, live: sites.filter((s) => s.statusLabel === "live").length },
  });
};

export const config: Config = {
  path: "/api/refresh",
  method: "POST",
};
