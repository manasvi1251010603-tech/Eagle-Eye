export type InspectionStatus = 
  | 'DRAFT'
  | 'PROCESSING'
  | 'NEEDS_REVIEW'
  | 'REPAIR_REQUIRED'
  | 'READY_FOR_REVIEW'
  | 'PASSED'
  | 'CLOSED'
  | 'PROCESSING_FAILED';

export type FindingStatus = 'PASS' | 'FAIL' | 'REVIEW' | 'NOT_CHECKED';

export type CheckType = 
  | 'GA_PLACEMENT'
  | 'DEVICE_LABEL'
  | 'FERRULE_TEXT'
  | 'WIRE_COLOUR'
  | 'WIRING_RELATIONSHIP';

export interface RepairAction {
  id: string;
  finding_id: string;
  checklist_item: string;
  is_completed: boolean;
  technician?: string;
  notes?: string;
  updated_at: string;
}

export interface InspectionFinding {
  id: string;
  session_id: string;
  original_finding_id?: string;
  check_type: CheckType;
  component_ref: string;
  expected_value?: string;
  observed_value?: string;
  status: FindingStatus;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason?: string;
  recommended_action?: string;
  confidence?: number;
  is_simulated?: boolean;
  bbox_x?: number;
  bbox_y?: number;
  bbox_width?: number;
  bbox_height?: number;
  evidence_crop_path?: string;
  source_reference?: string;
  reviewer_status?: string;
  reviewer_notes?: string;
  repair_status: 'PENDING' | 'IN_PROGRESS' | 'REPAIRED' | 'VERIFIED';
  repair_actions: RepairAction[];
  created_at: string;
}

export interface AuditEvent {
  id: string;
  session_id: string;
  finding_id?: string;
  event_type: string;
  description: string;
  actor: string;
  created_at: string;
}

export interface InspectionSessionSummary {
  id: string;
  cabinet_id: string;
  work_order_id?: string;
  batch_id?: string;
  inspector: string;
  reference_revision: string;
  status: InspectionStatus;
  parent_session_id?: string;
  processing_mode: 'DEMO' | 'AI' | 'MANUAL';
  cabinet_image_path?: string;
  repaired_image_path?: string;
  ga_filename?: string;
  schedule_filename?: string;
  pass_count: number;
  fail_count: number;
  review_count: number;
  not_checked_count: number;
  total_findings: number;
  created_at: string;
  updated_at: string;
}

export interface InspectionDetail extends InspectionSessionSummary {
  column_mapping?: string;
  alignment_data?: string;
  extracted_references?: string;
  findings: InspectionFinding[];
  audit_events: AuditEvent[];
}

export interface AlignmentResponse {
  session_id: string;
  alignment_status: string;
  confidence_score: number;
  scale?: number;
  trans_x?: number;
  trans_y?: number;
  rotation?: number;
  opacity?: number;
  homography_matrix?: number[][];
  warning_message?: string;
  aligned_overlay_url?: string;
}

export interface ComponentReference {
  ref: string;
  type: string;
  manufacturer?: string;
  part_number?: string;
  rail: string;
  qty: number;
}

export interface WireReference {
  wire_tag: string;
  source_device: string;
  source_terminal: string;
  dest_device: string;
  dest_terminal: string;
  expected_color: string;
  wire_gauge: string;
  ferrule_id: string;
  signal_type?: string;
}

export interface ExtractedReferencesData {
  drawing_number?: string;
  revision?: string;
  enclosure_dimensions?: string;
  identified_rails?: string[];
  components: ComponentReference[];
  wires: WireReference[];
  is_user_edited?: boolean;
}

export interface SchedulePreview {
  sheets: string[];
  selected_sheet: string;
  columns: string[];
  sample_rows: Record<string, any>[];
  total_rows: number;
  detected_mappings: Record<string, string>;
  validation_warnings: string[];
}

export interface ReinspectionDiff {
  reinspection_session_id: string;
  parent_session_id: string;
  resolved_findings: InspectionFinding[];
  persistent_findings: InspectionFinding[];
  new_findings: InspectionFinding[];
  review_needed_findings: InspectionFinding[];
  can_close_session: boolean;
  closure_blockers: string[];
  repaired_image_path?: string;
  parent_image_path?: string;
}

export interface ReportItem {
  id: string;
  session_id: string;
  report_type: 'PDF' | 'EXCEL';
  file_path: string;
  filename: string;
  download_url: string;
  created_at: string;
}

export interface DefectCategoryCount {
  check_type: string;
  count: number;
  percentage: number;
}

export interface ComponentDefectCount {
  component_ref: string;
  defect_count: number;
  primary_issue: string;
}

export interface AnalyticsOverview {
  total_inspections: number;
  total_checked_items: number;
  first_time_pass_rate: number;
  rework_success_rate: number;
  open_defects_count?: number;
  closed_defects_count?: number;
  severity_distribution?: Record<string, number>;
  defect_categories: DefectCategoryCount[];
  top_recurring_components: ComponentDefectCount[];
  batch_distribution: { batch_id: string; session_count: number }[];
  timeline_trends: { period: string; pass_count: number; defect_count: number; rework_count: number }[];
}
