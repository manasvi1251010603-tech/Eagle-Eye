import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Trash2,
  RefreshCw,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { useInspectionSession } from '../context/InspectionContext';

export const NewInspectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentSessionId, refreshSessions } = useInspectionSession();

  // Form metadata — starts fresh and empty
  const [cabinetId, setCabinetId] = useState('');
  const [workOrder, setWorkOrder] = useState('');
  const [batchId, setBatchId] = useState('');
  const [inspector, setInspector] = useState('Lead QC Inspector');
  const [revision, setRevision] = useState('');

  // Files — start completely empty
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [gaFile, setGaFile] = useState<File | null>(null);
  const [scheduleFile, setScheduleFile] = useState<File | null>(null);

  // Previews & filenames — null on fresh mount
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [gaFilename, setGaFilename] = useState<string | null>(null);
  const [scheduleFilename, setScheduleFilename] = useState<string | null>(null);

  const [isDemoPack, setIsDemoPack] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // File input refs for programmatically triggering Browse / Replace
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const gaInputRef = useRef<HTMLInputElement | null>(null);
  const scheduleInputRef = useRef<HTMLInputElement | null>(null);

  // Ensure state resets to clean empty whenever this page is mounted
  useEffect(() => {
    resetToCleanState();
  }, []);

  const resetToCleanState = () => {
    setCabinetId('');
    setWorkOrder('');
    setBatchId('');
    setInspector('Lead QC Inspector');
    setRevision('');
    setPhotoFile(null);
    setGaFile(null);
    setScheduleFile(null);
    setPhotoPreview(null);
    setGaFilename(null);
    setScheduleFilename(null);
    setIsDemoPack(false);
    if (photoInputRef.current) photoInputRef.current.value = '';
    if (gaInputRef.current) gaInputRef.current.value = '';
    if (scheduleInputRef.current) scheduleInputRef.current.value = '';
  };

  // Explicit opt-in action to load sample demo assets
  const handleLoadDemoPack = async () => {
    setLoadingDemo(true);
    try {
      setCabinetId('CAB-4092');
      setWorkOrder('WO-8492');
      setBatchId('BATCH-2026-Q4');
      setInspector('Lead QC Inspector');
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

  // Handlers for Photo
  const handlePhotoSelect = (file: File) => {
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setIsDemoPack(false);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsDemoPack(false);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  // Handlers for GA Drawing
  const handleGaSelect = (file: File) => {
    setGaFile(file);
    setGaFilename(file.name);
    setIsDemoPack(false);
  };

  const handleRemoveGa = () => {
    setGaFile(null);
    setGaFilename(null);
    setIsDemoPack(false);
    if (gaInputRef.current) gaInputRef.current.value = '';
  };

  // Handlers for Wiring Schedule
  const handleScheduleSelect = (file: File) => {
    setScheduleFile(file);
    setScheduleFilename(file.name);
    setIsDemoPack(false);
  };

  const handleRemoveSchedule = () => {
    setScheduleFile(null);
    setScheduleFilename(null);
    setIsDemoPack(false);
    if (scheduleInputRef.current) scheduleInputRef.current.value = '';
  };

  // Real-time Form Validation
  const hasPhoto = Boolean(photoFile || (isDemoPack && photoPreview));
  const hasGa = Boolean(gaFile || (isDemoPack && gaFilename));
  const hasSchedule = Boolean(scheduleFile || (isDemoPack && scheduleFilename));
  const hasCabinetId = Boolean(cabinetId.trim());

  const missingInputs: string[] = [];
  if (!hasCabinetId) missingInputs.push('Cabinet ID');
  if (!hasPhoto) missingInputs.push('Cabinet Photograph (JPG/PNG)');
  if (!hasGa) missingInputs.push('GA Drawing (PDF)');
  if (!hasSchedule) missingInputs.push('Wiring Schedule (XLSX)');

  const isFormValid = missingInputs.length === 0;

  // Submit action
  const handleStartInspection = async () => {
    if (!isFormValid) return;
    setSubmitting(true);
    try {
      // 1. Create inspection session in backend
      const session = await api.createInspection({
        cabinet_id: cabinetId.trim(),
        work_order_id: workOrder.trim() || undefined,
        batch_id: batchId.trim() || undefined,
        inspector: inspector.trim() || 'Lead QC Inspector',
        reference_revision: revision.trim() || 'Rev C',
      });

      // 2. Upload real files if provided by user, or load demo pack if selected
      if (isDemoPack) {
        await api.loadDemoPack(session.id);
      } else if (photoFile || gaFile || scheduleFile) {
        const formData = new FormData();
        if (photoFile) formData.append('cabinet_photo', photoFile);
        if (gaFile) formData.append('ga_drawing', gaFile);
        if (scheduleFile) formData.append('wiring_schedule', scheduleFile);
        await api.uploadFiles(session.id, formData);
      }

      // 3. Set active session ID in context
      setCurrentSessionId(session.id, session.cabinet_id);
      await refreshSessions();

      // 4. Navigate directly to Reference & Alignment step
      navigate('/reference-alignment');
    } catch (err: any) {
      alert(`Failed to initialize inspection workspace: ${err.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Hidden file inputs triggered programmatically */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handlePhotoSelect(e.target.files[0]);
        }}
      />
      <input
        ref={gaInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleGaSelect(e.target.files[0]);
        }}
      />
      <input
        ref={scheduleInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleScheduleSelect(e.target.files[0]);
        }}
      />

      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm animate-card-rise">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            New Inspection Workspace
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Provide the physical cabinet photograph, 2D General Arrangement drawing (PDF), and Excel wiring schedule.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={resetToCleanState}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono font-medium hover:bg-slate-100 transition-colors shadow-sm"
            title="Clear all fields"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleLoadDemoPack}
            disabled={loadingDemo}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-semibold hover:bg-blue-100 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{loadingDemo ? 'Loading Demo...' : 'Load Industrial Demo Pack'}</span>
          </button>
        </div>
      </div>

      {/* Metadata Configuration Grid */}
      <div className="p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm space-y-4 animate-card-rise">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center justify-between border-b border-slate-100 pb-2">
          <span>Inspection Metadata & Traceability</span>
          <span className="text-[10px] text-slate-400 font-normal">* Required fields</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
          <div>
            <label className="block text-[11px] font-mono text-slate-600 font-semibold mb-1">
              Cabinet ID <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={cabinetId}
              onChange={(e) => setCabinetId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:border-blue-500 focus:bg-white focus:outline-none placeholder-slate-400 font-medium"
              placeholder="e.g. CAB-4092"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-600 font-semibold mb-1">Work Order</label>
            <input
              type="text"
              value={workOrder}
              onChange={(e) => setWorkOrder(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:border-blue-500 focus:bg-white focus:outline-none placeholder-slate-400 font-medium"
              placeholder="e.g. WO-8492"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-600 font-semibold mb-1">Batch Number</label>
            <input
              type="text"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:border-blue-500 focus:bg-white focus:outline-none placeholder-slate-400 font-medium"
              placeholder="e.g. BATCH-2026-Q4"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-600 font-semibold mb-1">Inspector Name</label>
            <input
              type="text"
              value={inspector}
              onChange={(e) => setInspector(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:border-blue-500 focus:bg-white focus:outline-none placeholder-slate-400 font-medium"
              placeholder="e.g. Lead QC Inspector"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-600 font-semibold mb-1">Drawing Revision</label>
            <input
              type="text"
              value={revision}
              onChange={(e) => setRevision(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 text-xs font-mono focus:border-blue-500 focus:bg-white focus:outline-none placeholder-slate-400 font-medium"
              placeholder="e.g. Rev C"
            />
          </div>
        </div>
      </div>

      {/* 3 Upload Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Section A: Cabinet Photograph */}
        <div className="p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4 animate-card-rise">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                SECTION A
              </span>
              <span className="text-[10px] font-mono text-slate-400">JPG, PNG (Max 50MB)</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Cabinet Photograph</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              High-resolution front-facing photograph of the physical electrical enclosure.
            </p>
          </div>

          {/* Upload Dropzone / Preview */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) handlePhotoSelect(e.dataTransfer.files[0]);
            }}
            className="relative border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-3 text-center bg-slate-50/70 min-h-[220px] flex flex-col justify-center dropzone-trans"
          >
            {photoPreview ? (
              <div className="space-y-2">
                <img
                  src={photoPreview}
                  alt="Cabinet Preview"
                  className="w-full h-36 object-cover rounded-lg border border-slate-300 shadow-sm"
                />
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-700 font-medium">
                  <span className="truncate max-w-[150px]">
                    {photoFile ? photoFile.name : 'cabinet_sample_01.jpg'}
                  </span>
                  <span className="text-emerald-700 flex items-center gap-1 shrink-0 font-semibold">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> Ready
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="flex-1 py-1.5 rounded-lg bg-white text-xs font-mono text-blue-700 font-semibold hover:bg-blue-50 border border-slate-300 transition-colors shadow-sm"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-2.5 py-1.5 rounded-lg bg-white text-xs font-mono text-red-700 font-semibold hover:bg-red-50 border border-red-200 transition-colors flex items-center justify-center gap-1 shadow-sm"
                    title="Remove cabinet photo"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600 shadow-sm">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-800 font-semibold">Upload Cabinet Image</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Drag & drop or browse from filesystem</p>
                </div>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-lg bg-white text-xs font-mono text-blue-700 font-semibold hover:bg-blue-50 border border-slate-300 transition-colors shadow-sm"
                >
                  Browse Photo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section B: GA Drawing */}
        <div className="p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4 animate-card-rise">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                SECTION B
              </span>
              <span className="text-[10px] font-mono text-slate-400">PDF Document</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">General Arrangement (GA)</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Vector mechanical CAD layout blueprint with DIN rail slots & component tags.
            </p>
          </div>

          {/* Upload Dropzone / Preview */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) handleGaSelect(e.dataTransfer.files[0]);
            }}
            className="relative border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-3 text-center bg-slate-50/70 min-h-[220px] flex flex-col justify-center dropzone-trans"
          >
            {gaFilename ? (
              <div className="space-y-2">
                <div className="w-full h-36 flex flex-col items-center justify-center rounded-lg bg-blue-50/50 border border-blue-200 p-3 shadow-inner">
                  <FileText className="w-10 h-10 text-blue-600 mb-2" />
                  <span className="text-xs font-mono font-bold text-slate-900 truncate max-w-[200px]" title={gaFilename}>
                    {gaFilename}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 font-mono">
                    {gaFile ? `${(gaFile.size / 1024).toFixed(1)} KB` : 'Demo Blueprint'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-700 font-medium">
                  <span className="truncate max-w-[150px]">{gaFilename}</span>
                  <span className="text-emerald-700 flex items-center gap-1 shrink-0 font-semibold">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> Ready
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => gaInputRef.current?.click()}
                    className="flex-1 py-1.5 rounded-lg bg-white text-xs font-mono text-blue-700 font-semibold hover:bg-blue-50 border border-slate-300 transition-colors shadow-sm"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveGa}
                    className="px-2.5 py-1.5 rounded-lg bg-white text-xs font-mono text-red-700 font-semibold hover:bg-red-50 border border-red-200 transition-colors flex items-center justify-center gap-1 shadow-sm"
                    title="Remove GA Drawing"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600 shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-800 font-semibold">Upload GA Drawing (PDF)</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Drag & drop or browse from filesystem</p>
                </div>
                <button
                  type="button"
                  onClick={() => gaInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-lg bg-white text-xs font-mono text-blue-700 font-semibold hover:bg-blue-50 border border-slate-300 transition-colors shadow-sm"
                >
                  Browse PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section C: Excel Wiring Schedule */}
        <div className="p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4 animate-card-rise">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                SECTION C
              </span>
              <span className="text-[10px] font-mono text-slate-400">XLSX, XLS</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">Wiring Schedule & BOM</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-sheet spreadsheet with source/dest terminals, ferrule IDs, and colors.
            </p>
          </div>

          {/* Upload Dropzone / Preview */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) handleScheduleSelect(e.dataTransfer.files[0]);
            }}
            className="relative border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-3 text-center bg-slate-50/70 min-h-[220px] flex flex-col justify-center dropzone-trans"
          >
            {scheduleFilename ? (
              <div className="space-y-2">
                <div className="w-full h-36 flex flex-col items-center justify-center rounded-lg bg-emerald-50/40 border border-emerald-200 p-3 shadow-inner">
                  <FileSpreadsheet className="w-10 h-10 text-emerald-600 mb-2" />
                  <span className="text-xs font-mono font-bold text-slate-900 truncate max-w-[200px]" title={scheduleFilename}>
                    {scheduleFilename}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 font-mono">
                    {scheduleFile ? `${(scheduleFile.size / 1024).toFixed(1)} KB` : 'Demo Wiring Schedule'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-700 font-medium">
                  <span className="truncate max-w-[150px]">{scheduleFilename}</span>
                  <span className="text-emerald-700 flex items-center gap-1 shrink-0 font-semibold">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> Ready
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => scheduleInputRef.current?.click()}
                    className="flex-1 py-1.5 rounded-lg bg-white text-xs font-mono text-blue-700 font-semibold hover:bg-blue-50 border border-slate-300 transition-colors shadow-sm"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveSchedule}
                    className="px-2.5 py-1.5 rounded-lg bg-white text-xs font-mono text-red-700 font-semibold hover:bg-red-50 border border-red-200 transition-colors flex items-center justify-center gap-1 shadow-sm"
                    title="Remove Wiring Schedule"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-800 font-semibold">Upload Wiring Schedule (XLSX)</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Drag & drop or browse from filesystem</p>
                </div>
                <button
                  type="button"
                  onClick={() => scheduleInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-lg bg-white text-xs font-mono text-blue-700 font-semibold hover:bg-blue-50 border border-slate-300 transition-colors shadow-sm"
                >
                  Browse Schedule
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Validation Status & Proceed Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm animate-card-rise">
        <div className="flex items-center gap-3 text-xs">
          {isFormValid ? (
            <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>All required inputs provided. Ready to proceed to Reference & Alignment.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-900 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 font-medium">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Missing required inputs: <strong className="font-bold text-amber-950">{missingInputs.join(', ')}</strong>
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleStartInspection}
          disabled={!isFormValid || submitting}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-xs transition-all ${
            isFormValid && !submitting
              ? 'bg-[#0F2B5C] hover:bg-[#163A75] text-white btn-lift shadow-sm cursor-pointer'
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
          }`}
        >
          <span>{submitting ? 'Initializing Workspace...' : 'Proceed to Reference & Alignment'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
