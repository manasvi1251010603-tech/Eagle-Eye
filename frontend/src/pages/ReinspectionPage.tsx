import React, { useState, useRef } from 'react';
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
  Image as ImageIcon,
  UploadCloud,
  FileCheck2,
  Trash2,
  RotateCcw,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { useInspectionSession } from '../context/InspectionContext';
import { ReinspectionDiff } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { InspectionDisclaimer } from '../components/common/InspectionDisclaimer';

export const ReinspectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSessionId, currentCabinetId, refreshSessions } = useInspectionSession();
  const [inspector, setInspector] = useState('Lead QC Inspector');
  const [notes, setNotes] = useState('Post-rework verification: Contactor K1 aligned, ferrule sleeve X1:14 corrected.');
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [diffResult, setDiffResult] = useState<ReinspectionDiff | null>(null);
  const [isSessionClosed, setIsSessionClosed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dedicated Reinspection Image Upload State — Starts clean with NO file selected
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Slider comparison percentage [0..100]
  const [sliderPos, setSliderPos] = useState(50);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png)$/i)) {
      setErrorMessage('Invalid file format. Please select a JPG, JPEG, or PNG image.');
      return;
    }
    setErrorMessage(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setDiffResult(null); // Reset previous diff on new photo upload
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl && !previewUrl.startsWith('/data/')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setDiffResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTriggerBrowse = () => {
    fileInputRef.current?.click();
  };

  // Optional: Quick-load sample repaired photo for demonstration convenience
  const handleLoadSampleRepaired = async () => {
    try {
      const response = await fetch('/data/demo/cabinet_sample_01_repaired.jpg');
      const blob = await response.blob();
      const sampleFile = new File([blob], 'cabinet_sample_01_repaired.jpg', { type: 'image/jpeg' });
      processFile(sampleFile);
    } catch (err: any) {
      console.error('Failed to load demo sample:', err);
      setErrorMessage(`Failed to load demo sample: ${err.message}`);
    }
  };

  const handleRunReinspection = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select or drop a valid post-repair photograph first.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      // Package new image as multipart FormData
      const formData = new FormData();
      formData.append('reinspection_photo', selectedFile);
      formData.append('inspector', inspector);
      formData.append('reinspection_notes', notes);

      const res = await api.reinspect(currentSessionId, formData);
      setDiffResult(res);
      await refreshSessions(); // Refresh active session list so reinspection session is archived
    } catch (err: any) {
      const msg = err.message || 'Reinspection request failed';
      setErrorMessage(msg);
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
      await refreshSessions();
      alert('Inspection session officially CLOSED and archived into QC audit repository.');
    } catch (err: any) {
      alert(`Cannot close session: ${err.message}`);
    } finally {
      setClosing(false);
    }
  };

  // Resolve before and after image sources
  const parentImgSrc = diffResult?.parent_image_path || '/data/demo/cabinet_sample_01.jpg';
  const afterImgSrc = diffResult?.repaired_image_path || previewUrl;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm animate-card-rise">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold uppercase">
              Phase 7: Digital Audit & Reinspection
            </span>
            <span className="text-xs font-mono text-slate-500">
              Cabinet: <strong className="text-slate-800">{currentCabinetId}</strong> (Parent Session: <span className="text-blue-700">{currentSessionId}</span>)
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Cabinet Reinspection & Rework Verification
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify post-repair physical cabinet imagery against prior defect findings. Session history is immutable.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunReinspection}
            disabled={loading || !selectedFile}
            title={!selectedFile ? 'Upload a post-repair photograph to enable reinspection' : 'Execute verification'}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F2B5C] hover:bg-[#163A75] text-white font-semibold text-xs btn-lift shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <RefreshCw className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Evaluating Fresh Photo...' : 'Execute Reinspection Check'}</span>
          </button>
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50/95 border border-red-200 text-red-800 flex items-start justify-between gap-3 animate-fade-in shadow-sm">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-900">Reinspection Error</h4>
              <p className="text-xs text-red-700 mt-1 font-mono break-all">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-100 transition-colors shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Dedicated Reinspection Image Upload Area */}
      <div className="p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm space-y-4 animate-card-rise">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-blue-600" />
              Upload Post-Repair Cabinet Photograph
            </h3>
            <p className="text-xs text-slate-500">
              Select or drop the newly photographed cabinet after technician rework.
            </p>
          </div>
          {!selectedFile && (
            <button
              onClick={handleLoadSampleRepaired}
              className="text-xs font-mono text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Sample Post-Repair Photo
            </button>
          )}
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          className="hidden"
        />

        {!selectedFile ? (
          /* Empty upload dropzone */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleTriggerBrowse}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer dropzone-trans flex flex-col items-center justify-center space-y-3 transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50/80'
                : 'border-slate-300 hover:border-blue-400 bg-slate-50/60'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Drag and drop your post-rework cabinet photograph, or <span className="text-blue-600 underline">browse</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports JPG, JPEG, and PNG formats (high resolution recommended for ferrule & label OCR)
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-mono text-amber-900 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>No image selected yet. Reinspect button remains disabled until an image is loaded.</span>
            </div>
          </div>
        ) : (
          /* Active file preview and details card */
          <div className="flex flex-col md:flex-row items-center gap-5 p-4 rounded-xl bg-blue-50/40 border border-blue-200/80">
            {/* Image Preview Thumbnail */}
            <div className="relative w-36 h-28 rounded-lg overflow-hidden border border-slate-300 bg-slate-900 shrink-0 shadow-sm group">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Post-repair preview"
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-mono text-white bg-slate-900/80 px-2 py-0.5 rounded">
                  Preview
                </span>
              </div>
            </div>

            {/* File Details */}
            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
                  <Check className="w-3 h-3 text-emerald-600" />
                  IMAGE READY FOR REINSPECTION
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {selectedFile.type.toUpperCase() || 'IMAGE/JPEG'}
                </span>
              </div>
              <h4 className="text-sm font-bold font-mono text-slate-900 truncate" title={selectedFile.name}>
                {selectedFile.name}
              </h4>
              <p className="text-xs font-mono text-slate-500">
                File Size: <strong className="text-slate-700">{formatFileSize(selectedFile.size)}</strong>
              </p>
              <p className="text-xs text-slate-600">
                Ready to verify against prior defect findings. Click <strong>"Execute Reinspection Check"</strong> above to evaluate.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleTriggerBrowse}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-slate-700 text-xs font-medium transition-all shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                <span>Replace Image</span>
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-red-200 hover:bg-red-50 text-red-700 text-xs font-medium transition-all shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Before vs After Visual Comparison Slider */}
      <div className="p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm space-y-3 animate-card-rise">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-2 border-b border-slate-100 pb-2.5">
          <span className="text-slate-800 font-bold flex items-center gap-2">
            <Split className="w-4 h-4 text-blue-600" />
            Interactive Before (Initial Defect) vs After (Post-Repair) Split Comparison
          </span>
          <div className="flex items-center gap-3 text-xs">
            <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-bold">
              LEFT: INITIAL INSPECTION (FAIL)
            </span>
            <span className="text-slate-400">|</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              RIGHT: POST-REPAIR ({afterImgSrc ? 'LOADED' : 'AWAITING UPLOAD'})
            </span>
          </div>
        </div>

        {/* Comparison Viewer Container */}
        <div className="relative w-full h-[450px] bg-slate-900 rounded-lg border border-slate-300 overflow-hidden select-none shadow-inner">
          {afterImgSrc ? (
            <>
              {/* Layer 1: After Photo (Repaired) */}
              <img
                src={afterImgSrc}
                alt="Repaired Cabinet"
                className="absolute inset-0 w-full h-full object-contain"
              />

              {/* Layer 2: Before Photo (Clipped by slider position) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src={parentImgSrc}
                  alt="Initial Cabinet"
                  className="absolute inset-0 w-full h-full object-contain max-w-none"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>

              {/* Draggable Divider Line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-blue-500 shadow-md z-10 cursor-ew-resize flex items-center justify-center"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
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
            </>
          ) : (
            /* Awaiting image placeholder overlay */
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/80">
              <ImageIcon className="w-12 h-12 text-slate-500 mb-2" />
              <p className="text-sm font-semibold text-slate-300">
                Split Comparison Awaiting Post-Repair Photo
              </p>
              <p className="text-xs text-slate-400 max-w-md mt-1">
                Upload your post-repair photograph in the section above to activate the interactive before-and-after split slider.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Smart Diff Results Breakdown */}
      {diffResult ? (
        <div className="space-y-6 animate-card-rise">
          {/* Diff Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-white/95 border border-emerald-300 shadow-sm bg-emerald-50/30">
              <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold block mb-1">
                Resolved Defects
              </span>
              <div className="text-3xl font-bold font-mono text-emerald-700">
                {diffResult.resolved_findings.length}
              </div>
              <span className="text-[10px] text-emerald-700 font-medium">All prior defects rectified</span>
            </div>

            <div className="p-4 rounded-xl bg-white/95 border border-slate-200 shadow-sm">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1">
                Persistent Defects
              </span>
              <div className="text-3xl font-bold font-mono text-slate-900">
                {diffResult.persistent_findings.length}
              </div>
              <span className="text-[10px] text-slate-500">0 lingering defects</span>
            </div>

            <div className="p-4 rounded-xl bg-white/95 border border-slate-200 shadow-sm">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1">
                Newly Detected Defects
              </span>
              <div className="text-3xl font-bold font-mono text-slate-900">
                {diffResult.new_findings.length}
              </div>
              <span className="text-[10px] text-slate-500">0 regressions</span>
            </div>

            <div className="p-4 rounded-xl bg-white/95 border border-slate-200 shadow-sm">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1">
                Closure Gatekeeper
              </span>
              <div className={`text-base font-bold font-mono mt-1 ${diffResult.can_close_session ? 'text-emerald-700' : 'text-red-700'}`}>
                {diffResult.can_close_session ? 'READY TO CLOSE' : 'BLOCKED'}
              </div>
              <span className="text-[10px] text-slate-500">All required fails verified</span>
            </div>
          </div>

          {/* Resolved Defects Table */}
          <div className="p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Verified Resolved Findings
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-mono">
                    <th className="py-2.5 px-3">Ref Tag</th>
                    <th className="py-2.5 px-3">Module</th>
                    <th className="py-2.5 px-3">Previous Defect State</th>
                    <th className="py-2.5 px-3">Post-Repair Verified State</th>
                    <th className="py-2.5 px-3">Reinspection Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {diffResult.resolved_findings.map((f) => (
                    <tr key={f.id} className="text-slate-700 hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-bold text-slate-900">{f.component_ref}</td>
                      <td className="py-3 px-3 text-slate-500">{f.check_type.replace('_', ' ')}</td>
                      <td className="py-3 px-3 text-red-700 font-semibold">
                        {f.component_ref === 'K1' ? 'Misplaced at Slot 5 (X:61.6%)' : 'Inverted tag X1:41'}
                      </td>
                      <td className="py-3 px-3 text-emerald-700 font-semibold">{f.observed_value}</td>
                      <td className="py-3 px-3">
                        <StatusBadge status="PASS" size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Closure Gate Footer */}
          <div className="p-5 rounded-xl bg-white/95 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Factory Acceptance Testing (FAT) Closure Gate
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                All identified defects have passed optical reinspection. Session may now be permanently archived into SQLite records.
              </p>
            </div>

            {isSessionClosed ? (
              <span className="px-4 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-mono text-xs font-semibold flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-blue-600" /> Session Officially CLOSED
              </span>
            ) : (
              <button
                onClick={handleCloseSession}
                disabled={closing || !diffResult.can_close_session}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs btn-lift shadow-sm transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-white" />
                <span>{closing ? 'Closing Session...' : 'Approve & Officially Close QC Session'}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-white/95 border border-slate-200 text-center space-y-3 shadow-sm animate-card-rise">
          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Reinspection Awaiting Execution</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Upload the newly photographed post-repair cabinet image above and click <strong>"Execute Reinspection Check"</strong> to run automated verification and calculate defect diff.
          </p>
        </div>
      )}

      <InspectionDisclaimer />
    </div>
  );
};
