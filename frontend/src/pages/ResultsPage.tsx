import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Search,
  Filter,
  FileText,
  Wrench,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Eye,
  Check,
  X,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { useInspectionSession } from '../context/InspectionContext';
import { InspectionFinding, FindingStatus, CheckType } from '../types';
import { StatusBadge, SeverityBadge, SimulatedBadge } from '../components/common/StatusBadge';
import { InspectionDisclaimer } from '../components/common/InspectionDisclaimer';

export const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSessionId, currentCabinetId } = useInspectionSession();

  const [findings, setFindings] = useState<InspectionFinding[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<InspectionFinding | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Canvas zoom state
  const [zoom, setZoom] = useState(1.0);

  // Review override state
  const [overrideNotes, setOverrideNotes] = useState('');
  const [overrideStatus, setOverrideStatus] = useState<string>('PASS');
  const [savingReview, setSavingReview] = useState(false);

  useEffect(() => {
    async function loadFindings() {
      try {
        setLoading(true);
        const data = await api.getFindings(currentSessionId);
        setFindings(data);
        // Default select the first FAIL finding or first finding
        const firstFail = data.find((f) => f.status === 'FAIL') || data[0];
        setSelectedFinding(firstFail || null);
      } catch (err) {
        console.error('Failed to load findings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFindings();
  }, [currentSessionId]);

  // Filter findings
  const filteredFindings = findings.filter((f) => {
    if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && f.check_type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        f.component_ref.toLowerCase().includes(q) ||
        (f.expected_value || '').toLowerCase().includes(q) ||
        (f.observed_value || '').toLowerCase().includes(q) ||
        (f.reason || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const passCount = findings.filter((f) => f.status === 'PASS').length;
  const failCount = findings.filter((f) => f.status === 'FAIL').length;
  const reviewCount = findings.filter((f) => f.status === 'REVIEW').length;
  const ncCount = findings.filter((f) => f.status === 'NOT_CHECKED').length;

  const handleReviewOverride = async () => {
    if (!selectedFinding) return;
    setSavingReview(true);
    try {
      const updated = await api.updateFindingReview(selectedFinding.id, {
        status: overrideStatus,
        reviewer_status: overrideStatus === 'PASS' ? 'OVERRIDDEN_PASS' : 'CONFIRMED_DEFECT',
        reviewer_notes: overrideNotes || 'Reviewer manually confirmed finding disposition.'
      });
      setFindings((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      setSelectedFinding(updated);
      alert(`Finding ${updated.component_ref} updated to ${updated.status}.`);
    } catch (err: any) {
      alert(`Failed to save review override: ${err.message}`);
    } finally {
      setSavingReview(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Bar with KPI Pills & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm animate-card-rise">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold uppercase">
              Quality Control Workstation
            </span>
            <span className="text-xs font-mono text-slate-500">
              Cabinet: <strong className="text-slate-800">{currentCabinetId}</strong> ({currentSessionId})
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Visual Inspection Results & Evidence Markup
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare actual cabinet photographs against expected GA references and Excel schedules. Every finding includes severity and evidence crops.
          </p>
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/reports-analytics')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Generate Report</span>
          </button>
          <button
            onClick={() => navigate('/repair')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-50 border border-red-200 text-xs font-mono font-semibold text-red-800 hover:bg-red-100 transition-colors shadow-sm"
          >
            <Wrench className="w-3.5 h-3.5 text-red-600" />
            <span>Start Guided Repair ({failCount})</span>
          </button>
          <button
            onClick={() => navigate('/reinspection')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F2B5C] hover:bg-[#163A75] text-white font-semibold text-xs btn-lift shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-white" />
            <span>Reinspect Cabinet</span>
          </button>
        </div>
      </div>

      {/* Summary Count Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-card-rise">
        <button
          onClick={() => setStatusFilter(statusFilter === 'PASS' ? 'ALL' : 'PASS')}
          className={`p-3 rounded-xl border text-left transition-all backdrop-blur-md shadow-sm ${
            statusFilter === 'PASS'
              ? 'border-emerald-400 bg-emerald-50 text-emerald-900 font-bold'
              : 'bg-white/95 border-slate-200/90 hover:bg-emerald-50/30'
          }`}
        >
          <div className="text-[10px] font-mono uppercase text-emerald-700 font-bold">PASSED ITEMS</div>
          <div className="text-2xl font-mono font-bold text-emerald-700">{passCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'FAIL' ? 'ALL' : 'FAIL')}
          className={`p-3 rounded-xl border text-left transition-all backdrop-blur-md shadow-sm ${
            statusFilter === 'FAIL'
              ? 'border-red-400 bg-red-50 text-red-900 font-bold'
              : 'bg-white/95 border-slate-200/90 hover:bg-red-50/30'
          }`}
        >
          <div className="text-[10px] font-mono uppercase text-red-700 font-bold">FAILED (OPEN DEFECTS)</div>
          <div className="text-2xl font-mono font-bold text-red-700">{failCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'REVIEW' ? 'ALL' : 'REVIEW')}
          className={`p-3 rounded-xl border text-left transition-all backdrop-blur-md shadow-sm ${
            statusFilter === 'REVIEW'
              ? 'border-amber-400 bg-amber-50 text-amber-950 font-bold'
              : 'bg-white/95 border-slate-200/90 hover:bg-amber-50/30'
          }`}
        >
          <div className="text-[10px] font-mono uppercase text-amber-800 font-bold">REQUIRES REVIEW</div>
          <div className="text-2xl font-mono font-bold text-amber-800">{reviewCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'NOT_CHECKED' ? 'ALL' : 'NOT_CHECKED')}
          className={`p-3 rounded-xl border text-left transition-all backdrop-blur-md shadow-sm ${
            statusFilter === 'NOT_CHECKED'
              ? 'border-slate-400 bg-slate-100 text-slate-900 font-bold'
              : 'bg-white/95 border-slate-200/90 hover:bg-slate-50'
          }`}
        >
          <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">NOT CHECKED</div>
          <div className="text-2xl font-mono font-bold text-slate-700">{ncCount}</div>
        </button>
      </div>

      {/* Main Two-Column View: Left Canvas + Right Findings Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Interactive Annotated Visual Canvas */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm space-y-3 flex flex-col justify-between animate-card-rise">
          {/* Canvas Toolbar */}
          <div className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-200">
            <span className="font-mono text-slate-700 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Physical Cabinet View with Bounding Box Markup
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.15, 2.0))}
                className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-sm"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.15, 0.8))}
                className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-sm"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(1.0)}
                className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-sm"
                title="Reset Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-slate-600 font-semibold ml-1">{Math.round(zoom * 100)}%</span>
            </div>
          </div>

          {/* Canvas Image Container with Normalized Bounding Box Overlays */}
          <div className="relative w-full h-[520px] bg-slate-900 rounded-lg border border-slate-300 overflow-hidden flex items-center justify-center shadow-inner">
            <div
              className="relative transition-transform duration-100 origin-center"
              style={{ transform: `scale(${zoom})` }}
            >
              {/* Cabinet Photograph */}
              <img
                src="/data/demo/cabinet_sample_01.jpg"
                alt="Cabinet Inspection View"
                className="max-h-[480px] w-auto object-contain rounded select-none"
              />

              {/* Render Bounding Boxes */}
              {findings
                .filter((f) => f.bbox_x !== undefined && f.bbox_width !== undefined)
                .map((f) => {
                  const isSelected = selectedFinding?.id === f.id;
                  let borderColor = '#10B981';
                  let bgColor = 'rgba(16, 185, 129, 0.2)';
                  if (f.status === 'FAIL') {
                    borderColor = '#EF4444';
                    bgColor = 'rgba(239, 68, 68, 0.3)';
                  } else if (f.status === 'REVIEW') {
                    borderColor = '#F59E0B';
                    bgColor = 'rgba(245, 158, 11, 0.3)';
                  }

                  return (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFinding(f)}
                      className={`absolute cursor-pointer transition-all duration-150 ${
                        isSelected ? 'ring-2 ring-white z-20 scale-105' : 'hover:scale-102 z-10'
                      }`}
                      style={{
                        left: `${f.bbox_x}%`,
                        top: `${f.bbox_y}%`,
                        width: `${f.bbox_width}%`,
                        height: `${f.bbox_height}%`,
                        border: `2px solid ${borderColor}`,
                        backgroundColor: bgColor,
                        borderRadius: '2px',
                      }}
                      title={`${f.component_ref}: ${f.status}`}
                    >
                      {/* Component Tag Label Pin */}
                      <span
                        className="absolute -top-4 left-0 px-1 py-0.2 rounded text-[9px] font-mono font-bold whitespace-nowrap shadow-md"
                        style={{
                          backgroundColor: borderColor,
                          color: f.status === 'REVIEW' ? '#000' : '#FFF',
                        }}
                      >
                        {f.component_ref}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 font-medium">
            <span>Click any bounding box or table row to view optical evidence crops</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded bg-emerald-500" /> PASS
              </span>
              <span className="flex items-center gap-1 text-red-700 font-semibold">
                <span className="w-2 h-2 rounded bg-red-500" /> FAIL
              </span>
              <span className="flex items-center gap-1 text-amber-800 font-semibold">
                <span className="w-2 h-2 rounded bg-amber-500" /> REVIEW
              </span>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Selected Finding Detail Drawer */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between animate-card-rise">
          {selectedFinding ? (
            <div className="space-y-4">
              {/* Finding Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-mono text-slate-500 font-medium">{selectedFinding.id}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                      {selectedFinding.check_type.replace('_', ' ')}
                    </span>
                    <SeverityBadge severity={selectedFinding.severity} size="sm" />
                    <SimulatedBadge isSimulated={selectedFinding.is_simulated} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-mono flex items-center gap-2">
                    {selectedFinding.component_ref}
                  </h3>
                </div>
                <StatusBadge status={selectedFinding.status} />
              </div>

              {/* Expected vs Observed Comparison Table */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Expected Reference Value:</span>
                  <span className="font-mono text-emerald-700 font-bold">{selectedFinding.expected_value || 'None'}</span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Observed Value from Camera:</span>
                  <span className={`font-mono font-bold ${
                    selectedFinding.status === 'FAIL' ? 'text-red-700' : selectedFinding.status === 'REVIEW' ? 'text-amber-800' : 'text-emerald-700'
                  }`}>
                    {selectedFinding.observed_value || 'None'}
                  </span>
                </div>
              </div>

              {/* Defect Explanation & Reasoning */}
              <div className="text-xs text-slate-700 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">AI Defect Analysis:</span>
                <p className="leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800 font-medium">
                  {selectedFinding.reason}
                </p>
              </div>

              {/* Recommended Action */}
              {selectedFinding.recommended_action && (
                <div className="text-xs text-slate-700 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-blue-700 font-bold block">Recommended Corrective Action:</span>
                  <p className="leading-relaxed bg-blue-50/70 p-2.5 rounded-lg border border-blue-200 text-blue-950 font-medium">
                    {selectedFinding.recommended_action}
                  </p>
                </div>
              )}

              {/* Zoomed Micro-Evidence Crop */}
              {selectedFinding.evidence_crop_path && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold flex items-center justify-between">
                    <span>Optical Micro-Evidence Snippet:</span>
                    <span className="text-blue-700 font-bold">Zoomed Evidence</span>
                  </span>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-300 flex items-center justify-center shadow-inner">
                    <img
                      src={`/${selectedFinding.evidence_crop_path}`}
                      alt="Close-up crop"
                      className="max-h-28 rounded object-contain border border-slate-700 shadow-md"
                    />
                  </div>
                </div>
              )}

              {/* Reviewer Override Form */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-700 font-bold flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  Human QC Reviewer Disposition Override
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={overrideStatus}
                    onChange={(e) => setOverrideStatus(e.target.value)}
                    className="text-xs font-mono bg-white text-slate-900 px-2 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="PASS">Override to PASS</option>
                    <option value="FAIL">Confirm as FAIL</option>
                    <option value="REVIEW">Keep as REVIEW</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Enter disposition reason / note..."
                    value={overrideNotes}
                    onChange={(e) => setOverrideNotes(e.target.value)}
                    className="flex-1 text-xs bg-white text-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 placeholder-slate-400"
                  />
                  <button
                    onClick={handleReviewOverride}
                    disabled={savingReview}
                    className="px-3 py-1.5 rounded-lg bg-[#0F2B5C] hover:bg-[#163A75] text-white font-semibold text-xs font-mono btn-lift shadow-sm transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs font-mono text-slate-400">
              Select a finding to inspect detailed optical evidence
            </div>
          )}

          {/* Quick Repair Action */}
          {selectedFinding && selectedFinding.status === 'FAIL' && (
            <button
              onClick={() => navigate('/repair')}
              className="w-full py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-mono font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors shadow-sm mt-3"
            >
              <Wrench className="w-4 h-4 text-red-600" />
              <span>Open Guided Repair Checklist for {selectedFinding.component_ref}</span>
            </button>
          )}
        </div>
      </div>

      {/* Comprehensive Filterable Findings Table */}
      <div className="p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm space-y-4 animate-card-rise">
        {/* Table Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">Full Checklist Items</span>
            <span className="text-xs font-mono text-slate-500">({filteredFindings.length} records)</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search ref tag, ferrule, or defect..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white w-64 font-mono placeholder-slate-400"
              />
            </div>

            {/* Check Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs font-mono text-slate-800 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Modules</option>
              <option value="GA_PLACEMENT">GA Placement</option>
              <option value="DEVICE_LABEL">Device Label</option>
              <option value="FERRULE_TEXT">Ferrule Text</option>
              <option value="WIRE_COLOUR">Wire Colour</option>
              <option value="WIRING_RELATIONSHIP">Relationship</option>
            </select>
          </div>
        </div>

        {/* Findings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-mono">
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Ref Tag</th>
                <th className="py-2.5 px-3">Module</th>
                <th className="py-2.5 px-3">Expected Reference</th>
                <th className="py-2.5 px-3">Observed Camera Result</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Evidence Location</th>
                <th className="py-2.5 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFindings.map((f) => {
                const isSelected = selectedFinding?.id === f.id;
                return (
                  <tr
                    key={f.id}
                    onClick={() => setSelectedFinding(f)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70 text-slate-900 font-semibold'
                        : 'hover:bg-slate-50/70 text-slate-700'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={f.status} size="sm" />
                        <SimulatedBadge isSimulated={f.is_simulated} />
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <SeverityBadge severity={f.severity} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{f.component_ref}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{f.check_type.replace('_', ' ')}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 max-w-xs truncate">{f.expected_value}</td>
                    <td className="py-2.5 px-3 font-mono max-w-xs truncate">
                      <span className={f.status === 'FAIL' ? 'text-red-700 font-bold' : f.status === 'REVIEW' ? 'text-amber-800 font-bold' : 'text-slate-700'}>
                        {f.observed_value}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      {f.confidence ? `${Math.round(f.confidence * 100)}%` : 'Simulated'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] truncate max-w-xs">
                      {f.source_reference || 'Blueprint DIN Rail'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFinding(f);
                        }}
                        className="text-xs font-mono text-blue-600 hover:underline font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <InspectionDisclaimer />
    </div>
  );
};
