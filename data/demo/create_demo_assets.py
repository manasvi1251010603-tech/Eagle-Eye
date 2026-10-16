"""
Generates realistic demo assets for EAGLE EYE:
1. cabinet_sample_01.jpg (Control cabinet with intentional defects: misplaced contactor K1, mislabeled breaker QF2, reversed ferrule X1:14)
2. cabinet_sample_01_repaired.jpg (Post-repair cabinet with resolved contactor K1 and corrected ferrule tag)
3. GA_Drawing_Cabinet_RevC.pdf (Vector technical drawing of control cabinet layout)
4. Wiring_Schedule_RevC.xlsx (Excel wiring schedule with multi-column schedule and BOM)
5. Evidence close-up crops for flagged defects
"""

import os
from PIL import Image, ImageDraw, ImageFont
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors


def ensure_dirs(base_dir: str):
    os.makedirs(os.path.join(base_dir, "crops"), exist_ok=True)


def create_cabinet_image(output_path: str, is_repaired: bool = False):
    # Dimensions: 1200 x 900
    width, height = 1200, 900
    img = Image.new("RGB", (width, height), color=(26, 32, 40))
    draw = ImageDraw.Draw(img)

    # 1. Cabinet Enclosure Outer Frame (RAL 7035 Light Grey)
    draw.rectangle([40, 40, width - 40, height - 40], fill=(210, 215, 222), outline=(140, 148, 158), width=8)
    # Inner mounting plate (Zinc-plated galvanized metal look)
    draw.rectangle([60, 60, width - 60, height - 60], fill=(185, 192, 201), outline=(130, 138, 148), width=3)

    # Grid texture on backplate
    for x in range(80, width - 80, 50):
        draw.line([x, 70, x, height - 70], fill=(175, 182, 191), width=1)
    for y in range(80, height - 80, 50):
        draw.line([70, y, width - 70, y], fill=(175, 182, 191), width=1)

    # 2. Wire Ducts (Grey slotted trunking)
    duct_color = (130, 138, 145)
    duct_slot = (100, 108, 115)

    def draw_duct_horizontal(y, h=40):
        draw.rectangle([80, y, width - 80, y + h], fill=duct_color, outline=(90, 98, 105), width=2)
        for sx in range(90, width - 90, 15):
            draw.line([sx, y + 5, sx, y + h - 5], fill=duct_slot, width=3)

    def draw_duct_vertical(x, w=40):
        draw.rectangle([x, 90, x + w, height - 90], fill=duct_color, outline=(90, 98, 105), width=2)
        for sy in range(100, height - 100, 15):
            draw.line([x + 5, sy, x + w - 5, sy], fill=duct_slot, width=3)

    # Left, Right, Center Vertical Ducts
    draw_duct_vertical(80, 40)
    draw_duct_vertical(width - 120, 40)
    # Horizontal Ducts
    draw_duct_horizontal(90, 36)
    draw_duct_horizontal(320, 36)
    draw_duct_horizontal(580, 36)
    draw_duct_horizontal(810, 36)

    # 3. DIN Rails (Metallic slotted rails)
    din_rail_color = (225, 230, 236)
    din_rail_shadow = (160, 168, 178)

    def draw_din_rail(y):
        draw.rectangle([130, y, width - 130, y + 25], fill=din_rail_color, outline=din_rail_shadow, width=2)
        for rx in range(150, width - 150, 40):
            draw.rectangle([rx, y + 7, rx + 15, y + 18], fill=(140, 148, 158))

    rail_1_y = 190  # Rail 1: Power supply & Main breakers
    rail_2_y = 440  # Rail 2: PLC & Contactors
    rail_3_y = 690  # Rail 3: Terminal strip

    draw_din_rail(rail_1_y)
    draw_din_rail(rail_2_y)
    draw_din_rail(rail_3_y)

    # Font handling
    try:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    except Exception:
        font_large = None
        font_small = None

    # 4. Components on Rail 1
    # 4.1 Power Supply 24VDC (PS1)
    ps1_box = [160, 140, 290, 265]
    draw.rectangle(ps1_box, fill=(45, 52, 60), outline=(20, 25, 30), width=3)
    draw.rectangle([175, 155, 275, 195], fill=(30, 35, 42))  # vent
    draw.text((180, 210), "PS1 (24V 10A)", fill=(240, 245, 255), font=font_large)
    draw.text((180, 230), "STATUS: OK", fill=(50, 205, 50), font=font_small)

    # 4.2 Main 3-Phase Breaker (QF1)
    qf1_box = [320, 145, 430, 260]
    draw.rectangle(qf1_box, fill=(245, 245, 248), outline=(100, 105, 112), width=2)
    draw.rectangle([340, 180, 410, 220], fill=(20, 20, 20))  # toggle handle
    draw.text((345, 155), "QF1 (63A)", fill=(10, 10, 10), font=font_large)
    draw.text((345, 235), "MAIN FEED", fill=(180, 20, 20), font=font_small)

    # 4.3 Branch Breaker 1 (QF2) - Label error if not repaired ("QFZ" instead of "QF2")
    qf2_box = [460, 150, 540, 255]
    draw.rectangle(qf2_box, fill=(245, 245, 248), outline=(100, 105, 112), width=2)
    draw.rectangle([485, 185, 515, 215], fill=(20, 20, 20))
    qf2_label = "QF2" if is_repaired else "QFZ"  # Label Defect in demo!
    draw.text((475, 155), qf2_label, fill=(10, 10, 10), font=font_large)
    draw.text((475, 230), "16A-C", fill=(60, 60, 60), font=font_small)

    # 4.4 Branch Breaker 2 (QF3)
    qf3_box = [560, 150, 640, 255]
    draw.rectangle(qf3_box, fill=(245, 245, 248), outline=(100, 105, 112), width=2)
    draw.rectangle([585, 185, 615, 215], fill=(20, 20, 20))
    draw.text((575, 155), "QF3", fill=(10, 10, 10), font=font_large)
    draw.text((575, 230), "10A-C", fill=(60, 60, 60), font=font_small)

    # 4.5 Surge Protective Device (SPD1)
    spd_box = [670, 145, 750, 260]
    draw.rectangle(spd_box, fill=(220, 40, 40), outline=(120, 20, 20), width=2)
    draw.text((680, 160), "SPD1", fill=(255, 255, 255), font=font_large)
    draw.text((680, 230), "T2 40kA", fill=(255, 255, 255), font=font_small)

    # 5. Components on Rail 2
    # 5.1 PLC CPU (PLC1)
    plc_box = [160, 390, 360, 510]
    draw.rectangle(plc_box, fill=(50, 58, 68), outline=(20, 25, 30), width=3)
    draw.rectangle([180, 405, 340, 440], fill=(15, 20, 25))  # display
    draw.text((190, 415), "CPU 1214C DC/DC/DC", fill=(50, 255, 150), font=font_small)
    draw.text((180, 460), "PLC1 - SIMATIC", fill=(240, 240, 245), font=font_large)
    # Status LEDs
    draw.ellipse([180, 485, 190, 495], fill=(50, 220, 50))  # RUN
    draw.ellipse([200, 485, 210, 495], fill=(220, 180, 20))  # MAINT
    draw.ellipse([220, 485, 230, 495], fill=(80, 80, 80))   # ERROR

    # 5.2 Contactor 1 (K1) - Misplaced if not repaired!
    # Expected position: [420, 400, 520, 500].
    # If not repaired: shifted to [740, 400, 840, 500] (Misplaced component defect!)
    if is_repaired:
        k1_box = [420, 400, 520, 500]
    else:
        k1_box = [740, 400, 840, 500]  # Misplaced!

    draw.rectangle(k1_box, fill=(235, 238, 242), outline=(70, 75, 82), width=3)
    draw.rectangle([k1_box[0] + 15, k1_box[1] + 30, k1_box[2] - 15, k1_box[3] - 30], fill=(20, 25, 30))
    draw.text((k1_box[0] + 25, k1_box[1] + 10), "K1 (25A)", fill=(10, 10, 10), font=font_large)
    draw.text((k1_box[0] + 20, k1_box[3] - 22), "COIL 24VDC", fill=(180, 30, 30), font=font_small)

    # 5.3 Contactor 2 (K2)
    k2_box = [540, 400, 640, 500]
    draw.rectangle(k2_box, fill=(235, 238, 242), outline=(70, 75, 82), width=3)
    draw.rectangle([k2_box[0] + 15, k2_box[1] + 30, k2_box[2] - 15, k2_box[3] - 30], fill=(20, 25, 30))
    draw.text((k2_box[0] + 25, k2_box[1] + 10), "K2 (25A)", fill=(10, 10, 10), font=font_large)
    draw.text((k2_box[0] + 20, k2_box[3] - 22), "COIL 24VDC", fill=(180, 30, 30), font=font_small)

    # 5.4 Safety Relay (KA1)
    ka1_box = [660, 400, 720, 500]
    draw.rectangle(ka1_box, fill=(230, 190, 40), outline=(130, 100, 20), width=2)
    draw.text((ka1_box[0] + 10, ka1_box[1] + 15), "KA1", fill=(10, 10, 10), font=font_large)
    draw.text((ka1_box[0] + 5, ka1_box[3] - 25), "RELAY", fill=(10, 10, 10), font=font_small)

    # 6. Components on Rail 3 (Terminal blocks X1:1 to X1:20)
    tb_start_x = 180
    tb_y = 650
    tb_w = 28
    tb_h = 90

    for i in range(1, 21):
        bx = tb_start_x + (i - 1) * (tb_w + 2)
        # Alternate grey, blue, earth green-yellow
        if i in [1, 2, 3]:
            tb_fill = (90, 95, 105)  # Phase grey
        elif i in [4, 5]:
            tb_fill = (45, 115, 185)  # Neutral blue
        elif i == 6:
            tb_fill = (120, 175, 45)  # PE Green/Yellow
        else:
            tb_fill = (140, 145, 155)

        draw.rectangle([bx, tb_y, bx + tb_w, tb_y + tb_h], fill=tb_fill, outline=(40, 45, 50), width=1)
        # Screw terminal dots
        draw.ellipse([bx + 8, tb_y + 10, bx + 20, tb_y + 22], fill=(220, 225, 230), outline=(20, 25, 30))
        draw.ellipse([bx + 8, tb_y + tb_h - 22, bx + 20, tb_y + tb_h - 10], fill=(220, 225, 230), outline=(20, 25, 30))

        # Terminal number marking
        draw.text((bx + 6, tb_y + 42), f"{i}", fill=(255, 255, 255), font=font_small)

    # 7. Wires and Ferrule sleeves
    # Wire colors
    red_wire = (220, 45, 45)
    black_wire = (25, 25, 30)
    blue_wire = (35, 110, 215)
    dark_blue_shadow = (20, 50, 100)
    green_yellow = (120, 180, 40)

    # Draw wire bundles from duct to terminals
    # Wire 1: QF1 to X1:1 (Red)
    draw.line([360, 260, 360, 320], fill=red_wire, width=4)
    # Wire 2: QF2 to K1 (Red)
    draw.line([500, 255, 500, 320], fill=red_wire, width=4)
    # Wire 3: PS1 to PLC1 (Blue / White-Blue)
    draw.line([220, 265, 220, 320], fill=blue_wire, width=3)

    # Wire to Terminal X1:14
    # Expected wire colour: BLUE.
    # We will simulate visible wire leading into X1:14
    x1_14_x = tb_start_x + (14 - 1) * (tb_w + 2) + 14
    draw.line([x1_14_x, 580, x1_14_x, tb_y + 16], fill=dark_blue_shadow, width=4)

    # Ferrule sleeve on wire X1:14
    # Expected tag: "X1:14".
    # If not repaired: ferrule reads "X1:41" (reversed text defect!)
    # If repaired: reads "X1:14"
    ferrule_text = "X1:14" if is_repaired else "X1:41"
    ferrule_box = [x1_14_x - 16, tb_y - 35, x1_14_x + 16, tb_y - 10]
    draw.rectangle(ferrule_box, fill=(245, 245, 240), outline=(60, 60, 60), width=1)
    draw.text((ferrule_box[0] + 2, ferrule_box[1] + 5), ferrule_text, fill=(10, 10, 10), font=font_small)

    # Ferrule sleeve on wire X1:15 (PASS ferrule)
    x1_15_x = tb_start_x + (15 - 1) * (tb_w + 2) + 14
    draw.line([x1_15_x, 580, x1_15_x, tb_y + 16], fill=blue_wire, width=4)
    draw.rectangle([x1_15_x - 16, tb_y - 35, x1_15_x + 16, tb_y - 10], fill=(245, 245, 240), outline=(60, 60, 60), width=1)
    draw.text((x1_15_x - 14, tb_y - 30), "X1:15", fill=(10, 10, 10), font=font_small)

    # 8. Cabinet Nameplate / Barcode tag top-right
    draw.rectangle([width - 320, 55, width - 130, 85], fill=(255, 255, 255), outline=(50, 50, 50), width=1)
    draw.text((width - 310, 62), "EAGLE-EYE CAB-4092 REV:C", fill=(10, 10, 10), font=font_small)

    img.save(output_path, "JPEG", quality=95)
    return img


