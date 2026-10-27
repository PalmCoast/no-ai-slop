import type { BlueprintInput, BlueprintOutput, FinOpsLineItem, GcpArchitectureNode, GeneratedArtifact, InterviewFlashcard, ScenarioPreset, ScenarioId } from "./types.ts";

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: "gfs-catalog",
    badge: "Supply Chain · 450k SKUs",
    title: "Gordon Food Service — GenAI Vendor Item & Catalog Enrichment",
    publicCaseStudyRef: "66degrees Public Case Study & Google Cloud Next '26 (Ben Kessler + CIO Brendan Bonthuis)",
    problemStatement:
      "450,000+ foodservice items arrive from vendors with inconsistent specs, missing allergens, and English-only copy. Manual merchandising delays eCommerce onboarding and breaks catalog standards.",
    gcpHighlight:
      "BigQuery remote models (`ML.GENERATE_TEXT`) + Vertex AI Gemini 2.5 Pro structured outputs + Dataplex quality rules + human-in-the-lead approval queue on Cloud Run.",
    defaultInput: {
      scenarioId: "gfs-catalog",
      clientName: "Gordon Food Service (Simulated)",
      legacySource: "oracle-edw",
      ingestionPattern: "pubsub-dataflow",
      compliance: "standard-iam",
      agentPattern: "vertex-rag-grounding",
      dailyEventsMillions: 12,
      catalogOrRecordCount: 450000,
      humanInTheLoopThreshold: 0.88,
    },
  },
  {
    id: "gfs-dq-alerts",
    badge: "Managed Services · 24/7 SRE",
    title: "Enterprise Data Quality Alert & Pipeline Remediation Agent",
    publicCaseStudyRef: "66degrees Managed Services Data Quality Alert Automation Case Study",
    problemStatement:
      "On-call engineers manually compare Snapshot, Data Lake Views_Current, and Enterprise Data Warehouse (EDW) tables during pipeline drift incidents, calculating timestamp skews by hand before pausing downstream jobs.",
    gcpHighlight:
      "Cloud Monitoring + Eventarc trigger -> Cloud Run remediation agent -> BigQuery `INFORMATION_SCHEMA` drift diff -> Cloud Composer DAG pause + automated incident digest.",
    defaultInput: {
      scenarioId: "gfs-dq-alerts",
      clientName: "North American Food Distributor",
      legacySource: "oracle-edw",
      ingestionPattern: "cdc-datastream",
      compliance: "standard-iam",
      agentPattern: "eventarc-remediation",
      dailyEventsMillions: 45,
      catalogOrRecordCount: 1200000,
      humanInTheLoopThreshold: 0.92,
    },
  },
  {
    id: "biomed-migration",
    badge: "Healthcare · HIPAA + VPC-SC",
    title: "Biomedical Research Estate — Zero-Exfiltration GCP Migration",
    publicCaseStudyRef: "66degrees Complex Biomedical Data Client Migration Case Study",
    problemStatement:
      "Legacy on-prem SQL Server and file shares hold PHI/genomic clinical records. Researchers cannot run multimodal cohort queries without violating HIPAA boundary controls or waiting 18 hours for batch extracts.",
    gcpHighlight:
      "VPC Service Controls perimeter + CMEK via Cloud KMS + Sensitive Data Protection (Cloud DLP) de-identification in Dataflow -> BigQuery Lakehouse + Vertex AI Search on FHIR/clinical docs.",
    defaultInput: {
      scenarioId: "biomed-migration",
      clientName: "Biomedical Research Institute",
      legacySource: "sqlserver-onprem",
      ingestionPattern: "cdc-datastream",
      compliance: "hipaa-cmek-vpcsc",
      agentPattern: "vertex-rag-grounding",
      dailyEventsMillions: 18,
      catalogOrRecordCount: 850000,
      humanInTheLoopThreshold: 0.95,
    },
  },
  {
    id: "hospitality-ces",
    badge: "Travel & Hospitality · 50-70% Automation",
    title: "Omnichannel Guest Services — Customer Engagement Suite",
    publicCaseStudyRef: "66degrees Travel & Hospitality Leader (50–70% touchpoints automated)",
    problemStatement:
      "High call-center volume for reservation changes, loyalty tier disputes, and property disruption rebooking. Legacy IVR traps guests in menus and gives live agents zero context on guest lifetime value.",
    gcpHighlight:
      "Google Cloud Customer Engagement Suite (Dialogflow CX + Vertex AI Agent Assist) grounded in BigQuery real-time guest profile views + Cloud Spanner reservation state.",
    defaultInput: {
      scenarioId: "hospitality-ces",
      clientName: "Global Hospitality Group",
      legacySource: "snowflake-multi",
      ingestionPattern: "pubsub-dataflow",
      compliance: "pci-dlp-tokenized",
      agentPattern: "dialogflow-cx-ces",
      dailyEventsMillions: 65,
      catalogOrRecordCount: 2400000,
      humanInTheLoopThreshold: 0.85,
    },
  },
  {
    id: "utility-qa",
    badge: "Energy & Utilities · 90% QA Lift",
    title: "Regulated Utility — Contact Center Call Evaluation & Outage Triage",
    publicCaseStudyRef: "66degrees Energy & Utilities Leader (90% improvement in call evaluation quality)",
    problemStatement:
      "Supervisors manually audit less than 2% of customer outage and billing calls. Regulatory compliance misses go undetected for weeks, and mainframe CIS billing codes are opaque to new reps.",
    gcpHighlight:
      "Cloud Speech-to-Text V2 (Chirp) + Vertex AI Gemini 2.5 Flash batch rubric evaluator + Paradigm° Legacy COBOL copybook parser into BigQuery.",
    defaultInput: {
      scenarioId: "utility-qa",
      clientName: "Midwest Regulated Energy Utility",
      legacySource: "mainframe-cobol",
      ingestionPattern: "storage-batch",
      compliance: "pci-dlp-tokenized",
      agentPattern: "multi-agent-langgraph",
      dailyEventsMillions: 25,
      catalogOrRecordCount: 600000,
      humanInTheLoopThreshold: 0.9,
    },
  },
];

