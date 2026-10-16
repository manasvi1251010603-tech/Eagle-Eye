# EAGLE EYE — AI-Powered Industrial Control Cabinet Inspection Platform

> **Project Domain:** Industrial Automation & Systems Engineering  
> **Team:** Akatsuki  
> **Team Leader:** Samarth Shingare  
> **Tagline:** *Precision Inspection. Traceable Quality.*  
> **Core Workflow:** `UPLOAD → DETECT → ALIGN → COMPARE → VERIFY → REPORT → REPAIR → RE-CHECK`

---

## 1. Executive Product Overview

**EAGLE EYE** is a high-precision, computer-vision-assisted quality inspection and rework-tracking platform built for industrial electrical control cabinet manufacturers and Factory Acceptance Testing (FAT) teams. 

Modern control cabinets house hundreds of interconnected DIN-rail devices, miniature circuit breakers (MCBs), contactors, programmable logic controllers (PLCs), terminal blocks, and small wire ferrules. Traditional manual verification is repetitive, fatiguing, and prone to human oversight. A single swapped circuit breaker or transposed wire ferrule sleeve can result in catastrophic short circuits, factory dispatch delays, equipment damage, or severe fire hazards.

EAGLE EYE closes this gap by automating the visual comparison of a **real physical cabinet photograph** against:
1. **General Arrangement (GA) CAD drawings** (PDF format) representing expected physical layout coordinates and mounting rails.
2. **Excel wiring schedules** (XLSX format) specifying terminal interconnections, wire insulation color codes, and printed sleeve ferrule tags.

---

## 2. System Architecture & Tech Stack

```text
               +-----------------------------------------------------------+
               |            React 18 + Vite + TypeScript Frontend          |
               |       Tailwind CSS + Lucide Icons + Recharts + Fabric     |
               +-----------------------------+-----------------------------+
                                             | REST API / Static Proxy
                                             v
               +-----------------------------------------------------------+
               |                  FastAPI Python 3.14 Backend              |
               |                   Uvicorn ASGI Server (:8000)             |
               +-----------------------------+-----------------------------+
                                             |
            +----------------+---------------+---------------+----------------+
            |                |                               |                |
            v                v                               v                v
   +-----------------+  +--------------------+  +--------------------+  +-----------------+
   | File Ingestion  |  |  Image Alignment   |  |  CV & OCR Engines  |  | Comparison Core |
   | & Sanitization  |  | (OpenCV Homography)|  | (YOLO & PaddleOCR) |  | (Rules Engine)  |
   +-----------------+  +--------------------+  +--------------------+  +-----------------+
            |                |                               |                |
            +----------------+---------------+---------------+----------------+
                                             |
                                             v
                    +-------------------------------------------------+
                    |           SQLite Local Persistence              |
                    | Sessions • Findings • Repairs • Audit History   |
                    +------------------------+------------------------+
                                             |
                                             v
                    +-------------------------------------------------+
                    |           Downloadable Quality Reports          |
                    |     ReportLab (PDF) • OpenPyXL (Excel XLSX)     |
                    +-------------------------------------------------+
```

### Technology Matrix
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React icons, Recharts data visualization, Fabric.js / Canvas annotation overlay, React Router v6.
- **Backend:** Python 3.14, FastAPI, Pydantic v2, SQLAlchemy 2.0, Uvicorn, Python-Multipart.
- **Storage & Database:** SQLite 3 with full foreign key constraints and transactional integrity; local server-controlled directories for `uploads/`, `reports/`, and `data/demo/`.
- **Computer Vision & OCR:**
  - OpenCV for image preprocessing, homography matrix calculation, and HSV wire insulation color estimation.
  - PyMuPDF (fitz) with vector fallback for multi-page CAD PDF blueprint rendering.
  - OpenPyXL & Pandas for multi-sheet spreadsheet ingestion and dynamic column mapping.
  - Modular YOLOv8 & PaddleOCR inference interfaces with transparent fallback to deterministic sample findings.
