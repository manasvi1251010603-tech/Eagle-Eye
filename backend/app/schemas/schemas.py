import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


# --- Inspection Session Schemas ---

class InspectionCreate(BaseModel):
    cabinet_id: str
    work_order_id: Optional[str] = "WO-8492"
    batch_id: Optional[str] = "BATCH-2026-Q4"
    inspector: str
    reference_revision: Optional[str] = "Rev C"
    processing_mode: Optional[str] = "DEMO"  # DEMO or AI


class InspectionSummary(BaseModel):
    id: str
    cabinet_id: str
    work_order_id: Optional[str] = None
    batch_id: Optional[str] = None
    inspector: str
    reference_revision: str
    status: str
    parent_session_id: Optional[str] = None
    processing_mode: str
    cabinet_image_path: Optional[str] = None
    repaired_image_path: Optional[str] = None
    ga_filename: Optional[str] = None
    schedule_filename: Optional[str] = None
    pass_count: int = 0
    fail_count: int = 0
    review_count: int = 0
    not_checked_count: int = 0
    total_findings: int = 0
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


# --- Repair Action Schemas ---

class RepairActionCreate(BaseModel):
    checklist_item: str
    technician: Optional[str] = None
    notes: Optional[str] = None
    is_completed: bool = False


class RepairActionUpdate(BaseModel):
    is_completed: bool
    notes: Optional[str] = None
    technician: Optional[str] = None


class RepairActionResponse(BaseModel):
    id: str
    finding_id: str
    checklist_item: str
    is_completed: bool
    technician: Optional[str] = None
    notes: Optional[str] = None
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


# --- Inspection Finding Schemas ---

class FindingResponse(BaseModel):
    id: str
    session_id: str
    original_finding_id: Optional[str] = None
    check_type: str
    component_ref: str
    expected_value: Optional[str] = None
    observed_value: Optional[str] = None
    status: str
    severity: str = "MEDIUM"  # CRITICAL, HIGH, MEDIUM, LOW
    reason: Optional[str] = None
    recommended_action: Optional[str] = None
    confidence: Optional[float] = None
    is_simulated: bool = True
    bbox_x: Optional[float] = None
    bbox_y: Optional[float] = None
    bbox_width: Optional[float] = None
    bbox_height: Optional[float] = None
    evidence_crop_path: Optional[str] = None
    source_reference: Optional[str] = None
    reviewer_status: Optional[str] = None
    reviewer_notes: Optional[str] = None
    repair_status: str
    repair_actions: List[RepairActionResponse] = []
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class FindingReviewUpdate(BaseModel):
    status: Optional[str] = None  # PASS, FAIL, REVIEW
    reviewer_status: str  # CONFIRMED_DEFECT, OVERRIDDEN_PASS, DISMISSED
    reviewer_notes: str


# --- Detailed Inspection Session Detail ---

class InspectionDetail(InspectionSummary):
    column_mapping: Optional[str] = None
    alignment_data: Optional[str] = None
    extracted_references: Optional[str] = None
    findings: List[FindingResponse] = []
    audit_events: List[Any] = []


class ExtractedReferencesUpdate(BaseModel):
    components: List[Dict[str, Any]]
    wires: List[Dict[str, Any]]
    ga_dimensions: Optional[Dict[str, Any]] = None


# --- Alignment Schemas ---

class AlignmentPoint(BaseModel):
    x: float
    y: float


class AlignmentRequest(BaseModel):
    points_photo: Optional[List[AlignmentPoint]] = None
    points_cad: Optional[List[AlignmentPoint]] = None
    scale: Optional[float] = 1.0
    trans_x: Optional[float] = 0.0
    trans_y: Optional[float] = 0.0
    rotation: Optional[float] = 0.0
    opacity: Optional[float] = 0.5
    confirmed: bool = True
    mode: Optional[str] = "AUTO"  # AUTO or MANUAL


class AlignmentResponse(BaseModel):
    session_id: str
    alignment_status: str  # ALIGNED, WARNING, MANUAL_OVERRIDE
    confidence_score: float
    scale: Optional[float] = 1.0
    trans_x: Optional[float] = 0.0
    trans_y: Optional[float] = 0.0
    rotation: Optional[float] = 0.0
    opacity: Optional[float] = 0.5
    homography_matrix: Optional[List[List[float]]] = None
    warning_message: Optional[str] = None
    aligned_overlay_url: Optional[str] = None


# --- Excel Mapping & Validation Schemas ---

class ColumnMappingRequest(BaseModel):
    sheet_name: str
    mappings: Dict[str, str]  # logical field -> excel column header


class SchedulePreviewResponse(BaseModel):
    sheets: List[str]
    selected_sheet: str
    columns: List[str]
    sample_rows: List[Dict[str, Any]]
    total_rows: int
    detected_mappings: Dict[str, str]
    validation_warnings: List[str] = []


# --- Reinspection Schemas ---

class ReinspectionRequest(BaseModel):
    inspector: str
    reinspection_notes: Optional[str] = None
    use_sample_repaired_image: bool = True


class ReinspectionDiffResponse(BaseModel):
    reinspection_session_id: str
    parent_session_id: str
    resolved_findings: List[FindingResponse] = []
    persistent_findings: List[FindingResponse] = []
    new_findings: List[FindingResponse] = []
    review_needed_findings: List[FindingResponse] = []
    can_close_session: bool
    closure_blockers: List[str] = []


# --- Audit Event Schemas ---

class AuditEventResponse(BaseModel):
    id: str
    session_id: str
    finding_id: Optional[str] = None
    event_type: str
    description: str
    actor: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


# --- Report Schemas ---

class ReportResponse(BaseModel):
    id: str
    session_id: str
    report_type: str
    file_path: str
    filename: str
    download_url: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


# --- Analytics Schemas ---

class DefectCategoryCount(BaseModel):
    check_type: str
    count: int
    percentage: float


class ComponentDefectCount(BaseModel):
    component_ref: str
    defect_count: int
    primary_issue: str


class AnalyticsOverview(BaseModel):
    total_inspections: int
    total_checked_items: int
    first_time_pass_rate: float
    rework_success_rate: float
    open_defects_count: int = 0
    closed_defects_count: int = 0
    severity_distribution: Dict[str, int] = Field(default_factory=dict)
    defect_categories: List[DefectCategoryCount]
    top_recurring_components: List[ComponentDefectCount]
    batch_distribution: List[Dict[str, Any]]
    timeline_trends: List[Dict[str, Any]]