def create_evidence_crops(cabinet_img: Image.Image, output_dir: str):
    """Crops regions corresponding to the 4 key sample findings for micro-review."""
    crops_info = {
        "crop_contactor_k1.jpg": (720, 380, 860, 520),    # Misplaced contactor
        "crop_contactor_k1_repaired.jpg": (400, 380, 540, 520),  # Corrected contactor
        "crop_breaker_qf2.jpg": (440, 130, 560, 270),     # Breaker label mismatch
        "crop_ferrule_x1_14.jpg": (560, 590, 640, 680),   # Ferrule text mismatch
        "crop_wire_color_x1_14.jpg": (560, 560, 640, 660) # Wire color under shadow
    }

    for filename, box in crops_info.items():
        crop = cabinet_img.crop(box)
        crop.save(os.path.join(output_dir, filename), "JPEG", quality=95)


def create_ga_pdf(output_path: str):
    """Generates vector General Arrangement PDF reference drawing."""
    c = canvas.Canvas(output_path, pagesize=(842, 595))  # A4 Landscape
    width, height = 842, 595

    # Title Block Outer Border
    c.setStrokeColor(colors.HexColor("#1A202C"))
    c.setLineWidth(2)
    c.rect(30, 30, width - 60, height - 60)

    # Title Block Header
    c.setFillColor(colors.HexColor("#111827"))
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 65, "GENERAL ARRANGEMENT — CONTROL CABINET CAB-4092")
    c.setFont("Helvetica", 9)
    c.drawString(50, height - 80, "PROJECT: WATER PURIFICATION PLANT MCC-01 | DWG NO: GA-CAB-4092-C | REV: C")

    # Cabinet Enclosure Outline
    c.setStrokeColor(colors.HexColor("#4B5563"))
    c.setLineWidth(1.5)
    c.rect(70, 70, 700, 420)

    # DIN Rails (Expected Physical Layout)
    c.setStrokeColor(colors.HexColor("#9CA3AF"))
    c.setLineWidth(1)
    c.setDash(4, 2)
    # Rail 1
    c.line(100, 410, 740, 410)
    c.drawString(750, 408, "DIN 1")
    # Rail 2
    c.line(100, 280, 740, 280)
    c.drawString(750, 278, "DIN 2")
    # Rail 3
    c.line(100, 150, 740, 150)
    c.drawString(750, 148, "DIN 3")
    c.setDash()  # Reset dash

    # Rail 1 Expected Devices
    c.setFillColor(colors.HexColor("#E5E7EB"))
    c.setStrokeColor(colors.HexColor("#1F2937"))
    # PS1
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

    # Rail 2 Expected Devices
    # PLC1
    c.setFillColor(colors.HexColor("#E5E7EB"))
    c.rect(120, 245, 130, 70, fill=1)
    c.setFillColor(colors.HexColor("#111827"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(160, 285, "PLC1")
    c.setFont("Helvetica", 7)
    c.drawString(145, 265, "SIMATIC S7-1200")

    # K1 - EXPECTED AT X=300 to 360 (On Rail 2)
    c.setFillColor(colors.HexColor("#D1FAE5"))
    c.setStrokeColor(colors.HexColor("#059669"))
    c.rect(300, 250, 65, 60, fill=1)
    c.setFillColor(colors.HexColor("#065F46"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(320, 285, "K1")
    c.setFont("Helvetica", 7)
    c.drawString(310, 265, "CONTACTOR 25A")

    # K2
    c.setFillColor(colors.HexColor("#E5E7EB"))
    c.setStrokeColor(colors.HexColor("#1F2937"))
    c.rect(390, 250, 65, 60, fill=1)
    c.setFillColor(colors.HexColor("#111827"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(410, 285, "K2")
    c.setFont("Helvetica", 7)
    c.drawString(400, 265, "CONTACTOR 25A")

    # KA1
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
    c.drawString(140, 145, "TERMINAL STRIP X1 (TERMINALS 1 THROUGH 20)")

    # Title Block Bottom Right
    c.setStrokeColor(colors.HexColor("#1F2937"))
    c.rect(width - 250, 30, 220, 80)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(width - 240, 95, "ENGINEERING SPECIFICATION")
    c.setFont("Helvetica", 7)
    c.drawString(width - 240, 80, "APPROVED BY: Chief Electrical Eng.")
    c.drawString(width - 240, 65, "TOLERANCES: DIN EN 61439-1 / 2")
    c.drawString(width - 240, 50, "DATE: 2026-10-12 | SHEET 1 OF 1")
    c.drawString(width - 240, 38, "CONFIDENTIAL INDUSTRIAL REFERENCE")

    c.save()


def create_wiring_schedule_excel(output_path: str):
    """Creates a multi-sheet Excel wiring schedule workbook with realistic column structures."""
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
        ["W-101", "QF1", "L1_OUT", "QF2", "L_IN", "Black", "2.5", "QF1:L1", "AC Power", "Phase feed 1"],
        ["W-102", "QF1", "L2_OUT", "QF3", "L_IN", "Black", "2.5", "QF1:L2", "AC Power", "Phase feed 2"],
        ["W-103", "QF2", "L_OUT", "PS1", "L", "Black", "1.5", "PS1:L", "AC Power", "Power supply input"],
        ["W-104", "QF2", "N_OUT", "PS1", "N", "Light Blue", "1.5", "PS1:N", "AC Neutral", "Power supply neutral"],
        ["W-105", "PS1", "+24V", "PLC1", "L+", "Red", "1.5", "PLC1:24V", "DC 24V", "PLC primary power"],
        ["W-106", "PS1", "0V", "PLC1", "M", "Dark Blue", "1.5", "PLC1:0V", "DC Ground", "PLC return ground"],
        ["W-107", "PLC1", "DO_0", "K1", "A1", "Dark Blue", "0.75", "K1:A1", "Control", "Motor 1 Run Command"],
        ["W-108", "K1", "A2", "X1", "14", "Blue", "0.75", "X1:14", "Control", "Contactor K1 Return terminal"],
        ["W-109", "PLC1", "DO_1", "K2", "A1", "Dark Blue", "0.75", "K2:A1", "Control", "Motor 2 Run Command"],
        ["W-110", "K2", "A2", "X1", "15", "Blue", "0.75", "X1:15", "Control", "Contactor K2 Return terminal"],
        ["W-111", "KA1", "13", "PLC1", "DI_0", "White", "0.75", "KA1:13", "Safety", "Emergency Stop Loop"],
        ["W-112", "KA1", "14", "X1", "18", "White", "0.75", "X1:18", "Safety", "E-Stop Return terminal"],
        ["W-113", "QF1", "PE", "X1", "6", "Green-Yellow", "4.0", "PE:X1-6", "Ground", "Chassis Earth Bond"],
        ["W-114", "SPD1", "PE", "X1", "6", "Green-Yellow", "4.0", "SPD:PE", "Ground", "Surge Earth Discharge"]
    ]

    for row in schedule_rows:
        ws1.append(row)

    # Style data rows
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

    wb.save(output_path)


def main():
    base_dir = "/Users/manasvilomate/.gemini/antigravity/scratch/eagle-eye/data/demo"
    ensure_dirs(base_dir)

    print("Generating cabinet_sample_01.jpg...")
    cab_img = create_cabinet_image(os.path.join(base_dir, "cabinet_sample_01.jpg"), is_repaired=False)

    print("Generating cabinet_sample_01_repaired.jpg...")
    create_cabinet_image(os.path.join(base_dir, "cabinet_sample_01_repaired.jpg"), is_repaired=True)

    print("Generating evidence close-up crops...")
    create_evidence_crops(cab_img, os.path.join(base_dir, "crops"))

    print("Generating GA_Drawing_Cabinet_RevC.pdf...")
    create_ga_pdf(os.path.join(base_dir, "GA_Drawing_Cabinet_RevC.pdf"))

    print("Generating Wiring_Schedule_RevC.xlsx...")
    create_wiring_schedule_excel(os.path.join(base_dir, "Wiring_Schedule_RevC.xlsx"))

    print("Demo assets generation complete!")


if __name__ == "__main__":
    main()
