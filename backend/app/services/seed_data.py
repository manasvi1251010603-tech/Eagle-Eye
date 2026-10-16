import datetime
from sqlalchemy.orm import Session
from app.models.models import InspectionSession, InspectionFinding, RepairAction, AuditEvent
from app.services.comparison import execute_inspection_pipeline


def seed_database(db: Session):
    """
    Seeds initial realistic demo inspection sessions, findings, and repair actions
    if the database does not contain the primary demo session.
    """
    existing_session = db.query(InspectionSession).filter(InspectionSession.id == "INS-2026-0891").first()
    if existing_session:
        return  # Database already has primary demo session

    print("Seeding initial EAGLE EYE demo database records...")

    now = datetime.datetime.utcnow()

    # 1. Primary Demo Session: CAB-4092
    session_1 = InspectionSession(
        id="INS-2026-0891",
        cabinet_id="CAB-4092",
        work_order_id="WO-8492",
        batch_id="BATCH-2026-Q4",
        inspector="Samarth Shingare (Lead QC)",
        reference_revision="Rev C",
        status="REPAIR_REQUIRED",
        processing_mode="DEMO",
        cabinet_image_path="data/demo/cabinet_sample_01.jpg",
        repaired_image_path="data/demo/cabinet_sample_01_repaired.jpg",
        ga_filename="GA_Drawing_Cabinet_RevC.pdf",
        schedule_filename="Wiring_Schedule_RevC.xlsx",
        created_at=now - datetime.timedelta(hours=2),
        updated_at=now - datetime.timedelta(hours=1)
    )
    db.add(session_1)
    db.commit()

    # Generate realistic findings for session 1
    findings_data = execute_inspection_pipeline(
        session_id=session_1.id,
        image_rel_path=session_1.cabinet_image_path,
        ga_data={},
        schedule_data={},
        is_repaired=False
    )

    for item in findings_data:
        finding = InspectionFinding(
            id=item["id"],
            session_id=item["session_id"],
            check_type=item["check_type"],
            component_ref=item["component_ref"],
            expected_value=item["expected_value"],
            observed_value=item["observed_value"],
            status=item["status"],
            reason=item["reason"],
            confidence=item["confidence"],
            bbox_x=item["bbox_x"],
            bbox_y=item["bbox_y"],
            bbox_width=item["bbox_width"],
            bbox_height=item["bbox_height"],
            evidence_crop_path=item["evidence_crop_path"],
            source_reference=item["source_reference"],
            repair_status=item["repair_status"],
            created_at=now - datetime.timedelta(hours=2)
        )
        db.add(finding)
        db.flush()

        # Seed guided repair actions for failed findings
        if item["component_ref"] == "K1" and item["check_type"] == "GA_PLACEMENT":
            actions = [
                "Isolate cabinet and verify zero energy state with multimeter (LOTO procedure).",
                "Unclip Contactor K1 from DIN Rail 2 Slot 5 using insulated flat screwdriver.",
                "Verify GA drawing dimensions for DIN Rail 2 Slot 2 (X: 420mm position).",
                "Snap K1 into designated Slot 2 position and apply yellow torque seal paint mark."
            ]
            for act_text in actions:
                db.add(RepairAction(
                    id=f"REP-{finding.id[:6]}-{len(act_text)%1000}",
                    finding_id=finding.id,
                    checklist_item=act_text,
                    is_completed=False,
                    technician="A. Patil (Assembly Tech)"
                ))

        if item["component_ref"] == "X1:14" and item["check_type"] == "FERRULE_TEXT":
            actions = [
                "De-terminate wire W-108 from Terminal X1:14.",
                "Cut existing sleeve marked 'X1:41'.",
                "Print validated thermal-transfer sleeve ferrule tag 'X1:14'.",
                "Re-crimp wire pin with ratchet crimper and perform 20N pull test."
            ]
            for act_text in actions:
                db.add(RepairAction(
                    id=f"REP-{finding.id[:6]}-{len(act_text)%1000}",
                    finding_id=finding.id,
                    checklist_item=act_text,
                    is_completed=False,
                    technician="A. Patil (Assembly Tech)"
                ))

    # Audit events for session 1
    events = [
        ("SESSION_CREATED", "Inspection session created for Cabinet CAB-4092.", "Samarth Shingare"),
        ("FILES_UPLOADED", "Uploaded cabinet_sample_01.jpg, GA_Drawing_Cabinet_RevC.pdf, Wiring_Schedule_RevC.xlsx.", "Samarth Shingare"),
        ("ALIGNMENT_CONFIRMED", "Automatic homography perspective correction applied (tilt angle 3.2 deg).", "OpenCV Engine"),
        ("INSPECTION_RUN", "Inspection completed with 18 items checked: 15 PASS, 2 FAIL, 2 REVIEW.", "EAGLE EYE Rules Engine")
    ]
    for ev_type, desc, actor in events:
        db.add(AuditEvent(
            id=f"AUD-{len(desc)}-{now.microsecond}",
            session_id=session_1.id,
            event_type=ev_type,
            description=desc,
            actor=actor,
            created_at=now - datetime.timedelta(hours=2)
        ))

    # 2. Historical Passed Session: CAB-4088
    session_2 = InspectionSession(
        id="INS-2026-0885",
        cabinet_id="CAB-4088",
        work_order_id="WO-8480",
        batch_id="BATCH-2026-Q4",
        inspector="Priya Sharma (QC Inspector)",
        reference_revision="Rev B",
        status="PASSED",
        processing_mode="DEMO",
        cabinet_image_path="data/demo/cabinet_sample_01_repaired.jpg",
        ga_filename="GA_Drawing_Cabinet_RevB.pdf",
        schedule_filename="Wiring_Schedule_RevB.xlsx",
        created_at=now - datetime.timedelta(days=1),
        updated_at=now - datetime.timedelta(days=1)
    )
    db.add(session_2)

    # 3. Historical Closed Session: CAB-4075
    session_3 = InspectionSession(
        id="INS-2026-0870",
        cabinet_id="CAB-4075",
        work_order_id="WO-8455",
        batch_id="BATCH-2026-Q3",
        inspector="Samarth Shingare (Lead QC)",
        reference_revision="Rev A",
        status="CLOSED",
        processing_mode="DEMO",
        cabinet_image_path="data/demo/cabinet_sample_01_repaired.jpg",
        ga_filename="GA_Drawing_Cabinet_RevA.pdf",
        schedule_filename="Wiring_Schedule_RevA.xlsx",
        created_at=now - datetime.timedelta(days=3),
        updated_at=now - datetime.timedelta(days=2)
    )
    db.add(session_3)

    db.commit()
    print("Database seeding completed successfully.")
