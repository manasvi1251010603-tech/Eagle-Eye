from fastapi import APIRouter
from app.services.detection import HAS_YOLO
from app.services.ocr import HAS_PADDLEOCR
from app.services.alignment import HAS_OPENCV

router = APIRouter(tags=["Health & Status"])

@router.get("/health")
def get_health_status():
    return {
        "status": "HEALTHY",
        "service": "EAGLE EYE Backend Inspection Engine",
        "version": "1.0.0-PROTOTYPE",
        "demo_mode_active": True,
        "capabilities": {
            "opencv_available": HAS_OPENCV,
            "yolo_inference_available": HAS_YOLO,
            "paddle_ocr_available": HAS_PADDLEOCR,
            "deterministic_rules_engine": True,
            "cad_alignment_engine": True,
            "reinspection_engine": True,
            "pdf_report_generator": True,
            "excel_report_generator": True
        }
    }
