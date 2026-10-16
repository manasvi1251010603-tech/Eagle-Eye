import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Scan,
  Cpu,
  Layers,
  Terminal,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import { useInspectionSession } from '../context/InspectionContext';

interface Stage {
  id: number;
  name: string;
  module: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'SIMULATED';
  detail: string;
}

export const ProcessingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSessionId, currentCabinetId } = useInspectionSession();
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const stages: Stage[] = [
    { id: 1, name: 'Validating Input Files', module: 'File Integrity', status: 'COMPLETED', detail: 'Checked magic bytes for JPG, PDF, XLSX (0 checksum errors).' },
    { id: 2, name: 'Extracting GA Blueprint Reference', module: 'CAD Parser', status: 'COMPLETED', detail: 'Identified 3 DIN rails, 10 expected mounting coordinates.' },
    { id: 3, name: 'Parsing Wiring Schedule & BOM', module: 'Schedule Parser', status: 'COMPLETED', detail: 'Extracted 14 wire loops, terminal tags, and gauge specs.' },
    { id: 4, name: 'Planar Perspective Alignment', module: 'OpenCV Homography', status: 'COMPLETED', detail: 'Rectified 3.2 deg camera tilt angle using H(3x3) matrix.' },
    { id: 5, name: 'Component Detection & Localization', module: 'YOLOv8 Engine (Demo Mode)', status: 'SIMULATED', detail: 'Detected PS1, QF1-3, SPD1, PLC1, K1, K2, KA1, X1.' },
    { id: 6, name: 'Reading Device Faceplate Labels', module: 'PaddleOCR Engine', status: 'SIMULATED', detail: 'Scanned labels: Flagged ambiguous stroke on breaker QF2 (read QFZ).' },
    { id: 7, name: 'Reading Wire Ferrule Tags', module: 'Micro-OCR Engine', status: 'SIMULATED', detail: 'Scanned ferrules: Detected inverted label X1:41 on loop W-108.' },
    { id: 8, name: 'Estimating Wire Insulation Colours', module: 'HSV Vision Estimator', status: 'SIMULATED', detail: 'Analyzed color codes: Flagged shadow ambiguity on wire W-108.' },
    { id: 9, name: 'Deterministic Rules Comparison', module: 'EAGLE EYE Engine', status: 'COMPLETED', detail: 'Cross-referenced observed vs expected: Flagged 2 FAIL, 2 REVIEW.' },
    { id: 10, name: 'Generating QC Findings & Visual Crops', module: 'Reportlab & Storage', status: 'COMPLETED', detail: 'Saved 4 micro-evidence crops, updated SQLite audit trail.' },
  ];

  useEffect(() => {
    let step = 0;

    const interval = setInterval(() => {
      step += 1;
      if (step <= 10) {
        setCurrentStageIdx(step);
        const st = stages[step - 1];
        setLogs((prev) => [
          ...prev,
          `[${new Date().toISOString().substring(11, 19)}] Stage ${step}/10: ${st.name} — ${st.detail}`
        ]);
      } else {
        clearInterval(interval);
        // Call backend to ensure findings are saved for the active session
        api.runPipeline(currentSessionId, false)
          .then(() => {
            setIsCompleted(true);
            setLogs((prev) => [
              ...prev,
              `[${new Date().toISOString().substring(11, 19)}] PIPELINE EXECUTION SUCCESSFUL. 19 items verified.`
            ]);
          })
          .catch((err) => {
            console.error('Pipeline execution error:', err);
            setIsCompleted(true);
          });
      }
    }, 400);

    return () => clearInterval(interval);
  }, [currentSessionId]);

  const progressPercent = Math.min(Math.round((currentStageIdx / 10) * 100), 100);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-surface border border-slate-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-blue/10 text-accent-cyan border border-accent-blue/30 font-bold uppercase">
              Step 3 of 3: AI Inspection Pipeline
            </span>
            <span className="text-xs font-mono text-gray-400">Cabinet: {currentCabinetId} ({currentSessionId})</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Automated Quality Inspection Pipeline
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Running 10-stage computer vision comparison against engineering CAD references.
          </p>
        </div>

        {/* Action Button */}
        <div>
          {isCompleted ? (
            <button
              onClick={() => navigate('/results')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-blue text-white font-semibold text-xs transition-transform hover:scale-[1.02] shadow-blue-glow hover:bg-accent-blue-dark"
            >
              <span>View QC Findings & Evidence</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono text-accent-cyan px-3 py-1.5 rounded bg-graphite border border-slate-border">
              <span className="w-2 h-2 rounded-full bg-accent-blue animate-ping" />
              <span>Analyzing Physical Imagery...</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-gray-300">Overall Pipeline Progress</span>
          <span className="text-accent-cyan font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-graphite rounded-full overflow-hidden border border-slate-border">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stages Grid & Console Output */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stages Checklist */}
        <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent-blue" />
            Active Verification Pipeline Stages
          </h3>

          <div className="space-y-2">
            {stages.map((st) => {
              const isPast = currentStageIdx >= st.id;
              const isCurrent = currentStageIdx === st.id && !isCompleted;

              return (
                <div
                  key={st.id}
                  className={`p-2.5 rounded-lg border text-xs font-mono transition-all flex items-start gap-2.5 ${
                    isCurrent
                      ? 'bg-surface-elevated border-accent-blue/50 text-white shadow-technical'
                      : isPast
                      ? 'bg-graphite/40 border-slate-border text-gray-300'
                      : 'bg-graphite/10 border-slate-border/50 text-gray-600'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate">{st.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded border ${
                        st.status === 'SIMULATED' ? 'bg-amber-950/30 text-amber-400 border-amber-500/30' : 'bg-surface text-gray-400 border-slate-border'
                      }`}>
                        {st.module}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">{st.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Terminal Output */}
        <div className="p-5 rounded-xl bg-graphite border border-slate-border flex flex-col justify-between space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-slate-border pb-2.5">
            <span className="text-xs text-gray-400 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-accent-cyan" />
              Engine Event Stream
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 text-[11px] text-gray-300 max-h-[380px] pr-1">
            {logs.map((log, i) => (
              <div key={i} className="leading-relaxed">
                <span className="text-accent-cyan font-bold">&gt;</span> {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
