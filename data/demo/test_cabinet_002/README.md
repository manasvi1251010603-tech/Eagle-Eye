# EAGLE EYE Benchmark Dataset 2 — Cabinet with Known Documented Defects

**Cabinet Identifier:** `EAGLE-DEMO-002`  
**Classification:** Defect Detection & Quality Control Benchmark  
**Drawing Revision:** Rev A  
**Expected Outcome:** `REPAIR_REQUIRED` (2 FAIL, 2 REVIEW findings)  

---

## 1. Dataset Overview

This dataset tests the core inspection algorithms of EAGLE EYE under real industrial failure modes. The enclosure photograph contains **four intentional, documented, physically depicted assembly discrepancies**:

1. **GA Component Placement Defect (FAIL):** Contactor `K1` is mounted in DIN Rail 2 Slot 5 ($X=740$) instead of its designated Slot 2 ($X=420$). The correct slot is left visibly vacant.
2. **Device Nameplate Label Defect (REVIEW):** Circuit breaker `QF2` has faceplate text printing `"QFZ"` instead of `"QF2"` due to a character-rendering ambiguity / printing error.
3. **Ferrule Alphanumeric Markings Defect (FAIL):** The wire ferrule sleeve connected into terminal `X1:14` is imprinted with `"X1:41"` (transposed / inverted numeral defect).
4. **Wire Insulation Colour Check (REVIEW):** The wire connected to terminal `X1:14` is shaded with deep shadow / dark purple hue rather than standard industrial Light Blue, triggering an automated color ambiguity review.

---

## 2. Included Files

| Filename | Format | Description |
| :--- | :--- | :--- |
| `cabinet_photo.jpg` | JPEG (1200 x 900) | Physical cabinet image with the 4 documented defects clearly visible. |
| `ga_drawing.pdf` | Vector PDF (A4 Landscape) | General Arrangement drawing defining expected component coordinates. |
| `wiring_schedule.xlsx` | Excel Workbook | Wiring schedule and BOM detailing expected references and wire tags. |
| `README.md` | Markdown | Comprehensive defect documentation, root cause analysis, and remediation steps. |

---

## 3. Documented Defect Breakdown

```
+----------------------------------------------------------------------------------------------------+
| #  | Module         | Component | Expected Reference   | Observed in Image | Status | Severity     |
|----+----------------+-----------+----------------------+-------------------+--------+--------------|
| 1  | GA Placement   | K1        | Rail 2, Slot 2 (X:420) | Rail 2, Slot 5    | FAIL   | CRITICAL     |
| 2  | Device Label   | QF2       | "QF2"                | "QFZ"             | REVIEW | MEDIUM       |
| 3  | Ferrule Text   | Wire W-108| Ferrule "X1:14"      | Ferrule "X1:41"   | FAIL   | HIGH         |
| 4  | Wire Colour    | Wire W-108| Blue (RAL 5015)      | Dark Shadowed Hue | REVIEW | LOW          |
+----------------------------------------------------------------------------------------------------+
```

### Defect Descriptions & Root Causes:

1. **Defect 1 — Misplaced Contactor K1 (GA Placement Check):**
   - *Observation:* Contactor `K1` is mounted on the far right of Rail 2, occupying the spare reserve expansion slot.
   - *Standard Impact:* Violates IEC 61439-1 thermal separation and mechanical grouping requirements.
   - *Action:* De-energize, unscrew DIN clip, remount at designated Slot 2 between `PLC1` and `K2`.

2. **Defect 2 — Nameplate Misprint on QF2 (Device Label Check):**
   - *Observation:* OCR reads `"QFZ"` on breaker faceplate instead of `"QF2"`.
   - *Standard Impact:* Ambiguous component identification impedes field service and safety isolation.
   - *Action:* Operator re-tags breaker faceplate with approved thermal label `"QF2"`.

3. **Defect 3 — Reversed Wire Ferrule Tag (Ferrule Text Check):**
   - *Observation:* Sleeve on wire leading to terminal block `14` reads `"X1:41"`.
   - *Standard Impact:* High risk of cross-wiring or technician confusion during field commissioning.
   - *Action:* Cut sleeve, crimp new ferrule with verified marking `"X1:14"`.

4. **Defect 4 — Wire Colour Contrast Ambiguity (Wire Colour Check):**
   - *Observation:* Wire entering terminal `14` has low lighting/heavy shadow causing RGB chromaticity drift away from standard Light Blue.
   - *Action:* Manual inspector visual confirmation under auxiliary inspection lamp.

---

## 4. How to Upload and Inspect

1. Navigate to the **New Inspection** page (`/new-inspection`) in EAGLE EYE.
2. In the **Metadata** section, enter:
   - **Cabinet ID:** `EAGLE-DEMO-002`
   - **Work Order:** `WO-DEFECT-002`
   - **Batch Number:** `BATCH-2026-Q4`
   - **Drawing Revision:** `Rev A`
3. Upload the 3 files from this directory:
   - `cabinet_photo.jpg`
   - `ga_drawing.pdf`
   - `wiring_schedule.xlsx`
4. Confirm green upload indicators and click **Proceed to Reference & Alignment**.
5. After inspection pipeline execution, review the findings table on the **Inspection Results** page (`/results`).
6. Verify that `K1` (Misplaced), `QF2` (Mislabeled), `X1:14` (Ferrule reversed), and Wire Colour are flagged as expected.
