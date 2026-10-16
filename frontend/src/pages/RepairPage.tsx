import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  CheckSquare,
  Square,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Save,
  CheckCircle2,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useInspectionSession } from '../context/InspectionContext';
import { InspectionFinding, RepairAction } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { InspectionDisclaimer } from '../components/common/InspectionDisclaimer';

export const RepairPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSessionId, currentCabinetId } = useInspectionSession();
  const [failFindings, setFailFindings] = useState<InspectionFinding[]>([]);
  const [activeFinding, setActiveFinding] = useState<InspectionFinding | null>(null);
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [technicianName, setTechnicianName] = useState('A. Patil (Assembly Tech)');
  const [savingNotes, setSavingNotes] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFails() {
      try {
        const allFindings = await api.getFindings(currentSessionId);
        const actionable = allFindings.filter((f) => f.status === 'FAIL' || f.status === 'REVIEW');
        setFailFindings(actionable);
        if (actionable.length > 0) {
          setActiveFinding(actionable[0]);
        }
      } catch (err) {
        console.error('Failed to load failed findings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFails();
  }, [currentSessionId]);

  const handleToggleChecklist = async (action: RepairAction) => {
    try {
      const updated = await api.updateRepairAction(action.id, {
        is_completed: !action.is_completed,
        technician: technicianName,
      });

      // Update local state
      if (activeFinding) {
        const newActions = activeFinding.repair_actions.map((a) => (a.id === updated.id ? updated : a));
        setActiveFinding({ ...activeFinding, repair_actions: newActions });
        setFailFindings((prev) =>
          prev.map((f) => (f.id === activeFinding.id ? { ...f, repair_actions: newActions } : f))
        );
      }
    } catch (err: any) {
      alert(`Failed to update checklist item: ${err.message}`);
    }
  };

  const allRepairsFinished = failFindings.every(
    (f) => f.repair_actions.length > 0 && f.repair_actions.every((a) => a.is_completed)
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm animate-card-rise">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-50 text-red-800 border border-red-200 font-bold uppercase">
              Rework Guidance & Quality Sign-Off
            </span>
            <span className="text-xs font-mono text-slate-500">
              Cabinet: <strong className="text-slate-800">{currentCabinetId}</strong> ({currentSessionId})
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Guided Repair Assistant
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step isolation, correction, and re-termination checklists for physical defect rectification.
          </p>
        </div>

        <button
          onClick={() => navigate('/reinspection')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F2B5C] hover:bg-[#163A75] text-white font-semibold text-xs btn-lift shadow-sm transition-all"
        >
          <RefreshCw className="w-4 h-4 text-white" />
          <span>Upload Reinspection Photo</span>
        </button>
      </div>

      {/* Safety Notice Callout */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 shadow-sm flex items-start gap-3 animate-card-rise">
        <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="text-xs text-amber-950 space-y-1">
          <h4 className="font-bold text-amber-900">Lock-Out / Tag-Out (LOTO) Mandatory Policy</h4>
          <p className="text-amber-900/90 leading-relaxed">
            All physical electrical modifications (component repositioning, wire trimming, ferrule re-crimping) must be 
            performed with the cabinet de-energized. Marking items as completed logs a rework action; 
            <strong> items remain marked as FAIL in the official QC audit until verified by Reinspection.</strong>
          </p>
        </div>
      </div>

      {/* Main Repair Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Defect Tabs */}
        <div className="lg:col-span-4 space-y-3 animate-card-rise">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold block px-1">
            Actionable Discrepancies ({failFindings.length})
          </span>

          <div className="space-y-2">
            {failFindings.map((finding) => {
              const isSelected = activeFinding?.id === finding.id;
              const completedCount = finding.repair_actions.filter((a) => a.is_completed).length;
              const totalCount = finding.repair_actions.length;

              return (
                <div
                  key={finding.id}
                  onClick={() => setActiveFinding(finding)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all backdrop-blur-md shadow-sm ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-500 text-slate-900'
                      : 'bg-white/95 border-slate-200/90 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-slate-900 text-xs flex items-center gap-2">
                      {finding.component_ref}
                    </span>
                    <StatusBadge status={finding.status} size="sm" />
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mb-2">
                    {finding.check_type.replace('_', ' ')}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1.5 border-t border-slate-100">
                    <span>Checklist Progress:</span>
                    <span className={completedCount === totalCount && totalCount > 0 ? 'text-emerald-700 font-bold' : 'text-slate-700 font-semibold'}>
                      {completedCount} / {totalCount} Steps
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: Guided Repair Checklist */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm space-y-5 animate-card-rise">
          {activeFinding ? (
            <div className="space-y-5">
              {/* Finding Summary Banner */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Selected Discrepancy</div>
                  <h3 className="text-base font-bold text-slate-900 font-mono flex items-center gap-2">
                    {activeFinding.component_ref} — {activeFinding.check_type.replace('_', ' ')}
                  </h3>
                  <p className="text-xs text-slate-700 mt-1 max-w-lg leading-relaxed font-medium">
                    {activeFinding.reason}
                  </p>
                </div>
                {activeFinding.evidence_crop_path && (
                  <div className="shrink-0 p-1 bg-white rounded-lg border border-slate-300 shadow-sm">
                    <img
                      src={`/${activeFinding.evidence_crop_path}`}
                      alt="Crop"
                      className="h-16 w-24 object-contain rounded"
                    />
                  </div>
                )}
              </div>

              {/* Step-by-Step Interactive Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-blue-700 font-bold flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-blue-600" />
                    Standard Operating Correction Checklist
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500">
                    Technician: <strong className="text-slate-800">{technicianName}</strong>
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeFinding.repair_actions.length > 0 ? (
                    activeFinding.repair_actions.map((action, idx) => (
                      <div
                        key={action.id}
                        onClick={() => handleToggleChecklist(action)}
                        className={`p-3 rounded-lg border cursor-pointer flex items-start gap-3 transition-colors ${
                          action.is_completed
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-slate-50 border-slate-200 hover:bg-blue-50/40 text-slate-800'
                        }`}
                      >
                        <button className="mt-0.5 text-blue-600 shrink-0">
                          {action.is_completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <div className="text-xs leading-relaxed font-medium">
                          <span className="font-mono text-slate-500 mr-2 font-semibold">Step {idx + 1}:</span>
                          <span className={action.is_completed ? 'line-through text-slate-400' : 'text-slate-900'}>
                            {action.checklist_item}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs font-mono text-slate-400">
                      No automated checklist items generated for this finding category. Manual disposition recorded.
                    </div>
                  )}
                </div>
              </div>

              {/* Technician Repair Notes */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-mono text-slate-600 font-semibold">
                  Technician Rework Notes & Torque Record:
                </label>
                <textarea
                  rows={3}
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  placeholder="Record screwdriver torque values, part replacement serial numbers, or rework observations..."
                  className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white font-mono placeholder-slate-400"
                />
              </div>

              {/* Bottom Confirm Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-mono text-slate-500">
                  All steps must be executed before uploading post-repair photo.
                </span>

                <button
                  onClick={() => navigate('/reinspection')}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#0F2B5C] hover:bg-[#163A75] text-white font-semibold text-xs btn-lift shadow-sm transition-all"
                >
                  <span>Proceed to Reinspection Workspace</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-xs font-mono text-slate-400">
              No defect selected.
            </div>
          )}
        </div>
      </div>

      <InspectionDisclaimer />
    </div>
  );
};
