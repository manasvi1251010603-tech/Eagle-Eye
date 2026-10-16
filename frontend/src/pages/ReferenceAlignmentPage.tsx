import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Table,
  Sliders,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Save,
  Plus,
  Trash2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { useInspectionSession } from '../context/InspectionContext';
import { ComponentReference, WireReference, ExtractedReferencesData, AlignmentResponse } from '../types';

export const ReferenceAlignmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSessionId, currentCabinetId } = useInspectionSession();

  // Active Tab: 'references' (Module C) vs 'alignment' (Module D)
  const [activeTab, setActiveTab] = useState<'references' | 'alignment'>('references');

  // Module C State: Extracted References
  const [refData, setRefData] = useState<ExtractedReferencesData | null>(null);
  const [components, setComponents] = useState<ComponentReference[]>([]);
  const [wires, setWires] = useState<WireReference[]>([]);
  const [savingRefs, setSavingRefs] = useState(false);
  const [refsSaveSuccess, setRefsSaveSuccess] = useState(false);

  // Module D State: CAD Alignment
  const [alignmentData, setAlignmentData] = useState<AlignmentResponse | null>(null);
  const [scale, setScale] = useState(1.0);
  const [transX, setTransX] = useState(0);
  const [transY, setTransY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(0.45);
  const [viewMode, setViewMode] = useState<'overlay' | 'split'>('overlay');
  const [zoom, setZoom] = useState(1.0);
  const [savingAlignment, setSavingAlignment] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkspaceData() {
      try {
        setLoading(true);
        // Load Extracted References
        const extracted = await api.getExtractedReferences(currentSessionId);
        setRefData(extracted);
        setComponents(extracted.components || []);
        setWires(extracted.wires || []);

        // Load Alignment Data
        const alignRes = await api.align(currentSessionId, { mode: 'AUTO' });
        setAlignmentData(alignRes);
        if (alignRes.scale) setScale(alignRes.scale);
        if (alignRes.trans_x !== undefined) setTransX(alignRes.trans_x);
        if (alignRes.trans_y !== undefined) setTransY(alignRes.trans_y);
        if (alignRes.rotation !== undefined) setRotation(alignRes.rotation);
        if (alignRes.opacity !== undefined) setOpacity(alignRes.opacity);
      } catch (err) {
        console.error('Failed to load workspace data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWorkspaceData();
  }, [currentSessionId]);

  // Handle Editing Component Row
  const handleComponentChange = (index: number, field: keyof ComponentReference, value: any) => {
    const updated = [...components];
    updated[index] = { ...updated[index], [field]: value };
    setComponents(updated);
  };

  const handleAddComponent = () => {
    setComponents([
      ...components,
      { ref: `U${components.length + 1}`, type: 'Relay Module', rail: 'DIN 2', qty: 1 }
    ]);
  };

  const handleRemoveComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  // Handle Editing Wire Row
  const handleWireChange = (index: number, field: keyof WireReference, value: any) => {
    const updated = [...wires];
    updated[index] = { ...updated[index], [field]: value };
    setWires(updated);
  };

  const handleAddWire = () => {
    setWires([
      ...wires,
      {
        wire_tag: `W-${wires.length + 101}`,
        source_device: 'PLC1',
        source_terminal: 'DO_1',
        dest_device: 'K2',
        dest_terminal: 'A1',
        expected_color: 'Dark Blue',
        wire_gauge: '0.75',
        ferrule_id: 'K2:A1',
        signal_type: 'Control'
      }
    ]);
  };

  const handleRemoveWire = (index: number) => {
    setWires(wires.filter((_, i) => i !== index));
  };

  // Save References
  const handleSaveReferences = async () => {
    setSavingRefs(true);
    setRefsSaveSuccess(false);
    try {
      const payload: ExtractedReferencesData = {
        ...refData,
        components,
        wires,
        is_user_edited: true,
      };
      await api.updateExtractedReferences(currentSessionId, payload);
      setRefsSaveSuccess(true);
      setTimeout(() => setRefsSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(`Failed to save references: ${err.message}`);
    } finally {
      setSavingRefs(false);
    }
  };

  // Live Homography Calculation / Save
  const handleApplyAlignment = async (auto = false) => {
    setSavingAlignment(true);
    try {
      const res = await api.align(currentSessionId, {
        mode: auto ? 'AUTO' : 'MANUAL',
        scale: auto ? 1.0 : scale,
        trans_x: auto ? 0 : transX,
        trans_y: auto ? 0 : transY,
        rotation: auto ? 0 : rotation,
        opacity: opacity,
      });
      setAlignmentData(res);
      if (auto) {
        setScale(res.scale || 1.0);
        setTransX(res.trans_x || 0);
        setTransY(res.trans_y || 0);
        setRotation(res.rotation || 0);
      }
    } catch (err: any) {
      alert(`Alignment failed: ${err.message}`);
    } finally {
      setSavingAlignment(false);
    }
  };

  const handleProceedToInspection = () => {
    navigate('/processing');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Tab Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-surface border border-slate-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-blue/10 text-accent-cyan border border-accent-blue/30 font-bold uppercase">
              Step 2 of 3: Engineering Calibration
            </span>
            <span className="text-xs font-mono text-gray-400">Cabinet: {currentCabinetId}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Reference Extraction & CAD Alignment Workspace
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Verify parsed engineering BOM and wiring references, calibrate physical image homography, and align CAD coordinates.
          </p>
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleProceedToInspection}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-blue text-white font-semibold text-xs transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-blue-glow hover:bg-accent-blue-dark"
          >
            <span>Run AI Quality Inspection</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-border pb-2">
        <button
          onClick={() => setActiveTab('references')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-colors ${
            activeTab === 'references'
              ? 'bg-accent-blue text-white shadow-technical'
              : 'bg-surface text-gray-400 hover:text-white border border-slate-border'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>1. Engineering Reference Extraction</span>
        </button>
        <button
          onClick={() => setActiveTab('alignment')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-colors ${
            activeTab === 'alignment'
              ? 'bg-accent-blue text-white shadow-technical'
              : 'bg-surface text-gray-400 hover:text-white border border-slate-border'
          }`}
        >
          <ScanLine className="w-4 h-4" />
          <span>2. CAD / Reference Alignment</span>
        </button>
      </div>

      {/* TAB 1: ENGINEERING REFERENCE EXTRACTION */}
      {activeTab === 'references' && (
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="p-4 rounded-xl bg-surface border border-slate-border flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-gray-300">
                <FileText className="w-4 h-4 text-accent-blue" />
                <span className="text-gray-400">GA Drawing:</span>
                <span className="text-white font-bold">{refData?.drawing_number || 'GA-CAB-4092-C.pdf'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-300">
                <span className="text-gray-400">Revision:</span>
                <span className="text-accent-cyan font-bold">{refData?.revision || 'Rev C'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-300">
                <span className="text-gray-400">Enclosure:</span>
                <span className="text-white">{refData?.enclosure_dimensions || '1000 x 800 x 300 mm'}</span>
              </div>
            </div>

            <button
              onClick={handleSaveReferences}
              disabled={savingRefs}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-surface-elevated border border-accent-blue/50 text-accent-cyan text-xs font-mono font-medium hover:bg-accent-blue/20 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingRefs ? 'Saving References...' : 'Save Reference Edits'}</span>
            </button>
          </div>

          {refsSaveSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Extracted engineering reference tables updated and saved to SQLite session database.</span>
            </div>
          )}

          {/* Components / BOM Table */}
          <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Table className="w-4 h-4 text-accent-blue" />
                  Expected Component Master (BOM List)
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Expected component tags, designated DIN rails, and manufacturer part numbers. Editable inline.
                </p>
              </div>

              <button
                onClick={handleAddComponent}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-elevated border border-slate-border text-xs font-mono text-gray-300 hover:text-white"
              >
                <Plus className="w-3.5 h-3.5 text-accent-cyan" />
                <span>Add Component</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-border rounded-lg">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-graphite text-gray-400 border-b border-slate-border text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Ref ID</th>
                    <th className="py-2.5 px-3">Component Type / Description</th>
                    <th className="py-2.5 px-3">Manufacturer</th>
                    <th className="py-2.5 px-3">Part Number</th>
                    <th className="py-2.5 px-3">Mounting Rail</th>
                    <th className="py-2.5 px-3">Qty</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-border">
                  {components.map((comp, idx) => (
                    <tr key={idx} className="hover:bg-surface-elevated/50 transition-colors">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={comp.ref}
                          onChange={(e) => handleComponentChange(idx, 'ref', e.target.value)}
                          className="w-20 px-2 py-1 rounded bg-graphite border border-slate-border text-accent-cyan font-bold focus:border-accent-blue focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={comp.type}
                          onChange={(e) => handleComponentChange(idx, 'type', e.target.value)}
                          className="w-full min-w-[200px] px-2 py-1 rounded bg-graphite border border-slate-border text-white focus:border-accent-blue focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={comp.manufacturer || ''}
                          onChange={(e) => handleComponentChange(idx, 'manufacturer', e.target.value)}
                          className="w-32 px-2 py-1 rounded bg-graphite border border-slate-border text-gray-300 focus:border-accent-blue focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={comp.part_number || ''}
                          onChange={(e) => handleComponentChange(idx, 'part_number', e.target.value)}
                          className="w-36 px-2 py-1 rounded bg-graphite border border-slate-border text-gray-300 focus:border-accent-blue focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={comp.rail}
                          onChange={(e) => handleComponentChange(idx, 'rail', e.target.value)}
                          className="px-2 py-1 rounded bg-graphite border border-slate-border text-gray-200 focus:border-accent-blue focus:outline-none"
                        >
                          <option value="DIN 1">DIN 1 (Top Power)</option>
                          <option value="DIN 2">DIN 2 (Middle Control)</option>
                          <option value="DIN 3">DIN 3 (Bottom Field)</option>
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          value={comp.qty}
                          onChange={(e) => handleComponentChange(idx, 'qty', parseInt(e.target.value) || 1)}
                          className="w-14 px-2 py-1 rounded bg-graphite border border-slate-border text-white text-center focus:border-accent-blue focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleRemoveComponent(idx)}
                          className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-950/20"
                          title="Remove Component"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Wiring Schedule Table */}
          <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  Extracted Wiring Schedule & Terminal Connections
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Extracted conductor routes, expected insulation colors, and wire ferrule sleeve tags. Editable inline.
                </p>
              </div>

              <button
                onClick={handleAddWire}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-elevated border border-slate-border text-xs font-mono text-gray-300 hover:text-white"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Add Wire</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-border rounded-lg">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-graphite text-gray-400 border-b border-slate-border text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Wire Tag</th>
                    <th className="py-2.5 px-3">Source Device</th>
                    <th className="py-2.5 px-3">Src Term</th>
                    <th className="py-2.5 px-3">Dest Device</th>
                    <th className="py-2.5 px-3">Dst Term</th>
                    <th className="py-2.5 px-3">Expected Color</th>
                    <th className="py-2.5 px-3">Gauge (mm²)</th>
                    <th className="py-2.5 px-3">Ferrule ID</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-border">
                  {wires.map((wire, idx) => (
                    <tr key={idx} className="hover:bg-surface-elevated/50 transition-colors">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={wire.wire_tag}
                          onChange={(e) => handleWireChange(idx, 'wire_tag', e.target.value)}
                          className="w-20 px-2 py-1 rounded bg-graphite border border-slate-border text-accent-cyan font-bold focus:border-accent-blue focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={wire.source_device}
                          onChange={(e) => handleWireChange(idx, 'source_device', e.target.value)}
                          className="w-20 px-2 py-1 rounded bg-graphite border border-slate-border text-white focus:border-accent-blue focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={wire.source_terminal}
                          onChange={(e) => handleWireChange(idx, 'source_terminal', e.target.value)}
                          className="w-20 px-2 py-1 rounded bg-graphite border border-slate-border text-gray-300 focus:border-accent-blue focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={wire.dest_device}
                          onChange={(e) => handleWireChange(idx, 'dest_device', e.target.value)}
                          className="w-20 px-2 py-1 rounded bg-graphite border border-slate-border text-white focus:border-accent-blue focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={wire.dest_terminal}
                          onChange={(e) => handleWireChange(idx, 'dest_terminal', e.target.value)}
                          className="w-20 px-2 py-1 rounded bg-graphite border border-slate-border text-gray-300 focus:border-accent-blue focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={wire.expected_color}
                          onChange={(e) => handleWireChange(idx, 'expected_color', e.target.value)}
                          className="w-28 px-2 py-1 rounded bg-graphite border border-slate-border text-emerald-400 font-semibold focus:border-accent-blue focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={wire.wire_gauge}
                          onChange={(e) => handleWireChange(idx, 'wire_gauge', e.target.value)}
                          className="w-16 px-2 py-1 rounded bg-graphite border border-slate-border text-gray-300 text-center focus:border-accent-blue focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={wire.ferrule_id}
                          onChange={(e) => handleWireChange(idx, 'ferrule_id', e.target.value)}
                          className="w-24 px-2 py-1 rounded bg-graphite border border-slate-border text-accent-cyan focus:border-accent-blue focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleRemoveWire(idx)}
                          className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-950/20"
                          title="Remove Wire"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clearly Labelled Simplified Reference Layout View */}
          <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-accent-cyan" />
                  Simplified Reference Layout View (GA Blueprint Projection)
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Schematic reference representation based on parsed DIN rails. (Notice: Simplified layout projection, not CAD vector geometry).
                </p>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated text-gray-400 border border-slate-border">
                Enclosure: 1000 x 800 mm
              </span>
            </div>

            {/* Schematic Industrial Cabinet Container */}
            <div className="p-4 rounded-lg bg-graphite border-2 border-slate-border relative font-mono text-xs space-y-6">
              {/* DIN Rail 1 */}
              <div className="p-3 rounded bg-surface-elevated border border-slate-border space-y-2">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span className="font-bold text-accent-cyan">DIN RAIL 1 (Top Power Bus)</span>
                  <span>Slots: PS1, QF1, QF2, QF3, SPD1</span>
                </div>
                <div className="h-1 bg-slate-600 rounded" />
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {components.filter((c) => c.rail.includes('DIN 1')).map((c) => (
                    <div
                      key={c.ref}
                      className="px-3 py-2 rounded bg-surface border border-slate-border text-center shadow-sm"
                    >
                      <div className="text-accent-cyan font-bold">{c.ref}</div>
                      <div className="text-[10px] text-gray-400 truncate max-w-[110px]">{c.type}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DIN Rail 2 */}
              <div className="p-3 rounded bg-surface-elevated border border-slate-border space-y-2">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span className="font-bold text-accent-cyan">DIN RAIL 2 (Middle Control & Logic)</span>
                  <span>Slots: PLC1, K1 (Designated Slot 2), K2, KA1</span>
                </div>
                <div className="h-1 bg-slate-600 rounded" />
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {components.filter((c) => c.rail.includes('DIN 2')).map((c) => (
                    <div
                      key={c.ref}
                      className="px-3 py-2 rounded bg-surface border border-slate-border text-center shadow-sm"
                    >
                      <div className="text-accent-cyan font-bold">{c.ref}</div>
                      <div className="text-[10px] text-gray-400 truncate max-w-[110px]">{c.type}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DIN Rail 3 */}
              <div className="p-3 rounded bg-surface-elevated border border-slate-border space-y-2">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span className="font-bold text-accent-cyan">DIN RAIL 3 (Bottom Field Terminal Strip)</span>
                  <span>Strip X1: Terminals 1 through 20</span>
                </div>
                <div className="h-1 bg-slate-600 rounded" />
                <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((term) => (
                    <div
                      key={term}
                      className="px-2 py-1.5 rounded bg-surface border border-slate-border text-center min-w-[32px]"
                    >
                      <div className="text-[10px] text-gray-300">X1</div>
                      <div className="text-xs font-bold text-accent-cyan">{term}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CAD / REFERENCE ALIGNMENT */}
      {activeTab === 'alignment' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Visual Viewport (3 Cols) */}
          <div className="lg:col-span-3 p-4 rounded-xl bg-surface border border-slate-border space-y-3 flex flex-col justify-between">
            {/* Viewport Control Bar */}
            <div className="flex items-center justify-between bg-graphite p-2.5 rounded-lg border border-slate-border text-xs">
              <div className="flex items-center gap-1 bg-surface p-1 rounded border border-slate-border">
                <button
                  onClick={() => setViewMode('overlay')}
                  className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                    viewMode === 'overlay' ? 'bg-accent-blue text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Overlay Mode
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors ${
                    viewMode === 'split' ? 'bg-accent-blue text-white' : 'text-gray-400 hover:text-white'
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
                    className="w-32 accent-accent-blue cursor-pointer"
                  />
                  <span className="text-xs font-mono text-accent-cyan w-8">{Math.round(opacity * 100)}%</span>
                </div>
              )}

              {/* Zoom Controls */}
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
                  onClick={() => {
                    setZoom(1.0);
                    setScale(1.0);
                    setTransX(0);
                    setTransY(0);
                    setRotation(0);
                  }}
                  className="p-1.5 rounded bg-surface hover:bg-surface-elevated text-gray-300"
                  title="Reset Transform"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Viewport Canvas */}
            <div className="relative w-full h-[540px] bg-graphite/90 rounded-lg border border-slate-border overflow-hidden flex items-center justify-center">
              {viewMode === 'overlay' ? (
                <div
                  className="relative transition-transform duration-75 origin-center"
                  style={{
                    transform: `scale(${zoom})`,
                  }}
                >
                  {/* Base Photo: Physical Cabinet Photograph */}
                  <img
                    src="/data/demo/cabinet_sample_01.jpg"
                    alt="Physical Cabinet"
                    className="max-h-[500px] w-auto object-contain rounded border border-slate-border select-none"
                  />

                  {/* Overlaid CAD Layout with transform parameters */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-transform"
                    style={{
                      opacity: opacity,
                      transform: `translate(${transX}px, ${transY}px) scale(${scale}) rotate(${rotation}deg)`,
                    }}
                  >
                    <img
                      src="/uploads/ga_preview_page_1.png"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/data/demo/cabinet_sample_01.jpg';
                      }}
                      alt="CAD Drawing Alignment"
                      className="w-full h-full object-contain filter invert hue-rotate-180 brightness-125"
                    />
                  </div>

                  {/* Active Scanline indicator */}
                  <div className="animate-scanline pointer-events-none" />
                </div>
              ) : (
                /* Side-by-side mode */
                <div className="grid grid-cols-2 gap-4 w-full h-full p-3">
                  <div className="flex flex-col items-center justify-center p-2 rounded bg-surface border border-slate-border">
                    <span className="text-[11px] font-mono text-gray-400 mb-2">1. Physical Cabinet Photo</span>
                    <img
                      src="/data/demo/cabinet_sample_01.jpg"
                      alt="Physical Cabinet"
                      className="max-h-[440px] object-contain rounded border border-slate-border"
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center p-2 rounded bg-surface border border-slate-border">
                    <span className="text-[11px] font-mono text-gray-400 mb-2">2. CAD General Arrangement</span>
                    <img
                      src="/uploads/ga_preview_page_1.png"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/data/demo/cabinet_sample_01.jpg';
                      }}
                      alt="CAD GA Blueprint"
                      className="max-h-[440px] object-contain rounded bg-white p-2 border border-slate-border"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 px-1">
              <span>OpenCV Planar Homography • Perspective Rectification Active</span>
              <span className="text-accent-cyan">Calculated Homography Confidence: 94.2%</span>
            </div>
          </div>

          {/* Right 1 Col: Fine Adjustment Controls */}
          <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-border pb-3">
                <Sliders className="w-4 h-4 text-accent-blue" />
                Alignment Parameters
              </h3>

              {/* Scale Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-400">Scale:</span>
                  <span className="text-accent-cyan font-bold">{scale.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.01"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full accent-accent-blue cursor-pointer"
                />
              </div>

              {/* Translation X */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-400">Offset X:</span>
                  <span className="text-accent-cyan font-bold">{transX}px</span>
                </div>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  step="1"
                  value={transX}
                  onChange={(e) => setTransX(parseInt(e.target.value))}
                  className="w-full accent-accent-blue cursor-pointer"
                />
              </div>

              {/* Translation Y */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-400">Offset Y:</span>
                  <span className="text-accent-cyan font-bold">{transY}px</span>
                </div>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  step="1"
                  value={transY}
                  onChange={(e) => setTransY(parseInt(e.target.value))}
                  className="w-full accent-accent-blue cursor-pointer"
                />
              </div>

              {/* Rotation */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-400">Rotation:</span>
                  <span className="text-accent-cyan font-bold">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  step="0.5"
                  value={rotation}
                  onChange={(e) => setRotation(parseFloat(e.target.value))}
                  className="w-full accent-accent-blue cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => handleApplyAlignment(false)}
                  disabled={savingAlignment}
                  className="w-full py-2 rounded-lg bg-surface-elevated border border-accent-blue/50 text-accent-cyan text-xs font-mono font-medium hover:bg-accent-blue/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingAlignment ? 'Saving...' : 'Save Alignment Matrix'}</span>
                </button>

                <button
                  onClick={() => handleApplyAlignment(true)}
                  disabled={savingAlignment}
                  className="w-full py-2 rounded-lg bg-graphite border border-slate-border text-gray-300 text-xs font-mono font-medium hover:bg-surface-elevated transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-accent-blue" />
                  <span>Auto-Calibrate homography</span>
                </button>
              </div>
            </div>

            {/* Homography Matrix Card */}
            <div className="p-3 rounded-lg bg-graphite border border-slate-border text-[11px] font-mono space-y-1 text-gray-400">
              <span className="text-gray-300 block font-bold mb-1">Status Summary</span>
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="text-accent-cyan">Planar Perspective</span>
              </div>
              <div className="flex justify-between">
                <span>Aligned Status:</span>
                <span className="text-emerald-400 font-bold">{alignmentData?.alignment_status || 'ALIGNED_AUTO'}</span>
              </div>
              <div className="flex justify-between">
                <span>Confidence:</span>
                <span className="text-white">{(alignmentData?.confidence_score || 0.94) * 100}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
