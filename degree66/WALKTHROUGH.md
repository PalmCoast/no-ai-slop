# 66degrees Interview Workbench — Plain-English Walkthrough for Daniel

This guide explains everything about the **66degrees Interview Workbench** (`degree66`) in plain English so you can share your screen tomorrow (Wednesday, October 28 at 10:00 AM ET) and explain every piece from start to finish with complete confidence.

---

## 1. What This App Is (and What to Be Honest About Up Front)

- **What it is:** A **100% offline, deterministic Google Cloud architecture simulator and blueprint generator** built specifically to prepare for your 66degrees conversation.
- **Zero live AI or backend calls:** Because your interview bans using live LLMs during the call, this app makes **zero API calls, zero network fetches, and zero live LLM requests**. Everything runs locally in your browser using deterministic rules and templates.
- **Be honest with the interviewers:** Tell them plainly:
  - *"This is a deterministic blueprint simulator I built to prepare for our conversation today—not a live production system."*
  - *"All of the 66degrees case study scenarios, leadership references, and Paradigm° concepts come from your public website and your Google Cloud Next '26 session with Gordon Food Service."*

---

## 2. The Four Tabs and What to Click

Across the top of the screen, you always have **5 Preset Cards** (based on real public 66degrees client stories) and **4 Navigation Tabs**:

### Top Preset Strip: The 5 Public 66degrees Scenarios

Clicking any of these five cards reloads the entire workbench with realistic defaults for that industry:

1. **Gordon Food Service — GenAI Vendor Item & Catalog Enrichment (`Supply Chain · 450k SKUs`):** Models enriching 450,000+ foodservice items into English, Spanish, and French while checking allergen rules and catalog standards.
2. **Enterprise Data Quality Alert & Pipeline Remediation Agent (`Managed Services · 24/7 SRE`):** Models 66degrees' Managed Services case study for Gordon Food Service—automatically comparing Snapshot, `Views_Current`, and Enterprise Data Warehouse (EDW) tables when a data alert fires, and pausing downstream jobs before bad data reaches business users.
3. **Biomedical Research Estate — Zero-Exfiltration GCP Migration (`Healthcare · HIPAA + VPC-SC`):** Models moving sensitive clinical/genomic data off on-prem SQL Server into a locked-down HIPAA boundary on Google Cloud.
4. **Omnichannel Guest Services — Customer Engagement Suite (`Travel & Hospitality · 50-70% Automation`):** Models automating 50–70% of hotel/travel guest rebooking calls and chats while giving live human agents real-time coaching on VIP guests.
5. **Regulated Utility — Contact Center Call Evaluation & Outage Triage (`Energy & Utilities · 90% QA Lift`):** Models transcribing and grading 100% of customer utility calls for regulatory compliance (up from a 2% manual sample) while pulling billing codes off an old COBOL mainframe.

---

### Tab 1: `1. Paradigm° Blueprint Simulator` (Main Screen)

This is where you spend the first 90 seconds of your demo. It has two columns:

- **Left Column — Engagement Parameters & Live Gate:**
  - **Dropdowns:** Let you change the **Legacy Source Estate** (e.g., Oracle, SQL Server, Mainframe COBOL), the **Google Cloud Ingestion Pipeline**, the **Security & Privacy Boundary** (Standard, HIPAA, or PCI-DSS), and the **Agent Architecture**.
  - **Sliders:**
    - **Daily Event Volume (`1M` to `200M` events/day):** Moving this slider immediately recalculates the monthly Google Cloud cost estimate on the right.
    - **Human-in-the-Lead Confidence Gate (`70%` to `98%`):** This is the centerpiece interaction. Dragging this slider changes the cutoff score required for an AI agent to act on its own.
  - **Live "Human in the Lead" Gate Simulation (bottom left):** Shows 2–3 realistic sample events for the selected scenario. Each event has a pre-scored confidence number (for example, `96%` vs. `81%`). As you drag the confidence slider left and right, watch the badges flip live between green **`AUTO_COMMIT`** (high confidence, no policy flags) and yellow **`HUMAN_IN_THE_LEAD`** (held for a human supervisor to approve).