export function getPreset(id: ScenarioId): ScenarioPreset {
  const found = SCENARIO_PRESETS.find((p) => p.id === id);
  if (!found) {
    throw new Error(`Unknown scenario id: ${id}`);
  }
  return found;
}

export function generateBlueprint(raw: BlueprintInput): BlueprintOutput {
  const eventsM = Math.max(1, Math.min(500, Math.round(raw.dailyEventsMillions)));
  const records = Math.max(1000, Math.min(50000000, Math.round(raw.catalogOrRecordCount)));
  const threshold = Math.max(0.5, Math.min(0.99, Number(raw.humanInTheLoopThreshold.toFixed(2))));

  const input: BlueprintInput = {
    ...raw,
    clientName: raw.clientName.trim() || "Enterprise Client",
    dailyEventsMillions: eventsM,
    catalogOrRecordCount: records,
    humanInTheLoopThreshold: threshold,
  };

  const nodes = buildArchitectureNodes(input);
  const finops = computeFinOps(input);
  const riskControls = buildRiskControls(input);
  const interviewTalkingPoints = buildTalkingPoints(input);
  const artifacts = buildArtifacts(input, finops.totalMonthlyGcpUsd);

  const legacyDiscoveryWeeks = input.legacySource === "mainframe-cobol" ? 14 : 8;
  const paradigmDiscoveryHours = input.legacySource === "mainframe-cobol" ? 18 : 8;
  const dataModSpeedupPct = input.legacySource === "mainframe-cobol" ? 75 : 65;

  return {
    input,
    headline: `${input.clientName}: Paradigm° Data + Paradigm°OS Production Blueprint`,
    summary: `Ingests ${eventsM}M daily events from ${formatLegacySource(input.legacySource)} via ${formatIngestion(input.ingestionPattern)} into a partitioned BigQuery lakehouse under ${formatCompliance(input.compliance)}, powering a ${formatAgentPattern(input.agentPattern)} with human-in-the-lead escalation below ${(threshold * 100).toFixed(0)}% confidence.`,
    paradigmAcceleration: {
      legacyDiscoveryWeeks,
      paradigmDiscoveryHours,
      dataModSpeedupPct,
      projectedAnnualSavingsUsd: Math.max(120000, finops.netMonthlySavingsUsd * 12),
      humanCapacityMultiplier: "10x operator review throughput (Human in the Lead)",
    },
    nodes,
    finops,
    riskControls,
    interviewTalkingPoints,
    artifacts,
  };
}

function formatLegacySource(src: BlueprintInput["legacySource"]): string {
  switch (src) {
    case "oracle-edw":
      return "Oracle Exadata / Legacy EDW";
    case "sqlserver-onprem":
      return "On-Prem SQL Server & SMB File Estate";
    case "mainframe-cobol":
      return "IBM z/OS Mainframe (COBOL / DB2 / VSAM)";
    case "snowflake-multi":
      return "Siloed Multi-Cloud Snowflake & CRM Extracts";
    case "hadoop-hdfs":
      return "Legacy On-Prem Cloudera Hadoop / HDFS";
  }
}

function formatIngestion(ing: BlueprintInput["ingestionPattern"]): string {
  switch (ing) {
    case "cdc-datastream":
      return "Cloud Datastream Serverless CDC + Dataflow";
    case "pubsub-dataflow":
      return "Cloud Pub/Sub + Apache Beam on Dataflow Streaming";
    case "storage-batch":
      return "Cloud Storage Landing Zone + Cloud Composer 3 + BigQuery Load";
  }
}

