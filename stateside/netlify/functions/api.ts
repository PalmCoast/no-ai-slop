/**
 * Single entry point for the Stateside API (/api/*).
 *
 * One function instead of one-per-route keeps a single database connection
 * warm across requests and, in local development, guarantees only one embedded
 * database instance is opened.
 */
import type { Config } from "@netlify/functions";
import { json, Router } from "../lib/http";
import { registerAdmin } from "../lib/routes/admin";
import { registerAuth } from "../lib/routes/auth";
import { registerEmployer } from "../lib/routes/employer";
import { registerGroups } from "../lib/routes/groups";
import { registerJobs } from "../lib/routes/jobs";
import { registerPeople } from "../lib/routes/people";

const router = new Router();
router.on("GET", "/api/health", async () => json({ ok: true, service: "stateside", time: new Date().toISOString() }));
registerAuth(router);
registerJobs(router);
registerEmployer(router);
registerGroups(router);
registerPeople(router);
registerAdmin(router);

export default async (req: Request) => router.handle(req);

export const config: Config = {
  path: "/api/*",
};
