import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  FolderOpen
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { api } from '../services/api';
import { useInspectionSession } from '../context/InspectionContext';
import { InspectionSessionSummary, AnalyticsOverview } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { InspectionDisclaimer } from '../components/common/InspectionDisclaimer';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentSessionId } = useInspectionSession();
  const [sessions, setSessions] = useState<InspectionSessionSummary[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sessData, analData] = await Promise.all([
          api.getInspections(),
          api.getAnalytics()
        ]);
        setSessions(sessData);
        setAnalytics(analData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute metrics from actual sessions if analytics not yet loaded
  const totalSessions = sessions.length;
  const totalPass = sessions.reduce((acc, s) => acc + s.pass_count, 0);
  const totalFail = sessions.reduce((acc, s) => acc + s.fail_count, 0);
  const totalReview = sessions.reduce((acc, s) => acc + s.review_count, 0);
  const totalChecked = sessions.reduce((acc, s) => acc + s.total_findings, 0);

  const outcomeData = [
    { name: 'PASS', value: totalPass, color: '#10B981' },
    { name: 'FAIL', value: totalFail, color: '#EF4444' },
    { name: 'REVIEW', value: totalReview, color: '#F59E0B' },
  ];

  const categoryData = analytics?.defect_categories && analytics.defect_categories.length > 0
    ? analytics.defect_categories.map((c) => ({
        name: c.check_type.replace('_', ' '),
        count: c.count,
      }))
    : [];

  const handleSelectSession = (s: InspectionSessionSummary) => {
    setCurrentSessionId(s.id, s.cabinet_id);
    navigate('/results');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm animate-card-rise">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Industrial Inspection Command Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time visual comparison against General Arrangement drawings & Excel wiring schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/history')}
            className="px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors shadow-sm"
          >
            Audit Archive
          </button>
          <button
            onClick={() => navigate('/new-inspection')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F2B5C] hover:bg-[#163A75] text-white font-semibold text-xs btn-lift shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>New Inspection</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Total Sessions */}
        <div className="p-4 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm animate-card-rise">
          <div className="text-[11px] font-mono uppercase text-slate-500 font-bold mb-1 flex items-center justify-between">
            <span>Sessions</span>
            <FolderOpen className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {loading ? '...' : totalSessions}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {totalChecked} total items checked
          </div>
        </div>

        {/* PASS Count */}
        <div className="p-4 rounded-xl bg-white/95 backdrop-blur-md border border-emerald-300 shadow-sm bg-emerald-50/20 animate-card-rise">
          <div className="text-[11px] font-mono uppercase text-emerald-800 font-bold mb-1 flex items-center justify-between">
            <span>Passed Checks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            {loading ? '...' : totalPass}
          </div>
          <div className="text-[10px] text-emerald-700/80 mt-1 font-medium">
            Confirmed compliant
          </div>
        </div>

        {/* FAIL Count */}
        <div className="p-4 rounded-xl bg-white/95 backdrop-blur-md border border-red-300 shadow-sm bg-red-50/20 animate-card-rise">
          <div className="text-[11px] font-mono uppercase text-red-800 font-bold mb-1 flex items-center justify-between">
            <span>Open Defects</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-700">
            {loading ? '...' : totalFail}
          </div>
          <div className="text-[10px] text-red-700/80 mt-1 font-medium">
            Rework required
          </div>
        </div>

        {/* REVIEW Count */}
        <div className="p-4 rounded-xl bg-white/95 backdrop-blur-md border border-amber-300 shadow-sm bg-amber-50/20 animate-card-rise">
          <div className="text-[11px] font-mono uppercase text-amber-800 font-bold mb-1 flex items-center justify-between">
            <span>Review Needed</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700">
            {loading ? '...' : totalReview}
          </div>
          <div className="text-[10px] text-amber-700/80 mt-1 font-medium">
            Ambiguous visual evidence
          </div>
        </div>

        {/* First Time Yield */}
        <div className="p-4 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm animate-card-rise">
          <div className="text-[11px] font-mono uppercase text-slate-500 font-bold mb-1 flex items-center justify-between">
            <span>First-Time Yield</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-700">
            {analytics?.first_time_pass_rate !== undefined && analytics.first_time_pass_rate !== null
              ? `${analytics.first_time_pass_rate}%`
              : (totalChecked > 0 ? `${((totalPass / totalChecked) * 100).toFixed(1)}%` : '—')}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Across active production batches
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Defect Distribution Chart */}
        <div className="md:col-span-2 p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm flex flex-col justify-between animate-card-rise">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Defect Frequency by Check Module</h3>
              <p className="text-xs text-slate-500">Aggregated from confirmed QC findings</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500 font-medium">Database Records</span>
          </div>
          {categoryData.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', color: '#0F172A', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 w-full flex flex-col items-center justify-center text-slate-400 font-mono text-xs">
              <p>No open defect categories logged.</p>
            </div>
          )}
        </div>

        {/* Inspection Outcomes Donut */}
        <div className="p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm flex flex-col justify-between animate-card-rise">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">Inspection Outcome Ratio</h3>
            <p className="text-xs text-slate-500">Cumulative status proportion</p>
          </div>
          <div className="h-44 w-full my-auto flex items-center justify-center">
            {totalChecked > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={outcomeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {outcomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', color: '#0F172A', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 font-mono text-xs text-center">
                No inspection checks recorded yet.
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 text-center text-xs font-mono">
            <div>
              <span className="block text-emerald-700 font-bold">{totalPass}</span>
              <span className="text-[10px] text-slate-500">PASS</span>
            </div>
            <div>
              <span className="block text-red-700 font-bold">{totalFail}</span>
              <span className="text-[10px] text-slate-500">FAIL</span>
            </div>
            <div>
              <span className="block text-amber-700 font-bold">{totalReview}</span>
              <span className="text-[10px] text-slate-500">REVIEW</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Inspection Sessions Table */}
      <div className="p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm space-y-4 animate-card-rise">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Inspection Workspaces</h3>
            <p className="text-xs text-slate-500">Select any cabinet session to inspect visual evidence or start repair</p>
          </div>
          {sessions.length > 0 && (
            <button
              onClick={() => navigate('/history')}
              className="text-xs font-mono text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View All ({sessions.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">No inspections yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Start a new inspection to analyze cabinet photographs against GA drawings and wiring schedules.
              </p>
            </div>
            <button
              onClick={() => navigate('/new-inspection')}
              className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F2B5C] hover:bg-[#163A75] text-white text-xs font-semibold btn-lift shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start New Inspection</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-mono">
                  <th className="py-2.5 px-3">Cabinet ID</th>
                  <th className="py-2.5 px-3">Inspection ID</th>
                  <th className="py-2.5 px-3">Work Order</th>
                  <th className="py-2.5 px-3">Inspector</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Counts (P / F / R)</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => handleSelectSession(s)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 group-hover:text-blue-600">
                      {s.cabinet_id}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">{s.id}</td>
                    <td className="py-3 px-3 font-mono text-slate-700">{s.work_order_id || 'WO-8492'}</td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{s.inspector}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={s.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 font-mono text-xs">
                      <span className="text-emerald-700 font-bold">{s.pass_count}</span>
                      <span className="text-slate-400 mx-1">/</span>
                      <span className="text-red-700 font-bold">{s.fail_count}</span>
                      <span className="text-slate-400 mx-1">/</span>
                      <span className="text-amber-700 font-bold">{s.review_count}</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-xs font-mono text-blue-600 group-hover:underline flex items-center justify-end gap-1 font-semibold">
                        Open <ArrowRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Safety Disclaimer Callout */}
      <InspectionDisclaimer />
    </div>
  );
};
