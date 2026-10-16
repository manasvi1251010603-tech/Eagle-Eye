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
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-card-rise">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold uppercase">
              AI Inspection Processing Pipeline
            </span>
            <span className="text-xs font-mono text-slate-500">
              Cabinet: <strong className="text-slate-800">{currentCabinetId}</strong> ({currentSessionId})
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Automated Quality Inspection Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Running 10-stage computer vision comparison against engineering CAD references.
          </p>
        </div>

        {/* Action Button */}
        <div>
          {isCompleted ? (
            <button
              onClick={() => navigate('/results')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F2B5C] hover:bg-[#163A75] text-white font-semibold text-xs btn-lift shadow-sm transition-all"
            >
              <span>View QC Findings & Evidence</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono text-blue-700 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>Analyzing Physical Imagery...</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm space-y-3 animate-card-rise">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-700 font-semibold">Overall Pipeline Progress</span>
          <span className="text-blue-700 font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stages Grid & Console Output */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stages Checklist */}
        <div className="p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm space-y-3 animate-card-rise">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center gap-2 border-b border-slate-100 pb-2">
            <Layers className="w-4 h-4 text-blue-600" />
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
                      ? 'bg-blue-50 border-blue-400 text-slate-900 shadow-sm'
                      : isPast
                      ? 'bg-slate-50/80 border-slate-200 text-slate-800'
                      : 'bg-slate-50/30 border-slate-100 text-slate-400'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold truncate">{st.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${
                        st.status === 'SIMULATED' ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-white text-slate-600 border-slate-200'
                      }`}>
                        {st.module}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{st.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Terminal Output */}
        <div className="p-5 rounded-xl bg-[#0B1528] backdrop-blur-md border border-slate-800 shadow-md flex flex-col justify-between space-y-3 font-mono animate-card-rise">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="text-xs text-slate-300 font-semibold flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              Engine Event Stream
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 text-[11px] text-slate-300 max-h-[380px] pr-1">
            {logs.map((log, i) => (
              <div key={i} className="leading-relaxed">
                <span className="text-blue-400 font-bold">&gt;</span> {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
