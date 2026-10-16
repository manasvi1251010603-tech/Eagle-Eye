# EAGLE EYE Benchmark Dataset 3 — Cabinet Reinspection Scenario

**Cabinet Identifier:** `EAGLE-DEMO-003`  
**Classification:** Complete Guided Repair & Reinspection Verification  
**Drawing Revision:** Rev B  
**Workflow Demonstrated:** Upload -> Inspect -> Rework Checklist -> Reinspect -> Session Closure  

---

## 1. Dataset Overview

This dataset demonstrates the full closed-loop rework lifecycle of EAGLE EYE. It contains paired **Before** and **After** photographs of the identical enclosure to test:

1. **Before Inspection:** Automated detection and flagging of initial defects (`cabinet_photo_before.jpg`).
2. **Guided Repair:** Generation of actionable rework checklists for assembly technicians.
3. **Reinspection Pipeline:** Computer vision diff analysis comparing before-and-after imagery (`cabinet_photo_after.jpg`).
4. **Session Closure:** Formal validation that all open rework items are resolved prior to official certificate issuance.

---

## 2. Included Files

| Filename | Format | Description |
| :--- | :--- | :--- |
| `cabinet_photo_before.jpg` | JPEG (1200 x 900) | Initial assembly photograph showing the 3 defects requiring rework. |
| `cabinet_photo_after.jpg` | JPEG (1200 x 900) | Verified post-rework photograph showing all physical corrections applied. |
| `ga_drawing.pdf` | Vector PDF (A4 Landscape) | General Arrangement engineering layout drawing. |
| `wiring_schedule.xlsx` | Excel Workbook | Wiring schedule and BOM detailing expected connections. |
| `README.md` | Markdown | Complete workflow walkthrough, before-and-after diff analysis, and verification steps. |

---

## 3. Before vs. After Correction Matrix

```
+----------------------------------------------------------------------------------------------------+
| Item | Component | Before Photo (Defective)   | After Photo (Repaired)     | Reinspection Status   |
|------+-----------+----------------------------+----------------------------+-----------------------|
| 1    | K1        | Mounted at Slot 5 (X: 740) | Remounted to Slot 2 (X:420)| RESOLVED (PASS)       |
| 2    | QF2       | Mislabeled as "QFZ"        | Retagged as "QF2"          | RESOLVED (PASS)       |
| 3    | X1:14     | Ferrule sleeve "X1:41"     | Re-crimped as "X1:14"      | RESOLVED (PASS)       |
| 4    | Wire W-108| Low-lighting shadow hue    | Correct clean Blue hue     | RESOLVED (PASS)       |
+----------------------------------------------------------------------------------------------------+
```

---

## 4. Complete End-to-End Walkthrough

### Stage 1: Initial Inspection (Before)
1. Navigate to **New Inspection** (`/new-inspection`).
2. Enter **Cabinet ID:** `EAGLE-DEMO-003` and upload:
   - Photo: `cabinet_photo_before.jpg`
   - GA Drawing: `ga_drawing.pdf`
   - Schedule: `wiring_schedule.xlsx`
3. Proceed to inspection. Observe that defects are flagged on the **Inspection Results** page (`/results`).

### Stage 2: Guided Repair Workflow
1. Navigate to **Guided Repair** (`/repair`).
2. Follow the standard operating procedure (SOP) instructions for each item:
   - Remount `K1` from Slot 5 to Slot 2.
   - Replace label on breaker `QF2`.
   - Re-terminate and sleeve wire `X1:14`.
3. Check off all rework action items.

### Stage 3: Reinspection & Verification (After)
1. Navigate to **Reinspection** (`/reinspection`).
2. The platform loads `cabinet_photo_after.jpg` as the post-repair state.
3. Use the **Interactive Before-and-After Slider** to visually inspect each physical correction.
4. Click **Run Reinspection Analysis**. The computer vision diff algorithm compares both images and confirms that all 4 findings are **RESOLVED**.
5. Click **Close Inspection Session** to generate the final audit sign-off and official compliance certificate.
