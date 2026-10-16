import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Printer,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { ReportItem } from '../types';
import { InspectionDisclaimer } from '../components/common/InspectionDisclaimer';

export const ReportsPage: React.FC = () => {
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [generatingExcel, setGeneratingExcel] = useState(false);
  const [latestReport, setLatestReport] = useState<ReportItem | null>(null);
  const [reportsList, setReportsList] = useState<ReportItem[]>([
    {
      id: 'RPT-PDF-001',
      session_id: 'INS-2026-0891',
      report_type: 'PDF',
      file_path: 'reports/QC_Report_CAB-4092_RevC.pdf',
      filename: 'QC_Report_CAB-4092_RevC.pdf',
      download_url: '/reports/QC_Report_CAB-4092_RevC.pdf',
      created_at: new Date().toISOString()
    }
  ]);

  const handleExportPDF = async () => {
    setGeneratingPdf(true);
    try {
      const report = await api.exportPDF('INS-2026-0891');
      setLatestReport(report);
      setReportsList((prev) => [report, ...prev]);
      // Trigger download
      window.open(report.download_url, '_blank');
    } catch (err: any) {
      alert(`PDF export failed: ${err.message}`);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleExportExcel = async () => {
    setGeneratingExcel(true);
    try {
      const report = await api.exportExcel('INS-2026-0891');
      setLatestReport(report);
      setReportsList((prev) => [report, ...prev]);
      window.open(report.download_url, '_blank');
    } catch (err: any) {
      alert(`Excel export failed: ${err.message}`);
    } finally {
      setGeneratingExcel(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="p-5 rounded-xl bg-surface border border-slate-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-lime/10 text-accent-lime border border-accent-lime/30 font-bold uppercase">
            Factory Acceptance Testing Documentation
          </span>
          <h2 className="text-xl font-bold text-white tracking-wide mt-1">
            Quality Control Reports & Compliance Exports
          </h2>
          <p className="text-xs text-gray-400">
            Generate timestamped, traceable PDF and Excel quality reports containing complete checklists, defect explanations, and photographic proof.
          </p>
        </div>

        {/* Quick Generation CTA Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            disabled={generatingPdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 hover:bg-red-900/50 text-xs font-mono font-medium transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4 text-red-400" />
            <span>{generatingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={generatingExcel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 text-xs font-mono font-medium transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{generatingExcel ? 'Generating XLSX...' : 'Download Excel Sheet'}</span>
          </button>
        </div>
      </div>

      {/* Report Structure Information Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Report Structure */}
        <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-3">
          <div className="flex items-center gap-2.5 text-white">
            <div className="p-2 rounded bg-red-500/10 text-red-400 border border-red-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">ISO 9001 Factory Quality PDF Report</h3>
              <span className="text-[10px] font-mono text-gray-400">Formatted via ReportLab Engine</span>
            </div>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Includes high-resolution header blocks, metadata table, summary outcome counts, 
            complete 19-row verification checklist with red-highlighted defect rows, 
            optical micro-evidence snippet crops, and legal disclaimers.
          </p>
          <div className="p-3 rounded bg-graphite border border-slate-border text-xs font-mono text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Standard Format:</span>
              <span className="text-white">A4 Landscape</span>
            </div>
            <div className="flex justify-between">
              <span>Color Highlighting:</span>
              <span className="text-emerald-400">PASS</span> / <span className="text-red-400">FAIL</span> / <span className="text-amber-400">REVIEW</span>
            </div>
            <div className="flex justify-between">
              <span>Legal Disclaimer:</span>
              <span className="text-gray-300">IEC 61439 Mandated Notice</span>
            </div>
          </div>
          <button
            onClick={handleExportPDF}
            className="w-full py-2 rounded bg-surface-elevated hover:bg-surface-highlight border border-slate-border text-xs font-mono text-gray-200 flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-accent-lime" />
            <span>Generate & Download New PDF</span>
          </button>
        </div>

        {/* Excel Report Structure */}
        <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-3">
          <div className="flex items-center gap-2.5 text-white">
            <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Multi-Sheet Excel Audit Workbook</h3>
              <span className="text-[10px] font-mono text-gray-400">Formatted via OpenPyXL Engine</span>
            </div>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Contains two fully structured sheets: <strong>Executive_Summary</strong> with metadata KPIs, 
            and <strong>Inspection_Findings</strong> with conditional formatting, column filtering, 
            and individual verification records.
          </p>
          <div className="p-3 rounded bg-graphite border border-slate-border text-xs font-mono text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Sheets Included:</span>
              <span className="text-white">Summary + Detailed Findings</span>
            </div>
            <div className="flex justify-between">
              <span>Filter Compatibility:</span>
              <span className="text-emerald-400">AutoFilter Enabled</span>
            </div>
            <div className="flex justify-between">
              <span>Styling:</span>
              <span className="text-gray-300">Custom Cell Fill & Borders</span>
            </div>
          </div>
          <button
            onClick={handleExportExcel}
            className="w-full py-2 rounded bg-surface-elevated hover:bg-surface-highlight border border-slate-border text-xs font-mono text-gray-200 flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-accent-lime" />
            <span>Generate & Download New XLSX</span>
          </button>
        </div>
      </div>

      {/* Generated Reports Archive */}
      <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-4">
        <h3 className="text-sm font-semibold text-white">Generated Report Downloads</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-border text-gray-400">
                <th className="py-2.5 px-3">Format</th>
                <th className="py-2.5 px-3">Filename</th>
                <th className="py-2.5 px-3">Cabinet ID</th>
                <th className="py-2.5 px-3">Generated Timestamp</th>
                <th className="py-2.5 px-3 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-border">
              {reportsList.map((r, i) => (
                <tr key={i} className="hover:bg-surface-elevated/70 text-gray-300">
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      r.report_type === 'PDF' ? 'bg-red-950 text-red-400 border border-red-500/30' : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {r.report_type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-white">{r.filename}</td>
                  <td className="py-3 px-3 text-gray-400">CAB-4092</td>
                  <td className="py-3 px-3 text-gray-400">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="py-3 px-3 text-right">
                    <a
                      href={r.download_url}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-surface border border-slate-border text-accent-lime hover:bg-surface-elevated text-xs transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InspectionDisclaimer />
    </div>
  );
};