- **Right Column — Generated Architecture, FinOps Cost Table, and Talking Points:**
  - **Active Case Study Banner:** Shows the client problem statement, a one-paragraph summary of the Google Cloud blueprint, and three green speedup metrics (Discovery time compressed from weeks to hours, 65–75% faster data modernization, and projected annual savings).
  - **End-to-End Google Cloud Architecture Topology:** Shows the 5-step pipeline from legacy data ingestion all the way to Day-2 operations:
    1. `Ingest`
    2. `Paradigm° Data` (Lakehouse)
    3. `Governance` (Security & Privacy)
    4. `Paradigm°OS Agent` (AI Runtime)
    5. `Operations` (Human-in-the-Lead & Audit)
  - **Google Cloud FinOps & Sizing Estimate:** A 5-row monthly cost table showing how much BigQuery, ingestion, Vertex AI, security, and Cloud Run cost per month compared to the legacy baseline.
  - **What to Say When Sharing This Screen:** Four word-for-word bullet points you can read or paraphrase during the call.

---

### Tab 2: `2. Generated GCP Code (4)`

Click this tab (or click the blue **"Inspect Generated SQL, Terraform & Python →"** button on Tab 1) to show that the simulator doesn't just draw boxes—it writes four concrete technical deliverables based on your current dropdowns and sliders:

1. **`01_paradigm_data_bigquery.sql`:** The SQL script that sets up the BigQuery data warehouse, links it to Google's Gemini and embedding models, builds a vector search index, and routes low-confidence rows to human review.
2. **`02_gcp_foundation_main.tf`:** The Terraform infrastructure file that creates locked-down service accounts, the BigQuery dataset, and the Cloud Run service (automatically switching to `INGRESS_TRAFFIC_INTERNAL_ONLY` when you pick the HIPAA preset).
3. **`03_paradigm_os_vertex_agent.py`:** The Python code showing the strict JSON format the AI must follow (`RESPONSE_SCHEMA`) and the exact `if/else` function (`evaluate_governance_gate`) that enforces the Human-in-the-Lead threshold.
4. **`04_agentic_lab_runbook.md`:** A clean executive summary brief formatted like a 66degrees Agentic Lab leave-behind document.

You can click **Copy Code** or **Download** on any of the four files.

---

### Tab 3: `3. Interview Q&A Drills (6)`

A study deck of 6 technical and strategic questions likely to come up in a 66degrees interview. You can filter by category (`66degrees & Paradigm°`, `Google Cloud Data`, `Vertex AI & Gemini`, `Architecture Tradeoffs`). Each card shows:

- The question
- **What the interviewer is testing** (in yellow)
- A clear, direct answer
- A one-line command or architecture flow at the bottom

---

### Tab 4: `4. 66degrees Cheat Sheet`

A 4-panel reference page you can glance at right before the call:

- **Why 66degrees Is a True "Google House":** Diamond Partner, 4x Partner of the Year, 500+ GCP certifications, Launch Partner for Gemini Enterprise for Industries.
- **The Three Pillars of Paradigm°:** `Paradigm° Data`, `Paradigm°OS`, and `Paradigm° Legacy`.
- **Leadership & Google Cloud Next '26 Names:** CEO Ben Kessler, GFS CIO Brendan Bonthuis, Chief Innovation Officer Joshua Sutton, SVP Cloud Engineering Alex Voorhees, SVP Data Platforms Daniel Zagales, SVP Solution Consulting James Garza, VP Solution Consulting Matt Kelberman, VP of Alliances Maria Mejia.
- **Questions for You to Ask Them at the End:** Three tailored questions about Agentic Labs, Day-2 Managed Agentic Services, and ramping in the first 30–90 days.

---

## 3. How It Works Under the Hood (Files & Data Flow)

