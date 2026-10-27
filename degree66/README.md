# 66degrees Interview Workbench (`degree66`)

Interactive Google Cloud architecture simulator and interview preparation workbench tailored for **66degrees** (Google Cloud Diamond Partner & 4x Partner of the Year).

## What It Demonstrates

1. **Paradigm° Blueprint Simulator:** Interactive configurator modeled on 66degrees' three proprietary platform pillars:
   - **Paradigm° Data:** BigQuery Enterprise, BigLake, Cloud Datastream CDC, Pub/Sub + Apache Beam on Dataflow, Cloud Composer 3, and Dataplex governance.
   - **Paradigm°OS:** Vertex AI Gemini 2.5 Pro/Flash, BigQuery Vector Search (`text-embedding-005`), Customer Engagement Suite (Dialogflow CX + Agent Assist), and Eventarc + Cloud Run remediation agents.
   - **Paradigm° Legacy:** Mainframe COBOL/DB2, Oracle Exadata, and on-prem SQL Server migration patterns with FinOps run-rate sizing.
2. **Live "Human in the Lead" Governance Gate:** Adjust the confidence threshold slider (70%–98%) and watch real-world enterprise events (Gordon Food Service 450,000-item catalog enrichment, data quality alert diffs, HIPAA biomedical cohorts, hospitality IRROPS, and utility call QA) route between autonomous execution and human review.
3. **Production GCP Code Generator:** Dynamically emits copy-ready and downloadable:
   - `01_paradigm_data_bigquery.sql` (Partitioned/clustered BigQuery DDL, Vertex AI remote models, IVF vector index, and governance routing view)
   - `02_gcp_foundation_main.tf` (Terraform HCL for least-privilege service accounts, BigQuery datasets, and Cloud Run v2 internal ingress)
   - `03_paradigm_os_vertex_agent.py` (Python Vertex AI structured JSON schema + deterministic Human-in-the-Lead gate)
   - `04_agentic_lab_runbook.md` (Executive brief structured around 66degrees' Agentic Labs methodology)
4. **Interview Q&A Battle Cards & 66degrees Cheat Sheet:** Deep technical answers on BigQuery vs. Vertex AI Vector Search, VPC Service Controls + CMEK + Cloud DLP for HIPAA/PCI, Dataflow vs. Dataproc vs. dbt, FinOps triage, and Google Cloud Next '26 insights from CEO Ben Kessler and GFS CIO Brendan Bonthuis.

## Run Locally

```bash
cd degree66
npm install
npm test
npm run dev
```

Vite serves the workbench at `http://127.0.0.1:5186`. `npm run build` typechecks and writes `dist/`.
