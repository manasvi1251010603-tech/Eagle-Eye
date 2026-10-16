import {
  InspectionSessionSummary,
  InspectionDetail,
  InspectionFinding,
  RepairAction,
  AlignmentResponse,
  SchedulePreview,
  ReinspectionDiff,
  ReportItem,
  AnalyticsOverview
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      ...(options?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        if (typeof errJson.detail === 'string') {
          errorMsg = errJson.detail;
        } else if (Array.isArray(errJson.detail)) {
          errorMsg = errJson.detail.map((d: any) => d.msg || d.detail || JSON.stringify(d)).join('; ');
        } else {
          errorMsg = JSON.stringify(errJson.detail);
        }
      } else if (errJson.message) {
        errorMsg = errJson.message;
      }
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Health
  getHealth: () => request<any>('/health'),

  // Inspections
  getInspections: (status?: string, search?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    return request<InspectionSessionSummary[]>(`/inspections?${params.toString()}`);
  },

  getInspection: (id: string) => request<InspectionDetail>(`/inspections/${id}`),

  createInspection: (data: {
    cabinet_id: string;
    work_order_id?: string;
    batch_id?: string;
    inspector: string;
    reference_revision?: string;
    processing_mode?: string;
  }) => request<InspectionSessionSummary>('/inspections', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  uploadFiles: (id: string, formData: FormData) => request<any>(`/inspections/${id}/upload-files`, {
    method: 'POST',
    body: formData,
  }),

  loadDemoPack: (id: string) => request<any>(`/inspections/${id}/load-demo-pack`, {
    method: 'POST',
  }),

  previewSchedule: (id: string, sheet?: string) => {
    const params = sheet ? `?selected_sheet=${encodeURIComponent(sheet)}` : '';
    return request<SchedulePreview>(`/inspections/${id}/preview-schedule${params}`, {
      method: 'POST',
    });
  },

  saveColumnMapping: (id: string, sheet_name: string, mappings: Record<string, string>) =>
    request<any>(`/inspections/${id}/map-columns`, {
      method: 'POST',
      body: JSON.stringify({ sheet_name, mappings }),
    }),

  previewGA: (id: string) => request<any>(`/inspections/${id}/preview-ga`, {
    method: 'POST',
  }),

  getExtractedReferences: (id: string) => request<any>(`/inspections/${id}/extracted-references`),

  updateExtractedReferences: (id: string, payload: any) =>
    request<any>(`/inspections/${id}/extracted-references`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  align: (id: string, payload: {
    mode?: string;
    confirmed?: boolean;
    points_photo?: any[];
    points_cad?: any[];
    scale?: number;
    trans_x?: number;
    trans_y?: number;
    rotation?: number;
    opacity?: number;
  }) =>
    request<AlignmentResponse>(`/inspections/${id}/align`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  runPipeline: (id: string, is_repaired = false) => request<{
    message: string;
    session_status: string;
    total_findings: number;
    fail_count: number;
    review_count: number;
  }>(`/inspections/${id}/run-pipeline?is_repaired=${is_repaired}`, {
    method: 'POST',
  }),

  getFindings: (id: string, params?: { status?: string; check_type?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.check_type) q.append('check_type', params.check_type);
    if (params?.search) q.append('search', params.search);
    return request<InspectionFinding[]>(`/inspections/${id}/findings?${q.toString()}`);
  },

  updateFindingReview: (findingId: string, payload: {
    status?: string;
    reviewer_status: string;
    reviewer_notes: string;
  }) => request<InspectionFinding>(`/inspections/findings/${findingId}/review`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }),

  updateRepairAction: (actionId: string, payload: {
    is_completed: boolean;
    notes?: string;
    technician?: string;
  }) => request<RepairAction>(`/inspections/repair-actions/${actionId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }),

  reinspect: (id: string, payload: FormData | { inspector: string; reinspection_notes?: string }) =>
    request<ReinspectionDiff>(`/inspections/${id}/reinspect`, {
      method: 'POST',
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    }),

  closeSession: (id: string) => request<{ message: string; status: string }>(`/inspections/${id}/close`, {
    method: 'POST',
  }),

  exportPDF: (id: string) => request<ReportItem>(`/inspections/${id}/reports/pdf`, {
    method: 'POST',
  }),

  exportExcel: (id: string) => request<ReportItem>(`/inspections/${id}/reports/excel`, {
    method: 'POST',
  }),

  getAnalytics: () => request<AnalyticsOverview>('/analytics/defects'),
};
