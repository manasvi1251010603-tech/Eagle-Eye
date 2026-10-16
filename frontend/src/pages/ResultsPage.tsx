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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Bar with KPI Pills & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-surface border border-slate-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-blue/10 text-accent-cyan border border-accent-blue/30 font-bold uppercase">
              Quality Control Workstation
            </span>
            <span className="text-xs font-mono text-gray-400">Cabinet: {currentCabinetId} ({currentSessionId})</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Visual Inspection Results & Evidence Markup
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Compare actual cabinet photographs against expected GA references and Excel schedules. Every finding includes severity and evidence crops.
          </p>
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/reports-analytics')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-elevated border border-slate-border text-xs font-mono text-gray-300 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Generate Report</span>
          </button>
          <button
            onClick={() => navigate('/repair')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-950/40 border border-red-500/40 text-xs font-mono text-red-300 hover:bg-red-900/50 transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-red-400" />
            <span>Start Guided Repair ({failCount})</span>
          </button>
          <button
            onClick={() => navigate('/reinspection')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-blue text-white font-semibold text-xs transition-transform hover:scale-[1.02] shadow-blue-glow hover:bg-accent-blue-dark"
          >
            <RefreshCw className="w-3.5 h-3.5 text-white" />
            <span>Reinspect Cabinet</span>
          </button>
        </div>
      </div>

      {/* Summary Count Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter(statusFilter === 'PASS' ? 'ALL' : 'PASS')}
          className={`p-3 rounded-lg border text-left transition-all ${
            statusFilter === 'PASS' ? 'border-emerald-400 bg-emerald-950/30' : 'bg-surface border-slate-border'
          }`}
        >
          <div className="text-[10px] font-mono uppercase text-emerald-400">PASSED ITEMS</div>
          <div className="text-xl font-mono font-bold text-emerald-400">{passCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'FAIL' ? 'ALL' : 'FAIL')}
          className={`p-3 rounded-lg border text-left transition-all ${
            statusFilter === 'FAIL' ? 'border-red-400 bg-red-950/30' : 'bg-surface border-slate-border'
          }`}
        >
          <div className="text-[10px] font-mono uppercase text-red-400">FAILED (OPEN DEFECTS)</div>
          <div className="text-xl font-mono font-bold text-red-400">{failCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'REVIEW' ? 'ALL' : 'REVIEW')}
          className={`p-3 rounded-lg border text-left transition-all ${
            statusFilter === 'REVIEW' ? 'border-amber-400 bg-amber-950/30' : 'bg-surface border-slate-border'
          }`}
        >
          <div className="text-[10px] font-mono uppercase text-amber-400">REQUIRES REVIEW</div>
          <div className="text-xl font-mono font-bold text-amber-400">{reviewCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'NOT_CHECKED' ? 'ALL' : 'NOT_CHECKED')}
          className={`p-3 rounded-lg border text-left transition-all ${
            statusFilter === 'NOT_CHECKED' ? 'border-gray-400 bg-gray-900/50' : 'bg-surface border-slate-border'
          }`}
        >
          <div className="text-[10px] font-mono uppercase text-gray-400">NOT CHECKED</div>
          <div className="text-xl font-mono font-bold text-gray-400">{ncCount}</div>
        </button>
      </div>

      {/* Main Two-Column View: Left Canvas + Right Findings Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Interactive Annotated Visual Canvas */}
        <div className="lg:col-span-7 p-4 rounded-xl bg-surface border border-slate-border space-y-3 flex flex-col justify-between">
          {/* Canvas Toolbar */}
          <div className="flex items-center justify-between text-xs bg-graphite p-2 rounded-lg border border-slate-border">
            <span className="font-mono text-gray-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent-blue" />
              Physical Cabinet View with Bounding Box Markup
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.15, 2.0))}
                className="p-1.5 rounded bg-surface text-gray-300 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.15, 0.8))}
                className="p-1.5 rounded bg-surface text-gray-300 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(1.0)}
                className="p-1.5 rounded bg-surface text-gray-300 hover:text-white"
                title="Reset Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-gray-400 ml-1">{Math.round(zoom * 100)}%</span>
            </div>
          </div>

          {/* Canvas Image Container with Normalized Bounding Box Overlays */}
          <div className="relative w-full h-[520px] bg-graphite rounded-lg border border-slate-border overflow-hidden flex items-center justify-center">
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
                  let bgColor = 'rgba(16, 185, 129, 0.15)';
                  if (f.status === 'FAIL') {
                    borderColor = '#EF4444';
                    bgColor = 'rgba(239, 68, 68, 0.25)';
                  } else if (f.status === 'REVIEW') {
                    borderColor = '#F59E0B';
                    bgColor = 'rgba(245, 158, 11, 0.25)';
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
                        className="absolute -top-4 left-0 px-1 py-0.2 rounded text-[9px] font-mono font-bold whitespace-nowrap shadow-sm"
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

          <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
            <span>Click any bounding box or row below to view optical evidence crops</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded bg-emerald-400" /> PASS
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2 h-2 rounded bg-red-400" /> FAIL
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded bg-amber-400" /> REVIEW
              </span>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Selected Finding Detail Drawer */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-surface border border-slate-border space-y-4 flex flex-col justify-between">
          {selectedFinding ? (
            <div className="space-y-4">
              {/* Finding Header */}
              <div className="flex items-start justify-between border-b border-slate-border pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-mono text-gray-400">{selectedFinding.id}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-graphite border border-slate-border text-gray-300">
                      {selectedFinding.check_type.replace('_', ' ')}
                    </span>
                    <SeverityBadge severity={selectedFinding.severity} size="sm" />
                    <SimulatedBadge isSimulated={selectedFinding.is_simulated} />
                  </div>
                  <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                    {selectedFinding.component_ref}
                  </h3>
                </div>
                <StatusBadge status={selectedFinding.status} />
              </div>

              {/* Expected vs Observed Comparison Table */}
              <div className="p-3 rounded-lg bg-graphite border border-slate-border space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-gray-400 block">Expected Reference Value:</span>
                  <span className="font-mono text-emerald-400 font-semibold">{selectedFinding.expected_value || 'None'}</span>
                </div>
                <div className="pt-2 border-t border-slate-border">
                  <span className="text-[10px] font-mono uppercase text-gray-400 block">Observed Value from Camera:</span>
                  <span className={`font-mono font-semibold ${
                    selectedFinding.status === 'FAIL' ? 'text-red-400' : selectedFinding.status === 'REVIEW' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {selectedFinding.observed_value || 'None'}
                  </span>
                </div>
              </div>

              {/* Defect Explanation & Reasoning */}
              <div className="text-xs text-gray-300 space-y-1">
                <span className="text-[10px] font-mono uppercase text-gray-400 block">AI Defect Analysis:</span>
                <p className="leading-relaxed bg-surface-elevated p-2.5 rounded border border-slate-border">
                  {selectedFinding.reason}
                </p>
              </div>

              {/* Recommended Action */}
              {selectedFinding.recommended_action && (
                <div className="text-xs text-gray-300 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-accent-cyan block">Recommended Corrective Action:</span>
                  <p className="leading-relaxed bg-surface-elevated p-2.5 rounded border border-accent-blue/30 text-gray-200">
                    {selectedFinding.recommended_action}
                  </p>
                </div>
              )}

              {/* Zoomed Micro-Evidence Crop */}
              {selectedFinding.evidence_crop_path && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-gray-400 flex items-center justify-between">
                    <span>Optical Micro-Evidence Snippet:</span>
                    <span className="text-accent-cyan font-bold">Zoomed Evidence</span>
                  </span>
                  <div className="p-2 rounded bg-graphite border border-slate-border flex items-center justify-center">
                    <img
                      src={`/${selectedFinding.evidence_crop_path}`}
                      alt="Close-up crop"
                      className="max-h-28 rounded object-contain border border-slate-border shadow-md"
                    />
                  </div>
                </div>
              )}

              {/* Reviewer Override Form */}
              <div className="p-3 rounded-lg bg-surface-elevated border border-slate-border space-y-2">
                <span className="text-[10px] font-mono uppercase text-gray-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-accent-cyan" />
                  Human QC Reviewer Disposition Override
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={overrideStatus}
                    onChange={(e) => setOverrideStatus(e.target.value)}
                    className="text-xs font-mono bg-graphite text-white px-2 py-1.5 rounded border border-slate-border focus:outline-none"
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
                    className="flex-1 text-xs bg-graphite text-white px-2.5 py-1.5 rounded border border-slate-border focus:outline-none focus:border-accent-blue"
                  />
                  <button
                    onClick={handleReviewOverride}
                    disabled={savingReview}
                    className="px-3 py-1.5 rounded bg-accent-blue text-white font-semibold text-xs font-mono hover:bg-accent-blue-dark transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs font-mono text-gray-400">
              Select a finding to inspect detailed optical evidence
            </div>
          )}

          {/* Quick Repair Action */}
          {selectedFinding && selectedFinding.status === 'FAIL' && (
            <button
              onClick={() => navigate('/repair')}
              className="w-full py-2.5 rounded-lg bg-red-950/40 border border-red-500/50 text-red-300 text-xs font-mono font-semibold flex items-center justify-center gap-2 hover:bg-red-900/60 transition-colors shadow-sm"
            >
              <Wrench className="w-4 h-4 text-red-400" />
              <span>Open Guided Repair Checklist for {selectedFinding.component_ref}</span>
            </button>
          )}
        </div>
      </div>

      {/* Comprehensive Filterable Findings Table */}
      <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-4">
        {/* Table Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">Full Checklist Items</span>
            <span className="text-xs font-mono text-gray-400">({filteredFindings.length} records)</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search ref tag, ferrule, or defect..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded bg-graphite border border-slate-border text-xs text-white focus:outline-none focus:border-accent-blue w-64 font-mono"
              />
            </div>

            {/* Check Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded bg-graphite border border-slate-border text-xs font-mono text-gray-300 focus:outline-none"
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
              <tr className="border-b border-slate-border text-gray-400 font-mono">
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
            <tbody className="divide-y divide-slate-border">
              {filteredFindings.map((f) => {
                const isSelected = selectedFinding?.id === f.id;
                return (
                  <tr
                    key={f.id}
                    onClick={() => setSelectedFinding(f)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-surface-elevated text-white font-medium'
                        : 'hover:bg-surface-elevated/60 text-gray-300'
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
                    <td className="py-2.5 px-3 font-mono font-bold text-white">{f.component_ref}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-400">{f.check_type.replace('_', ' ')}</td>
                    <td className="py-2.5 px-3 font-mono text-gray-300 max-w-xs truncate">{f.expected_value}</td>
                    <td className="py-2.5 px-3 font-mono max-w-xs truncate">
                      <span className={f.status === 'FAIL' ? 'text-red-400 font-semibold' : f.status === 'REVIEW' ? 'text-amber-400 font-semibold' : 'text-gray-300'}>
                        {f.observed_value}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-gray-400">
                      {f.confidence ? `${Math.round(f.confidence * 100)}%` : 'Simulated'}
                    </td>
                    <td className="py-2.5 px-3 text-gray-400 font-mono text-[11px] truncate max-w-xs">
                      {f.source_reference || 'Blueprint DIN Rail'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFinding(f);
                        }}
                        className="text-xs font-mono text-accent-cyan hover:underline"
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