- **Report Generation:** ReportLab for ISO-compliant PDF inspection check sheets; OpenPyXL for styled Excel workbooks with AutoFilter and conditional cell highlights.

---

## 3. Visual Design System

EAGLE EYE features an industrial automation aesthetic inspired by aerospace diagnostics and machine-vision workstations:

- **Main Background:** Deep Near-Black Charcoal (`#0B0F12`)
- **Sidebar & Panels:** Dark Graphite (`#11171D`)
- **Elevated Surfaces:** Surface Grey (`#171F27` / `#1E2833`)
- **Borders:** Slate Graphite (`#222F3E` / `#2D3748`)
- **Primary Accent:** Electric Lime Green (`#A3FF3F`) — used purposefully for active sensor states, focal actions, and selection highlights
- **Secondary Accent:** Muted Emerald (`#10B981`)
- **Semantic Status Badges:**
  - **PASS:** Muted Emerald Green (`#10B981`)
  - **FAIL:** Vivid Red (`#EF4444`)
  - **REVIEW:** Industrial Amber (`#F59E0B`)
  - **NOT CHECKED:** Neutral Slate (`#6B7280`)
- **Typography:** Inter for clean operational UI headers; JetBrains Mono / SF Mono for technical identifiers, wire ferrules, confidence percentages, and timestamps.
- **Brand Wordmark:** Geometric optical target motif featuring concentric reticle apertures, tactical crosshairs, and an active sensor pupil.

---

## 4. The 10 Application Workspaces

### Page 1 — Command Center Dashboard (`/`)
- High-level KPIs: Total Inspection Sessions, Total Checked Verification Items, PASS Count, Open Defects (FAIL Count), and Items Requiring Review.
- First-Time Pass Rate (FPY) tracking across production batches.
- Recharts visualizations: Defect distribution bar chart across the 5 check types, plus cumulative outcome donut chart.
- Recent inspection workspaces table with real-time status badges and instant navigation.
- One-click **"New Inspection"** action.

### Page 2 — New Inspection Workspace (`/new`)
- Guided 3-part ingestion:
  - **Section A (Cabinet Photograph):** Drag-and-drop ingestion of high-resolution JPG/PNG images with client-side preview.
  - **Section B (GA Drawing):** PDF blueprint ingestion with page selection and vector schematic preview.
  - **Section C (Wiring Schedule):** Multi-sheet Excel ingestion with sheet selector and dynamic column mapping interface (`device_ref`, `source_terminal`, `dest_terminal`, `ferrule_id`, `wire_colour`, `wire_gauge`).
- Inspection metadata form: Cabinet ID, Work Order ID, Batch Number, Inspector Name, and Blueprint Revision.
- **"Load Industrial Demo Pack"** button for instant one-click demonstration using verified test assets.

### Page 3 — CAD-to-Photo Alignment Workspace (`/alignment`)
- Perspective calibration between physical tilted photographs and flat 2D vector CAD drawings.
- Dual view modes:
  - **Overlay Mode:** Variable opacity slider (0% to 100%) blending physical photograph with green vector CAD DIN-rail outlines.
  - **Side-by-Side Split Mode:** Synchronized zoom and pan.
- Real planar homography matrix $H(3 \times 3)$ readout with estimated camera tilt angle (3.2°).
- Interactive 4-point corner calibration handles (TL, TR, BL, BR) with alignment warning safeguards.

### Page 4 — AI Inspection Processing Stepper (`/processing`)
- Sequential 10-stage execution pipeline with live progress tracking and scanline radar animation:
  1. Validating input files
  2. Extracting GA blueprint reference
  3. Parsing wiring schedule & BOM
  4. Planar perspective alignment
  5. Component detection & localization
  6. Reading device faceplate labels
  7. Reading wire ferrule tags
  8. Estimating wire insulation colours
  9. Deterministic rules comparison
  10. Generating QC findings & visual crops
- Real-time terminal telemetry log streaming execution milestones.

