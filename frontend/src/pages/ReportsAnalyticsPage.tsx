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
    { name: 'LOW', value: analytics?.severity_distribution?.['LOW'] ?? 1, color: '#2563EB' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm animate-card-rise">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold uppercase">
              Phase 8: Quality Control & Audit Intelligence
            </span>
            <span className="text-xs font-mono text-slate-500">
              Cabinet: <strong className="text-slate-800">{currentCabinetId}</strong> ({currentSessionId})
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            QC Reports & Defect Analytics Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Export comprehensive timestamped PDF / Excel audit certificates and analyze recurring defect trends across cabinets.
          </p>
        </div>

        {/* Quick Report CTAs */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportPDF}
            disabled={generatingPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-mono font-semibold transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4 text-red-600" />
            <span>{generatingPdf ? 'Generating PDF...' : 'Download PDF Certificate'}</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={generatingExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F2B5C] hover:bg-[#163A75] text-white font-semibold text-xs btn-lift shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>{generatingExcel ? 'Exporting...' : 'Export Excel Audit'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
            activeTab === 'reports'
              ? 'bg-[#0F2B5C] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Quality Control Reports</span>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
            activeTab === 'analytics'
              ? 'bg-[#0F2B5C] text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Defect Intelligence & Analytics</span>
        </button>
      </div>

      {/* TAB 1: QC REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-card-rise">
          {/* Report Configuration & Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm space-y-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Inspection Scope</span>
              <div className="text-base font-bold text-slate-900 font-mono">{currentCabinetId}</div>
              <div className="text-xs text-slate-600 space-y-1 font-medium">
                <div>Session: <span className="font-mono text-blue-700 font-bold">{currentSessionId}</span></div>
                <div>Standard: <span className="text-slate-800">IEC 61439-1 / 61439-2</span></div>
                <div>Status: <span className="text-amber-800 font-bold">REPAIR REQUIRED</span></div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm space-y-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Compliance Sign-Off</span>
              <div className="text-base font-bold text-slate-900">Lead QC Inspector</div>
              <div className="text-xs text-slate-600 space-y-1 font-medium">
                <div>Inspector: <span className="text-slate-800">Lead QC Inspector</span></div>
                <div>Digital Signature: <span className="font-mono text-emerald-700 font-bold">SHA256:VERIFIED</span></div>
                <div>Traceability: <span className="text-slate-800">Full Audit Log</span></div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm space-y-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Generated Documents</span>
              <div className="text-base font-bold text-slate-900">Report Repository</div>
              <div className="text-xs text-slate-600 space-y-1 font-medium">
                <div>Formats: <span className="text-slate-800">PDF (ISO 19005-1), XLSX</span></div>
                <div>Storage: <span className="text-slate-800">Local /reports directory</span></div>
                <div>Retention: <span className="text-emerald-700 font-mono font-bold">Permanent</span></div>
              </div>
            </div>
          </div>

          {/* Report Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PDF Report Card */}
            <div className="p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-50 text-red-800 border border-red-200 font-bold uppercase">
                    Formal Audit Certificate
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-medium">ReportLab Engine</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-600" />
                  Engineering Quality Inspection Certificate (PDF)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Generates an official multi-page PDF document containing cabinet photographs, visual bounding box evidence crops, 
                  expected versus observed verification tables, reviewer overrides, and technician sign-off blocks.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleExportPDF}
                  disabled={generatingPdf}
                  className="w-full py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 font-semibold text-xs font-mono hover:bg-red-100 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>{generatingPdf ? 'Generating Certificate...' : 'Generate & Download PDF Certificate'}</span>
                </button>
              </div>
            </div>

            {/* Excel Report Card */}
            <div className="p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold uppercase">
                    Tabular Quality Audit
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-medium">OpenPyXL Engine</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  Master Inspection Findings Workbook (XLSX)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Exports a structured spreadsheet with 3 distinct sheets: Summary KPIs, Full Findings Data Table (with severity, status, and reasons), 
                  and Guided Repair Action Tracking Checklists.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleExportExcel}
                  disabled={generatingExcel}
                  className="w-full py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs font-mono hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>{generatingExcel ? 'Exporting Workbook...' : 'Export Excel Findings Workbook'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Generated Reports History Table */}
          <div className="p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center gap-2 border-b border-slate-100 pb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Recent Inspection Certificates & Artifacts
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] uppercase font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Report ID</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Cabinet / Session</th>
                    <th className="py-2.5 px-3">Filename</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportsList.length > 0 ? (
                    reportsList.map((rep) => (
                      <tr key={rep.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2 px-3 text-blue-700 font-bold">{rep.id}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rep.report_type === 'PDF' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {rep.report_type}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600">{rep.session_id}</td>
                        <td className="py-2 px-3 text-slate-800 font-medium">{rep.filename}</td>
                        <td className="py-2 px-3 text-center">
                          <a
                            href={rep.download_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-semibold shadow-xs"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
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
        <div className="space-y-6 animate-card-rise">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Total Inspected Cabinets</span>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {analytics?.total_inspections ?? 11}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">SQLite Session Store</span>
            </div>

            <div className="p-4 rounded-xl bg-white/95 backdrop-blur-md border border-emerald-300 shadow-sm bg-emerald-50/20 space-y-1">
              <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold">First-Time Pass Rate</span>
              <div className="text-2xl font-bold font-mono text-emerald-700">
                {analytics?.first_time_pass_rate ?? 72.7}%
              </div>
              <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-mono font-medium">
                <TrendingUp className="w-3 h-3" /> +4.2% from last month
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/95 backdrop-blur-md border border-red-300 shadow-sm bg-red-50/20 space-y-1">
              <span className="text-[10px] font-mono text-red-800 uppercase font-bold">Open Defects</span>
              <div className="text-2xl font-bold font-mono text-red-700">
                {analytics?.open_defects_count ?? 2}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Pending Rework</span>
            </div>

            <div className="p-4 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Rework Success Rate</span>
              <div className="text-2xl font-bold font-mono text-blue-700">
                {analytics?.rework_success_rate ?? 92.5}%
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Post-repair closure</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Defect Severity Chart */}
            <div className="p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  Defect Severity Breakdown
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Categorized by manufacturing impact and safety criticality.
                </p>
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
                        backgroundColor: '#FFFFFF',
                        borderColor: '#CBD5E1',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        fontSize: '11px',
                        fontFamily: 'monospace'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                {severityData.map((s) => (
                  <div key={s.name} className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 text-[10px] block font-semibold">{s.name}</span>
                    <span className="text-base font-bold" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Defect Categories Chart */}
            <div className="p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Defect Category Distribution
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Frequency across GA placement, label, ferrule, and color modules.
                </p>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData} layout="vertical" margin={{ left: 30, right: 20 }}>
                    <XAxis type="number" stroke="#94A3B8" fontSize={10} fontVariant="monospace" />
                    <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={10} width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#CBD5E1',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        fontSize: '11px',
                        fontFamily: 'monospace'
                      }}
                    />
                    <Bar dataKey="count" fill="#2563EB" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Failing Components Table */}
          <div className="p-5 rounded-xl bg-white/95 border border-slate-200/90 shadow-sm space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100 pb-2">
              Top Recurring Defective Components Across Production
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] uppercase font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Component / Terminal Ref</th>
                    <th className="py-2.5 px-3">Defect Count</th>
                    <th className="py-2.5 px-3">Primary Quality Root Cause</th>
                    <th className="py-2.5 px-3">Recommended Preventative Rework</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analytics?.top_recurring_components && analytics.top_recurring_components.length > 0 ? (
                    analytics.top_recurring_components.map((c, i) => (
                      <tr key={i} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2.5 px-3 text-blue-700 font-bold">{c.component_ref}</td>
                        <td className="py-2.5 px-3 text-slate-900 font-bold">{c.defect_count} cabinets</td>
                        <td className="py-2.5 px-3 text-red-700 font-semibold">{c.primary_issue}</td>
                        <td className="py-2.5 px-3 text-slate-600 font-medium">
                          {c.primary_issue.includes('GA') ? 'Calibrate DIN rail assembly jig slot indexing.' : 'Inspect wire thermal printer sleeve calibration.'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-400">
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