If an interviewer asks *"How did you build this?"* or *"Walk me through the code,"* here is the exact chain from your mouse click to the screen:

1. **`degree66/shared/types.ts` (The Data Shapes):**
   Defines the TypeScript blueprint inputs (`BlueprintInput`: which scenario, legacy source, ingestion pattern, compliance level, daily event volume, catalog size, and human confidence threshold) and the outputs (`BlueprintOutput`: the 5 architecture nodes, the FinOps cost lines, the risk controls, and the 4 generated code files).
2. **`degree66/shared/planner.ts` (The Deterministic Brain):**
   This single file holds all the logic—no external libraries and no network calls:
   - `SCENARIO_PRESETS` stores the 5 public 66degrees client scenarios and their default numbers.
   - `generateBlueprint(input)` takes whatever you selected in the UI and runs four pure helper functions:
     - `buildArchitectureNodes(input)` picks the right Google Cloud products for each of the 5 layers based on your dropdowns.
     - `computeFinOps(input)` calculates the monthly Google Cloud cost using straightforward math formulas based on `dailyEventsMillions`, `catalogOrRecordCount`, and your chosen ingestion/compliance tier.
     - `buildRiskControls(input)` and `buildTalkingPoints(input)` assemble the security bullets and interview scripts.
     - `buildArtifacts(input, monthlyGcpUsd)` fills in four deterministic code templates (`.sql`, `.tf`, `.py`, `.md`) with your exact dataset name, compliance posture, monthly dollar estimate, and `HUMAN_GATE_THRESHOLD` number.
3. **`degree66/src/App.tsx` (The User Interface):**
   Holds the React state for the active tab and `input` parameters. Whenever you click a preset card, change a dropdown, or slide a slider, React calls `generateBlueprint(input)` in memory (in less than 1 millisecond) and updates the architecture cards, cost table, Human-in-the-Lead sandbox badges, and code viewer immediately.
4. **`degree66/tests/planner.test.ts` (Automated Tests):**
   Runs 5 automated checks verifying that all 5 presets load, that the Gordon Food Service preset generates all 5 layers and 4 files, that choosing HIPAA turns on `VPC Service Controls` and `INGRESS_TRAFFIC_INTERNAL_ONLY`, and that increasing event volume scales the FinOps cost table properly.

---

## 4. Plain-English Guide to the Google Cloud Services Used

When you point at the 5-layer diagram on Tab 1, here is what each Google Cloud service actually does and why 66degrees uses it:

