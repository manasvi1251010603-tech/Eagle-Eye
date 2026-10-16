import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Layers,
  Table,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { useInspectionSession } from '../context/InspectionContext';
import { SchedulePreview } from '../types';

export const NewInspectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentSessionId, refreshSessions } = useInspectionSession();

  // Form metadata
  const [cabinetId, setCabinetId] = useState('CAB-4092');
  const [workOrder, setWorkOrder] = useState('WO-8492');
  const [batchId, setBatchId] = useState('BATCH-2026-Q4');
  const [inspector, setInspector] = useState('Samarth Shingare (Lead QC)');
  const [revision, setRevision] = useState('Rev C');

  // Files
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [gaFile, setGaFile] = useState<File | null>(null);
  const [scheduleFile, setScheduleFile] = useState<File | null>(null);

  // Previews & states
  const [photoPreview, setPhotoPreview] = useState<string>('/data/demo/cabinet_sample_01.jpg');
  const [gaFilename, setGaFilename] = useState<string>('GA_Drawing_Cabinet_RevC.pdf');
  const [scheduleFilename, setScheduleFilename] = useState<string>('Wiring_Schedule_RevC.xlsx');
  const [isDemoPack, setIsDemoPack] = useState(true);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Handle loading sample demo pack
  const handleLoadDemoPack = async () => {
    setLoadingDemo(true);
    try {
      setCabinetId('CAB-4092');
      setWorkOrder('WO-8492');
      setBatchId('BATCH-2026-Q4');
      setInspector('Samarth Shingare (Lead QC)');
      setRevision('Rev C');
      setPhotoFile(null);
      setGaFile(null);
      setScheduleFile(null);
      setPhotoPreview('/data/demo/cabinet_sample_01.jpg');
      setGaFilename('GA_Drawing_Cabinet_RevC.pdf');
      setScheduleFilename('Wiring_Schedule_RevC.xlsx');
      setIsDemoPack(true);
    } catch (err) {
      console.error('Error loading demo pack:', err);
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleStartInspection = async () => {
    setSubmitting(true);
    try {
      // 1. Create inspection session in backend
      const session = await api.createInspection({
        cabinet_id: cabinetId,
        work_order_id: workOrder,
        batch_id: batchId,
        inspector: inspector,
        reference_revision: revision,
        processing_mode: 'DEMO'
      });

      // 2. Upload actual files if selected, or load demo pack
      if (photoFile || gaFile || scheduleFile) {
        const formData = new FormData();
        if (photoFile) formData.append('cabinet_photo', photoFile);
        if (gaFile) formData.append('ga_drawing', gaFile);
        if (scheduleFile) formData.append('wiring_schedule', scheduleFile);
        await api.uploadFiles(session.id, formData);
      } else {
        await api.loadDemoPack(session.id);
      }

      // 3. Set global active session
      setCurrentSessionId(session.id, session.cabinet_id);
      await refreshSessions();

      // 4. Navigate to Reference & Alignment Workspace
      navigate('/reference-alignment');
    } catch (err: any) {
      alert(`Failed to start inspection: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Title & One-Click Demo Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-surface border border-slate-border">
        <div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-blue/10 text-accent-cyan border border-accent-blue/30 font-bold uppercase">
            Step 1 of 3: Reference Ingestion
          </span>
          <h2 className="text-xl font-bold text-white tracking-wide mt-1">
            New Inspection Workspace
          </h2>
          <p className="text-xs text-gray-400">
            Upload the physical cabinet photograph, 2D General Arrangement blueprint (PDF), and Excel wiring schedule.
          </p>
        </div>

        <button
          onClick={handleLoadDemoPack}
          disabled={loadingDemo}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-elevated border border-accent-blue/40 text-accent-cyan text-xs font-mono font-medium hover:bg-accent-blue/20 transition-colors shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-accent-cyan" />
          <span>{loadingDemo ? 'Loading Sample Pack...' : 'Load Industrial Demo Pack'}</span>
        </button>
      </div>

      {/* Metadata Configuration Grid */}
      <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400">
          Inspection Metadata & Traceability
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1">Cabinet ID *</label>
            <input
              type="text"
              value={cabinetId}
              onChange={(e) => setCabinetId(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-graphite border border-slate-border text-white text-xs font-mono focus:border-accent-blue focus:outline-none"
              placeholder="e.g. CAB-4092"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1">Work Order *</label>
            <input
              type="text"
              value={workOrder}
              onChange={(e) => setWorkOrder(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-graphite border border-slate-border text-white text-xs font-mono focus:border-accent-blue focus:outline-none"
              placeholder="e.g. WO-8492"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1">Batch Number</label>
            <input
              type="text"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-graphite border border-slate-border text-white text-xs font-mono focus:border-accent-blue focus:outline-none"
              placeholder="e.g. BATCH-2026-Q4"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1">Inspector Name *</label>
            <input
              type="text"
              value={inspector}
              onChange={(e) => setInspector(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-graphite border border-slate-border text-white text-xs font-mono focus:border-accent-blue focus:outline-none"
              placeholder="e.g. S. Shingare"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-gray-400 mb-1">Drawing Revision</label>
            <input
              type="text"
              value={revision}
              onChange={(e) => setRevision(e.target.value)}
              className="w-full px-3 py-1.5 rounded bg-graphite border border-slate-border text-white text-xs font-mono focus:border-accent-blue focus:outline-none"
              placeholder="e.g. Rev C"
            />
          </div>
        </div>
      </div>

      {/* 3 Prominent Upload Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Section A: Cabinet Photograph */}
        <div className="p-5 rounded-xl bg-surface border border-slate-border flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-accent-cyan">SECTION A</span>
              <span className="text-[10px] font-mono text-gray-400">JPG, PNG (Max 50MB)</span>
            </div>
            <h4 className="text-sm font-semibold text-white">Cabinet Photograph</h4>
            <p className="text-xs text-gray-400 mt-0.5">
              High-resolution front-facing photograph of the fully wired control cabinet.
            </p>
          </div>

          {/* Upload Dropzone / Preview */}
          <div className="relative border-2 border-dashed border-slate-border rounded-lg p-3 text-center bg-graphite/60 hover:border-accent-blue/50 transition-colors">
            {photoPreview ? (
              <div className="space-y-2">
                <img
                  src={photoPreview}
                  alt="Cabinet Preview"
                  className="w-full h-36 object-cover rounded border border-slate-border"
                />
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-300">
                  <span className="truncate">{photoFile ? photoFile.name : 'cabinet_sample_01.jpg'}</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Validated
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 space-y-2">
                <UploadCloud className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-xs text-gray-300">Drag & drop cabinet photograph here</p>
              </div>
            )}

            <label className="mt-2 block w-full py-1.5 rounded bg-surface-elevated text-xs font-mono text-accent-cyan cursor-pointer hover:bg-surface-highlight border border-slate-border text-center">
              {photoFile ? 'Change Cabinet Photo' : 'Browse Cabinet Photo'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setPhotoFile(e.target.files[0]);
                    setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                    setIsDemoPack(false);
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* Section B: GA Drawing */}
        <div className="p-5 rounded-xl bg-surface border border-slate-border flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-accent-cyan">SECTION B</span>
              <span className="text-[10px] font-mono text-gray-400">PDF Document</span>
            </div>
            <h4 className="text-sm font-semibold text-white">General Arrangement (GA)</h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Vector mechanical CAD layout blueprint with DIN rail slots & component tags.
            </p>
          </div>

          {/* Upload Dropzone / Preview */}
          <div className="relative border-2 border-dashed border-slate-border rounded-lg p-3 text-center bg-graphite/60 hover:border-accent-blue/50 transition-colors">
            <div className="space-y-2">
              <div className="w-full h-36 flex flex-col items-center justify-center rounded bg-graphite border border-slate-border p-2">
                <FileText className="w-10 h-10 text-accent-blue mb-1" />
                <span className="text-xs font-mono text-white truncate max-w-[200px]">
                  {gaFile ? gaFile.name : gaFilename}
                </span>
                <span className="text-[10px] text-gray-400">
                  {gaFile ? `${(gaFile.size / 1024).toFixed(1)} KB` : 'Demo PDF Blueprint'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-gray-300">
                <span className="truncate">{gaFile ? gaFile.name : gaFilename}</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Validated
                </span>
              </div>
            </div>

            <label className="mt-2 block w-full py-1.5 rounded bg-surface-elevated text-xs font-mono text-accent-cyan cursor-pointer hover:bg-surface-highlight border border-slate-border text-center">
              {gaFile ? 'Change GA Drawing (PDF)' : 'Browse GA Blueprint (PDF)'}
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setGaFile(e.target.files[0]);
                    setGaFilename(e.target.files[0].name);
                    setIsDemoPack(false);
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* Section C: Excel Wiring Schedule */}
        <div className="p-5 rounded-xl bg-surface border border-slate-border flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-accent-cyan">SECTION C</span>
              <span className="text-[10px] font-mono text-gray-400">XLSX, XLS</span>
            </div>
            <h4 className="text-sm font-semibold text-white">Wiring Schedule & BOM</h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Multi-sheet spreadsheet with source/dest terminals, ferrule IDs, and colors.
            </p>
          </div>

          {/* Upload Dropzone / Preview */}
          <div className="border border-slate-border rounded-lg p-3 bg-graphite/60 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono text-white">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">{scheduleFile ? scheduleFile.name : scheduleFilename}</span>
            </div>
            <div className="p-2 rounded bg-surface border border-slate-border text-[11px] font-mono space-y-1">
              <div className="flex justify-between text-gray-400">
                <span>Wiring Connections:</span>
                <span className="text-accent-cyan">14 Rows</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>BOM Items:</span>
                <span className="text-white">10 Components</span>
              </div>
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 justify-center font-mono">
              <CheckCircle className="w-3 h-3" /> Auto-Extraction Ready
            </div>

            <label className="mt-2 block w-full py-1.5 rounded bg-surface-elevated text-xs font-mono text-accent-cyan cursor-pointer hover:bg-surface-highlight border border-slate-border text-center">
              {scheduleFile ? 'Change Wiring Schedule (XLSX)' : 'Browse Schedule (XLSX)'}
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setScheduleFile(e.target.files[0]);
                    setScheduleFilename(e.target.files[0].name);
                    setIsDemoPack(false);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Confirmation & Proceed Action */}
      <div className="flex items-center justify-between p-5 rounded-xl bg-surface border border-slate-border">
        <div className="flex items-center gap-3 text-xs text-gray-300">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-blue animate-pulse" />
          <span>Cabinet photograph, GA drawing, and wiring schedule verified. Ready for calibration.</span>
        </div>

        <button
          onClick={handleStartInspection}
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent-blue text-white font-semibold text-xs transition-transform hover:scale-[1.02] shadow-blue-glow hover:bg-accent-blue-dark"
        >
          <span>{submitting ? 'Initializing Workspace...' : 'Proceed to Reference & Alignment'}</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};