### Page 5 — Inspection Results Workspace (`/results`)
- Interactive canvas displaying the cabinet photograph with color-coded bounding boxes:
  - **Red:** FAIL findings
  - **Green:** PASS findings
  - **Amber:** REVIEW findings
- Bidirectional synchronization: clicking any bounding box highlights the table row; clicking any table row highlights and centers the bounding box.
- Filter toolbar: Status filters (ALL, PASS, FAIL, REVIEW, NOT_CHECKED), Module filters, and instant text search.
- Finding Detail Drawer:
  - Defect explanation & failure reasoning
  - Expected reference value vs Observed camera result
  - GA drawing & Excel row source references
  - Zoomed optical micro-evidence snippet crop
  - Human Reviewer Disposition Override form (CONFIRMED_DEFECT, OVERRIDDEN_PASS, DISMISSED) with notes logging to the audit trail
  - Direct CTA to start guided repair

### Page 6 — Guided Repair Assistant (`/repair`)
- Actionable rework guidance for every identified discrepancy.
- Categorized step-by-step checklists with interactive completion checkboxes:
  - *Component placement error (K1):* LOTO isolation, unclip screwdriver procedure, DIN rail slot realignment, torque seal paint mark.
  - *Ferrule text mismatch (X1:14):* Circuit isolation, cutting defective sleeve, re-printing thermal sleeve tag, ratchet crimping, and 20N pull tug test.
- Technician notes textarea with live timestamp logging.
- **Safety Rule:** Completing a repair checklist item records a rework action but does *not* convert the finding to PASS; resolution must be confirmed by Reinspection.

### Page 7 — Cabinet Reinspection Workspace (`/reinspection`)
- Allows technicians to upload a fresh post-repair cabinet photograph.
- Interactive **Before vs After Split Slider** displaying initial defect state side-by-side with corrected cabinet.
- Creates a linked `InspectionSession` preserving parent history (`parent_session_id`).
- Automated diff engine calculating:
  - Resolved Defects (converted from FAIL to PASS)
  - Persistent Defects (unresolved)
  - Newly Detected Regressions
- **Factory Acceptance Testing (FAT) Closure Gate:** Prevents closing sessions until all required defects are resolved.

### Page 8 — Session History & Digital Audit Trail (`/history`)
- Searchable, filterable archive of all inspection sessions persisted in SQLite.
- Split-screen drawer featuring the complete event timeline: creation, file uploads, alignment, check runs, reviewer overrides, technician repairs, and report generations.

### Page 9 — QC Reports Center (`/reports`)
- Instant, on-demand downloadable report generation:
  - **PDF Report (ReportLab):** Formatted landscape A4 report with header metadata, outcome counts, full color-coded checklist table, micro-evidence references, and mandatory IEC 61439 safety notice.
  - **Excel Workbook (OpenPyXL):** Multi-sheet workbook (`Executive_Summary` and `Inspection_Findings`) with custom cell fills, borders, and AutoFilter.

### Page 10 — Defect Intelligence & Analytics (`/analytics`)
- Longitudinal quality intelligence:
  - Defect frequency by check module
  - Weekly quality trends & rework velocity
  - Top recurring defect component references (e.g. K1 contactor, X1:14 ferrule) with root-cause insights
  - Batch distribution breakdown

---

## 5. The Five Primary Inspection Modules

| Module | Inspection Target | Expected Logic | Demo Finding in Sample Pack |
|---|---|---|---|
| **Check A — GA Placement** | Physical mounting position on DIN rails | Coordinates & slot order vs GA CAD drawing | **FAIL:** Contactor K1 mounted at Slot 5 ($X: 61.6\%$) instead of designated Slot 2 ($X: 35.0\%$) |
| **Check B — Device Label** | Nameplate alphanumeric text | OCR reading vs BOM/Schedule tag | **REVIEW:** Breaker QF2 faceplate scanned as "QFZ" due to font stroke ambiguity |
| **Check C — Ferrule Text** | Alphanumeric print on wire sleeve | Micro-OCR vs Wiring Schedule row | **FAIL:** Wire W-108 ferrule reads "X1:41" (transposed digits) instead of expected "X1:14" |
| **Check D — Wire Colour** | Visible conductor insulation color | HSV color clustering vs schedule color | **REVIEW:** Wire W-108 estimated as "Dark Blue / Shadowed" due to trunking shadows |
| **Check E — Wiring Relationship** | Terminal-to-terminal loop path | Source/dest consistency & visible path | **REVIEW:** Loop K1:A2 $\rightarrow$ X1:14 suspected mismatch due to K1 shift & inverted ferrule |

