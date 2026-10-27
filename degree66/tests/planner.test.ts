import { describe, expect, it } from "vitest";
import {
  generateBlueprint,
  getPreset,
  INTERVIEW_FLASHCARDS,
  SCENARIO_PRESETS,
} from "../shared/planner.ts";

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
});
