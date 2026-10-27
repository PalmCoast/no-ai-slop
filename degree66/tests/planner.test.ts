import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  generateBlueprint,
  getPreset,
  INTERVIEW_FLASHCARDS,
  SCENARIO_PRESETS,
} from "../shared/planner.ts";

const degree66Root = fileURLToPath(new URL("..", import.meta.url));

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (/\.(tsx|ts|html|txt|md|css)$/.test(name)) acc.push(full);
  }
  return acc;
}

describe("66degrees Paradigm° blueprint planner", () => {
  it("provides 5 verified 66degrees client scenario presets", () => {
    expect(SCENARIO_PRESETS).toHaveLength(5);
    const ids = SCENARIO_PRESETS.map((s) => s.id);
    expect(ids).toEqual([
      "gfs-catalog",
      "gfs-dq-alerts",
      "biomed-migration",
      "hospitality-ces",
      "utility-qa",
    ]);
  });

  it("generates a 5-layer Google Cloud architecture and 4 code artifacts for Gordon Food Service", () => {
    const preset = getPreset("gfs-catalog");
    const out = generateBlueprint(preset.defaultInput);

    expect(out.nodes).toHaveLength(5);
    expect(out.nodes.map((n) => n.layer)).toEqual([
      "Ingest",
      "Paradigm° Data",
      "Governance",
      "Paradigm°OS Agent",
      "Operations",
    ]);
    expect(out.artifacts).toHaveLength(4);
    expect(out.artifacts.map((a) => a.filename)).toEqual([
      "01_paradigm_data_bigquery.sql",
      "02_gcp_foundation_main.tf",
      "03_paradigm_os_vertex_agent.py",
      "04_agentic_lab_runbook.md",
    ]);
    expect(out.artifacts[0].contents).toContain("CREATE VECTOR INDEX");
    expect(out.artifacts[0].contents).toContain("text-embedding-005");
    expect(out.artifacts[1].contents).toContain("google_bigquery_dataset");
    expect(out.artifacts[2].contents).toContain("HUMAN_GATE_THRESHOLD: float = 0.88");
  });

  it("enforces HIPAA VPC Service Controls and INTERNAL_ONLY ingress on biomedical scenario", () => {
    const preset = getPreset("biomed-migration");
    const out = generateBlueprint(preset.defaultInput);

    const govNode = out.nodes.find((n) => n.layer === "Governance")!;
    expect(govNode.gcpProduct).toContain("VPC Service Controls");
    expect(out.riskControls[0]).toContain("Zero-Exfiltration HIPAA Perimeter");
    expect(out.artifacts[1].contents).toContain("INGRESS_TRAFFIC_INTERNAL_ONLY");
  });

  it("scales FinOps estimates and mainframe acceleration metrics accurately", () => {
    const small = generateBlueprint({
      ...getPreset("utility-qa").defaultInput,
      dailyEventsMillions: 10,
    });
    const large = generateBlueprint({
      ...getPreset("utility-qa").defaultInput,
      dailyEventsMillions: 120,
    });

    expect(large.finops.totalMonthlyGcpUsd).toBeGreaterThan(small.finops.totalMonthlyGcpUsd);
    expect(large.finops.netMonthlySavingsUsd).toBeGreaterThan(0);
    expect(large.paradigmAcceleration.dataModSpeedupPct).toBe(75);
  });

  it("includes comprehensive interview battle cards across all 4 categories", () => {
    expect(INTERVIEW_FLASHCARDS.length).toBeGreaterThanOrEqual(6);
    const categories = new Set(INTERVIEW_FLASHCARDS.map((f) => f.category));
    expect(categories.has("66degrees & Paradigm°")).toBe(true);
    expect(categories.has("Google Cloud Data")).toBe(true);
    expect(categories.has("Vertex AI & Gemini")).toBe(true);
    expect(categories.has("Architecture Tradeoffs")).toBe(true);
  });

  it("ships noindex meta tag, disallow-all robots.txt, zero live API calls, and no personal email/phone", () => {
    const indexHtml = readFileSync(join(degree66Root, "index.html"), "utf8");
    expect(indexHtml).toContain('<meta name="robots" content="noindex" />');
    expect(indexHtml).toContain("Paradigm Blueprint Workbench");
    expect(indexHtml).not.toContain("fonts.googleapis.com");

    const appTsx = readFileSync(join(degree66Root, "src/App.tsx"), "utf8");
    expect(appTsx).toContain("Paradigm Blueprint Workbench");
    expect(appTsx).toContain(
      "An offline study simulator by Daniel Graham, built to learn the 66degrees approach on Google Cloud",
    );
    expect(appTsx).not.toContain('<div className="brand-badge">66°</div>');
    expect(appTsx).not.toContain('<span className="gcp-pill">Google Cloud Diamond Partner</span>');

    const robotsTxt = readFileSync(join(degree66Root, "public/robots.txt"), "utf8");
    expect(robotsTxt).toContain("User-agent: *");
    expect(robotsTxt).toContain("Disallow: /");

    const files = walk(degree66Root).filter((f) => !f.includes("/tests/"));
    for (const file of files) {
      const content = readFileSync(file, "utf8");
      expect(content).not.toMatch(/320-335-6186|3203356186|daniel@agenthiveinc\.com|coltsinsider/i);
      if (file.endsWith(".ts") || file.endsWith(".tsx")) {
        expect(content).not.toMatch(/\bfetch\s*\(/);
      }
    }
  });
});
