import os
import datetime
from typing import List, Dict, Any
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether
)
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from app.config import BASE_DIR, REPORTS_DIR
from app.models.models import InspectionSession, InspectionFinding


def generate_pdf_report(session: InspectionSession, findings: List[InspectionFinding]) -> str:
    """
    Generates a professional, industrial-grade quality control PDF report.
    Returns relative path to the generated PDF report.
    """
    timestamp_str = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"QC_Report_{session.cabinet_id}_{timestamp_str}.pdf"
    full_path = os.path.join(REPORTS_DIR, filename)

    doc = SimpleDocTemplate(
        full_path,
        pagesize=landscape(letter),
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=20,
        textColor=colors.HexColor("#0B0F12")
    )
    subtitle_style = ParagraphStyle(
        "SubtitleStyle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#10B981")
    )
    body_style = ParagraphStyle(
        "BodyStyle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#1F2937")
    )
    header_label_style = ParagraphStyle(
        "HeaderLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#374151")
    )
    badge_pass = ParagraphStyle("BadgePass", fontName="Helvetica-Bold", fontSize=8, textColor=colors.HexColor("#065F46"))
    badge_fail = ParagraphStyle("BadgeFail", fontName="Helvetica-Bold", fontSize=8, textColor=colors.HexColor("#991B1B"))
    badge_review = ParagraphStyle("BadgeReview", fontName="Helvetica-Bold", fontSize=8, textColor=colors.HexColor("#92400E"))
    badge_not_checked = ParagraphStyle("BadgeNC", fontName="Helvetica", fontSize=8, textColor=colors.HexColor("#4B5563"))

    story = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>EAGLE EYE</b> — AI-POWERED CONTROL CABINET INSPECTION", title_style),
            Paragraph("CONFIDENTIAL QC AUDIT RECORD<br/>ISO 9001 / IEC 61439 SUPPORT", ParagraphStyle("RightH", parent=body_style, alignment=2))
        ],
        [
            Paragraph("<b>PRECISION INSPECTION. TRACEABLE QUALITY.</b>", subtitle_style),
            Paragraph(f"Generated: {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}", ParagraphStyle("RightH2", parent=body_style, alignment=2))
        ]
    ]
    header_table = Table(header_data, colWidths=[450, 270])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))

    # 2. Metadata Grid
    meta_data = [
        [
            Paragraph("<b>Inspection ID:</b>", header_label_style), Paragraph(str(session.id), body_style),
            Paragraph("<b>Cabinet ID:</b>", header_label_style), Paragraph(str(session.cabinet_id), body_style),
            Paragraph("<b>Inspector:</b>", header_label_style), Paragraph(str(session.inspector), body_style)
        ],
        [
            Paragraph("<b>Work Order:</b>", header_label_style), Paragraph(str(session.work_order_id or 'N/A'), body_style),
            Paragraph("<b>Batch No:</b>", header_label_style), Paragraph(str(session.batch_id or 'N/A'), body_style),
            Paragraph("<b>Status:</b>", header_label_style), Paragraph(f"<b>{session.status}</b>", body_style)
        ],
        [
            Paragraph("<b>GA Drawing:</b>", header_label_style), Paragraph(str(session.ga_filename or 'GA-CAB-4092-C.pdf'), body_style),
            Paragraph("<b>Wiring Schedule:</b>", header_label_style), Paragraph(str(session.schedule_filename or 'Wiring_Schedule_RevC.xlsx'), body_style),
            Paragraph("<b>Reference Rev:</b>", header_label_style), Paragraph(str(session.reference_revision or 'Rev C'), body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[80, 160, 80, 160, 80, 160])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F9FAFB")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # 3. Summary Statistics Bar
    pass_cnt = sum(1 for f in findings if f.status == "PASS")
    fail_cnt = sum(1 for f in findings if f.status == "FAIL")
    review_cnt = sum(1 for f in findings if f.status == "REVIEW")
    nc_cnt = sum(1 for f in findings if f.status == "NOT_CHECKED")
    total_cnt = len(findings)

    stats_data = [
        [
            Paragraph("<b>TOTAL CHECKED</b>", ParagraphStyle("C", alignment=1, fontSize=8)),
            Paragraph("<b>PASSED</b>", ParagraphStyle("C", alignment=1, fontSize=8, textColor=colors.HexColor("#065F46"))),
            Paragraph("<b>FAILED (DEFECTS)</b>", ParagraphStyle("C", alignment=1, fontSize=8, textColor=colors.HexColor("#991B1B"))),
            Paragraph("<b>REQUIRES REVIEW</b>", ParagraphStyle("C", alignment=1, fontSize=8, textColor=colors.HexColor("#92400E"))),
            Paragraph("<b>NOT CHECKED</b>", ParagraphStyle("C", alignment=1, fontSize=8, textColor=colors.HexColor("#4B5563")))
        ],
        [
            Paragraph(f"<b>{total_cnt}</b>", ParagraphStyle("C2", alignment=1, fontSize=14, fontName="Helvetica-Bold")),
            Paragraph(f"<b>{pass_cnt}</b>", ParagraphStyle("C2", alignment=1, fontSize=14, fontName="Helvetica-Bold", textColor=colors.HexColor("#059669"))),
            Paragraph(f"<b>{fail_cnt}</b>", ParagraphStyle("C2", alignment=1, fontSize=14, fontName="Helvetica-Bold", textColor=colors.HexColor("#DC2626"))),
            Paragraph(f"<b>{review_cnt}</b>", ParagraphStyle("C2", alignment=1, fontSize=14, fontName="Helvetica-Bold", textColor=colors.HexColor("#D97706"))),
            Paragraph(f"<b>{nc_cnt}</b>", ParagraphStyle("C2", alignment=1, fontSize=14, fontName="Helvetica-Bold", textColor=colors.HexColor("#6B7280")))
        ]
    ]
    stats_table = Table(stats_data, colWidths=[144, 144, 144, 144, 144])
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#F3F4F6")),
        ('BACKGROUND', (1, 0), (1, -1), colors.HexColor("#D1FAE5")),
        ('BACKGROUND', (2, 0), (2, -1), colors.HexColor("#FEE2E2")),
        ('BACKGROUND', (3, 0), (3, -1), colors.HexColor("#FEF3C7")),
        ('BACKGROUND', (4, 0), (4, -1), colors.HexColor("#F3F4F6")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(stats_table)
    story.append(Spacer(1, 12))

    # 4. Detailed Checklist Table
    story.append(Paragraph("<b>COMPREHENSIVE INSPECTION FINDINGS CHECKLIST</b>", header_label_style))
    story.append(Spacer(1, 4))

    table_rows = [
        [
            Paragraph("<b>Finding ID</b>", header_label_style),
            Paragraph("<b>Module</b>", header_label_style),
            Paragraph("<b>Ref Tag</b>", header_label_style),
            Paragraph("<b>Expected Reference</b>", header_label_style),
            Paragraph("<b>Observed Result</b>", header_label_style),
            Paragraph("<b>Status</b>", header_label_style),
            Paragraph("<b>Confidence</b>", header_label_style),
            Paragraph("<b>Explanation & Notes</b>", header_label_style)
        ]
    ]

    row_styles = []
    for idx, f in enumerate(findings):
        row_num = idx + 1
        if f.status == "FAIL":
            status_p = Paragraph("FAIL", badge_fail)
            row_styles.append(('BACKGROUND', (0, row_num), (-1, row_num), colors.HexColor("#FEF2F2")))
        elif f.status == "REVIEW":
            status_p = Paragraph("REVIEW", badge_review)
            row_styles.append(('BACKGROUND', (0, row_num), (-1, row_num), colors.HexColor("#FFFBEB")))
        elif f.status == "PASS":
            status_p = Paragraph("PASS", badge_pass)
        else:
            status_p = Paragraph("NOT CHECKED", badge_not_checked)

        conf_str = f"{int(f.confidence * 100)}%" if f.confidence is not None else "N/A (Demo)"

        table_rows.append([
            Paragraph(str(f.id)[:10], body_style),
            Paragraph(f.check_type.replace("_", " "), body_style),
            Paragraph(f"<b>{f.component_ref}</b>", body_style),
            Paragraph(str(f.expected_value or ''), body_style),
            Paragraph(str(f.observed_value or ''), body_style),
            status_p,
            Paragraph(conf_str, body_style),
            Paragraph(str(f.reason or ''), body_style)
        ])

    checklist_table = Table(
        table_rows,
        colWidths=[65, 75, 55, 115, 115, 55, 60, 180]
    )
    base_table_style = [
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1F2937")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ] + row_styles
    checklist_table.setStyle(TableStyle(base_table_style))
    story.append(checklist_table)
    story.append(Spacer(1, 15))

    # 5. Mandatory Safety Disclaimer
    disclaimer_text = (
        "<b>LEGAL & ELECTRICAL SAFETY NOTICE:</b> This Quality Control report is generated by the EAGLE EYE "
        "computer-vision decision-support platform as an assembly inspection aid. This document DOES NOT constitute an "
        "electrical safety certificate, dielectric test certification, or authorization to energize. Qualified electrical "
        "personnel must perform physical continuity, insulation resistance (megger), and torque verification per IEC 61439 "
        "prior to final factory dispatch."
    )
    story.append(Paragraph(disclaimer_text, ParagraphStyle("Disc", parent=body_style, fontSize=7, leading=9, textColor=colors.HexColor("#6B7280"))))

    doc.build(story)
    return f"reports/{filename}"


def generate_excel_report(session: InspectionSession, findings: List[InspectionFinding]) -> str:
    """
    Generates a multi-sheet formatted Excel QC report with conditional styling.
    """
    timestamp_str = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"QC_Report_{session.cabinet_id}_{timestamp_str}.xlsx"
    full_path = os.path.join(REPORTS_DIR, filename)

    wb = openpyxl.Workbook()

    # Sheet 1: Executive Summary
    ws1 = wb.active
    ws1.title = "Executive_Summary"

    header_font = Font(name="Calibri", size=14, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="111827", end_color="111827", fill_type="solid")
    subhead_fill = PatternFill(start_color="1F2937", end_color="1F2937", fill_type="solid")
    subhead_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")

    pass_fill = PatternFill(start_color="D1FAE5", end_color="D1FAE5", fill_type="solid")
    fail_fill = PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid")
    review_fill = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid")

    ws1.merge_cells("A1:F1")
    ws1["A1"] = "EAGLE EYE — QUALITY CONTROL INSPECTION REPORT"
    ws1["A1"].font = header_font
    ws1["A1"].fill = header_fill
    ws1["A1"].alignment = Alignment(horizontal="center", vertical="center")
    ws1.row_dimensions[1].height = 30

    metadata = [
        ("Inspection ID", session.id),
        ("Cabinet ID", session.cabinet_id),
        ("Work Order", session.work_order_id or "N/A"),
        ("Batch Number", session.batch_id or "N/A"),
        ("Inspector", session.inspector),
        ("Current Session Status", session.status),
        ("Reference Revision", session.reference_revision),
        ("Generated Timestamp (UTC)", datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"))
    ]

    for idx, (label, val) in enumerate(metadata):
        row_num = idx + 3
        ws1.cell(row=row_num, column=1, value=label).font = Font(bold=True)
        ws1.cell(row=row_num, column=2, value=str(val))

    # Summary Counts
    pass_cnt = sum(1 for f in findings if f.status == "PASS")
    fail_cnt = sum(1 for f in findings if f.status == "FAIL")
    review_cnt = sum(1 for f in findings if f.status == "REVIEW")
    nc_cnt = sum(1 for f in findings if f.status == "NOT_CHECKED")

    counts = [
        ("Total Items Checked", len(findings)),
        ("Passed Items", pass_cnt),
        ("Failed Items (Open Defects)", fail_cnt),
        ("Items Requiring Review", review_cnt),
        ("Not Checked", nc_cnt)
    ]
    for idx, (label, val) in enumerate(counts):
        row_num = idx + 3
        ws1.cell(row=row_num, column=4, value=label).font = Font(bold=True)
        cell = ws1.cell(row=row_num, column=5, value=val)
        if label == "Passed Items":
            cell.fill = pass_fill
        elif label == "Failed Items (Open Defects)":
            cell.fill = fail_fill
        elif label == "Items Requiring Review":
            cell.fill = review_fill

    # Sheet 2: Findings Details
    ws2 = wb.create_sheet(title="Inspection_Findings")
    headers = [
        "Finding_ID", "Check_Module", "Component_Ref", "Expected_Reference",
        "Observed_Result", "Status", "Confidence", "Evidence_Location", "Reason_Explanation"
    ]
    ws2.append(headers)
    for col_idx in range(1, len(headers) + 1):
        cell = ws2.cell(row=1, column=col_idx)
        cell.fill = subhead_fill
        cell.font = subhead_font

    for f in findings:
        conf_str = f"{int(f.confidence * 100)}%" if f.confidence is not None else "Demo Mode"
        row_data = [
            f.id,
            f.check_type,
            f.component_ref,
            f.expected_value or "",
            f.observed_value or "",
            f.status,
            conf_str,
            f.source_reference or "",
            f.reason or ""
        ]
        ws2.append(row_data)
        current_row = ws2.max_row
        status_cell = ws2.cell(row=current_row, column=6)
        if f.status == "FAIL":
            status_cell.fill = fail_fill
            status_cell.font = Font(bold=True, color="991B1B")
        elif f.status == "REVIEW":
            status_cell.fill = review_fill
            status_cell.font = Font(bold=True, color="92400E")
        elif f.status == "PASS":
            status_cell.fill = pass_fill
            status_cell.font = Font(bold=True, color="065F46")

    # Column dimensions auto-adjust
    for ws in [ws1, ws2]:
        for col in ws.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            col_letter = openpyxl.utils.get_column_letter(col[0].column)
            ws.column_dimensions[col_letter].width = min(max(max_len + 3, 12), 45)

    wb.save(full_path)
    return f"reports/{filename}"