function formatCompliance(comp: BlueprintInput["compliance"]): string {
  switch (comp) {
    case "standard-iam":
      return "Dataplex Governance + BigQuery Policy Tags + IAM Least Privilege";
    case "hipaa-cmek-vpcsc":
      return "HIPAA Boundary: VPC Service Controls + Cloud KMS CMEK + Cloud DLP";
    case "pci-dlp-tokenized":
      return "PCI-DSS Scope Reduction: Cloud DLP Format-Preserving Encryption + Row-Level Security";
  }
}

function formatAgentPattern(agent: BlueprintInput["agentPattern"]): string {
  switch (agent) {
    case "vertex-rag-grounding":
      return "Vertex AI Gemini 2.5 Pro with BigQuery Vector Search & Grounding";
    case "multi-agent-langgraph":
      return "Vertex AI Reasoning Engine Multi-Agent Supervisor (Gemini 2.5 Flash + Pro)";
    case "dialogflow-cx-ces":
      return "Google Cloud Customer Engagement Suite (Dialogflow CX + Agent Assist)";
    case "eventarc-remediation":
      return "Autonomous Eventarc + Cloud Run Data SRE Remediation Agent";
  }
}

function buildArchitectureNodes(input: BlueprintInput): GcpArchitectureNode[] {
  const ingestService =
    input.ingestionPattern === "cdc-datastream"
      ? {
          service: "Change Data Capture",
          gcpProduct: "Cloud Datastream + Dataflow",
          role: `Low-latency log-based CDC from ${formatLegacySource(input.legacySource)} into BigQuery staging with dead-letter routing.`,
          slaOrSpec: `< 60s replication lag · ${input.dailyEventsMillions}M events/day`,
        }
      : input.ingestionPattern === "pubsub-dataflow"
        ? {
            service: "Streaming Event Bus",
            gcpProduct: "Cloud Pub/Sub + Dataflow (Beam)",
            role: `Ingests real-time events from ${formatLegacySource(input.legacySource)} with exactly-once windowing and schema validation.`,
            slaOrSpec: `99.95% SLA · ${input.dailyEventsMillions}M events/day`,
          }
        : {
            service: "Orchestrated Lakehouse Landing",
            gcpProduct: "Cloud Storage + Cloud Composer 3",
            role: `Lands micro-batch Parquet/Avro extracts from ${formatLegacySource(input.legacySource)} with SLA sensors.`,
            slaOrSpec: `15-min micro-batch · ${input.dailyEventsMillions}M rows/day`,
          };

  const governanceSpec =
    input.compliance === "hipaa-cmek-vpcsc"
      ? {
          gcpProduct: "VPC Service Controls + Cloud DLP + KMS CMEK",
          role: "Enforces zero data exfiltration perimeter, customer-managed encryption keys, and automatic PHI de-identification before LLM context injection.",
          slaOrSpec: "HIPAA BAA · Zero-egress perimeter",
        }
      : input.compliance === "pci-dlp-tokenized"
        ? {
            gcpProduct: "Sensitive Data Protection (DLP) + Dataplex",
            role: "Redacts PAN/PII in flight using surrogate tokens and enforces BigQuery column-level policy tags.",
            slaOrSpec: "PCI-DSS 4.0 · Column & Row ACLs",
          }
        : {
            gcpProduct: "Cloud Dataplex + Data Catalog Policy Tags",
            role: "Automated data quality assertions, lineage tracking from source to Vertex AI prompt, and IAM principal masking.",
            slaOrSpec: "Automated DQ SLA · Lineage graph",
          };

  const agentSpec =
    input.agentPattern === "vertex-rag-grounding"
      ? {
          gcpProduct: "Vertex AI Gemini 2.5 Pro + BigQuery Vector Search",
          role: `Executes grounded generation over ${input.catalogOrRecordCount.toLocaleString()} enterprise records using cosine similarity + strict JSON schema output.`,
          slaOrSpec: `Confidence gate >= ${(input.humanInTheLoopThreshold * 100).toFixed(0)}%`,
        }
      : input.agentPattern === "multi-agent-langgraph"
        ? {
            gcpProduct: "Vertex AI Agent Builder / Reasoning Engine",
            role: "Supervisor agent routes tasks across specialized Retriever, Policy Validator, and Action Executor sub-agents.",
            slaOrSpec: `Deterministic tool schema · Gate ${(input.humanInTheLoopThreshold * 100).toFixed(0)}%`,
          }
        : input.agentPattern === "dialogflow-cx-ces"
          ? {
              gcpProduct: "Customer Engagement Suite + Dialogflow CX",
              role: "Handles voice/chat turns with live Agent Assist whisper coaching and deterministic tool calls to core booking APIs.",
              slaOrSpec: "< 600ms voice turn latency · 50-70% containment",
            }
          : {
              gcpProduct: "Eventarc + Cloud Run + Gemini 2.5 Flash",
              role: "Listens to BigQuery/Monitoring anomaly alerts, runs root-cause SQL diffs across Snapshot and EDW, and pauses downstream DAGs.",
              slaOrSpec: "< 15s incident triage · Auto-pause DAG",
            };

  return [
    {
      id: "node-ingest",
      layer: "Ingest",
      ...ingestService,
    },
    {
      id: "node-data",
      layer: "Paradigm° Data",
      service: "AI-Ready Unified Lakehouse",
      gcpProduct: "BigQuery Enterprise + BigLake + dbt",
      role: `Partitioned, clustered canonical domain tables (${input.catalogOrRecordCount.toLocaleString()} core entities) plus text-embedding-005 vector index.`,
      slaOrSpec: "Partitioned by ingestion_date · Clustered by entity_id",
    },
    {
      id: "node-gov",
      layer: "Governance",
      service: "Security, Privacy & Lineage",
      ...governanceSpec,
    },
    {
      id: "node-agent",
      layer: "Paradigm°OS Agent",
      service: "Agentic Workflow Runtime",
      ...agentSpec,
    },
    {
      id: "node-ops",
      layer: "Operations",
      service: "Human-in-the-Lead & Managed Agentic SRE",
      gcpProduct: "Cloud Run + Cloud Trace + Model Armor",
      role: `Routes outputs below ${(input.humanInTheLoopThreshold * 100).toFixed(0)}% confidence to human reviewers and logs every prompt, tool call, and approval into an immutable BigQuery audit table.`,
      slaOrSpec: "100% audit trail · Drift & hallucination evals",
    },
  ];
}

