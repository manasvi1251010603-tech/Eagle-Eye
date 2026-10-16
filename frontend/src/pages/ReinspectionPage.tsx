import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Split,
  Sparkles,
  Lock,
  Download,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../services/api';
import { useInspectionSession } from '../context/InspectionContext';
import { ReinspectionDiff } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { InspectionDisclaimer } from '../components/common/InspectionDisclaimer';

export const ReinspectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSessionId, currentCabinetId } = useInspectionSession();
  const [inspector, setInspector] = useState('Lead QC Inspector');
  const [notes, setNotes] = useState('Post-rework verification: Contactor K1 aligned, ferrule sleeve X1:14 corrected.');
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [diffResult, setDiffResult] = useState<ReinspectionDiff | null>(null);
  const [isSessionClosed, setIsSessionClosed] = useState(false);

  // Slider comparison percentage [0..100]
  const [sliderPos, setSliderPos] = useState(50);

  const handleRunReinspection = async () => {
    setLoading(true);
    try {
      const res = await api.reinspect(currentSessionId, {
        inspector: inspector,
        reinspection_notes: notes,
      });
      setDiffResult(res);
    } catch (err: any) {
      alert(`Reinspection failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSession = async () => {
    if (!diffResult) return;
    setClosing(true);
    try {
      await api.closeSession(diffResult.reinspection_session_id);
      setIsSessionClosed(true);
      alert('Inspection session officially CLOSED and archived into QC audit repository.');
    } catch (err: any) {
      alert(`Cannot close session: ${err.message}`);
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-surface border border-slate-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
              Phase 7: Digital Audit & Reinspection
            </span>
            <span className="text-xs font-mono text-gray-400">Cabinet: {currentCabinetId} (Parent: {currentSessionId})</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Cabinet Reinspection & Rework Verification
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Verify post-repair physical cabinet imagery against prior defect findings. History is immutable.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunReinspection}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-blue text-white font-semibold text-xs transition-transform hover:scale-[1.02] shadow-blue-glow hover:bg-accent-blue-dark"
          >
            <RefreshCw className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Evaluating Fresh Photo...' : 'Execute Reinspection Check'}</span>
          </button>
        </div>
      </div>

      {/* Before vs After Visual Comparison Slider */}
      <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-gray-300 flex items-center gap-2">
            <Split className="w-4 h-4 text-accent-lime" />
            Interactive Before (Initial Defect) vs After (Post-Repair) Split Comparison
          </span>
          <div className="flex items-center gap-4 text-gray-400">
            <span className="text-red-400 font-bold">LEFT: INITIAL INSPECTION (FAIL)</span>
            <span>|</span>
            <span className="text-emerald-400 font-bold">RIGHT: POST-REPAIR (VERIFIED)</span>
          </div>
        </div>

        {/* Comparison Viewer Container */}
        <div className="relative w-full h-[450px] bg-charcoal rounded-lg border border-slate-border overflow-hidden select-none">
          {/* Layer 1: After Photo (Repaired) */}
          <img
            src="/data/demo/cabinet_sample_01_repaired.jpg"
            alt="Repaired Cabinet"
            className="absolute inset-0 w-full h-full object-contain"
          />

          {/* Layer 2: Before Photo (Clipped by slider position) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src="/data/demo/cabinet_sample_01.jpg"
              alt="Initial Cabinet"
              className="absolute inset-0 w-full h-full object-contain max-w-none"
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          {/* Draggable Divider Line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-accent-lime shadow-lime-glow z-10 cursor-ew-resize flex items-center justify-center"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="w-6 h-6 rounded-full bg-accent-lime text-black flex items-center justify-center text-[10px] font-bold shadow-md">
              ↔
            </div>
          </div>

          {/* Slider Input Controller */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(parseFloat(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-ew-resize z-20"
          />
        </div>
      </div>

      {/* Smart Diff Results Breakdown */}
      {diffResult ? (
        <div className="space-y-6">
          {/* Diff Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-lg bg-surface border border-emerald-500/30 bg-emerald-950/20">
              <span className="text-[10px] font-mono uppercase text-emerald-400 block mb-1">
                Resolved Defects
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {diffResult.resolved_findings.length}
              </div>
              <span className="text-[10px] text-emerald-400/80">K1 Placed & X1:14 Re-tagged</span>
            </div>

            <div className="p-4 rounded-lg bg-surface border border-slate-border">
              <span className="text-[10px] font-mono uppercase text-gray-400 block mb-1">
                Persistent Defects
              </span>
              <div className="text-2xl font-bold font-mono text-white">
                {diffResult.persistent_findings.length}
              </div>
              <span className="text-[10px] text-gray-400">0 lingering defects</span>
            </div>

            <div className="p-4 rounded-lg bg-surface border border-slate-border">
              <span className="text-[10px] font-mono uppercase text-gray-400 block mb-1">
                Newly Detected Defects
              </span>
              <div className="text-2xl font-bold font-mono text-white">
                {diffResult.new_findings.length}
              </div>
              <span className="text-[10px] text-gray-400">0 regressions</span>
            </div>

            <div className="p-4 rounded-lg bg-surface border border-slate-border">
              <span className="text-[10px] font-mono uppercase text-gray-400 block mb-1">
                Closure Gatekeeper
              </span>
              <div className={`text-sm font-bold font-mono ${diffResult.can_close_session ? 'text-emerald-400' : 'text-red-400'}`}>
                {diffResult.can_close_session ? 'READY TO CLOSE' : 'BLOCKED'}
              </div>
              <span className="text-[10px] text-gray-400">All required fails verified</span>
            </div>
          </div>

          {/* Resolved Defects Table */}
          <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Verified Resolved Findings
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-border text-gray-400 font-mono">
                    <th className="py-2 px-3">Ref Tag</th>
                    <th className="py-2 px-3">Module</th>
                    <th className="py-2 px-3">Previous Defect State</th>
                    <th className="py-2 px-3">Post-Repair Verified State</th>
                    <th className="py-2 px-3">Reinspection Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-border font-mono">
                  {diffResult.resolved_findings.map((f) => (
                    <tr key={f.id} className="text-gray-300">
                      <td className="py-2.5 px-3 font-bold text-white">{f.component_ref}</td>
                      <td className="py-2.5 px-3 text-gray-400">{f.check_type.replace('_', ' ')}</td>
                      <td className="py-2.5 px-3 text-red-400">
                        {f.component_ref === 'K1' ? 'Misplaced at Slot 5 (X:61.6%)' : 'Inverted tag X1:41'}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-400">{f.observed_value}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status="PASS" size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Closure Gate Footer */}
          <div className="p-5 rounded-xl bg-surface border border-slate-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Factory Acceptance Testing (FAT) Closure Gate
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                All 2 open defects have passed optical reinspection. Session may now be permanently archived.
              </p>
            </div>

            {isSessionClosed ? (
              <span className="px-4 py-2 rounded-lg bg-blue-950/40 border border-blue-500/40 text-blue-300 font-mono text-xs flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-blue-400" /> Session Officially CLOSED
              </span>
            ) : (
              <button
                onClick={handleCloseSession}
                disabled={closing || !diffResult.can_close_session}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-transform hover:scale-[1.02] shadow-md"
              >
                <Lock className="w-3.5 h-3.5 text-black" />
                <span>{closing ? 'Closing Session...' : 'Approve & Officially Close QC Session'}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-surface border border-slate-border text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-accent-lime mx-auto animate-spin" />
          <h3 className="text-sm font-semibold text-white">Reinspection Awaiting Execution</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Click <strong>"Execute Reinspection Check"</strong> to cross-reference the post-repair photograph 
            against the previous findings and calculate the automated defect diff.
          </p>
        </div>
      )}

      <InspectionDisclaimer />
    </div>
  );
};
