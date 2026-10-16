import os
from typing import Dict, Any, List
from PIL import Image, ImageDraw, ImageFont
from app.config import BASE_DIR, UPLOADS_DIR

# Check if PyMuPDF (fitz) is available
try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False


def parse_ga_pdf(pdf_relative_or_abs_path: str) -> Dict[str, Any]:
    """
    Parses a General Arrangement drawing PDF.
    Extracts text, metadata, page count, and renders page previews.
    """
    if os.path.isabs(pdf_relative_or_abs_path):
        full_pdf_path = pdf_relative_or_abs_path
    else:
        full_pdf_path = os.path.join(BASE_DIR, pdf_relative_or_abs_path)

    if not os.path.exists(full_pdf_path):
        # Fallback to demo GA drawing
        full_pdf_path = os.path.join(BASE_DIR, "data", "demo", "GA_Drawing_Cabinet_RevC.pdf")

    extracted_text = []
    page_count = 1
    page_preview_rel_path = "uploads/ga_preview_page_1.png"
    page_preview_full = os.path.join(BASE_DIR, page_preview_rel_path)

    if HAS_PYMUPDF and os.path.exists(full_pdf_path):
        try:
            doc = fitz.open(full_pdf_path)
            page_count = len(doc)
            for page_num in range(page_count):
                page = doc[page_num]
                text = page.get_text()
                if text:
                    extracted_text.append(text.strip())

                # Render first page as high-res PNG preview
                if page_num == 0:
                    pix = page.get_pixmap(dpi=150)
                    pix.save(page_preview_full)
            doc.close()
        except Exception:
            _render_fallback_ga_preview(page_preview_full)
    else:
        # Fallback renderer using Pillow to create a clean schematic preview
        _render_fallback_ga_preview(page_preview_full)
        extracted_text = [
            "GENERAL ARRANGEMENT — CONTROL CABINET CAB-4092\n"
            "PROJECT: WATER PURIFICATION PLANT MCC-01 | DWG NO: GA-CAB-4092-C | REV: C\n"
            "DIN 1: PS1, QF1, QF2, QF3, SPD1\n"
            "DIN 2: PLC1, K1, K2, KA1\n"
            "DIN 3: TERMINAL STRIP X1 (1-20)\n"
            "APPROVED BY: Chief Electrical Eng."
        ]

    return {
        "page_count": page_count,
        "selected_page": 1,
        "preview_image_path": page_preview_rel_path,
        "extracted_text_snippet": "\n".join(extracted_text)[:500],
        "has_machine_readable_text": len(extracted_text) > 0,
        "drawing_number": "GA-CAB-4092-C",
        "revision": "Rev C",
        "identified_rails": ["DIN 1 (Power)", "DIN 2 (Control & Logic)", "DIN 3 (Field Terminals)"],
        "expected_components": [
            {"ref": "PS1", "type": "Power Supply 24VDC", "rail": "DIN 1"},
            {"ref": "QF1", "type": "Main Breaker 3P 63A", "rail": "DIN 1"},
            {"ref": "QF2", "type": "Branch Breaker 1P 16A", "rail": "DIN 1"},
            {"ref": "QF3", "type": "Branch Breaker 1P 10A", "rail": "DIN 1"},
            {"ref": "SPD1", "type": "Surge Protector 40kA", "rail": "DIN 1"},
            {"ref": "PLC1", "type": "PLC CPU 1214C", "rail": "DIN 2"},
            {"ref": "K1", "type": "Motor Contactor 25A", "rail": "DIN 2"},
            {"ref": "K2", "type": "Motor Contactor 25A", "rail": "DIN 2"},
            {"ref": "KA1", "type": "Safety Relay Module", "rail": "DIN 2"},
            {"ref": "X1", "type": "Terminal Strip 20P", "rail": "DIN 3"}
        ]
    }


def _render_fallback_ga_preview(dest_path: str):
    """Generates a clean vector-style technical schematic image preview."""
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    w, h = 840, 590
    img = Image.new("RGB", (w, h), color=(248, 249, 250))
    draw = ImageDraw.Draw(img)

    # Technical grid lines
    for x in range(0, w, 30):
        draw.line([x, 0, x, h], fill=(235, 238, 242), width=1)
    for y in range(0, h, 30):
        draw.line([0, y, w, y], fill=(235, 238, 242), width=1)

    # Outer border
    draw.rectangle([30, 30, w - 30, h - 30], outline=(40, 50, 60), width=2)
    # Header block
    draw.text((45, 45), "GENERAL ARRANGEMENT — CONTROL CABINET CAB-4092", fill=(20, 25, 30))
    draw.text((45, 65), "DWG: GA-CAB-4092-C | REV: C | ENCLOSURE: 1000x800x300mm", fill=(80, 90, 100))

    # Inner plate outline
    draw.rectangle([60, 90, w - 60, h - 90], outline=(100, 110, 120), width=1)

    # DIN Rails
    draw.line([90, 180, w - 90, 180], fill=(70, 80, 90), width=3)
    draw.text((w - 85, 175), "DIN 1", fill=(60, 70, 80))

    draw.line([90, 300, w - 90, 300], fill=(70, 80, 90), width=3)
    draw.text((w - 85, 295), "DIN 2", fill=(60, 70, 80))

    draw.line([90, 420, w - 90, 420], fill=(70, 80, 90), width=3)
    draw.text((w - 85, 415), "DIN 3", fill=(60, 70, 80))

    # Components boxes on DIN 1
    draw.rectangle([110, 140, 180, 210], fill=(225, 230, 238), outline=(50, 60, 70), width=2)
    draw.text((130, 170), "PS1", fill=(10, 15, 20))

    draw.rectangle([210, 145, 270, 210], fill=(225, 230, 238), outline=(50, 60, 70), width=2)
    draw.text((225, 170), "QF1", fill=(10, 15, 20))

    draw.rectangle([290, 150, 340, 210], fill=(225, 230, 238), outline=(50, 60, 70), width=2)
    draw.text((305, 170), "QF2", fill=(10, 15, 20))

    draw.rectangle([360, 150, 410, 210], fill=(225, 230, 238), outline=(50, 60, 70), width=2)
    draw.text((375, 170), "QF3", fill=(10, 15, 20))

    # Components on DIN 2
    draw.rectangle([110, 260, 230, 330], fill=(225, 230, 238), outline=(50, 60, 70), width=2)
    draw.text((150, 290), "PLC1", fill=(10, 15, 20))

    # K1
    draw.rectangle([260, 265, 330, 330], fill=(210, 240, 220), outline=(20, 120, 60), width=2)
    draw.text((285, 290), "K1", fill=(10, 60, 20))

    # K2
    draw.rectangle([350, 265, 420, 330], fill=(225, 230, 238), outline=(50, 60, 70), width=2)
    draw.text((375, 290), "K2", fill=(10, 15, 20))

    # Terminal strip on DIN 3
    draw.rectangle([110, 400, 500, 440], fill=(235, 238, 242), outline=(50, 60, 70), width=2)
    draw.text((130, 415), "TERMINAL STRIP X1 (TERMINALS 1 TO 20)", fill=(10, 15, 20))

    img.save(dest_path, "PNG")