---

## 6. Demo Mode vs. Live AI Mode Policy

EAGLE EYE strictly separates real model outputs from simulated data:

- **DEMO MODE (Default):** Runs immediately out-of-the-box without requiring gigabytes of GPU weights, external cloud API keys, or specialized camera hardware. Uses deterministic, mathematically grounded sample findings matching the supplied realistic cabinet imagery. All simulated records and confidences are explicitly labeled as `DEMO DATA`.
- **LIVE AI MODE:** Activates when compatible YOLOv8 weights and PaddleOCR binaries are installed and configured via environment variables. When a model fails or is unconfident, it falls back to `REVIEW` with an explicit reason rather than inventing a fabricated `PASS`.

---

## 7. Installation & Quick Start (macOS / Linux)

### Prerequisites
- Python 3.10+ (tested on Python 3.14 and 3.11)
- Node.js 18+ and npm 9+

### Step 1: Clone or Navigate to Project
```bash
cd /Users/manasvilomate/.gemini/antigravity/scratch/eagle-eye
```

### Step 2: Start the FastAPI Backend
```bash
cd backend

# Create and activate virtual environment (if not already active)
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start backend ASGI server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*The backend will automatically create `eagle_eye.sqlite3` and seed initial realistic inspection sessions.*  
*Backend Swagger Docs:* `http://localhost:8000/docs`  
*API Health Endpoint:* `http://localhost:8000/api/health`

### Step 3: Start the React Frontend (in a separate terminal)
```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```
*Frontend Application:* `http://localhost:5173`

---

## 8. Running the Automated Test Suite

EAGLE EYE includes an automated end-to-end test suite testing the REST API, database persistence, Excel schedule parsing, homography alignment, the comparison engine, reviewer overrides, reinspection diffing, and PDF/Excel report generation.

To run tests:
```bash
cd backend
source venv/bin/activate
export PYTHONPATH=.
pytest tests -v
```

Expected result:
```text
tests/test_inspections.py::test_health_endpoint PASSED                   [ 25%]
tests/test_inspections.py::test_list_inspections PASSED                  [ 50%]
tests/test_inspections.py::test_create_and_run_inspection_lifecycle PASSED [ 75%]
tests/test_inspections.py::test_analytics_endpoint PASSED                [100%]
======================= 4 passed in 0.87s ========================
```

---

## 9. Docker Deployment

To launch the full application stack in isolated containers:
```bash
docker compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

---

## 10. Industrial Safety & Regulatory Disclaimer

> **IMPORTANT NOTICE:**  
> EAGLE EYE is an automated optical decision-support platform designed to assist manufacturing technicians and quality inspectors during Factory Acceptance Testing (FAT).  
> **This application does not certify electrical safety, dielectric breakdown voltage, or operational readiness.**  
> Visual inspection cannot substitute for mandatory physical tests including:
> - Ground bond resistance and earth continuity testing
> - Insulation resistance (megohmmeter / megger) testing
> - Terminal screw torque calibration per manufacturer specifications
> - Functional loop testing under controlled electrical isolation
> 
> Under no circumstances does this software command or control physical energization equipment. All physical work must adhere to standard Lock-Out / Tag-Out (LOTO) safety protocols and IEC 61439 standards.

---

*Precision Inspection. Traceable Quality.*  
**EAGLE EYE — Industrial Quality Control Workstation**
