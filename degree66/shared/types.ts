export type ScenarioId =
  | "gfs-catalog"
  | "gfs-dq-alerts"
  | "biomed-migration"
  | "hospitality-ces"
  | "utility-qa";

export type LegacySource =
  | "oracle-edw"
  | "sqlserver-onprem"
  | "mainframe-cobol"
  | "snowflake-multi"
  | "hadoop-hdfs";

export type IngestionPattern = "cdc-datastream" | "pubsub-dataflow" | "storage-batch";

export type CompliancePosture = "standard-iam" | "hipaa-cmek-vpcsc" | "pci-dlp-tokenized";

export type AgentPattern =
  | "vertex-rag-grounding"
  | "multi-agent-langgraph"
  | "dialogflow-cx-ces"
  | "eventarc-remediation";

export interface BlueprintInput {
  scenarioId: ScenarioId;
  clientName: string;
  legacySource: LegacySource;
  ingestionPattern: IngestionPattern;
  compliance: CompliancePosture;
  agentPattern: AgentPattern;
  dailyEventsMillions: number;
  catalogOrRecordCount: number;
  humanInTheLoopThreshold: number; // e.g. 0.85 confidence
}

export interface GcpArchitectureNode {
  id: string;
  layer: "Ingest" | "Paradigm° Data" | "Governance" | "Paradigm°OS Agent" | "Operations";
  service: string;
  gcpProduct: string;
  role: string;
  slaOrSpec: string;
}

export interface FinOpsLineItem {
  service: string;
  sizingBasis: string;
  monthlyUsd: number;
  notes: string;
}

export interface GeneratedArtifact {
  filename: string;
  title: string;
  language: "sql" | "hcl" | "python" | "markdown";
  pillar: "Paradigm° Data" | "Paradigm°OS" | "Paradigm° Legacy" | "FinOps & Governance";
  description: string;
  contents: string;
}

export interface BlueprintOutput {
  input: BlueprintInput;
  headline: string;
  summary: string;
  paradigmAcceleration: {
    legacyDiscoveryWeeks: number;
    paradigmDiscoveryHours: number;
    dataModSpeedupPct: number;
    projectedAnnualSavingsUsd: number;
    humanCapacityMultiplier: string;
  };
  nodes: GcpArchitectureNode[];
  finops: {
    items: FinOpsLineItem[];
    totalMonthlyGcpUsd: number;
    legacyMonthlyBaselineUsd: number;
    netMonthlySavingsUsd: number;
  };
  riskControls: string[];
  interviewTalkingPoints: string[];
  artifacts: GeneratedArtifact[];
}

export interface ScenarioPreset {
  id: ScenarioId;
  badge: string;
  title: string;
  publicCaseStudyRef: string;
  problemStatement: string;
  gcpHighlight: string;
  defaultInput: BlueprintInput;
}

export interface InterviewFlashcard {
  id: string;
  category: "Google Cloud Data" | "Vertex AI & Gemini" | "66degrees & Paradigm°" | "Architecture Tradeoffs";
  question: string;
  interviewerIntent: string;
  sharpAnswer: string;
  codeOrCommandSnippet: string;
}
