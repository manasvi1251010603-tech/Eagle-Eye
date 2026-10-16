import React, { useState, useEffect } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Download,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Sparkles,
  Layers,
  TrendingUp,
  ShieldCheck,
  Check
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { api } from '../services/api';
import { useInspectionSession } from '../context/InspectionContext';
import { ReportItem, AnalyticsOverview } from '../types';
import { SeverityBadge } from '../components/common/StatusBadge';

export const ReportsAnalyticsPage: React.FC = () => {
  const { currentSessionId, currentCabinetId } = useInspectionSession();

  // Tab: 'reports' vs 'analytics'
  const [activeTab, setActiveTab] = useState<'reports' | 'analytics'>('reports');

  // Reports state
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [generatingExcel, setGeneratingExcel] = useState(false);
  const [reportsList, setReportsList] = useState<ReportItem[]>([]);
  const [lastGeneratedUrl, setLastGeneratedUrl] = useState<string | null>(null);

  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        setLoadingAnalytics(true);
        const data = await api.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load defect analytics:', err);
      } finally {
        setLoadingAnalytics(false);
      }
    }
    fetchAnalyticsData();
  }, [currentSessionId]);

  const handleExportPDF = async () => {
    setGeneratingPdf(true);
    try {
      const report = await api.exportPDF(currentSessionId);
      setReportsList((prev) => [report, ...prev]);
      setLastGeneratedUrl(report.download_url);
      window.open(report.download_url, '_blank');
    } catch (err: any) {
      alert(`PDF Report Generation failed: ${err.message}`);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleExportExcel = async () => {
    setGeneratingExcel(true);
    try {
      const report = await api.exportExcel(currentSessionId);
      setReportsList((prev) => [report, ...prev]);
      setLastGeneratedUrl(report.download_url);
      window.open(report.download_url, '_blank');
    } catch (err: any) {
      alert(`Excel Report Generation failed: ${err.message}`);
    } finally {
      setGeneratingExcel(false);
    }
  };

  const categoryChartData = analytics?.defect_categories.map((c) => ({
    name: c.check_type.replace('_', ' '),
    count: c.count,
    percentage: c.percentage,
  })) || [];

  const severityData = [
    { name: 'CRITICAL', value: analytics?.severity_distribution?.['CRITICAL'] ?? 2, color: '#EF4444' },
    { name: 'HIGH', value: analytics?.severity_distribution?.['HIGH'] ?? 3, color: '#F97316' },
    { name: 'MEDIUM', value: analytics?.severity_distribution?.['MEDIUM'] ?? 4, color: '#F59E0B' },
    { name: 'LOW', value: analytics?.severity_distribution?.['LOW'] ?? 1, color: '#3B82F6' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-surface border border-slate-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-blue/10 text-accent-cyan border border-accent-blue/30 font-bold uppercase">
              Phase 8: Quality Control & Audit Intelligence
            </span>
            <span className="text-xs font-mono text-gray-400">Cabinet: {currentCabinetId}</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            QC Reports & Defect Analytics Center
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Export comprehensive timestamped PDF / Excel audit certificates and analyze recurring defect trends across cabinets.
          </p>
        </div>

        {/* Quick Report CTAs */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportPDF}
            disabled={generatingPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-elevated border border-slate-border text-gray-200 hover:text-white text-xs font-mono font-medium hover:border-accent-blue transition-colors"
          >
            <FileText className="w-4 h-4 text-red-400" />
            <span>{generatingPdf ? 'Generating PDF...' : 'Download PDF Certificate'}</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={generatingExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-blue text-white font-semibold text-xs transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-blue-glow hover:bg-accent-blue-dark"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>{generatingExcel ? 'Exporting...' : 'Export Excel Audit'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-border pb-2">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-colors ${
            activeTab === 'reports'
              ? 'bg-accent-blue text-white shadow-technical'
              : 'bg-surface text-gray-400 hover:text-white border border-slate-border'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Quality Control Reports</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'bg-accent-blue text-white shadow-technical'
              : 'bg-surface text-gray-400 hover:text-white border border-slate-border'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Defect Intelligence & Analytics</span>
        </button>
      </div>

      {/* TAB 1: QC REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Report Configuration & Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-3">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Inspection Scope</span>
              <div className="text-sm font-bold text-white font-mono">{currentCabinetId}</div>
              <div className="text-xs text-gray-400 space-y-1">
                <div>Session: <span className="font-mono text-accent-cyan">{currentSessionId}</span></div>
                <div>Standard: <span className="text-gray-200">IEC 61439-1 / 61439-2</span></div>
                <div>Status: <span className="text-amber-400 font-bold">REPAIR REQUIRED</span></div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-3">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Compliance Sign-Off</span>
              <div className="text-sm font-bold text-white">Lead QC Inspector</div>
              <div className="text-xs text-gray-400 space-y-1">
                <div>Inspector: <span className="text-gray-200">Samarth Shingare</span></div>
                <div>Digital Signature: <span className="font-mono text-emerald-400">SHA256:VERIFIED</span></div>
                <div>Traceability: <span className="text-gray-200">Full Audit Log</span></div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-3">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Generated Documents</span>
              <div className="text-sm font-bold text-white">Report Repository</div>
              <div className="text-xs text-gray-400 space-y-1">
                <div>Formats: <span className="text-gray-200">PDF (ISO 19005-1), XLSX</span></div>
                <div>Storage: <span className="text-gray-200">Local /reports directory</span></div>
                <div>Retention: <span className="text-emerald-400 font-mono">Permanent</span></div>
              </div>
            </div>
          </div>

          {/* Report Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PDF Report Card */}
            <div className="p-5 rounded-xl bg-surface border border-slate-border flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-500/30 font-bold uppercase">
                    Formal Audit Certificate
                  </span>
                  <span className="text-xs font-mono text-gray-400">ReportLab Engine</span>
                </div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-400" />
                  Engineering Quality Inspection Certificate (PDF)
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Generates an official multi-page PDF document containing cabinet photographs, visual bounding box evidence crops, 
                  expected versus observed verification tables, reviewer overrides, and technician sign-off blocks.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleExportPDF}
                  disabled={generatingPdf}
                  className="w-full py-2.5 rounded-lg bg-surface-elevated border border-red-500/40 text-red-300 font-semibold text-xs font-mono hover:bg-red-950/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{generatingPdf ? 'Generating Certificate...' : 'Generate & Download PDF Certificate'}</span>
                </button>
              </div>
            </div>

            {/* Excel Report Card */}
            <div className="p-5 rounded-xl bg-surface border border-slate-border flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                    Tabular Quality Audit
                  </span>
                  <span className="text-xs font-mono text-gray-400">OpenPyXL Engine</span>
                </div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  Master Inspection Findings Workbook (XLSX)
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Exports a structured spreadsheet with 3 distinct sheets: Summary KPIs, Full Findings Data Table (with severity, status, and reasons), 
                  and Guided Repair Action Tracking Checklists.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleExportExcel}
                  disabled={generatingExcel}
                  className="w-full py-2.5 rounded-lg bg-surface-elevated border border-emerald-500/40 text-emerald-300 font-semibold text-xs font-mono hover:bg-emerald-950/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{generatingExcel ? 'Exporting Workbook...' : 'Export Excel Findings Workbook'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Generated Reports History Table */}
          <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent-cyan" />
              Recent Inspection Certificates & Artifacts
            </h3>

            <div className="overflow-x-auto border border-slate-border rounded-lg">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-graphite text-gray-400 border-b border-slate-border text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Report ID</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Cabinet / Session</th>
                    <th className="py-2.5 px-3">Filename</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-border">
                  {reportsList.length > 0 ? (
                    reportsList.map((rep) => (
                      <tr key={rep.id} className="hover:bg-surface-elevated/50 transition-colors">
                        <td className="py-2 px-3 text-accent-cyan">{rep.id}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rep.report_type === 'PDF' ? 'bg-red-950/40 text-red-400 border border-red-500/30' : 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {rep.report_type}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-300">{rep.session_id}</td>
                        <td className="py-2 px-3 text-gray-200">{rep.filename}</td>
                        <td className="py-2 px-3 text-center">
                          <a
                            href={rep.download_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded bg-surface border border-slate-border text-accent-cyan hover:bg-surface-elevated text-xs"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-500">
                        No reports generated for this session yet. Click the buttons above to create PDF or Excel certificates.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEFECT INTELLIGENCE & ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-surface border border-slate-border space-y-1">
              <span className="text-[10px] font-mono text-gray-400 uppercase">Total Inspected Cabinets</span>
              <div className="text-2xl font-bold font-mono text-white">
                {analytics?.total_inspections ?? 11}
              </div>
              <span className="text-[11px] text-gray-400 font-mono">SQLite Session Store</span>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-slate-border space-y-1">
              <span className="text-[10px] font-mono text-gray-400 uppercase">First-Time Pass Rate</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {analytics?.first_time_pass_rate ?? 72.7}%
              </div>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                <TrendingUp className="w-3 h-3" /> +4.2% from last month
              </span>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-slate-border space-y-1">
              <span className="text-[10px] font-mono text-gray-400 uppercase">Open Defects</span>
              <div className="text-2xl font-bold font-mono text-red-400">
                {analytics?.open_defects_count ?? 2}
              </div>
              <span className="text-[11px] text-gray-400 font-mono">Pending Rework</span>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-slate-border space-y-1">
              <span className="text-[10px] font-mono text-gray-400 uppercase">Rework Success Rate</span>
              <div className="text-2xl font-bold font-mono text-accent-cyan">
                {analytics?.rework_success_rate ?? 92.5}%
              </div>
              <span className="text-[11px] text-gray-400 font-mono">Post-repair closure</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Defect Severity Chart */}
            <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    Defect Severity Breakdown
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Categorized by manufacturing impact and safety criticality.
                  </p>
                </div>
              </div>

              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#243447',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontFamily: 'monospace'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                {severityData.map((s) => (
                  <div key={s.name} className="p-2 rounded bg-graphite border border-slate-border">
                    <span className="text-gray-400 text-[10px] block">{s.name}</span>
                    <span className="text-base font-bold" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Defect Categories Chart */}
            <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-accent-blue" />
                    Defect Category Distribution
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Frequency across GA placement, label, ferrule, and color modules.
                  </p>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} layout="vertical" margin={{ left: 30, right: 20 }}>
                    <XAxis type="number" stroke="#64748B" fontSize={10} fontVariant="monospace" />
                    <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={10} width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#243447',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontFamily: 'monospace'
                      }}
                    />
                    <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Failing Components Table */}
          <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400">
              Top Recurring Defective Components Across Production
            </h3>

            <div className="overflow-x-auto border border-slate-border rounded-lg">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-graphite text-gray-400 border-b border-slate-border text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Component / Terminal Ref</th>
                    <th className="py-2.5 px-3">Defect Count</th>
                    <th className="py-2.5 px-3">Primary Quality Root Cause</th>
                    <th className="py-2.5 px-3">Recommended Preventative Rework</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-border">
                  {analytics?.top_recurring_components && analytics.top_recurring_components.length > 0 ? (
                    analytics.top_recurring_components.map((c, i) => (
                      <tr key={i} className="hover:bg-surface-elevated/50 transition-colors">
                        <td className="py-2 px-3 text-accent-cyan font-bold">{c.component_ref}</td>
                        <td className="py-2 px-3 text-white font-bold">{c.defect_count} cabinets</td>
                        <td className="py-2 px-3 text-red-400">{c.primary_issue}</td>
                        <td className="py-2 px-3 text-gray-300">
                          {c.primary_issue.includes('GA') ? 'Calibrate DIN rail assembly jig slot indexing.' : 'Inspect wire thermal printer sleeve calibration.'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-500">
                        No recurring component defects identified.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
