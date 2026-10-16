import os
from typing import Dict, Any, List

# Check if PaddleOCR or pytesseract is installed
try:
    from paddleocr import PaddleOCR
    HAS_PADDLEOCR = True
except ImportError:
    HAS_PADDLEOCR = False


def run_ocr_readings(image_path: str, is_repaired: bool = False) -> Dict[str, Any]:
    """
    Reads device nameplates and wire ferrule sleeve alphanumeric characters.
    Distinguishes genuine AI OCR from demo deterministic results.
    """
    live_ocr_available = False
    engine_name = "None (Demo OCR Engine Active)"

    # OCR readings for the cabinet components
    # Notice: In initial inspection, QF2 has label "QFZ", and X1:14 has ferrule "X1:41"
    # When is_repaired is True, QF2 is "QF2" and X1:14 is "X1:14"
    qf2_label = "QF2" if is_repaired else "QFZ"
    ferrule_x1_14 = "X1:14" if is_repaired else "X1:41"

    device_labels = [
        {"component_ref": "PS1", "text_read": "PS1 (24V 10A)", "confidence": 0.98 if live_ocr_available else None, "bbox": [15.0, 23.3, 8.3, 2.2]},
        {"component_ref": "QF1", "text_read": "QF1", "confidence": 0.99 if live_ocr_available else None, "bbox": [28.7, 17.2, 5.0, 2.2]},
        {"component_ref": "QF2", "text_read": qf2_label, "confidence": 0.76 if live_ocr_available else None, "bbox": [39.5, 17.2, 4.2, 2.2], "is_ambiguous": not is_repaired},
        {"component_ref": "QF3", "text_read": "QF3", "confidence": 0.98 if live_ocr_available else None, "bbox": [47.9, 17.2, 4.2, 2.2]},
        {"component_ref": "SPD1", "text_read": "SPD1", "confidence": 0.95 if live_ocr_available else None, "bbox": [56.6, 17.7, 4.2, 2.2]},
        {"component_ref": "PLC1", "text_read": "PLC1", "confidence": 0.99 if live_ocr_available else None, "bbox": [15.0, 51.1, 8.3, 2.2]},
        {"component_ref": "K1", "text_read": "K1", "confidence": 0.96 if live_ocr_available else None, "bbox": [63.3 if not is_repaired else 35.0, 45.5, 4.2, 2.2]},
        {"component_ref": "K2", "text_read": "K2", "confidence": 0.97 if live_ocr_available else None, "bbox": [46.6, 45.5, 4.2, 2.2]},
        {"component_ref": "KA1", "text_read": "KA1", "confidence": 0.94 if live_ocr_available else None, "bbox": [55.8, 45.5, 3.5, 2.2]}
    ]

    ferrule_readings = [
        {"ferrule_tag": "QF1:L1", "terminal": "QF1:1", "text_read": "QF1:L1", "confidence": 0.94 if live_ocr_available else None, "bbox": [29.5, 29.0, 3.0, 2.0]},
        {"ferrule_tag": "PS1:L", "terminal": "PS1:L", "text_read": "PS1:L", "confidence": 0.93 if live_ocr_available else None, "bbox": [17.5, 29.5, 3.0, 2.0]},
        {"ferrule_tag": "PLC1:24V", "terminal": "PLC1:L+", "text_read": "PLC1:24V", "confidence": 0.91 if live_ocr_available else None, "bbox": [17.5, 36.0, 3.5, 2.0]},
        {
            "ferrule_tag": "X1:14",
            "terminal": "X1:14",
            "text_read": ferrule_x1_14,
            "confidence": 0.78 if live_ocr_available else None,
            "bbox": [49.5, 68.3, 3.2, 2.5],
            "is_ambiguous": not is_repaired,
            "mismatch_detected": not is_repaired
        },
        {"ferrule_tag": "X1:15", "terminal": "X1:15", "text_read": "X1:15", "confidence": 0.95 if live_ocr_available else None, "bbox": [52.0, 68.3, 3.2, 2.5]}
    ]

    return {
        "live_ocr_available": live_ocr_available,
        "engine_name": engine_name,
        "device_labels": device_labels,
        "ferrule_readings": ferrule_readings
    }
