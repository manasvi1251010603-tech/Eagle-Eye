"""
EAGLE EYE — Industrial Control Cabinet Inspection Benchmark Generator
Generates 3 Complete Sample Datasets for Testing:
- test_cabinet_001: EAGLE-DEMO-001 (Correct Cabinet Assembly)
- test_cabinet_002: EAGLE-DEMO-002 (Cabinet with Known Documented Defects)
- test_cabinet_003: EAGLE-DEMO-003 (Reinspection Scenario: Before and After Images)
"""

import os
from typing import Optional, Tuple
from PIL import Image, ImageDraw, ImageFont
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

BASE_OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__)))

# Font loading helper
def get_fonts():
    try:
        font_title = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 20)
        font_large = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 15)
        font_medium = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 13)
        font_small = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 10)
        font_micro = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 8)
    except Exception:
        font_title = ImageFont.load_default()
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_small = ImageFont.load_default()
        font_micro = ImageFont.load_default()
    return font_title, font_large, font_medium, font_small, font_micro


def render_cabinet_graphic(
    output_path: str,
    cabinet_id: str,
    specimen_badge: str,
    status_label: str,
    k1_position_slot: int,  # 2 for correct (X=420), 5 for misplaced (X=740)
    qf2_text: str,          # "QF2" for correct, "QFZ" for defect
    ferrule_14_text: str,   # "X1:14" for correct, "X1:41" for defect
    wire_14_color_type: str # "blue" for correct, "dark_shadow" for defect/ambiguity
):
    """
    Renders a high-fidelity synthetic benchmark graphic of an industrial control cabinet.
    Clearly watermarked as a synthetic benchmark illustration.
    """
    font_title, font_large, font_medium, font_small, font_micro = get_fonts()

    width, height = 1200, 900
    img = Image.new("RGB", (width, height), color=(20, 26, 35))
    draw = ImageDraw.Draw(img)

    # 1. Enclosure Outer Bezel & Mounting Plate
    # RAL 7035 Light Grey enclosure
    draw.rectangle([40, 40, width - 40, height - 40], fill=(215, 220, 226), outline=(135, 142, 152), width=8)
    # Galvanized zinc backplate
    draw.rectangle([60, 60, width - 60, height - 60], fill=(188, 194, 202), outline=(125, 132, 142), width=3)

    # Grid texture on backplate
    for x in range(80, width - 80, 50):
        draw.line([x, 70, x, height - 70], fill=(178, 185, 193), width=1)
    for y in range(80, height - 80, 50):
        draw.line([70, y, width - 70, y], fill=(178, 185, 193), width=1)

    # 2. Slotted Wire Ducts (Grey trunking)
    duct_fill = (130, 138, 145)
    duct_border = (90, 98, 105)
    slot_color = (100, 108, 115)

    def draw_duct_h(y, h=40):
        draw.rectangle([80, y, width - 80, y + h], fill=duct_fill, outline=duct_border, width=2)
        for sx in range(90, width - 90, 15):
            draw.line([sx, y + 5, sx, y + h - 5], fill=slot_color, width=3)

    def draw_duct_v(x, w=40):
        draw.rectangle([x, 90, x + w, height - 90], fill=duct_fill, outline=duct_border, width=2)
        for sy in range(100, height - 100, 15):
            draw.line([x + 5, sy, x + w - 5, sy], fill=slot_color, width=3)

    draw_duct_v(80, 40)
    draw_duct_v(width - 120, 40)
    draw_duct_h(90, 36)
    draw_duct_h(320, 36)
    draw_duct_h(580, 36)
    draw_duct_h(810, 36)

    # 3. Metallic DIN Rails
    din_rail_color = (226, 231, 238)
    din_rail_border = (155, 163, 173)

    def draw_rail(y):
        draw.rectangle([130, y, width - 130, y + 25], fill=din_rail_color, outline=din_rail_border, width=2)
        for rx in range(150, width - 150, 40):
            draw.rectangle([rx, y + 7, rx + 15, y + 18], fill=(135, 143, 153))

    rail_1_y = 190
    rail_2_y = 440
    rail_3_y = 690

    draw_rail(rail_1_y)
    draw_rail(rail_2_y)
    draw_rail(rail_3_y)

    # 4. Rail 1 Devices (Power & Distribution)
    # 4.1 PS1: 24VDC Power Supply
    ps1_box = [160, 140, 290, 265]
    draw.rectangle(ps1_box, fill=(45, 52, 60), outline=(20, 25, 30), width=3)
    draw.rectangle([175, 155, 275, 195], fill=(30, 35, 42))  # Vent grill
    draw.text((180, 205), "PS1 (24V 10A)", fill=(240, 245, 255), font=font_medium)
    draw.text((180, 230), "STATUS: OK", fill=(50, 205, 50), font=font_small)

    # 4.2 QF1: Main 3-Phase Breaker
    qf1_box = [320, 145, 430, 260]
    draw.rectangle(qf1_box, fill=(245, 245, 248), outline=(100, 105, 112), width=2)
    draw.rectangle([340, 180, 410, 220], fill=(20, 20, 20))  # 3P Toggle handle
    draw.text((345, 155), "QF1 (63A)", fill=(10, 10, 10), font=font_large)
    draw.text((345, 235), "MAIN FEED", fill=(180, 20, 20), font=font_small)

    # 4.3 QF2: Branch Breaker 1 (16A) — Target for label check
    qf2_box = [460, 150, 540, 255]
    draw.rectangle(qf2_box, fill=(245, 245, 248), outline=(100, 105, 112), width=2)
    draw.rectangle([485, 185, 515, 215], fill=(20, 20, 20))  # Toggle
    draw.text((475, 155), qf2_text, fill=(10, 10, 10), font=font_large)
    draw.text((475, 230), "16A-C", fill=(60, 60, 60), font=font_small)

    # 4.4 QF3: Branch Breaker 2 (10A)
    qf3_box = [560, 150, 640, 255]
    draw.rectangle(qf3_box, fill=(245, 245, 248), outline=(100, 105, 112), width=2)
    draw.rectangle([585, 185, 615, 215], fill=(20, 20, 20))
    draw.text((575, 155), "QF3", fill=(10, 10, 10), font=font_large)
    draw.text((575, 230), "10A-C", fill=(60, 60, 60), font=font_small)

    # 4.5 SPD1: Surge Protection Device
    spd_box = [670, 145, 750, 260]
    draw.rectangle(spd_box, fill=(215, 38, 38), outline=(120, 20, 20), width=2)
    draw.text((680, 160), "SPD1", fill=(255, 255, 255), font=font_large)
    draw.text((680, 230), "T2 40kA", fill=(255, 255, 255), font=font_small)

    # 5. Rail 2 Devices (Automation & Contactors)
    # 5.1 PLC1: SIMATIC S7-1200 CPU
    plc_box = [160, 390, 360, 510]
    draw.rectangle(plc_box, fill=(50, 58, 68), outline=(20, 25, 30), width=3)
    draw.rectangle([180, 405, 340, 440], fill=(15, 20, 25))  # LCD Display area
    draw.text((190, 415), "CPU 1214C DC/DC/DC", fill=(50, 255, 150), font=font_small)
    draw.text((180, 460), "PLC1 - SIMATIC", fill=(240, 240, 245), font=font_large)
    # Status LEDs
    draw.ellipse([180, 485, 190, 495], fill=(50, 220, 50))  # RUN
    draw.ellipse([200, 485, 210, 495], fill=(220, 180, 20))  # MAINT
    draw.ellipse([220, 485, 230, 495], fill=(80, 80, 80))   # ERROR

    # 5.2 Contactor K1 (Target for placement check)
    if k1_position_slot == 2:
        k1_box = [420, 400, 520, 500]  # Slot 2 (Correct)
    else:
        k1_box = [740, 400, 840, 500]  # Slot 5 (Misplaced Defect)
        # Draw empty DIN rail slot where K1 should have been
        draw.rectangle([420, 400, 520, 500], outline=(170, 180, 190), width=1)
        draw.text((435, 445), "[EMPTY SLOT 2]", fill=(120, 130, 140), font=font_micro)

    draw.rectangle(k1_box, fill=(235, 238, 242), outline=(70, 75, 82), width=3)
    draw.rectangle([k1_box[0] + 15, k1_box[1] + 30, k1_box[2] - 15, k1_box[3] - 30], fill=(20, 25, 30))
    draw.text((k1_box[0] + 25, k1_box[1] + 10), "K1 (25A)", fill=(10, 10, 10), font=font_large)
    draw.text((k1_box[0] + 20, k1_box[3] - 22), "COIL 24VDC", fill=(180, 30, 30), font=font_small)

    # 5.3 Contactor K2 (Slot 3)
    k2_box = [540, 400, 640, 500]
    draw.rectangle(k2_box, fill=(235, 238, 242), outline=(70, 75, 82), width=3)
    draw.rectangle([k2_box[0] + 15, k2_box[1] + 30, k2_box[2] - 15, k2_box[3] - 30], fill=(20, 25, 30))
    draw.text((k2_box[0] + 25, k2_box[1] + 10), "K2 (25A)", fill=(10, 10, 10), font=font_large)
    draw.text((k2_box[0] + 20, k2_box[3] - 22), "COIL 24VDC", fill=(180, 30, 30), font=font_small)

    # 5.4 Safety Relay KA1 (Slot 4)
    ka1_box = [660, 400, 720, 500]
    draw.rectangle(ka1_box, fill=(230, 190, 40), outline=(130, 100, 20), width=2)
    draw.text((ka1_box[0] + 10, ka1_box[1] + 15), "KA1", fill=(10, 10, 10), font=font_large)
    draw.text((ka1_box[0] + 5, ka1_box[3] - 25), "RELAY", fill=(10, 10, 10), font=font_small)

    # 6. Rail 3 Terminal Strip X1 (Terminals 1 to 20)
    tb_start_x = 180
    tb_y = 650
    tb_w = 28
    tb_h = 90

    for i in range(1, 21):
        bx = tb_start_x + (i - 1) * (tb_w + 2)
        if i in [1, 2, 3]:
            tb_fill = (90, 95, 105)   # Phase Grey
        elif i in [4, 5]:
            tb_fill = (45, 115, 185)  # Neutral Blue
        elif i == 6:
            tb_fill = (120, 175, 45)  # PE Green/Yellow
        else:
            tb_fill = (140, 145, 155) # Control Grey

        draw.rectangle([bx, tb_y, bx + tb_w, tb_y + tb_h], fill=tb_fill, outline=(40, 45, 50), width=1)
        # Screw terminal dots
        draw.ellipse([bx + 8, tb_y + 10, bx + 20, tb_y + 22], fill=(220, 225, 230), outline=(20, 25, 30))
        draw.ellipse([bx + 8, tb_y + tb_h - 22, bx + 20, tb_y + tb_h - 10], fill=(220, 225, 230), outline=(20, 25, 30))
        # Terminal label
        draw.text((bx + 6, tb_y + 42), f"{i}", fill=(255, 255, 255), font=font_small)

    # 7. Wires and Ferrule Sleeves
    red_wire = (220, 45, 45)
    black_wire = (25, 25, 30)
    blue_wire = (35, 110, 215)
    dark_shadow_wire = (45, 35, 65)  # Dark shadow / purple tint for defect
    pe_wire = (120, 180, 40)

    # Feeder wires
    draw.line([360, 260, 360, 320], fill=red_wire, width=4)
    draw.line([500, 255, 500, 320], fill=red_wire, width=4)
    draw.line([220, 265, 220, 320], fill=blue_wire, width=3)

    # Wire to Terminal X1:14
    x1_14_x = tb_start_x + (14 - 1) * (tb_w + 2) + 14
    actual_wire_14_color = blue_wire if wire_14_color_type == "blue" else dark_shadow_wire
    draw.line([x1_14_x, 580, x1_14_x, tb_y + 16], fill=actual_wire_14_color, width=4)

    # Ferrule sleeve on Wire X1:14
    ferrule_14_box = [x1_14_x - 16, tb_y - 35, x1_14_x + 16, tb_y - 10]
    draw.rectangle(ferrule_14_box, fill=(245, 245, 240), outline=(60, 60, 60), width=1)
    draw.text((ferrule_14_box[0] + 3, ferrule_14_box[1] + 5), ferrule_14_text, fill=(10, 10, 10), font=font_small)

    # Ferrule sleeve on Wire X1:15 (Correct reference)
    x1_15_x = tb_start_x + (15 - 1) * (tb_w + 2) + 14
    draw.line([x1_15_x, 580, x1_15_x, tb_y + 16], fill=blue_wire, width=4)
    ferrule_15_box = [x1_15_x - 16, tb_y - 35, x1_15_x + 16, tb_y - 10]
    draw.rectangle(ferrule_15_box, fill=(245, 245, 240), outline=(60, 60, 60), width=1)
    draw.text((ferrule_15_box[0] + 3, ferrule_15_box[1] + 5), "X1:15", fill=(10, 10, 10), font=font_small)

    # 8. Title, Watermark & Nameplate Metadata
    # Top Benchmark Banner
    draw.rectangle([60, 60, width - 60, 85], fill=(15, 23, 42))
    draw.text((75, 67), f"EAGLE EYE BENCHMARK SPECIMEN — {specimen_badge}", fill=(56, 189, 248), font=font_small)
    draw.text((width - 320, 67), f"SPECIMEN ID: {cabinet_id}", fill=(243, 244, 246), font=font_small)

    # Cabinet Faceplate (Bottom right inside cabinet)
    nameplate_box = [width - 340, height - 85, width - 70, height - 55]
    draw.rectangle(nameplate_box, fill=(255, 255, 255), outline=(50, 50, 50), width=1)
    draw.text((nameplate_box[0] + 10, nameplate_box[1] + 4), f"{cabinet_id} | {status_label}", fill=(15, 23, 42), font=font_small)

    img.save(output_path, "JPEG", quality=95)
    return img