function computeFinOps(input: BlueprintInput): BlueprintOutput["finops"] {
  const bqComputeUsd = Math.round(1100 + input.dailyEventsMillions * 42);
  const ingestionUsd =
    input.ingestionPattern === "pubsub-dataflow"
      ? Math.round(750 + input.dailyEventsMillions * 28)
      : input.ingestionPattern === "cdc-datastream"
        ? Math.round(620 + input.dailyEventsMillions * 22)
        : Math.round(450 + input.dailyEventsMillions * 12);

  const vertexUsd =
    input.agentPattern === "dialogflow-cx-ces"
      ? Math.round(1800 + (input.catalogOrRecordCount / 100000) * 190)
      : Math.round(950 + (input.catalogOrRecordCount / 100000) * 145);

  const securityUsd =
    input.compliance === "hipaa-cmek-vpcsc"
      ? Math.round(680 + input.dailyEventsMillions * 9)
      : input.compliance === "pci-dlp-tokenized"
        ? Math.round(790 + input.dailyEventsMillions * 11)
        : 320;

  const cloudRunOpsUsd = 290;

  const items: FinOpsLineItem[] = [
    {
      service: "BigQuery Enterprise (Storage + Slot Autoscaling)",
      sizingBasis: `${input.dailyEventsMillions}M events/day · ${input.catalogOrRecordCount.toLocaleString()} entities`,
      monthlyUsd: bqComputeUsd,
      notes: "Includes BI Engine caching, vector index storage, and partition expiration policies.",
    },
    {
      service: formatIngestion(input.ingestionPattern),
      sizingBasis: `${input.dailyEventsMillions}M daily records ingested`,
      monthlyUsd: ingestionUsd,
      notes: "Right-sized with Dataflow Prime / FlexRS where latency SLAs permit.",
    },
    {
      service: "Vertex AI (Gemini 2.5 + text-embedding-005)",
      sizingBasis: "Context caching enabled + Flash routing for classification",
      monthlyUsd: vertexUsd,
      notes: "Uses Gemini 2.5 Flash for high-volume triage and Gemini 2.5 Pro only on complex reasoning.",
    },
    {
      service: "Dataplex, Sensitive Data Protection & KMS",
      sizingBasis: formatCompliance(input.compliance),
      monthlyUsd: securityUsd,
      notes: "Sampling-based DLP inspection + automated Dataplex DQ scans.",
    },
    {
      service: "Cloud Run, Eventarc & Cloud Monitoring",
      sizingBasis: "Scale-to-zero agent gateways + OpenTelemetry trace export",
      monthlyUsd: cloudRunOpsUsd,
      notes: "Min instances = 1 on production webhook gateway to eliminate cold-start tail latency.",
    },
  ];

  const totalMonthlyGcpUsd = items.reduce((sum, item) => sum + item.monthlyUsd, 0);
  const legacyMultiplier = input.legacySource === "mainframe-cobol" ? 3.4 : input.legacySource === "oracle-edw" ? 2.8 : 2.3;
  const legacyMonthlyBaselineUsd = Math.round(totalMonthlyGcpUsd * legacyMultiplier);
  const netMonthlySavingsUsd = Math.max(0, legacyMonthlyBaselineUsd - totalMonthlyGcpUsd);

  return {
    items,
    totalMonthlyGcpUsd,
    legacyMonthlyBaselineUsd,
    netMonthlySavingsUsd,
  };
}

