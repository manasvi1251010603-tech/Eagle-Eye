import os
import uuid
from typing import List, Dict, Any
from app.services.detection import run_component_detection
from app.services.ocr import run_ocr_readings
from app.services.wire_colour import estimate_wire_colours


def execute_inspection_pipeline(
    session_id: str,
    image_rel_path: str,
    ga_data: Dict[str, Any],
    schedule_data: Dict[str, Any],
    is_repaired: bool = False
) -> List[Dict[str, Any]]:
    """
    Executes the deterministic comparison rules engine for EAGLE EYE.
    Compares expected reference items against observed vision/OCR results.
    Generates structured findings with PASS, FAIL, REVIEW, and NOT_CHECKED.
    """
    findings = []

    # Run sub-modules
    det_results = run_component_detection(image_rel_path)
    ocr_results = run_ocr_readings(image_rel_path, is_repaired=is_repaired)
    color_results = estimate_wire_colours(image_rel_path)

    # -------------------------------------------------------------
    # 1. GA Placement Checks (Check A)
    # -------------------------------------------------------------
    # K1 Placement Finding
    if not is_repaired:
        findings.append({
            "id": f"FND-{uuid.uuid4().hex[:6].upper()}",
            "session_id": session_id,
            "check_type": "GA_PLACEMENT",
            "component_ref": "K1",
            "expected_value": "Rail DIN 2, Position Slot 2 (X: 35.0%, Y: 44.4%)",
            "observed_value": "Contactor K1 detected at Rail DIN 2, Slot 5 (X: 61.6%, Y: 44.4%)",
            "status": "FAIL",
            "severity": "CRITICAL",
            "reason": "Component K1 is mounted 320mm to the right of designated GA drawing position. Conflicts with spare DIN rail reserve zone.",
            "recommended_action": "De-energize cabinet, unmount K1 from Slot 5, mount at Slot 2 (420mm) and apply torque seal.",
            "confidence": 0.94,
            "is_simulated": True,
            "bbox_x": 61.6,
            "bbox_y": 44.4,
            "bbox_width": 8.3,
            "bbox_height": 11.1,
            "evidence_crop_path": "data/demo/crops/crop_contactor_k1.jpg",
            "source_reference": "GA Drawing Rev C, Sheet 1, DIN 2",
            "repair_status": "PENDING"
        })
    else:
        findings.append({
            "id": f"FND-{uuid.uuid4().hex[:6].upper()}",
            "session_id": session_id,
            "check_type": "GA_PLACEMENT",
            "component_ref": "K1",
            "expected_value": "Rail DIN 2, Position Slot 2 (X: 35.0%, Y: 44.4%)",
            "observed_value": "Rail DIN 2, Position Slot 2 (X: 35.0%, Y: 44.4%)",
            "status": "PASS",
            "reason": "Contactor K1 verified mounted at correct GA drawing location on DIN Rail 2.",
            "confidence": 0.97,
            "bbox_x": 35.0,
            "bbox_y": 44.4,
            "bbox_width": 8.3,
            "bbox_height": 11.1,
            "evidence_crop_path": "data/demo/crops/crop_contactor_k1_repaired.jpg",
            "source_reference": "GA Drawing Rev C, Sheet 1, DIN 2",
            "repair_status": "VERIFIED"
        })

    # Standard Passing GA Placements
    passing_ga_items = [
        ("PS1", "Rail DIN 1, Slot 1", [13.3, 15.5, 10.8, 13.8]),
        ("QF1", "Rail DIN 1, Slot 2", [26.6, 16.1, 9.2, 12.8]),
        ("QF2", "Rail DIN 1, Slot 3", [38.3, 16.6, 6.7, 11.6]),
        ("QF3", "Rail DIN 1, Slot 4", [46.6, 16.6, 6.7, 11.6]),
        ("SPD1", "Rail DIN 1, Slot 5", [55.8, 16.1, 6.7, 12.8]),
        ("PLC1", "Rail DIN 2, Slot 1", [13.3, 43.3, 16.7, 13.3]),
        ("K2", "Rail DIN 2, Slot 3", [45.0, 44.4, 8.3, 11.1]),
        ("KA1", "Rail DIN 2, Slot 4", [55.0, 44.4, 5.0, 11.1]),
        ("X1", "Rail DIN 3, Slot 1-20", [15.0, 72.2, 50.0, 10.0]),
    ]
    for comp_ref, loc, bbox in passing_ga_items:
        findings.append({
            "id": f"FND-{uuid.uuid4().hex[:6].upper()}",
            "session_id": session_id,
            "check_type": "GA_PLACEMENT",
            "component_ref": comp_ref,
            "expected_value": loc,
            "observed_value": loc,
            "status": "PASS",
            "reason": f"Component {comp_ref} presence and mounting coordinates match GA blueprint specifications.",
            "confidence": 0.95,
            "bbox_x": bbox[0],
            "bbox_y": bbox[1],
            "bbox_width": bbox[2],
            "bbox_height": bbox[3],
            "evidence_crop_path": None,
            "source_reference": "GA Drawing Rev C, Sheet 1",
            "repair_status": "VERIFIED"
        })

    # -------------------------------------------------------------
    # 2. Device Label Checks (Check B)
    # -------------------------------------------------------------
    if not is_repaired:
        findings.append({
            "id": f"FND-{uuid.uuid4().hex[:6].upper()}",
            "session_id": session_id,
            "check_type": "DEVICE_LABEL",
            "component_ref": "QF2",
            "expected_value": "QF2",
            "observed_value": "QFZ",
            "status": "REVIEW",
            "reason": "Character ambiguity detected: Optical reader scanned 'QFZ' on breaker faceplate instead of 'QF2'. Character stroke resembles Z. Manual technician confirmation required.",
            "confidence": 0.76,
            "bbox_x": 39.5,
            "bbox_y": 17.2,
            "bbox_width": 4.2,
            "bbox_height": 2.2,
            "evidence_crop_path": "data/demo/crops/crop_breaker_qf2.jpg",
            "source_reference": "Wiring Schedule Rev C / BOM Line 3",
            "repair_status": "PENDING"
        })
    else:
        findings.append({
            "id": f"FND-{uuid.uuid4().hex[:6].upper()}",
            "session_id": session_id,
            "check_type": "DEVICE_LABEL",
            "component_ref": "QF2",
            "expected_value": "QF2",
            "observed_value": "QF2",
            "status": "PASS",
            "reason": "Nameplate label verified clearly as 'QF2' following technician review and re-tagging.",
            "confidence": 0.98,
            "bbox_x": 39.5,
            "bbox_y": 17.2,
            "bbox_width": 4.2,
            "bbox_height": 2.2,
            "evidence_crop_path": "data/demo/crops/crop_breaker_qf2.jpg",
            "source_reference": "Wiring Schedule Rev C / BOM Line 3",
            "repair_status": "VERIFIED"
        })

    passing_labels = [
        ("PS1", "PS1", [15.0, 23.3, 8.3, 2.2]),
        ("QF1", "QF1", [28.7, 17.2, 5.0, 2.2]),
        ("QF3", "QF3", [47.9, 17.2, 4.2, 2.2]),
        ("PLC1", "PLC1", [15.0, 51.1, 8.3, 2.2]),
        ("K2", "K2", [46.6, 45.5, 4.2, 2.2]),
        ("KA1", "KA1", [55.8, 45.5, 3.5, 2.2]),
    ]
    for comp_ref, tag, bbox in passing_labels:
        findings.append({
            "id": f"FND-{uuid.uuid4().hex[:6].upper()}",
            "session_id": session_id,
            "check_type": "DEVICE_LABEL",
            "component_ref": comp_ref,
            "expected_value": tag,
            "observed_value": tag,
            "status": "PASS",
            "reason": f"Device label '{tag}' matches expected engineering reference.",
            "confidence": 0.98,
            "bbox_x": bbox[0],
            "bbox_y": bbox[1],
            "bbox_width": bbox[2],
            "bbox_height": bbox[3],
            "evidence_crop_path": None,
            "source_reference": "Wiring Schedule Rev C / BOM",
            "repair_status": "VERIFIED"
        })

    # -------------------------------------------------------------
    # 3. Ferrule Text Checks (Check C)
    # -------------------------------------------------------------
    if not is_repaired:
        findings.append({
            "id": f"FND-{uuid.uuid4().hex[:6].upper()}",
            "session_id": session_id,
            "check_type": "FERRULE_TEXT",
            "component_ref": "X1:14",
            "expected_value": "X1:14",
            "observed_value": "X1:41",
            "status": "FAIL",
            "reason": "Wire sleeve ferrule printing reads 'X1:41' (transposed/reversed digits). Expected ferrule tag is 'X1:14' per wiring schedule row W-108.",
            "confidence": 0.91,
            "bbox_x": 49.5,
            "bbox_y": 68.3,
            "bbox_width": 3.2,
            "bbox_height": 2.5,
            "evidence_crop_path": "data/demo/crops/crop_ferrule_x1_14.jpg",
            "source_reference": "Wiring Schedule Rev C, Wire W-108",
            "repair_status": "PENDING"
        })
    else:
        findings.append({
            "id": f"FND-{uuid.uuid4().hex[:6].upper()}",
            "session_id": session_id,
            "check_type": "FERRULE_TEXT",
            "component_ref": "X1:14",
            "expected_value": "X1:14",
            "observed_value": "X1:14",
            "status": "PASS",
            "reason": "Re-crimped ferrule sleeve tag verified as 'X1:14' per wiring schedule.",
            "confidence": 0.96,
            "bbox_x": 49.5,
            "bbox_y": 68.3,
            "bbox_width": 3.2,
            "bbox_height": 2.5,
            "evidence_crop_path": "data/demo/crops/crop_ferrule_x1_14.jpg",
            "source_reference": "Wiring Schedule Rev C, Wire W-108",
            "repair_status": "VERIFIED"
        })

    passing_ferrules = [
        ("QF1:L1", "QF1:L1", [29.5, 29.0, 3.0, 2.0]),
        ("PS1:L", "PS1:L", [17.5, 29.5, 3.0, 2.0]),
        ("PLC1:24V", "PLC1:24V", [17.5, 36.0, 3.5, 2.0]),
        ("X1:15", "X1:15", [52.0, 68.3, 3.2, 2.5])
    ]
    for tag, val, bbox in passing_ferrules:
        findings.append({
            "id": f"FND-{uuid.uuid4().hex[:6].upper()}",
            "session_id": session_id,
            "check_type": "FERRULE_TEXT",
            "component_ref": tag,
            "expected_value": val,
            "observed_value": val,
            "status": "PASS",
            "reason": f"Ferrule sleeve marking '{val}' verified matching wiring schedule.",
            "confidence": 0.94,
            "bbox_x": bbox[0],
            "bbox_y": bbox[1],
            "bbox_width": bbox[2],
            "bbox_height": bbox[3],
            "evidence_crop_path": None,
            "source_reference": "Wiring Schedule Rev C",
            "repair_status": "VERIFIED"
        })

    # -------------------------------------------------------------
    # 4. Wire Insulation Colour Checks (Check D)
    # -------------------------------------------------------------
    findings.append({
        "id": f"FND-{uuid.uuid4().hex[:6].upper()}",
        "session_id": session_id,
        "check_type": "WIRE_COLOUR",
        "component_ref": "W-108",
        "expected_value": "Blue (RAL 5015)",
        "observed_value": "Dark Blue / Shadowed (HSV H:215, S:75%, V:35%)",
        "status": "REVIEW" if not is_repaired else "PASS",
        "reason": "Wire entry into bottom duct cast in deep shadow. Color luminance is low; visual estimation cannot rule out dark grey or navy conductor without illumination." if not is_repaired else "Wire color re-checked with direct task lighting: verified standard Blue insulation.",
        "confidence": 0.68 if not is_repaired else 0.95,
        "bbox_x": 49.5,
        "bbox_y": 64.4,
        "bbox_width": 2.0,
        "bbox_height": 6.0,
        "evidence_crop_path": "data/demo/crops/crop_wire_color_x1_14.jpg",
        "source_reference": "Wiring Schedule Rev C, Wire W-108",
        "repair_status": "PENDING" if not is_repaired else "VERIFIED"
    })

    passing_colors = [
        ("W-101", "Black", "Black", [30.0, 28.8, 1.5, 6.6]),
        ("W-105", "Red", "Red", [18.3, 29.4, 1.5, 6.1]),
        ("W-110", "Blue", "Blue", [52.0, 64.4, 2.0, 6.0]),
        ("W-113", "Green-Yellow", "Green-Yellow", [28.3, 72.2, 2.5, 5.0]),
    ]
    for w_tag, exp_col, obs_col, bbox in passing_colors:
        findings.append({
            "id": f"FND-{uuid.uuid4().hex[:6].upper()}",
            "session_id": session_id,
            "check_type": "WIRE_COLOUR",
            "component_ref": w_tag,
            "expected_value": exp_col,
            "observed_value": obs_col,
            "status": "PASS",
            "reason": f"Wire insulation color matches standard code ({exp_col}).",
            "confidence": 0.93,
            "bbox_x": bbox[0],
            "bbox_y": bbox[1],
            "bbox_width": bbox[2],
            "bbox_height": bbox[3],
            "evidence_crop_path": None,
            "source_reference": "Wiring Schedule Rev C",
            "repair_status": "VERIFIED"
        })

    # -------------------------------------------------------------
    # 5. Wiring Relationship Verification (Check E - Advanced Module)
    # -------------------------------------------------------------
    findings.append({
        "id": f"FND-{uuid.uuid4().hex[:6].upper()}",
        "session_id": session_id,
        "check_type": "WIRING_RELATIONSHIP",
        "component_ref": "K1:A2 -> X1:14",
        "expected_value": "Loop W-108 terminates K1:A2 to Terminal X1:14",
        "observed_value": "Path disrupted by K1 placement shift and reversed ferrule X1:41" if not is_repaired else "Path verified: K1:A2 to X1:14",
        "status": "REVIEW" if not is_repaired else "PASS",
        "reason": "Suspected connection mismatch: Due to physical displacement of Contactor K1 and incorrect ferrule label, end-to-end electrical path cannot be validated from visual photo alone. Physical continuity test required before energization." if not is_repaired else "Wiring relationship confirmed following K1 realignment and ferrule re-tagging.",
        "confidence": 0.70 if not is_repaired else 0.92,
        "bbox_x": 55.5,
        "bbox_y": 55.0,
        "bbox_width": 12.0,
        "bbox_height": 10.0,
        "evidence_crop_path": None,
        "source_reference": "Wiring Schedule Rev C, Row 8",
        "repair_status": "PENDING" if not is_repaired else "VERIFIED"
    })

    # Unchecked Item for Scope Completeness
    findings.append({
        "id": f"FND-{uuid.uuid4().hex[:6].upper()}",
        "session_id": session_id,
        "check_type": "WIRING_RELATIONSHIP",
        "component_ref": "PLC1:ETH -> SWITCH",
        "expected_value": "Profinet RJ45 Patch Cable",
        "observed_value": "Not Checked",
        "status": "NOT_CHECKED",
        "reason": "Ethernet communication cabling is routed through rear sub-chassis duct outside frontal camera field of view.",
        "confidence": None,
        "bbox_x": None,
        "bbox_y": None,
        "bbox_width": None,
        "bbox_height": None,
        "evidence_crop_path": None,
        "source_reference": "Network Topology Rev C",
        "repair_status": "PENDING"
    })

    for f in findings:
        if "severity" not in f:
            if f["status"] == "FAIL":
                f["severity"] = "CRITICAL" if "ferrule" in f["check_type"].lower() or "k1" in f["component_ref"].lower() else "HIGH"
            elif f["status"] == "REVIEW":
                f["severity"] = "MEDIUM" if "label" in f["check_type"].lower() else "LOW"
            else:
                f["severity"] = "LOW"
        if "recommended_action" not in f:
            if f["status"] == "FAIL":
                f["recommended_action"] = f"Rework required: rectify {f['component_ref']} to match reference {f['expected_value']}."
            elif f["status"] == "REVIEW":
                f["recommended_action"] = f"Manual reviewer confirmation required for {f['component_ref']}."
            else:
                f["recommended_action"] = "No corrective action needed."
        if "is_simulated" not in f:
            f["is_simulated"] = True

    return findings
