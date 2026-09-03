/**
 * GET /api/skill  (header X-Sonaris-License or ?key=)
 *   valid license → the paid skill as text/markdown (attachment SKILL.md)
 *   otherwise     → 402 { error: "license_required", checkout: "/#pricing" }
 *
 * The skill lives at sonaris/skill/SKILL.md, shipped with the function through
 * `included_files` in netlify.toml and never copied into dist/.
 */
import type { Config } from "@netlify/functions";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requireLicense } from "../lib/auth";
import { projectRoot } from "../lib/env";
import { error, licenseFromRequest } from "../lib/http";

function candidatePaths(): string[] {
  const here = (() => {
    try {
      return path.dirname(fileURLToPath(import.meta.url));
    } catch {
      return process.cwd();
    }
  })();
  return [
    path.join(projectRoot(), "skill", "SKILL.md"),
    path.join(process.cwd(), "skill", "SKILL.md"),
    path.join(process.cwd(), "sonaris", "skill", "SKILL.md"),
    path.resolve(here, "..", "..", "skill", "SKILL.md"),
    path.resolve(here, "..", "..", "..", "skill", "SKILL.md"),
  ];
}

export async function readSkill(): Promise<string | null> {
  for (const p of candidatePaths()) {
    try {
      return await fs.readFile(p, "utf8");
    } catch {
      // try the next location
    }
  }
  return null;
}

export default async (req: Request) => {
  if (req.method !== "GET") return error(405, "method_not_allowed", "Use GET.");
  const license = await requireLicense(licenseFromRequest(req));
  if (license instanceof Response) return license;

  const md = await readSkill();
  if (!md) return error(500, "skill_missing", "SKILL.md is not bundled with this deploy. Check included_files in netlify.toml.");
  const url = new URL(req.url);
  const inline = url.searchParams.get("inline") === "1";
  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="SKILL.md"`,
      "Cache-Control": "private, no-store",
      "X-Sonaris-License-Plan": license.plan ?? "unknown",
    },
  });
};

export const config: Config = {
  path: "/api/skill",
  method: ["GET"],
};