function buildRiskControls(input: BlueprintInput): string[] {
  const controls: string[] = [
    `Human-in-the-Lead Gate: Any Gemini generation or tool call with self-consistency / grounding score < ${(input.humanInTheLoopThreshold * 100).toFixed(0)}% is held in Cloud Run review queue rather than written to production.`,
    "Model Armor & Structured Outputs: Vertex AI calls enforce strict `response_schema` JSON contracts and prompt-injection filtering before invoking downstream APIs.",
    "FinOps Slot & Token Guardrails: BigQuery editions autoscaling capped with per-project `maximum_bytes_billed` and Vertex AI context caching to cut repeated system-prompt token spend by up to 75%.",
    "Immutable Audit Ledger: Every agent turn writes `trace_id`, `model_version`, `grounding_citations`, `latency_ms`, and `reviewer_id` to an append-only BigQuery table.",
  ];

  if (input.compliance === "hipaa-cmek-vpcsc") {
    controls.unshift(
      "Zero-Exfiltration HIPAA Perimeter: VPC Service Controls bind BigQuery, Cloud Storage, and Vertex AI inside a single security perimeter with Cloud KMS Customer-Managed Encryption Keys (CMEK).",
    );
  } else if (input.compliance === "pci-dlp-tokenized") {
    controls.unshift(
      "PCI Scope Isolation: Sensitive Data Protection (Cloud DLP) tokenizes cardholder & account numbers in Dataflow before landing in BigQuery or entering Gemini context windows.",
    );
  }

  return controls;
}

function buildTalkingPoints(input: BlueprintInput): string[] {
  return [
    `"At Google Cloud Next '26, Ben Kessler and GFS CIO Brendan Bonthuis emphasized that 'the stuff that used to be true is still true' — agents only reach as far as the data foundation allows. That is why this blueprint pairs Paradigm° Data (BigQuery + Dataplex) directly with Paradigm°OS."`,
    `"Rather than treating AI as a chatbot bolted onto ${formatLegacySource(input.legacySource)}, we redesign the workflow around a ${formatAgentPattern(input.agentPattern)} with an explicit ${(input.humanInTheLoopThreshold * 100).toFixed(0)}% Human-in-the-Lead threshold."`,
    `"To keep long-term Google Cloud spend predictable, we route high-volume classification and schema extraction to Gemini 2.5 Flash via BigQuery ML.GENERATE_TEXT, reserving Gemini 2.5 Pro for multi-step exception resolution."`,
    `"In Managed Services (Day-2 LLMOps), we monitor both data drift in BigQuery INFORMATION_SCHEMA and grounding score decay in Vertex AI, automatically pausing downstream Composer DAGs if source tables skew."`,
  ];
}

