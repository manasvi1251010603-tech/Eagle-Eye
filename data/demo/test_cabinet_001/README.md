# EAGLE EYE Benchmark Dataset 1 — Correct Cabinet Assembly

**Cabinet Identifier:** `EAGLE-DEMO-001`  
**Classification:** Baseline Known-Good Assembly  
**Drawing Revision:** Rev A  
**Standard Compliance:** IEC 61439-1 / IEC 61439-2  

---

## 1. Dataset Overview

This dataset represents an electrical control cabinet constructed strictly in accordance with General Arrangement (GA) engineering drawings and the wiring schedule. All physical components, terminal strips, wiring ferrules, and insulation colors match their engineering specifications.

Use this dataset to verify **false-positive resistance** and ensure that a correctly assembled enclosure achieves a **100% PASS** outcome across all automated QC modules.

---

## 2. Included Files

| Filename | Format | Description |
| :--- | :--- | :--- |
| `cabinet_photo.jpg` | JPEG (1200 x 900) | High-fidelity synthetic illustration of the physical control cabinet enclosure. |
| `ga_drawing.pdf` | Vector PDF (A4 Landscape) | Official General Arrangement engineering blueprint depicting DIN rails and designated component slots. |
| `wiring_schedule.xlsx` | Excel Workbook | 3-sheet schedule containing 14 point-to-point wires, complete 10-item BOM, and terminal block mapping. |
| `README.md` | Markdown | Comprehensive specification, verification instructions, and expected test outcomes. |

---

## 3. Reference Component Layout (BOM)

| Tag | Component Description | Manufacturer | Part Number | DIN Rail | Designated Slot |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PS1** | Power Supply 24VDC 10A | Phoenix Contact | TRIO-PS-2G/1AC/24DC/10 | Rail 1 | Slot 1 |
| **QF1** | Main Circuit Breaker 3P 63A | Schneider Electric | A9F74363 | Rail 1 | Slot 2 |
| **QF2** | Miniature Circuit Breaker 1P 16A | Schneider Electric | A9F74116 | Rail 1 | Slot 3 |
| **QF3** | Miniature Circuit Breaker 1P 10A | Schneider Electric | A9F74110 | Rail 1 | Slot 4 |
| **SPD1** | Surge Protective Device 40kA | DEHN | 952070 | Rail 1 | Slot 5 |
| **PLC1** | SIMATIC S7-1200 CPU 1214C | Siemens | 6ES7214-1AG40-0XB0 | Rail 2 | Slot 1 |
| **K1** | Motor Contactor 25A 24VDC | Siemens | 3RT2026-1BB40 | Rail 2 | Slot 2 |
| **K2** | Motor Contactor 25A 24VDC | Siemens | 3RT2026-1BB40 | Rail 2 | Slot 3 |
| **KA1** | Safety Relay Module | Pilz | PNOZ s4 24VDC | Rail 2 | Slot 4 |
| **X1** | 20-Pole Terminal Block Strip | Weidmuller | WDU 2.5 | Rail 3 | Slots 1-20 |

---

## 4. Expected Test Outcomes

When uploaded and evaluated by the EAGLE EYE platform:

- **GA Placement Check:** **PASS** (10/10 components detected at exact mounting coordinates).
- **Device Label Check:** **PASS** (Faceplate OCR matches expected references: `PS1`, `QF1`, `QF2`, `QF3`, `SPD1`, `PLC1`, `K1`, `K2`, `KA1`).
- **Ferrule Text Check:** **PASS** (All wire sleeves verified, including `X1:14` and `X1:15`).
- **Wire Colour Check:** **PASS** (All wire insulation matches schedule: AC Phase Black, AC Neutral Light Blue, 24VDC Red, DC Return Blue, Earth Green-Yellow).
- **Overall Session Status:** **PASSED (Certificate Ready)**.

---

## 5. How to Upload and Inspect

1. Navigate to the **New Inspection** page (`/new-inspection`) in the EAGLE EYE web application.
2. In the **Metadata** section, enter:
   - **Cabinet ID:** `EAGLE-DEMO-001`
   - **Work Order:** `WO-DEMO-001`
   - **Batch Number:** `BATCH-2026-Q4`
   - **Drawing Revision:** `Rev A`
3. Upload the files from this directory:
   - **Section A (Cabinet Photograph):** Select `cabinet_photo.jpg`
   - **Section B (GA Drawing):** Select `ga_drawing.pdf`
   - **Section C (Wiring Schedule):** Select `wiring_schedule.xlsx`
4. Verify all 3 upload cards show the green **Ready** badges.
5. Click **Proceed to Reference & Alignment** to initiate extraction and automated inspection.