def create_dataset_ga_pdf(output_path: str, cabinet_id: str, rev: str, dwg_no: str, status_note: str):
    """Generates a genuine, readable vector General Arrangement PDF blueprint."""
    c = canvas.Canvas(output_path, pagesize=(842, 595))  # A4 Landscape
    width, height = 842, 595

    # Outer Sheet Border & Margin
    c.setStrokeColor(colors.HexColor("#1A202C"))
    c.setLineWidth(2)
    c.rect(30, 30, width - 60, height - 60)

    # Title Block Header
    c.setFillColor(colors.HexColor("#111827"))
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 65, f"GENERAL ARRANGEMENT — CONTROL CABINET {cabinet_id}")
    c.setFont("Helvetica", 9)
    c.drawString(50, height - 80, f"PROJECT: EAGLE EYE QC BENCHMARK | DWG NO: {dwg_no} | REV: {rev} | {status_note}")

    # Enclosure Boundary Outline
    c.setStrokeColor(colors.HexColor("#4B5563"))
    c.setLineWidth(1.5)
    c.rect(70, 70, 700, 420)

    # DIN Rails (Expected Physical Reference Layout)
    c.setStrokeColor(colors.HexColor("#9CA3AF"))
    c.setLineWidth(1)
    c.setDash(4, 2)
    # Rail 1
    c.line(100, 410, 740, 410)
    c.drawString(748, 407, "DIN 1")
    # Rail 2
    c.line(100, 280, 740, 280)
    c.drawString(748, 277, "DIN 2")
    # Rail 3
    c.line(100, 150, 740, 150)
    c.drawString(748, 147, "DIN 3")
    c.setDash()

    # Rail 1 Devices
    # PS1
    c.setFillColor(colors.HexColor("#E5E7EB"))
    c.setStrokeColor(colors.HexColor("#1F2937"))
    c.rect(120, 375, 80, 70, fill=1)
    c.setFillColor(colors.HexColor("#111827"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(145, 415, "PS1")
    c.setFont("Helvetica", 7)
    c.drawString(135, 395, "24VDC 10A")

    # QF1
    c.setFillColor(colors.HexColor("#E5E7EB"))
    c.rect(230, 380, 70, 60, fill=1)
    c.setFillColor(colors.HexColor("#111827"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(250, 415, "QF1")
    c.setFont("Helvetica", 7)
    c.drawString(245, 395, "3P 63A")

    # QF2
    c.setFillColor(colors.HexColor("#E5E7EB"))
    c.rect(330, 385, 50, 50, fill=1)
    c.setFillColor(colors.HexColor("#111827"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(342, 415, "QF2")
    c.setFont("Helvetica", 7)
    c.drawString(342, 395, "1P 16A")

    # QF3
    c.setFillColor(colors.HexColor("#E5E7EB"))
    c.rect(405, 385, 50, 50, fill=1)
    c.setFillColor(colors.HexColor("#111827"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(417, 415, "QF3")
    c.setFont("Helvetica", 7)
    c.drawString(417, 395, "1P 10A")

    # SPD1
    c.setFillColor(colors.HexColor("#E5E7EB"))
    c.rect(480, 380, 50, 60, fill=1)
    c.setFillColor(colors.HexColor("#111827"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(490, 415, "SPD1")

    # Rail 2 Devices
    # PLC1
    c.setFillColor(colors.HexColor("#E5E7EB"))
    c.rect(120, 245, 130, 70, fill=1)
    c.setFillColor(colors.HexColor("#111827"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(160, 285, "PLC1")
    c.setFont("Helvetica", 7)
    c.drawString(145, 265, "SIMATIC S7-1200")

    # K1 (Designated slot at X=300 to 365)
    c.setFillColor(colors.HexColor("#D1FAE5"))
    c.setStrokeColor(colors.HexColor("#059669"))
    c.rect(300, 250, 65, 60, fill=1)
    c.setFillColor(colors.HexColor("#065F46"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(320, 285, "K1")
    c.setFont("Helvetica", 7)
    c.drawString(308, 265, "SLOT 2 (25A)")

    # K2 (Slot 3)
    c.setFillColor(colors.HexColor("#E5E7EB"))
    c.setStrokeColor(colors.HexColor("#1F2937"))
    c.rect(390, 250, 65, 60, fill=1)
    c.setFillColor(colors.HexColor("#111827"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(410, 285, "K2")
    c.setFont("Helvetica", 7)
    c.drawString(398, 265, "SLOT 3 (25A)")

    # KA1 (Slot 4)
    c.setFillColor(colors.HexColor("#E5E7EB"))
    c.rect(480, 250, 40, 60, fill=1)
    c.setFillColor(colors.HexColor("#111827"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(490, 285, "KA1")

    # Rail 3 Terminal Strip X1
    c.setFillColor(colors.HexColor("#F3F4F6"))
    c.rect(120, 125, 450, 50, fill=1)
    c.setFillColor(colors.HexColor("#111827"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(140, 145, "TERMINAL STRIP X1 (20 POLES: 1..20)")

    # Engineering Title Block (Bottom Right)
    c.setStrokeColor(colors.HexColor("#1F2937"))
    c.rect(width - 250, 30, 220, 80)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(width - 240, 95, "EAGLE EYE QUALITY SPECIFICATION")
    c.setFont("Helvetica", 7)
    c.drawString(width - 240, 80, f"CABINET ID: {cabinet_id}")
    c.drawString(width - 240, 65, "STANDARD: IEC 61439-1 / 61439-2")
    c.drawString(width - 240, 50, f"DRAWING REV: {rev} | DATE: 2026-10-16")
    c.drawString(width - 240, 38, "BENCHMARK TEST DATASET SPECIMEN")

    c.save()


def create_dataset_wiring_excel(output_path: str, cabinet_id: str, rev: str):
    """Creates a multi-sheet, fully populated Excel wiring schedule and BOM."""
    wb = openpyxl.Workbook()

    # Sheet 1: Wiring Schedule
    ws1 = wb.active
    ws1.title = "Wiring_Schedule"

    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="1F2937", end_color="1F2937", fill_type="solid")
    border_thin = Border(
        left=Side(style='thin', color='D1D5DB'),
        right=Side(style='thin', color='D1D5DB'),
        top=Side(style='thin', color='D1D5DB'),
        bottom=Side(style='thin', color='D1D5DB')
    )

    headers = [
        "Wire_Tag", "Source_Device", "Source_Terminal", "Dest_Device",
        "Dest_Terminal", "Expected_Color", "Wire_Gauge_mm2", "Ferrule_ID", "Signal_Type", "Remarks"
    ]
    ws1.append(headers)

    for col_idx in range(1, len(headers) + 1):
        cell = ws1.cell(row=1, column=col_idx)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center", vertical="center")

    schedule_rows = [
        ["W-101", "QF1", "L1_OUT", "QF2", "L_IN", "Black", "2.5", "QF1:L1", "AC Power", f"{cabinet_id} Phase 1 feed"],
        ["W-102", "QF1", "L2_OUT", "QF3", "L_IN", "Black", "2.5", "QF1:L2", "AC Power", f"{cabinet_id} Phase 2 feed"],
        ["W-103", "QF2", "L_OUT", "PS1", "L", "Black", "1.5", "PS1:L", "AC Power", "Power supply AC input"],
        ["W-104", "QF2", "N_OUT", "PS1", "N", "Light Blue", "1.5", "PS1:N", "AC Neutral", "Power supply AC neutral"],
        ["W-105", "PS1", "+24V", "PLC1", "L+", "Red", "1.5", "PLC1:24V", "DC 24V", "PLC main power feed"],
        ["W-106", "PS1", "0V", "PLC1", "M", "Dark Blue", "1.5", "PLC1:0V", "DC Ground", "PLC return ground"],
        ["W-107", "PLC1", "DO_0", "K1", "A1", "Dark Blue", "0.75", "K1:A1", "Control", "Motor 1 contactor coil"],
        ["W-108", "K1", "A2", "X1", "14", "Blue", "0.75", "X1:14", "Control", "Motor 1 return to terminal X1:14"],
        ["W-109", "PLC1", "DO_1", "K2", "A1", "Dark Blue", "0.75", "K2:A1", "Control", "Motor 2 contactor coil"],
        ["W-110", "K2", "A2", "X1", "15", "Blue", "0.75", "X1:15", "Control", "Motor 2 return to terminal X1:15"],
        ["W-111", "KA1", "13", "PLC1", "DI_0", "White", "0.75", "KA1:13", "Safety", "Emergency stop monitoring"],
        ["W-112", "KA1", "14", "X1", "18", "White", "0.75", "X1:18", "Safety", "Emergency stop circuit return"],
        ["W-113", "QF1", "PE", "X1", "6", "Green-Yellow", "4.0", "PE:X1-6", "Ground", "Chassis protective ground"],
        ["W-114", "SPD1", "PE", "X1", "6", "Green-Yellow", "4.0", "SPD:PE", "Ground", "Surge protective discharge"]
    ]

    for row in schedule_rows:
        ws1.append(row)

    for r in range(2, len(schedule_rows) + 2):
        for c in range(1, len(headers) + 1):
            cell = ws1.cell(row=r, column=c)
            cell.border = border_thin
            cell.alignment = Alignment(horizontal="left", vertical="center")

    # Sheet 2: BOM List
    ws2 = wb.create_sheet(title="BOM_List")
    bom_headers = ["Reference_Tag", "Component_Type", "Manufacturer", "Part_Number", "Rail_Designation", "Qty"]
    ws2.append(bom_headers)
    for col_idx in range(1, len(bom_headers) + 1):
        cell = ws2.cell(row=1, column=col_idx)
        cell.font = header_font
        cell.fill = header_fill

    bom_rows = [
        ["PS1", "Power Supply 24VDC 10A", "Phoenix Contact", "TRIO-PS-2G/1AC/24DC/10", "DIN 1", 1],
        ["QF1", "Main Circuit Breaker 3P 63A", "Schneider Electric", "A9F74363", "DIN 1", 1],
        ["QF2", "Miniature Circuit Breaker 1P 16A", "Schneider Electric", "A9F74116", "DIN 1", 1],
        ["QF3", "Miniature Circuit Breaker 1P 10A", "Schneider Electric", "A9F74110", "DIN 1", 1],
        ["SPD1", "Surge Protector Type 2 40kA", "DEHN", "952070", "DIN 1", 1],
        ["PLC1", "PLC CPU 1214C DC/DC/DC", "Siemens", "6ES7214-1AG40-0XB0", "DIN 2", 1],
        ["K1", "Motor Contactor 25A 24VDC", "Siemens", "3RT2026-1BB40", "DIN 2", 1],
        ["K2", "Motor Contactor 25A 24VDC", "Siemens", "3RT2026-1BB40", "DIN 2", 1],
        ["KA1", "Safety Relay Module", "Pilz", "PNOZ s4 24VDC", "DIN 2", 1],
        ["X1", "Terminal Block Strip 20P", "Weidmuller", "WDU 2.5", "DIN 3", 20]
    ]
    for row in bom_rows:
        ws2.append(row)

    for r in range(2, len(bom_rows) + 2):
        for c in range(1, len(bom_headers) + 1):
            cell = ws2.cell(row=r, column=c)
            cell.border = border_thin
            cell.alignment = Alignment(horizontal="left", vertical="center")

    # Sheet 3: Terminal_Plan
    ws3 = wb.create_sheet(title="Terminal_Plan")
    term_headers = ["Terminal_Strip", "Terminal_No", "Function_Designation", "Wire_Connected", "Signal_Level", "Wire_Color"]
    ws3.append(term_headers)
    for col_idx in range(1, len(term_headers) + 1):
        cell = ws3.cell(row=1, column=col_idx)
        cell.font = header_font
        cell.fill = header_fill

    term_rows = [
        ["X1", "1", "Main Phase L1 Infeed", "W-101", "400VAC", "Black"],
        ["X1", "2", "Main Phase L2 Infeed", "W-102", "400VAC", "Black"],
        ["X1", "3", "Main Phase L3 Infeed", "W-100", "400VAC", "Black"],
        ["X1", "4", "System Neutral Return", "W-104", "0VAC", "Light Blue"],
        ["X1", "5", "Aux Neutral Return", "W-104B", "0VAC", "Light Blue"],
        ["X1", "6", "Protective Earth Bond", "W-113", "PE", "Green-Yellow"],
        ["X1", "14", "Motor 1 Contactor K1 Return", "W-108", "0VDC", "Blue"],
        ["X1", "15", "Motor 2 Contactor K2 Return", "W-110", "0VDC", "Blue"],
        ["X1", "18", "Emergency Stop Return", "W-112", "24VDC", "White"],
    ]
    for row in term_rows:
        ws3.append(row)

    wb.save(output_path)


def generate_all_datasets():
    # -------------------------------------------------------------
    # Dataset 1: test_cabinet_001 (Correct Assembly)
    # -------------------------------------------------------------
    dir_001 = os.path.join(BASE_OUTPUT_DIR, "test_cabinet_001")
    os.makedirs(dir_001, exist_ok=True)
    print("Generating Dataset 1 (EAGLE-DEMO-001)...")

    # Photo: 100% compliant assembly
    render_cabinet_graphic(
        output_path=os.path.join(dir_001, "cabinet_photo.jpg"),
        cabinet_id="EAGLE-DEMO-001",
        specimen_badge="CORRECT ASSEMBLY (KNOWN GOOD)",
        status_label="100% COMPLIANT",
        k1_position_slot=2,
        qf2_text="QF2",
        ferrule_14_text="X1:14",
        wire_14_color_type="blue"
    )

    # GA Drawing
    create_dataset_ga_pdf(
        output_path=os.path.join(dir_001, "ga_drawing.pdf"),
        cabinet_id="EAGLE-DEMO-001",
        rev="Rev A",
        dwg_no="GA-DEMO-001-A",
        status_note="APPROVED BASELINE DRAWING"
    )

    # Wiring Schedule Excel
    create_dataset_wiring_excel(
        output_path=os.path.join(dir_001, "wiring_schedule.xlsx"),
        cabinet_id="EAGLE-DEMO-001",
        rev="Rev A"
    )

    # README
    with open(os.path.join(dir_001, "README.md"), "w") as f:
        f.write("""# EAGLE EYE Benchmark Dataset 1 — Correct Cabinet Assembly

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
""")

    # -------------------------------------------------------------
    # Dataset 2: test_cabinet_002 (Known Documented Defects)
    # -------------------------------------------------------------
    dir_002 = os.path.join(BASE_OUTPUT_DIR, "test_cabinet_002")
    os.makedirs(dir_002, exist_ok=True)
    print("Generating Dataset 2 (EAGLE-DEMO-002)...")

    # Photo: Contains 4 documented discrepancies
    render_cabinet_graphic(
        output_path=os.path.join(dir_002, "cabinet_photo.jpg"),
        cabinet_id="EAGLE-DEMO-002",
        specimen_badge="DEFECT BENCHMARK (4 DOCUMENTED ANOMALIES)",
        status_label="DEFECTS ACTIVE",
        k1_position_slot=5,         # Defect 1: Misplaced K1 at Slot 5 instead of Slot 2
        qf2_text="QFZ",             # Defect 2: Mislabeled QF2 as QFZ
        ferrule_14_text="X1:41",    # Defect 3: Reversed ferrule X1:41 instead of X1:14
        wire_14_color_type="dark_shadow" # Defect 4: Dark shadow / incorrect hue
    )

    # GA Drawing (Designates correct locations)
    create_dataset_ga_pdf(
        output_path=os.path.join(dir_002, "ga_drawing.pdf"),
        cabinet_id="EAGLE-DEMO-002",
        rev="Rev A",
        dwg_no="GA-DEMO-002-A",
        status_note="REFERENCE BLUEPRINT (REQUIRED POSITIONING)"
    )

    # Wiring Schedule Excel
    create_dataset_wiring_excel(
        output_path=os.path.join(dir_002, "wiring_schedule.xlsx"),
        cabinet_id="EAGLE-DEMO-002",
        rev="Rev A"
    )

    # README
    with open(os.path.join(dir_002, "README.md"), "w") as f:
        f.write("""# EAGLE EYE Benchmark Dataset 2 — Cabinet with Known Documented Defects

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
""")

    # -------------------------------------------------------------
    # Dataset 3: test_cabinet_003 (Reinspection Before & After)
    # -------------------------------------------------------------
    dir_003 = os.path.join(BASE_OUTPUT_DIR, "test_cabinet_003")
    os.makedirs(dir_003, exist_ok=True)
    print("Generating Dataset 3 (EAGLE-DEMO-003)...")

    # Photo Before: Defective state
    render_cabinet_graphic(
        output_path=os.path.join(dir_003, "cabinet_photo_before.jpg"),
        cabinet_id="EAGLE-DEMO-003",
        specimen_badge="REINSPECTION BENCHMARK [STAGE 1: PRE-REPAIR]",
        status_label="DEFECTIVE (PRE-REWORK)",
        k1_position_slot=5,         # K1 in Slot 5 (Defect)
        qf2_text="QFZ",             # Breaker label error (Defect)
        ferrule_14_text="X1:41",    # Ferrule reversed (Defect)
        wire_14_color_type="dark_shadow"
    )

    # Photo After: Resolved state
    render_cabinet_graphic(
        output_path=os.path.join(dir_003, "cabinet_photo_after.jpg"),
        cabinet_id="EAGLE-DEMO-003",
        specimen_badge="REINSPECTION BENCHMARK [STAGE 2: POST-REPAIR]",
        status_label="VERIFIED & CLOSED",
        k1_position_slot=2,         # K1 remounted to Slot 2 (Resolved)
        qf2_text="QF2",             # Breaker label corrected (Resolved)
        ferrule_14_text="X1:14",    # Ferrule sleeve corrected (Resolved)
        wire_14_color_type="blue"
    )

    # GA Drawing
    create_dataset_ga_pdf(
        output_path=os.path.join(dir_003, "ga_drawing.pdf"),
        cabinet_id="EAGLE-DEMO-003",
        rev="Rev B",
        dwg_no="GA-DEMO-003-B",
        status_note="FINAL QUALITY BASELINE DRAWING"
    )

    # Wiring Schedule Excel
    create_dataset_wiring_excel(
        output_path=os.path.join(dir_003, "wiring_schedule.xlsx"),
        cabinet_id="EAGLE-DEMO-003",
        rev="Rev B"
    )

    # README
    with open(os.path.join(dir_003, "README.md"), "w") as f:
        f.write("""# EAGLE EYE Benchmark Dataset 3 — Cabinet Reinspection Scenario

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
""")

    print("All 3 datasets successfully generated under data/demo/!")


if __name__ == "__main__":
    generate_all_datasets()