function buildArtifacts(input: BlueprintInput, monthlyGcpUsd: number): GeneratedArtifact[] {
  const dataset = `${input.scenarioId.replace(/-/g, "_")}_paradigm_data`;
  const threshold = input.humanInTheLoopThreshold;

  const sqlArtifact: GeneratedArtifact = {
    filename: "01_paradigm_data_bigquery.sql",
    title: "BigQuery AI-Ready Lakehouse + Vertex AI Remote Model SQL",
    language: "sql",
    pillar: "Paradigm° Data",
    description:
      "Creates the partitioned BigQuery table, registers Vertex AI text-embedding-005 and Gemini 2.5 remote models, builds a vector index, and runs grounded enrichment with a confidence gate.",
    contents: `-- Paradigm° Data Foundation: ${input.clientName}
-- Source Estate: ${formatLegacySource(input.legacySource)}
-- Governance Posture: ${formatCompliance(input.compliance)}

CREATE SCHEMA IF NOT EXISTS \`${dataset}\`
OPTIONS(
  location = 'us-central1',
  description = '66degrees Paradigm Data governed lakehouse dataset'
);

-- 1. Canonical Partitioned & Clustered Operational Table
CREATE TABLE IF NOT EXISTS \`${dataset}.enterprise_records\`
(
  entity_id STRING NOT NULL,
  ingestion_ts TIMESTAMP NOT NULL,
  source_system STRING NOT NULL,
  raw_payload JSON,
  normalized_spec STRING,
  quality_score FLOAT64,
  policy_classification STRING OPTIONS(description = 'Governed by Dataplex policy tag'),
  embedding ARRAY<FLOAT64>
)
PARTITION BY DATE(ingestion_ts)
CLUSTER BY source_system, entity_id
OPTIONS(
  require_partition_filter = TRUE,
  partition_expiration_days = 1095
);

-- 2. Register Vertex AI Embedding & Gemini 2.5 Models via Cloud Resource Connection
CREATE OR REPLACE MODEL \`${dataset}.embedding_model\`
REMOTE WITH CONNECTION \`us-central1.vertex_ai_conn\`
OPTIONS (endpoint = 'text-embedding-005');

CREATE OR REPLACE MODEL \`${dataset}.gemini_agent_model\`
REMOTE WITH CONNECTION \`us-central1.vertex_ai_conn\`
OPTIONS (endpoint = 'gemini-2.5-flash');

-- 3. Vector Index for Sub-50ms Semantic Grounding in BigQuery
CREATE VECTOR INDEX IF NOT EXISTS \`enterprise_records_vec_idx\`
ON \`${dataset}.enterprise_records\`(embedding)
OPTIONS(
  index_type = 'IVF',
  distance_type = 'COSINE',
  ivf_options = '{"num_lists": 500}'
);

-- 4. Paradigm°OS Batch Enrichment + Human-in-the-Lead Routing View
CREATE OR REPLACE VIEW \`${dataset}.v_agent_enrichment_queue\` AS
SELECT
  entity_id,
  ingestion_ts,
  quality_score,
  CASE
    WHEN quality_score >= ${threshold} THEN 'AUTO_COMMIT_PRODUCTION'
    ELSE 'ROUTE_HUMAN_IN_THE_LEAD'
  END AS governance_action
FROM \`${dataset}.enterprise_records\`
WHERE DATE(ingestion_ts) = CURRENT_DATE();
`,
  };

  const terraformArtifact: GeneratedArtifact = {
    filename: "02_gcp_foundation_main.tf",
    title: "Terraform Google Cloud Foundation & Security Perimeter",
    language: "hcl",
    pillar: "FinOps & Governance",
    description:
      "Provisions the Google Cloud service accounts, BigQuery dataset with CMEK/IAM bindings, Eventarc trigger, and Cloud Run agent gateway.",
    contents: `# 66degrees Paradigm° Infrastructure-as-Code
# Scenario: ${input.clientName} (${input.scenarioId})
# Estimated Monthly GCP Run-Rate: $${monthlyGcpUsd.toLocaleString()}/mo

terraform {
  required_version = ">= 1.7.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

variable "project_id" {
  type        = string
  default     = "deg66-${input.scenarioId}-prod"
}

variable "region" {
  type        = string
  default     = "us-central1"
}

resource "google_service_account" "paradigm_agent_sa" {
  project      = var.project_id
  account_id   = "paradigm-os-agent"
  display_name = "Paradigm OS Runtime Service Account (Least Privilege)"
}

resource "google_project_iam_member" "agent_vertex_user" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = "serviceAccount:\${google_service_account.paradigm_agent_sa.email}"
}

resource "google_project_iam_member" "agent_bq_job_user" {
  project = var.project_id
  role    = "roles/bigquery.jobUser"
  member  = "serviceAccount:\${google_service_account.paradigm_agent_sa.email}"
}

resource "google_bigquery_dataset" "paradigm_data" {
  dataset_id                 = "${dataset}"
  project                    = var.project_id
  location                   = var.region
  delete_contents_on_destroy = false

  labels = {
    managed_by = "66degrees-paradigm"
    compliance = "${input.compliance}"
  }
}

resource "google_cloud_run_v2_service" "paradigm_agent_gateway" {
  name     = "paradigm-os-gateway"
  location = var.region
  project  = var.project_id
  ingress  = "${input.compliance === "hipaa-cmek-vpcsc" ? "INGRESS_TRAFFIC_INTERNAL_ONLY" : "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"}"

  template {
    service_account = google_service_account.paradigm_agent_sa.email
    scaling {
      min_instance_count = 1
      max_instance_count = 20
    }
    containers {
      image = "us-central1-docker.pkg.dev/\${var.project_id}/paradigm/agent-gateway:latest"
      env {
        name  = "HUMAN_IN_THE_LOOP_THRESHOLD"
        value = "${threshold}"
      }
      env {
        name  = "BQ_DATASET"
        value = google_bigquery_dataset.paradigm_data.dataset_id
      }
    }
  }
}
`,
  };

  const pythonAgentArtifact: GeneratedArtifact = {
    filename: "03_paradigm_os_vertex_agent.py",
    title: "Paradigm°OS Vertex AI Gemini 2.5 Agent with Governance Gate",
    language: "python",
    pillar: "Paradigm°OS",
    description:
      "Production Python implementation using Vertex AI SDK, structured JSON outputs, BigQuery grounding retrieval, and deterministic Human-in-the-Lead escalation.",
    contents: `"""
Paradigm°OS Agent Runtime — ${input.clientName}
Pattern: ${formatAgentPattern(input.agentPattern)}
Human-in-the-Lead Confidence Gate: ${(threshold * 100).toFixed(0)}%
"""

from dataclasses import dataclass
from typing import Any, Dict, List
import json
import time

HUMAN_GATE_THRESHOLD: float = ${threshold}

RESPONSE_SCHEMA: Dict[str, Any] = {
    "type": "OBJECT",
    "properties": {
        "entity_id": {"type": "STRING"},
        "recommended_action": {"type": "STRING"},
        "grounded_summary": {"type": "STRING"},
        "citations": {"type": "ARRAY", "items": {"type": "STRING"}},
        "confidence_score": {"type": "NUMBER"},
        "policy_violations": {"type": "ARRAY", "items": {"type": "STRING"}},
    },
    "required": [
        "entity_id",
        "recommended_action",
        "grounded_summary",
        "citations",
        "confidence_score",
        "policy_violations",
    ],
}


@dataclass
class AgentDecision:
    entity_id: str
    status: str  # "AUTO_APPROVED" | "ESCALATED_TO_HUMAN"
    confidence_score: float
    recommended_action: str
    citations: List[str]
    audit_trace_id: str


def evaluate_governance_gate(payload: Dict[str, Any]) -> AgentDecision:
    """Enforces 66degrees Human-in-the-Lead operating policy before any state mutation."""
    confidence = float(payload.get("confidence_score", 0.0))
    violations = payload.get("policy_violations", [])
    trace_id = f"trace-{int(time.time() * 1000)}"

    if confidence >= HUMAN_GATE_THRESHOLD and len(violations) == 0:
        status = "AUTO_APPROVED"
    else:
        status = "ESCALATED_TO_HUMAN"

    return AgentDecision(
        entity_id=str(payload["entity_id"]),
        status=status,
        confidence_score=confidence,
        recommended_action=str(payload["recommended_action"]),
        citations=list(payload.get("citations", [])),
        audit_trace_id=trace_id,
    )
`,
  };

  const runbookArtifact: GeneratedArtifact = {
    filename: "04_agentic_lab_runbook.md",
    title: "Agentic Labs Discovery-to-Production Executive Brief",
    language: "markdown",
    pillar: "Paradigm° Legacy",
    description:
      "Leave-behind brief structured around 66degrees' five capabilities: Agentic Labs, AI-Native Foundations, AI Workflow Transformation, AI Workplace Enablement, and Managed Agentic Services.",
    contents: `# 66degrees Agentic Labs Blueprint — ${input.clientName}

## 1. Executive Summary
${input.clientName} is modernizing from **${formatLegacySource(input.legacySource)}** to a governed Google Cloud AI-Native operating system. Rather than deploying disconnected chatbots, this blueprint connects **Paradigm° Data** (BigQuery + Dataplex) with **Paradigm°OS** (${formatAgentPattern(input.agentPattern)}).

## 2. Architecture & Governance Targets
- **Daily Event Volume:** ${input.dailyEventsMillions}M events/day via ${formatIngestion(input.ingestionPattern)}
- **Core Catalog / Domain Entities:** ${input.catalogOrRecordCount.toLocaleString()} records
- **Security & Compliance:** ${formatCompliance(input.compliance)}
- **Human-in-the-Lead Confidence Gate:** ${(threshold * 100).toFixed(0)}% minimum confidence for autonomous execution

## 3. FinOps & Value Realization
- **Legacy Baseline Estimate:** $${Math.round(monthlyGcpUsd * 2.6).toLocaleString()}/month
- **Projected Google Cloud Run-Rate:** $${monthlyGcpUsd.toLocaleString()}/month
- **Paradigm° Delivery Acceleration:** Compresses workflow discovery from weeks to hours and accelerates data modernization by 50–80%.
`,
  };

  return [sqlArtifact, terraformArtifact, pythonAgentArtifact, runbookArtifact];
}