| Layer in the App | Google Cloud Service | What It Does in Plain English | Why You Picked It for 66degrees |
| :--- | :--- | :--- | :--- |
| **1. Ingest** | **Cloud Datastream** | Reads live changes (inserts/updates) directly from legacy databases like Oracle or SQL Server without slowing them down. | Best way to replicate a legacy database into Google Cloud in under 60 seconds without installing heavy agents. |
| **1. Ingest** | **Cloud Pub/Sub + Cloud Dataflow** | **Pub/Sub** is Google's high-speed message queue; **Dataflow** processes streaming data in flight (cleaning, deduplicating, or masking it) before saving it. | Handles tens of millions of events per day reliably and can scrub sensitive data *before* it ever touches storage. |
| **1. Ingest** | **Cloud Storage + Cloud Composer 3** | **Cloud Storage** holds raw files (like Parquet or mainframe extracts); **Composer** (managed Apache Airflow) schedules batch jobs in the right order. | Ideal when a legacy system (like a mainframe) only exports files every 15 minutes or overnight. |
| **2. Paradigm° Data** | **BigQuery + BigLake + dbt** | **BigQuery** is Google's serverless data warehouse. **BigLake** lets BigQuery read files across storage buckets with unified security. **dbt** organizes the SQL transformations. | BigQuery is the heart of every 66degrees data foundation—it holds both structured business tables and AI vector embeddings in one place. |
| **3. Governance** | **Cloud Dataplex** | Automated data governance: checks data quality rules, tracks lineage (where data came from), and enforces column-level access tags. | Prevents "garbage in, garbage out" before an AI agent is allowed to read a table. |
| **3. Governance** | **VPC Service Controls (VPC-SC) + Cloud KMS (CMEK)** | **VPC-SC** draws an invisible security fence around Google Cloud services so data cannot be copied outside. **KMS CMEK** lets the client hold their own encryption keys. | Mandatory for healthcare (HIPAA) and regulated financial clients worried about data leaks. |
| **3. Governance** | **Sensitive Data Protection (Cloud DLP)** | Automatically spots and masks Social Security numbers, credit cards, or patient names in text and tables. | Strips out private data before it ever gets sent into an AI prompt. |
| **4. Paradigm°OS Agent** | **Vertex AI (Gemini 2.5 Pro & Flash + Vector Search)** | Google's enterprise AI platform. **Gemini 2.5 Flash** is fast and cheap for high-volume sorting; **Gemini 2.5 Pro** handles hard reasoning; **Vector Search** finds matching company records by meaning. | Lets you route simple work to the cheaper model (`Flash`) and force the AI to cite real BigQuery rows instead of guessing. |
| **4. Paradigm°OS Agent** | **Customer Engagement Suite (Dialogflow CX + Agent Assist)** | Google's contact-center AI: handles voice/chat menus and whispers live answers + summaries to human call-center reps. | Directly matches 66degrees' travel/hospitality and utility call-center case studies. |
| **5. Operations** | **Cloud Run + Eventarc + Model Armor** | **Cloud Run** runs the lightweight web service that checks the AI's confidence score; **Eventarc** triggers actions when alerts fire; **Model Armor** blocks prompt-injection attacks. | Enforces the **Human-in-the-Lead** gate and logs a 100% audit trail back to BigQuery. |

---

## 5. Five Likely Interviewer Questions (With Short, Honest Answers)

### Q1: "Did you connect this to Vertex AI or use an LLM to generate the SQL and Terraform?"

> **Answer:** "No—and intentionally so. I know live LLMs aren't used during the interview, and in production architecture you want infrastructure templates to be deterministic. Everything here runs offline in TypeScript (`planner.ts`). When you change a dropdown or slider, it runs pure sizing rules and populates vetted BigQuery, Terraform, and Python templates in memory."

### Q2: "Where did you get the Gordon Food Service and other case study numbers?"

> **Answer:** "The client themes and headline outcomes—like Gordon Food Service's 450,000+ item catalog and data-quality alert automation, the 50–70% hospitality touchpoint automation, and the 90% utility call QA improvement—come straight from 66degrees' public website and Ben Kessler's Google Cloud Next '26 interview with GFS CIO Brendan Bonthuis. The specific monthly dollar figures and sample SKU rows in the simulator are realistic sizing estimates I modeled for this demo, not private GFS numbers."

### Q3: "Why did you put Vector Search inside BigQuery in the SQL file instead of using a separate vector database?"

> **Answer:** "For enterprise catalog or operational data that already lives in BigQuery—like 450,000 SKUs—keeping embeddings in the same partitioned BigQuery table (`VECTOR_SEARCH` + `text-embedding-005`) means you don't have to sync a second database, and you can filter by SQL columns and Dataplex security tags in the same query. I'd only step up to dedicated Vertex AI Vector Search if a live customer voice/chat bot needed sub-15-millisecond lookups at thousands of queries per second."

### Q4: "How does your 'Human in the Lead' confidence gate actually work in real life?"

> **Answer:** "An AI model shouldn't write directly to a production ERP or eCommerce catalog unguarded. In the Python file on Tab 2, we force Gemini to return a structured JSON object that includes its citations, any policy flags, and a confidence score. A lightweight Cloud Run gate checks two rules: is the confidence above our slider threshold (say 88%), and is the policy-violation list empty? If yes, it auto-commits. If not—like the Pollock SKU with an unverified sustainability claim—it holds the record in a review queue for a human Merchandising Lead."

