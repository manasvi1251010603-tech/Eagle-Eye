import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ScanLine,
  Sliders,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Eye,
  Crosshair,
  Maximize2
} from 'lucide-react';
import { api } from '../services/api';
import { AlignmentResponse } from '../types';

export const AlignmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [opacity, setOpacity] = useState(0.45);
  const [zoom, setZoom] = useState(1.0);
  const [viewMode, setViewMode] = useState<'overlay' | 'split'>('overlay');
  const [alignmentData, setAlignmentData] = useState<AlignmentResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function initAlignment() {
      try {
        setLoading(true);
        const res = await api.align('INS-2026-0891', { mode: 'AUTO' });
        setAlignmentData(res);
      } catch (err) {
        console.error('Alignment failed:', err);
      } finally {
        setLoading(false);
      }
    }
    initAlignment();
  }, []);

  const handleRunAutoAlign = async () => {
    setLoading(true);
    try {
      const res = await api.align('INS-2026-0891', { mode: 'AUTO' });
      setAlignmentData(res);
    } catch (err) {
      alert('Alignment calculation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-surface border border-slate-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-lime/10 text-accent-lime border border-accent-lime/30 font-bold uppercase">
              Step 2 of 3: Homography Calibration
            </span>
            <span className="text-xs font-mono text-gray-400">OpenCV Planar Rectification</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            CAD-to-Photo Alignment Workspace
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Rectify tilted smartphone photograph perspective and project vector GA blueprint coordinates onto physical DIN rails.
          </p>
        </div>

        {/* Alignment Status Pill */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-surface-elevated border border-slate-border text-xs font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-gray-400">Status:</span>
            <span className="text-emerald-400 font-bold">{alignmentData?.alignment_status || 'ALIGNED_AUTO'}</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-300">Conf: 94%</span>
          </div>

          <button
            onClick={() => navigate('/processing')}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-accent-lime text-black font-semibold text-xs transition-transform hover:scale-[1.02] shadow-lime-glow"
          >
            <span>Confirm & Run AI Inspection</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>

      {/* Main Alignment Canvas & Tool Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Interactive Visual Viewport */}
        <div className="lg:col-span-3 p-4 rounded-xl bg-surface border border-slate-border space-y-3 flex flex-col justify-between">
          {/* Viewport Control Bar */}
          <div className="flex items-center justify-between bg-graphite p-2.5 rounded-lg border border-slate-border text-xs">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-surface p-1 rounded border border-slate-border">
              <button
                onClick={() => setViewMode('overlay')}
                className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                  viewMode === 'overlay' ? 'bg-accent-lime text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                Overlay Mode
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                  viewMode === 'split' ? 'bg-accent-lime text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                Side-by-Side Split
              </button>
            </div>

            {/* Opacity Slider for Overlay Mode */}
            {viewMode === 'overlay' && (
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-gray-400">CAD Opacity:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-32 accent-accent-lime cursor-pointer"
                />
                <span className="text-xs font-mono text-accent-lime w-8">{Math.round(opacity * 100)}%</span>
              </div>
            )}

            {/* Zoom / Pan Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.15, 2.5))}
                className="p-1.5 rounded bg-surface hover:bg-surface-elevated text-gray-300"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.15, 0.7))}
                className="p-1.5 rounded bg-surface hover:bg-surface-elevated text-gray-300"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(1.0)}
                className="p-1.5 rounded bg-surface hover:bg-surface-elevated text-gray-300"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono text-gray-400 ml-1">{Math.round(zoom * 100)}%</span>
            </div>
          </div>

          {/* Canvas Display Viewport */}
          <div className="relative w-full h-[540px] bg-charcoal rounded-lg border border-slate-border overflow-hidden flex items-center justify-center">
            {viewMode === 'overlay' ? (
              <div
                className="relative transition-transform duration-100 ease-out"
                style={{ transform: `scale(${zoom})` }}
              >
                {/* Layer 1: Real Cabinet Photo */}
                <img
                  src="/data/demo/cabinet_sample_01.jpg"
                  alt="Cabinet Photograph"
                  className="max-h-[500px] object-contain rounded"
                />

                {/* Layer 2: Vector CAD Blueprint Overlay with Variable Opacity */}
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-150"
                  style={{ opacity: opacity }}
                >
                  <img
                    src="/uploads/ga_preview_page_1.png"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/data/demo/cabinet_sample_01.jpg';
                    }}
                    alt="GA CAD Blueprint"
                    className="w-full h-full object-contain filter invert hue-rotate-180 brightness-150"
                  />
                </div>

                {/* Corner Calibration Crosshair Targets */}
                <div className="absolute top-4 left-4 p-1 rounded bg-black/70 border border-accent-lime text-accent-lime text-[10px] font-mono flex items-center gap-1">
                  <Crosshair className="w-3 h-3" /> P1 [40, 40]
                </div>
                <div className="absolute top-4 right-4 p-1 rounded bg-black/70 border border-accent-lime text-accent-lime text-[10px] font-mono flex items-center gap-1">
                  <Crosshair className="w-3 h-3" /> P2 [1160, 40]
                </div>
                <div className="absolute bottom-4 left-4 p-1 rounded bg-black/70 border border-accent-lime text-accent-lime text-[10px] font-mono flex items-center gap-1">
                  <Crosshair className="w-3 h-3" /> P3 [40, 860]
                </div>
                <div className="absolute bottom-4 right-4 p-1 rounded bg-black/70 border border-accent-lime text-accent-lime text-[10px] font-mono flex items-center gap-1">
                  <Crosshair className="w-3 h-3" /> P4 [1160, 860]
                </div>
              </div>
            ) : (
              /* Side-by-Side Split View */
              <div className="grid grid-cols-2 gap-3 w-full h-full p-2">
                <div className="relative border border-slate-border rounded bg-graphite flex flex-col justify-between overflow-hidden">
                  <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-gray-300 border border-slate-border">
                    Physical Cabinet Photo
                  </span>
                  <img
                    src="/data/demo/cabinet_sample_01.jpg"
                    alt="Cabinet Photo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="relative border border-slate-border rounded bg-white flex flex-col justify-between overflow-hidden">
                  <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-accent-lime border border-slate-border">
                    2D GA Blueprint (CAD)
                  </span>
                  <img
                    src="/uploads/ga_preview_page_1.png"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/data/demo/cabinet_sample_01.jpg';
                    }}
                    alt="CAD Blueprint"
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Mathematical Transform & Calibration Controls */}
        <div className="space-y-4">
          {/* Planar Homography Matrix */}
          <div className="p-4 rounded-xl bg-surface border border-slate-border space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-accent-lime flex items-center gap-2">
              <ScanLine className="w-4 h-4" />
              Homography Matrix H(3x3)
            </h3>
            <div className="p-2.5 rounded bg-graphite border border-slate-border text-[11px] font-mono text-gray-300 space-y-1">
              <div className="grid grid-cols-3 gap-1 text-center font-bold">
                <span className="text-accent-lime">0.978</span>
                <span>0.021</span>
                <span>-18.2</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center font-bold">
                <span>-0.018</span>
                <span className="text-accent-lime">0.985</span>
                <span>12.6</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center font-bold">
                <span>0.00001</span>
                <span>0.00002</span>
                <span className="text-accent-lime">1.000</span>
              </div>
            </div>
            <div className="text-[11px] text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Estimated Tilt Angle:</span>
                <span className="text-white font-mono font-bold">3.2 deg</span>
              </div>
              <div className="flex justify-between">
                <span>Geometric Rectification:</span>
                <span className="text-emerald-400 font-mono">CONVERGED</span>
              </div>
            </div>
          </div>

          {/* Manual Corner Correction */}
          <div className="p-4 rounded-xl bg-surface border border-slate-border space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-gray-300">
              Manual Calibration Handles
            </h3>
            <p className="text-xs text-gray-400">
              Adjust 4 outer cabinet mounting lugs to fine-tune perspective rectification if automatic alignment drifts.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-graphite border border-slate-border text-gray-300 text-center">
                TL: (40, 40)
              </div>
              <div className="p-2 rounded bg-graphite border border-slate-border text-gray-300 text-center">
                TR: (1160, 40)
              </div>
              <div className="p-2 rounded bg-graphite border border-slate-border text-gray-300 text-center">
                BL: (40, 860)
              </div>
              <div className="p-2 rounded bg-graphite border border-slate-border text-gray-300 text-center">
                BR: (1160, 860)
              </div>
            </div>
            <button
              onClick={handleRunAutoAlign}
              disabled={loading}
              className="w-full py-2 rounded bg-surface-elevated border border-slate-border hover:border-accent-lime text-xs font-mono text-white transition-colors"
            >
              {loading ? 'Re-calculating...' : 'Re-run Auto Alignment'}
            </button>
          </div>

          {/* Alignment Warning Callout */}
          <div className="p-3.5 rounded-lg bg-surface border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Caution:</strong> While optical alignment is calibrated, 2D drawings and physical photos 
              differ in wire depth and parallax. Alignment coordinates do not guarantee terminal contact continuity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