export const INTERVIEW_FLASHCARDS: InterviewFlashcard[] = [
  {
    id: "fc-paradigm",
    category: "66degrees & Paradigm°",
    question: "How does 66degrees position its delivery model differently from traditional cloud consultancies?",
    interviewerIntent: "Tests whether you researched 66degrees beyond generic 'they do GCP' and understand their Paradigm° platform + Forward-Deployed Engineer model.",
    sharpAnswer:
      "66degrees pairs Forward-Deployed Engineers with Paradigm°, its AI-native delivery platform split into three pillars: Paradigm° Data (accelerating governed BigQuery/Dataplex foundations by 50–80%), Paradigm°OS (decomposing legacy workflows into build-ready agentic blueprints in hours rather than months), and Paradigm° Legacy (automated mainframe/COBOL and legacy database exits to Google Cloud). Their philosophy from Google Cloud Next '26 with Gordon Food Service is 'Human in the Lead': redesigning workflows around governed data rather than counting how many isolated agents you deploy.",
    codeOrCommandSnippet:
      "Paradigm° Data (BigQuery + Dataplex) -> Paradigm°OS (Vertex AI Agent Builder + Gemini 2.5) -> Managed Agentic Services (24/7 SRE & Drift Governance)",
  },
  {
    id: "fc-bq-vector",
    category: "Google Cloud Data",
    question: "When should you keep RAG & embeddings inside BigQuery versus standing up Vertex AI Vector Search?",
    interviewerIntent: "Evaluates practical Google Cloud data architecture and FinOps judgment.",
    sharpAnswer:
      "Use BigQuery Vector Search (`VECTOR_SEARCH` with IVF or TreeAH indexes + `ML.GENERATE_EMBEDDING`) when your grounding data lives alongside transactional/analytical tables, needs SQL pre-filtering (e.g., vendor_id, region, policy tags), or runs in batch/intraday enrichment like Gordon Food Service's 450k-item catalog. Step up to dedicated Vertex AI Vector Search (Matching Engine) when you need sub-15ms p99 online serving at thousands of QPS for customer-facing voice or chat.",
    codeOrCommandSnippet:
      "SELECT base.entity_id, distance FROM VECTOR_SEARCH(TABLE dataset.enterprise_records, 'embedding', (SELECT ml_generate_embedding_result FROM ML.GENERATE_EMBEDDING(...)), top_k => 5, options => '{\"fraction_lists_to_search\": 0.05}')",
  },
  {
    id: "fc-vpcsc-hipaa",
    category: "Architecture Tradeoffs",
    question: "A healthcare or financial client is worried Gemini will leak PHI/PII or train on their prompts. How do you architect the boundary on GCP?",
    interviewerIntent: "Tests enterprise security, compliance, and Vertex AI zero-data-retention fluency.",
    sharpAnswer:
      "First, Vertex AI enterprise terms guarantee customer prompts and grounding data are never used to train Google foundation models, and zero-data-retention can be enforced for Gemini endpoints. Architecturally, we wrap BigQuery, Cloud Storage, and Vertex AI inside a VPC Service Controls (VPC-SC) perimeter with Private Google Access, encrypt data and model artifacts with Cloud KMS Customer-Managed Encryption Keys (CMEK), and run Sensitive Data Protection (Cloud DLP) in Dataflow to de-identify or tokenize PII before it ever enters a prompt.",
    codeOrCommandSnippet:
      "gcloud access-context-manager perimeters create biomed_perimeter --resources=projects/12345 --restricted-services=bigquery.googleapis.com,aiplatform.googleapis.com,storage.googleapis.com",
  },
  {
    id: "fc-dataflow-vs-dataproc",
    category: "Google Cloud Data",
    question: "How do you decide between Cloud Dataflow, Dataproc Serverless, and BigQuery ELT (dbt/Dataform) during a legacy migration?",
    interviewerIntent: "Core GCP Data Architect question from 66degrees job specs.",
    sharpAnswer:
      "Push SQL transformations down into BigQuery via dbt or Dataform first because slot autoscaling and storage separation make SQL ELT the lowest-ops path. Use Cloud Dataflow (Apache Beam) for unified streaming + batch pipelines—especially Pub/Sub or Datastream CDC ingestion with windowing, dead-letter queues, and inline Cloud DLP calls. Use Dataproc Serverless for Spark only when migrating existing PySpark/Scala workloads from on-prem Hadoop/Cloudera where rewriting into SQL or Beam would delay the exit.",
    codeOrCommandSnippet:
      "Datastream (CDC) -> Dataflow (Beam + DLP) -> BigQuery Staging -> dbt / Dataform (Medallion ELT) -> Dataplex DQ Assertions",
  },
  {
    id: "fc-agent-governance",
    category: "Vertex AI & Gemini",
    question: "Why do enterprise AI pilots plateau before production, and how do you keep agents reliable on Day 2?",
    interviewerIntent: "Directly echoes 66degrees' thought leadership ('Why Enterprise AI Plateaus, and What an AgenticOS Changes').",
    sharpAnswer:
      "Pilots plateau for three reasons: un-governed upstream data, brittle free-text LLM outputs, and no operational ownership after launch. In production on Google Cloud, we enforce: (1) strict JSON `response_schema` and Vertex AI Model Armor against prompt injection, (2) a quantitative confidence & grounding score gate that routes ambiguous cases to a human-in-the-lead queue, and (3) continuous evaluation jobs in Managed Services that test real production traces against golden datasets whenever data distributions or model versions shift.",
    codeOrCommandSnippet:
      "generation_config = GenerationConfig(temperature=0.1, response_mime_type='application/json', response_schema=RESPONSE_SCHEMA)",
  },
  {
    id: "fc-finops",
    category: "Architecture Tradeoffs",
    question: "A client's BigQuery and Vertex AI bill spiked 3x after launch. Walk through your first 48 hours of FinOps triage.",
    interviewerIntent: "Tests pragmatic Managed Services & FinOps instincts.",
    sharpAnswer:
      "Hour 1: Query `region-us.INFORMATION_SCHEMA.JOBS_BY_PROJECT` grouped by `user_email` and `query_info.query_hashes` to spot unpartitioned full-table scans. Enforce `require_partition_filter = TRUE` and cluster high-cardinality filter columns. Hour 4: Switch spiky ad-hoc workloads to BigQuery Enterprise Edition slot autoscaling with a hard max-slot cap. Hour 12: On Vertex AI, enable Gemini Context Caching for large system prompts/catalog schemas and route 80% of classification turns from Gemini 2.5 Pro to Gemini 2.5 Flash.",
    codeOrCommandSnippet:
      "SELECT user_email, SUM(total_bytes_billed)/POW(1024,4) AS tb_billed FROM `region-us`.INFORMATION_SCHEMA.JOBS_BY_PROJECT WHERE creation_time > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY) GROUP BY 1 ORDER BY 2 DESC;",
  },
];
