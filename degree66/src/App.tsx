import { useMemo, useState } from "react";
import {
  generateBlueprint,
  getPreset,
  INTERVIEW_FLASHCARDS,
  SCENARIO_PRESETS,
} from "../shared/planner.ts";
import type {
  AgentPattern,
  BlueprintInput,
  CompliancePosture,
  GeneratedArtifact,
  IngestionPattern,
  LegacySource,
  ScenarioId,
} from "../shared/types.ts";

type WorkspaceTab = "simulator" | "artifacts" | "flashcards" | "company-brief";

interface SandboxSimItem {
  id: string;
  skuOrEvent: string;
  sourceDetail: string;
  geminiOutput: string;
  groundingCitation: string;
  confidence: number;
  policyFlag: string | null;
}

const SANDBOX_ITEMS: Record<ScenarioId, SandboxSimItem[]> = {
  "gfs-catalog": [
    {
      id: "GFS-481920",
      skuOrEvent: " Artisan Sourdough Pullman Loaf 6x2.5lb",
      sourceDetail: "Vendor EDI 832 · Missing French/Spanish copy · Allergen code: WHEAT",
      geminiOutput:
        "EN/ES/FR catalog block generated; allergen badge standardized to [CONTAINS: WHEAT]; shelf-life parsed to 180 days frozen.",
      groundingCitation: "bq://gfs_catalog_paradigm_data.catalog_standards#section-4.2",
      confidence: 0.96,
      policyFlag: null,
    },
    {
      id: "GFS-902114",
      skuOrEvent: "Tempura Wild Pollock Fillet Portions 10lb",
      sourceDetail: "Vendor PDF Spec · Unverified MSC sustainability claim · Mixedoz/g units",
      geminiOutput:
        "Normalized nutrition table to per-100g; flagged unverified MSC certification claim for buyer sign-off before publishing.",
      groundingCitation: "bq://gfs_catalog_paradigm_data.vendor_claims_policy#rule-19",
      confidence: 0.81,
      policyFlag: "Unverified sustainability claim requires Merchandising Lead approval",
    },
    {
      id: "GFS-331087",
      skuOrEvent: "Heavy Duty 3-Compartment Foil Container",
      sourceDetail: "Oracle Item Master · Complete dimensions · Clean spec",
      geminiOutput:
        "Generated eCommerce bullet points, dimensional weight, and pallet tie-high (9x5) in EN/ES/FR.",
      groundingCitation: "bq://gfs_catalog_paradigm_data.packaging_specs#foil-3comp",
      confidence: 0.94,
      policyFlag: null,
    },
  ],
  "gfs-dq-alerts": [
    {
      id: "INC-2026-8841",
      skuOrEvent: "Views_Current vs EDW Order_Header Row Count Drift (+4.8%)",
      sourceDetail: "Cloud Monitoring Alert · Snapshot lag 42 mins on us-central1",
      geminiOutput:
        "Root cause isolated to late-arriving CDC batch from Warehouse #14. Paused downstream Composer DAG `daily_exec_margin_rollup` and posted diff table to #data-ops.",
      groundingCitation: "bq://INFORMATION_SCHEMA.PARTITIONS#order_header_20261027",
      confidence: 0.95,
      policyFlag: null,
    },
    {
      id: "INC-2026-8849",
      skuOrEvent: "Schema Mutation Detected on Vendor_Rebate_Ledger",
      sourceDetail: "Datastream CDC · Column `rebate_tier_pct` precision narrowed",
      geminiOutput:
        "Blocked automatic DDL propagation; generated backfill migration script and escalated to Data Platform On-Call.",
      groundingCitation: "bq://gfs_dq_alerts_paradigm_data.schema_registry#v42",
      confidence: 0.84,
      policyFlag: "DDL precision change requires human Data Architect approval",
    },
  ],
  "biomed-migration": [
    {
      id: "COHORT-771A",
      skuOrEvent: "Oncology Phase-II Biomarker Cohort Query",
      sourceDetail: "FHIR Observation + De-identified Genomic Variant VCF in BigQuery",
      geminiOutput:
        "Synthesized 412 matching patient records with zero PHI exposure; all dates shifted via Cloud DLP crypto-deterministic key.",
      groundingCitation: "bq://biomed_migration_paradigm_data.fhir_observations_deid",
      confidence: 0.97,
      policyFlag: null,
    },
    {
      id: "COHORT-779C",
      skuOrEvent: "Cross-Site Clinical Note Free-Text Extraction",
      sourceDetail: "Unstructured pathology PDF · Quasi-identifier detected in header",
      geminiOutput:
        "Cloud DLP inspection caught rare zip+birth-year combination; masked token `[REDACTED_QUASI_ID]` and held export for Privacy Officer.",
      groundingCitation: "dlp://inspection_templates/hipaa_safe_harbor_v3",
      confidence: 0.86,
      policyFlag: "HIPAA Safe Harbor quasi-identifier review required",
    },
  ],
  "hospitality-ces": [
    {
      id: "GUEST-99201",
      skuOrEvent: "Diamond Member Flight Cancellation — Late Check-In & Rebook",
      sourceDetail: "Dialogflow CX Voice Turn · LTV Tier: Top 1% · Spanner Res #88412",
      geminiOutput:
        "Held Oceanfront King past midnight, waived change fee ($0), and pushed mobile key update via Cloud Run booking tool.",
      groundingCitation: "spanner://reservations/loyalty_policy#diamond_irrops",
      confidence: 0.93,
      policyFlag: null,
    },
    {
      id: "GUEST-99244",
      skuOrEvent: "Group Block Contract Attrition Waiver ($18,400)",
      sourceDetail: "Omnichannel Chat · Corporate Event Planner · Custom addendum",
      geminiOutput:
        "Extracted force-majeure clause via Vertex AI Search and prepared Agent Assist summary for live Group Sales Manager.",
      groundingCitation: "vertex_search://contracts_store/addendum_2026_q4.pdf",
      confidence: 0.78,
      policyFlag: "Credit > $5,000 threshold routed to Human in the Lead",
    },
  ],
  "utility-qa": [
    {
      id: "CALL-55109",
      skuOrEvent: "Downed Line & Medical Baseline Priority Restoration Call",
      sourceDetail: "Chirp Speech-to-Text V2 · 4m 12s audio · CIS Mainframe Code: MB-01",
      geminiOutput:
        "Verified rep read mandatory safety clearance script within 18 seconds and properly logged Medical Baseline flag in CIS.",
      groundingCitation: "bq://utility_qa_paradigm_data.puc_compliance_rubric#sec-12",
      confidence: 0.96,
      policyFlag: null,
    },
    {
      id: "CALL-55142",
      skuOrEvent: "High-Bill Dispute & Payment Plan Arrangement",
      sourceDetail: "Chirp Speech-to-Text V2 · 9m 45s audio · CIS Code: AR-LIHEAP",
      geminiOutput:
        "Detected missed LIHEAP assistance disclosure on turn 14; queued coaching clip for supervisor sign-off.",
      groundingCitation: "bq://utility_qa_paradigm_data.puc_compliance_rubric#sec-08",
      confidence: 0.83,
      policyFlag: "Regulatory coaching action requires Supervisor confirmation",
    },
  ],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("simulator");
  const [input, setInput] = useState<BlueprintInput>(() => getPreset("gfs-catalog").defaultInput);
  const [selectedArtifactIdx, setSelectedArtifactIdx] = useState<number>(0);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [flashcardFilter, setFlashcardFilter] = useState<string>("ALL");

  const activePreset = useMemo(() => getPreset(input.scenarioId), [input.scenarioId]);
  const blueprint = useMemo(() => generateBlueprint(input), [input]);
  const currentArtifact: GeneratedArtifact =
    blueprint.artifacts[selectedArtifactIdx] ?? blueprint.artifacts[0];

  const sandboxItems = SANDBOX_ITEMS[input.scenarioId] ?? SANDBOX_ITEMS["gfs-catalog"];

  function handleSelectPreset(id: ScenarioId) {
    const preset = getPreset(id);
    setInput(preset.defaultInput);
    setSelectedArtifactIdx(0);
  }

  async function handleCopy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFile(label);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch {
      setCopiedFile(label);
    }
  }

  function handleDownloadArtifact(artifact: GeneratedArtifact) {
    const blob = new Blob([artifact.contents], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = artifact.filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredFlashcards = useMemo(() => {
    if (flashcardFilter === "ALL") return INTERVIEW_FLASHCARDS;
    return INTERVIEW_FLASHCARDS.filter((f) => f.category === flashcardFilter);
  }, [flashcardFilter]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand-block">
            <div>
              <div className="brand-title">Paradigm Blueprint Workbench</div>
              <div className="brand-sub">
                An offline study simulator by Daniel Graham, built to learn the 66degrees approach on Google Cloud
              </div>
            </div>
          </div>

          <nav className="workspace-nav" aria-label="Workbench Views">
            <button
              type="button"
              className={activeTab === "simulator" ? "nav-tab active" : "nav-tab"}
              onClick={() => setActiveTab("simulator")}
            >
              1. Paradigm° Blueprint Simulator
            </button>
            <button
              type="button"
              className={activeTab === "artifacts" ? "nav-tab active" : "nav-tab"}
              onClick={() => setActiveTab("artifacts")}
            >
              2. Generated GCP Code ({blueprint.artifacts.length})
            </button>
            <button
              type="button"
              className={activeTab === "flashcards" ? "nav-tab active" : "nav-tab"}
              onClick={() => setActiveTab("flashcards")}
            >
              3. Interview Q&A Drills ({INTERVIEW_FLASHCARDS.length})
            </button>
            <button
              type="button"
              className={activeTab === "company-brief" ? "nav-tab active" : "nav-tab"}
              onClick={() => setActiveTab("company-brief")}
            >
              4. 66degrees Cheat Sheet
            </button>
          </nav>
        </div>
      </header>

      <main className="container main-content">
        {/* Scenario Selector Strip */}
        <section className="scenario-strip" aria-label="66degrees Client Scenarios">
          <div className="strip-header">
            <div>
              <span className="eyebrow">REAL 66DEGREES CASE STUDY PRESETS</span>
              <h1>Engineer the Agentic Enterprise on Google Cloud</h1>
            </div>
            <div className="kpi-badges">
              <div className="kpi-chip">
                <strong>4x</strong>
                <span>Google Cloud AI Partner of the Year</span>
              </div>
              <div className="kpi-chip">
                <strong>500+</strong>
                <span>GCP Certifications</span>
              </div>
              <div className="kpi-chip">
                <strong>Paradigm°</strong>
                <span>Data · OS · Legacy</span>
              </div>
            </div>
          </div>

          <div className="preset-grid">
            {SCENARIO_PRESETS.map((preset) => {
              const isSelected = preset.id === input.scenarioId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={isSelected ? "preset-card active" : "preset-card"}
                  onClick={() => handleSelectPreset(preset.id)}
                >
                  <div className="preset-badge">{preset.badge}</div>
                  <div className="preset-title">{preset.title}</div>
                  <div className="preset-ref">{preset.publicCaseStudyRef}</div>
                </button>
              );
            })}
          </div>
        </section>

        {activeTab === "simulator" && (
          <div className="simulator-layout">
            {/* Left Column: Controls + Human-in-the-Lead Sandbox */}
            <div className="sim-controls-col">
              <div className="panel">
                <div className="panel-head">
                  <h2>Paradigm° Engagement Parameters</h2>
                  <p>Tune the legacy estate, Google Cloud ingestion, compliance perimeter, and Gemini agent gate.</p>
                </div>

                <div className="control-group">
                  <label htmlFor="client-name">Client / Program Name</label>
                  <input
                    id="client-name"
                    type="text"
                    value={input.clientName}
                    onChange={(e) => setInput({ ...input, clientName: e.target.value })}
                  />
                </div>

                <div className="control-group">
                  <label htmlFor="legacy-source">Legacy Source Estate (Paradigm° Legacy / Data)</label>
                  <select
                    id="legacy-source"
                    value={input.legacySource}
                    onChange={(e) =>
                      setInput({ ...input, legacySource: e.target.value as LegacySource })
                    }
                  >
                    <option value="oracle-edw">Oracle Exadata / Legacy EDW</option>
                    <option value="sqlserver-onprem">On-Prem SQL Server & SMB File Shares</option>
                    <option value="mainframe-cobol">IBM z/OS Mainframe (COBOL / DB2 / VSAM)</option>
                    <option value="snowflake-multi">Siloed Multi-Cloud Snowflake & CRM</option>
                    <option value="hadoop-hdfs">On-Prem Cloudera Hadoop / HDFS</option>
                  </select>
                </div>

                <div className="control-group">
                  <label htmlFor="ingestion-pattern">Google Cloud Ingestion Pipeline</label>
                  <select
                    id="ingestion-pattern"
                    value={input.ingestionPattern}
                    onChange={(e) =>
                      setInput({ ...input, ingestionPattern: e.target.value as IngestionPattern })
                    }
                  >
                    <option value="pubsub-dataflow">Cloud Pub/Sub + Apache Beam on Dataflow (Streaming)</option>
                    <option value="cdc-datastream">Cloud Datastream Serverless CDC + Dataflow</option>
                    <option value="storage-batch">Cloud Storage + Cloud Composer 3 + BigQuery Load</option>
                  </select>
                </div>

                <div className="control-group">
                  <label htmlFor="compliance-posture">Security, Governance & Privacy Boundary</label>
                  <select
                    id="compliance-posture"
                    value={input.compliance}
                    onChange={(e) =>
                      setInput({ ...input, compliance: e.target.value as CompliancePosture })
                    }
                  >
                    <option value="standard-iam">Dataplex Governance + BigQuery Policy Tags + IAM</option>
                    <option value="hipaa-cmek-vpcsc">HIPAA Boundary: VPC Service Controls + KMS CMEK + DLP</option>
                    <option value="pci-dlp-tokenized">PCI-DSS 4.0: Cloud DLP Tokenization + Row-Level Security</option>
                  </select>
                </div>

                <div className="control-group">
                  <label htmlFor="agent-pattern">Paradigm°OS Agent Architecture</label>
                  <select
                    id="agent-pattern"
                    value={input.agentPattern}
                    onChange={(e) =>
                      setInput({ ...input, agentPattern: e.target.value as AgentPattern })
                    }
                  >
                    <option value="vertex-rag-grounding">Vertex AI Gemini 2.5 Pro + BigQuery Vector Search</option>
                    <option value="multi-agent-langgraph">Vertex AI Reasoning Engine Multi-Agent Supervisor</option>
                    <option value="dialogflow-cx-ces">Customer Engagement Suite (Dialogflow CX + Agent Assist)</option>
                    <option value="eventarc-remediation">Eventarc + Cloud Run Autonomous Data SRE Agent</option>
                  </select>
                </div>

                <div className="slider-row">
                  <div className="slider-label">
                    <span>Daily Event Volume</span>
                    <strong>{input.dailyEventsMillions}M events/day</strong>
                  </div>
                  <input
                    aria-label="Daily Event Volume"
                    type="range"
                    min={1}
                    max={200}
                    value={input.dailyEventsMillions}
                    onChange={(e) =>
                      setInput({ ...input, dailyEventsMillions: Number(e.target.value) })
                    }
                  />
                </div>

                <div className="slider-row">
                  <div className="slider-label">
                    <span>Human-in-the-Lead Confidence Gate</span>
                    <strong>{(input.humanInTheLoopThreshold * 100).toFixed(0)}% minimum</strong>
                  </div>
                  <input
                    aria-label="Human-in-the-Lead Confidence Gate"
                    type="range"
                    min={70}
                    max={98}
                    value={Math.round(input.humanInTheLoopThreshold * 100)}
                    onChange={(e) =>
                      setInput({
                        ...input,
                        humanInTheLoopThreshold: Number(e.target.value) / 100,
                      })
                    }
                  />
                </div>
              </div>

              {/* Interactive Human-in-the-Lead Live Gate Tester */}
              <div className="panel">
                <div className="panel-head">
                  <h2>Live &ldquo;Human in the Lead&rdquo; Gate Simulation</h2>
                  <p>
                    Drag the confidence slider above ({(input.humanInTheLoopThreshold * 100).toFixed(0)}%) to watch how
                    Paradigm°OS routes real {activePreset.title.split("—")[0].trim()} events between autonomous commit
                    and human review.
                  </p>
                </div>
                <div className="sandbox-list">
                  {sandboxItems.map((item) => {
                    const autoApproved =
                      item.confidence >= input.humanInTheLoopThreshold && !item.policyFlag;
                    return (
                      <div
                        key={item.id}
                        className={autoApproved ? "sandbox-item approved" : "sandbox-item escalated"}
                      >
                        <div className="sandbox-top">
                          <span className="mono-id">{item.id}</span>
                          <span className={autoApproved ? "gate-pill pass" : "gate-pill hold"}>
                            {autoApproved
                              ? `AUTO_COMMIT (${(item.confidence * 100).toFixed(0)}% >= ${(input.humanInTheLoopThreshold * 100).toFixed(0)}%)`
                              : `HUMAN_IN_THE_LEAD (${(item.confidence * 100).toFixed(0)}%)`}
                          </span>
                        </div>
                        <div className="sandbox-title">{item.skuOrEvent}</div>
                        <div className="sandbox-meta">{item.sourceDetail}</div>
                        <div className="sandbox-output">{item.geminiOutput}</div>
                        <div className="sandbox-citation">
                          Grounding: <code>{item.groundingCitation}</code>
                        </div>
                        {item.policyFlag && (
                          <div className="sandbox-flag">Policy Gate: {item.policyFlag}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Live GCP Topology, FinOps Estimator, Talking Points */}
            <div className="sim-results-col">
              <div className="panel highlight-panel">
                <div className="blueprint-banner">
                  <div>
                    <span className="eyebrow">ACTIVE CASE STUDY CONTEXT</span>
                    <h2>{activePreset.title}</h2>
                  </div>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setActiveTab("artifacts")}
                  >
                    Inspect Generated SQL, Terraform & Python →
                  </button>
                </div>
                <p className="problem-box">
                  <strong>Client Challenge:</strong> {activePreset.problemStatement}
                </p>
                <p className="summary-box">
                  <strong>Generated Google Cloud Blueprint:</strong> {blueprint.summary}
                </p>

                <div className="acceleration-grid">
                  <div className="accel-stat">
                    <span className="accel-val">
                      {blueprint.paradigmAcceleration.legacyDiscoveryWeeks} wks →{" "}
                      {blueprint.paradigmAcceleration.paradigmDiscoveryHours} hrs
                    </span>
                    <span className="accel-label">Paradigm°OS Workflow Discovery</span>
                  </div>
                  <div className="accel-stat">
                    <span className="accel-val">
                      {blueprint.paradigmAcceleration.dataModSpeedupPct}% Faster
                    </span>
                    <span className="accel-label">Paradigm° Data Modernization</span>
                  </div>
                  <div className="accel-stat">
                    <span className="accel-val">
                      ${blueprint.paradigmAcceleration.projectedAnnualSavingsUsd.toLocaleString()}/yr
                    </span>
                    <span className="accel-label">Projected Infra & Ops Run-Rate Savings</span>
                  </div>
                </div>
              </div>

              {/* 5-Layer GCP Architecture Pipeline */}
              <div className="panel">
                <div className="panel-head">
                  <h2>End-to-End Google Cloud Architecture Topology</h2>
                  <p>Every layer connects data governance directly into production agent execution.</p>
                </div>

                <div className="topology-stack">
                  {blueprint.nodes.map((node, index) => (
                    <div key={node.id} className="topology-node">
                      <div className="node-step">{index + 1}</div>
                      <div className="node-body">
                        <div className="node-header-row">
                          <span className="node-layer">{node.layer}</span>
                          <span className="node-sla">{node.slaOrSpec}</span>
                        </div>
                        <div className="node-product">{node.gcpProduct}</div>
                        <p className="node-role">{node.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FinOps & Sizing Table */}
              <div className="panel">
                <div className="panel-head">
                  <h2>Google Cloud FinOps & Sizing Estimate</h2>
                  <p>
                    Transparent monthly run-rate breakdown (addresses 66degrees&apos; FAQ on keeping long-term GCP spend
                    predictable).
                  </p>
                </div>
                <div className="table-wrap">
                  <table className="finops-table">
                    <thead>
                      <tr>
                        <th>Google Cloud Service</th>
                        <th>Sizing Basis</th>
                        <th>Est. Monthly</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blueprint.finops.items.map((item) => (
                        <tr key={item.service}>
                          <td>
                            <strong>{item.service}</strong>
                            <div className="table-note">{item.notes}</div>
                          </td>
                          <td>{item.sizingBasis}</td>
                          <td className="amount-cell">${item.monthlyUsd.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={2}>
                          <strong>Projected Google Cloud Monthly Total</strong> (vs. $
                          {blueprint.finops.legacyMonthlyBaselineUsd.toLocaleString()}/mo legacy estate baseline)
                        </td>
                        <td className="amount-cell total-cell">
                          ${blueprint.finops.totalMonthlyGcpUsd.toLocaleString()}/mo
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Verbal Talking Points for Screen-Share */}
              <div className="panel">
                <div className="panel-head">
                  <h2>What to Say When Sharing This Screen in Your Interview</h2>
                  <p>Word-for-word hooks grounded in 66degrees&apos; Google Cloud Next &apos;26 messaging.</p>
                </div>
                <ul className="talking-points">
                  {blueprint.interviewTalkingPoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "artifacts" && (
          <section className="artifacts-view">
            <div className="artifacts-sidebar">
              <h2>Generated Production Artifacts</h2>
              <p className="muted-copy">
                Live code updated from your simulator parameters ({input.clientName}, {input.dailyEventsMillions}M
                events/day, {(input.humanInTheLoopThreshold * 100).toFixed(0)}% gate).
              </p>
              <div className="artifact-nav-list">
                {blueprint.artifacts.map((art, idx) => (
                  <button
                    key={art.filename}
                    type="button"
                    className={idx === selectedArtifactIdx ? "artifact-btn active" : "artifact-btn"}
                    onClick={() => setSelectedArtifactIdx(idx)}
                  >
                    <span className="artifact-pillar">{art.pillar}</span>
                    <strong>{art.filename}</strong>
                    <span className="artifact-desc">{art.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="artifact-viewer panel">
              <div className="viewer-header">
                <div>
                  <span className="eyebrow">{currentArtifact.pillar}</span>
                  <h2>{currentArtifact.title}</h2>
                  <p>{currentArtifact.description}</p>
                </div>
                <div className="viewer-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => handleCopy(currentArtifact.contents, currentArtifact.filename)}
                  >
                    {copiedFile === currentArtifact.filename ? "Copied!" : "Copy Code"}
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handleDownloadArtifact(currentArtifact)}
                  >
                    Download {currentArtifact.filename}
                  </button>
                </div>
              </div>
              <pre className="code-block">
                <code>{currentArtifact.contents}</code>
              </pre>
            </div>
          </section>
        )}

        {activeTab === "flashcards" && (
          <section className="flashcards-view">
            <div className="flashcards-header">
              <div>
                <span className="eyebrow">TECHNICAL & ARCHITECTURAL DRILLS</span>
                <h2>66degrees Interview Q&A Battle Cards</h2>
                <p>
                  Built from 66degrees&apos; Google Cloud Data Architect & AI Engineer job specs, Paradigm° platform
                  architecture, and client case studies.
                </p>
              </div>
              <div className="filter-pills">
                {[
                  "ALL",
                  "66degrees & Paradigm°",
                  "Google Cloud Data",
                  "Vertex AI & Gemini",
                  "Architecture Tradeoffs",
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={flashcardFilter === cat ? "pill-btn active" : "pill-btn"}
                    onClick={() => setFlashcardFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flashcards-grid">
              {filteredFlashcards.map((card) => (
                <article key={card.id} className="flashcard panel">
                  <div className="fc-category">{card.category}</div>
                  <h3>{card.question}</h3>
                  <div className="fc-intent">
                    <strong>What the interviewer is testing:</strong> {card.interviewerIntent}
                  </div>
                  <p className="fc-answer">{card.sharpAnswer}</p>
                  <pre className="fc-snippet">
                    <code>{card.codeOrCommandSnippet}</code>
                  </pre>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "company-brief" && (
          <section className="company-brief-view">
            <div className="brief-grid">
              <article className="panel">
                <span className="eyebrow">IDENTITY & STANDING</span>
                <h2>Why 66degrees Is a True &ldquo;Google House&rdquo;</h2>
                <ul className="brief-list">
                  <li>
                    <strong>Diamond Google Cloud Partner & 4x Partner of the Year:</strong> Recognized specifically for
                    client impact in Artificial Intelligence and enterprise-grade Google Cloud delivery, backed by 500+
                    Google Cloud certifications.
                  </li>
                  <li>
                    <strong>Launch Partner for Gemini Enterprise for Industries:</strong> Selected by Google Cloud to
                    take industry-specific Gemini workflows from blueprint to production across retail, foodservice
                    distribution, healthcare, financial services, travel/hospitality, and energy/utilities.
                  </li>
                  <li>
                    <strong>Core Thesis:</strong> &ldquo;Every enterprise is looking to AI for an advantage. It
                    doesn&apos;t come from how many agents you deploy. It&apos;s built in the workflows redesigned
                    around AI, connected into an operating system that governs and improves as it runs.&rdquo;
                  </li>
                </ul>
              </article>

              <article className="panel">
                <span className="eyebrow">PROPRIETARY PLATFORM</span>
                <h2>The Three Pillars of Paradigm°</h2>
                <ul className="brief-list">
                  <li>
                    <strong>Paradigm° Data (AI-Ready Foundation):</strong> Accelerates data and platform modernization
                    by 50–80% into BigQuery, BigLake, Dataflow, and Dataplex—because agents only reach as far as the
                    data foundation allows.
                  </li>
                  <li>
                    <strong>Paradigm°OS (Agentic Operating System):</strong> Decomposes legacy business workflows into
                    build-ready agentic blueprints with projected ROI in hours instead of weeks, carrying governance and
                    human decision points into production on Vertex AI.
                  </li>
                  <li>
                    <strong>Paradigm° Legacy (Mainframe & Core System Exits):</strong> Ingests legacy COBOL/mainframe
                    and monolithic codebases to generate idiomatic, cloud-native services on Google Cloud Run and GKE.
                  </li>
                </ul>
              </article>

              <article className="panel">
                <span className="eyebrow">LEADERSHIP & GOOGLE CLOUD NEXT &apos;26</span>
                <h2>Names & Proof Points to Reference Naturally</h2>
                <ul className="brief-list">
                  <li>
                    <strong>Ben Kessler (CEO) & Gordon Food Service CIO Brendan Bonthuis:</strong> Featured together at
                    Google Cloud Next &apos;26 on theCUBE discussing &ldquo;Human in the Lead&rdquo; (targeting a 10x
                    capacity lift for people rather than headcount replacement) and how GFS modernized 450,000+ catalog
                    SKUs and automated Managed Services data-quality alerts on GCP.
                  </li>
                  <li>
                    <strong>Technical Leadership Bench:</strong> Joshua Sutton (Chief Innovation Officer), Alex Voorhees
                    (SVP Cloud Engineering), Daniel Zagales (SVP Data Platforms), James Garza (SVP Solution Consulting),
                    Matt Kelberman (VP Solution Consulting), Maria Mejia (VP of Alliances).
                  </li>
                  <li>
                    <strong>Quantified Client Outcomes:</strong> $10M annual savings from data-center exit for a Fortune
                    250 client; 50–70% customer touchpoints automated for a Travel & Hospitality leader; 90% improvement
                    in call-center QA evaluation quality for an Energy & Utilities leader.
                  </li>
                </ul>
              </article>

              <article className="panel">
                <span className="eyebrow">YOUR HIGH-SIGNAL QUESTIONS FOR THEM</span>
                <h2>Questions to Ask at the End of the Interview</h2>
                <ul className="brief-list">
                  <li>
                    <strong>On Paradigm°OS & Forward-Deployed Delivery:</strong> &ldquo;When Forward-Deployed Engineers
                    walk out of an Agentic Lab with a Paradigm°OS blueprint, what are the most common data-readiness
                    gaps in the client&apos;s BigQuery or legacy estate that have to be solved first?&rdquo;
                  </li>
                  <li>
                    <strong>On Day-2 Managed Agentic Services:</strong> &ldquo;In your Managed Agentic Services
                    practice, how are teams structuring continuous evaluation and human-in-the-lead feedback loops as
                    Google ships updates across the Gemini 2.5 model family?&rdquo;
                  </li>
                  <li>
                    <strong>On First 90 Days Impact:</strong> &ldquo;For someone stepping into this role tomorrow, what
                    separates an engineer who ramps in 30 days on your Google Cloud engagements from everyone
                    else?&rdquo;
                  </li>
                </ul>
              </article>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