### Q5: "How are the monthly FinOps costs calculated in your table?"

> **Answer:** "It's a transparent rule-of-thumb sizing model in `computeFinOps()`. It starts with a base footprint for BigQuery Enterprise slots, ingestion, Vertex AI tokens, security, and Cloud Run, and then scales linearly with the daily event volume slider and catalog size. I also modeled two cost-control levers 66degrees cares about: using BigQuery partition filters so queries don't scan the whole table, and routing high-volume work to Gemini 2.5 Flash with context caching instead of running everything on Pro."

---

## 6. Your 3-Minute Screen-Share Demo Script

Have the app open on **Tab 1 (`1. Paradigm° Blueprint Simulator`)** with the first card (**Gordon Food Service**) selected before you share your screen.

### Minute 1: The Hook & Why You Built It (0:00 – 1:00)

1. **Say:** *"As I prepared for today, I watched Ben Kessler and Gordon Food Service CIO Brendan Bonthuis at Google Cloud Next '26, and read up on how you pair Forward-Deployed Engineers with Paradigm° Data and Paradigm°OS. To make sure I really understood your stack from end to end, I built an offline Google Cloud blueprint simulator around five of your public client stories. Everything here is deterministic—no live LLM calls."*
2. **Point at the top 5 cards:** *"I loaded five presets from your public case studies: Gordon Food Service's 450,000-SKU catalog enrichment, your Managed Services data-quality alert automation, a HIPAA biomedical migration, travel/hospitality Customer Engagement Suite, and utility contact-center QA."*

### Minute 2: The Interactive "Human in the Lead" Gate & HIPAA Switch (1:00 – 2:00)

1. **Point to the bottom-left panel (`Live "Human in the Lead" Gate Simulation`):** *"Ben Kessler talked about 'Human in the Lead'—using AI for a 10x capacity lift while keeping humans in control of exceptions. Here on the GFS preset, the gate is set to 88%. Item #1 (Sourdough Loaf at 96% confidence) auto-commits to BigQuery, while Item #2 (Pollock Fillet at 81% with an unverified sustainability claim) automatically routes to a human buyer."*
2. **Drag the `Human-in-the-Lead Confidence Gate` slider** from `88%` up to `97%` and back down: *"As I tighten or relax the governance threshold, you can see the routing decisions update live."*
3. **Click the 3rd preset card at the top (`Healthcare · HIPAA + VPC-SC — Biomedical Research Estate`):** *"If we switch to a regulated healthcare migration, watch the right column: the Governance layer automatically locks down to VPC Service Controls, Cloud KMS Customer-Managed Encryption Keys, and Cloud DLP de-identification, and the FinOps table updates for the new volume."*

### Minute 3: The Generated SQL, Terraform, and Python Deliverables (2:00 – 3:00)

1. **Click Tab 2 (`2. Generated GCP Code (4)`):** *"To make this concrete, the planner generates four starter templates from those settings."*
2. **Click through the first three files on the left sidebar (`01_paradigm_data_bigquery.sql`, `02_gcp_foundation_main.tf`, `03_paradigm_os_vertex_agent.py`):**
   - *"First is the BigQuery SQL: partitioned by date, clustered by entity ID, linked to Vertex AI `text-embedding-005`, with a cosine vector index and the human-review routing view."*
   - *"Second is the Terraform HCL: least-privilege IAM roles and a Cloud Run v2 gateway—which automatically switched to `INGRESS_TRAFFIC_INTERNAL_ONLY` because we're on the HIPAA scenario."*
   - *"Third is the Python gate: enforcing a strict JSON `RESPONSE_SCHEMA` and the `evaluate_governance_gate` check before anything touches production."*
3. **Close with:** *"I know this is a lightweight simulator, but building it gave me a huge appreciation for how Paradigm° Data and Paradigm°OS fit together on Google Cloud—and I'd love to hear how your teams run this in the field."*
