import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class InspectionSession(Base):
    __tablename__ = "inspection_sessions"

    id = Column(String(64), primary_key=True, index=True)
    cabinet_id = Column(String(64), index=True, nullable=False)
    work_order_id = Column(String(64), index=True, nullable=True)
    batch_id = Column(String(64), index=True, nullable=True)
    inspector = Column(String(128), nullable=False)
    reference_revision = Column(String(32), default="Rev C")
    status = Column(String(32), default="DRAFT", index=True)
    parent_session_id = Column(String(64), ForeignKey("inspection_sessions.id"), nullable=True)

    # File paths
    cabinet_image_path = Column(String(256), nullable=True)
    repaired_image_path = Column(String(256), nullable=True)
    ga_filename = Column(String(256), nullable=True)
    ga_file_path = Column(String(256), nullable=True)
    schedule_filename = Column(String(256), nullable=True)
    schedule_file_path = Column(String(256), nullable=True)

    # Column mapping JSON & settings
    column_mapping = Column(Text, nullable=True)
    processing_mode = Column(String(32), default="DEMO")  # "DEMO", "AI", "MANUAL"

    # Alignment data JSON
    alignment_data = Column(Text, nullable=True)

    # Summary statistics JSON
    summary_stats = Column(Text, nullable=True)

    # Extracted engineering reference JSON (editable by user)
    extracted_references = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    findings = relationship("InspectionFinding", back_populates="session", cascade="all, delete-orphan")
    audit_events = relationship("AuditEvent", back_populates="session", cascade="all, delete-orphan")
    reports = relationship("GeneratedReport", back_populates="session", cascade="all, delete-orphan")
    reinspections = relationship("InspectionSession", backref="parent_session", remote_side=[id])


class InspectionFinding(Base):
    __tablename__ = "inspection_findings"

    id = Column(String(64), primary_key=True, index=True)
    session_id = Column(String(64), ForeignKey("inspection_sessions.id"), index=True, nullable=False)
    original_finding_id = Column(String(64), nullable=True, index=True)

    check_type = Column(String(32), index=True, nullable=False)
    component_ref = Column(String(64), index=True, nullable=False)
    expected_value = Column(String(256), nullable=True)
    observed_value = Column(String(256), nullable=True)
    status = Column(String(32), index=True, nullable=False)  # PASS, FAIL, REVIEW, NOT_CHECKED
    severity = Column(String(32), default="MEDIUM")  # CRITICAL, HIGH, MEDIUM, LOW
    reason = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    confidence = Column(Float, nullable=True)
    is_simulated = Column(Boolean, default=True)

    # Bounding Box normalized [0..100] coordinates
    bbox_x = Column(Float, nullable=True)
    bbox_y = Column(Float, nullable=True)
    bbox_width = Column(Float, nullable=True)
    bbox_height = Column(Float, nullable=True)

    evidence_crop_path = Column(String(256), nullable=True)
    source_reference = Column(String(128), nullable=True)  # e.g., "GA Page 1, DIN 2" or "Schedule Row 8"

    # Human Review Overrides
    reviewer_status = Column(String(32), nullable=True)  # "CONFIRMED_DEFECT", "OVERRIDDEN_PASS", "DISMISSED"
    reviewer_notes = Column(Text, nullable=True)
    repair_status = Column(String(32), default="PENDING")  # PENDING, IN_PROGRESS, REPAIRED, VERIFIED

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    session = relationship("InspectionSession", back_populates="findings")
    repair_actions = relationship("RepairAction", back_populates="finding", cascade="all, delete-orphan")


class RepairAction(Base):
    __tablename__ = "repair_actions"

    id = Column(String(64), primary_key=True, index=True)
    finding_id = Column(String(64), ForeignKey("inspection_findings.id"), index=True, nullable=False)
    checklist_item = Column(String(256), nullable=False)
    is_completed = Column(Boolean, default=False)
    technician = Column(String(128), nullable=True)
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    finding = relationship("InspectionFinding", back_populates="repair_actions")


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(64), primary_key=True, index=True)
    session_id = Column(String(64), ForeignKey("inspection_sessions.id"), index=True, nullable=False)
    finding_id = Column(String(64), nullable=True)
    event_type = Column(String(64), nullable=False)
    description = Column(Text, nullable=False)
    actor = Column(String(128), default="System")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("InspectionSession", back_populates="audit_events")


class GeneratedReport(Base):
    __tablename__ = "generated_reports"

    id = Column(String(64), primary_key=True, index=True)
    session_id = Column(String(64), ForeignKey("inspection_sessions.id"), index=True, nullable=False)
    report_type = Column(String(16), nullable=False)  # "PDF", "EXCEL"
    file_path = Column(String(256), nullable=False)
    filename = Column(String(128), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    session = relationship("InspectionSession", back_populates="reports")
