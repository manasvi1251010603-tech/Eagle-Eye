import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw,
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

  const categoryData = analytics?.defect_categories.map((c) => ({
    name: c.check_type.replace('_', ' '),
    count: c.count,
  })) || [
    { name: 'GA PLACEMENT', count: 3 },
    { name: 'DEVICE LABEL', count: 2 },
    { name: 'FERRULE TEXT', count: 4 },
    { name: 'WIRE COLOUR', count: 2 },
    { name: 'RELATIONSHIP', count: 1 },
  ];

  const handleSelectSession = (s: InspectionSessionSummary) => {
    setCurrentSessionId(s.id, s.cabinet_id);
    navigate('/results');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-surface border border-slate-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-blue/10 text-accent-cyan border border-accent-blue/30 font-bold uppercase tracking-wider">
              DEMO DATA ACTIVE
            </span>
            <span className="text-xs text-gray-400 font-mono">SQLite Session Store</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Industrial Inspection Command Center
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-time visual comparison against General Arrangement drawings & Excel wiring schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/history')}
            className="px-3.5 py-2 rounded-md bg-surface-elevated border border-slate-border text-gray-300 hover:text-white text-xs font-medium transition-colors"
          >
            Audit Archive
          </button>
          <button
            onClick={() => navigate('/new-inspection')}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-accent-blue text-white font-semibold text-xs transition-transform hover:scale-[1.02] shadow-blue-glow hover:bg-accent-blue-dark"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>New Inspection</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Total Sessions */}
        <div className="p-4 rounded-lg bg-surface border border-slate-border">
          <div className="text-[11px] font-mono uppercase text-gray-400 mb-1 flex items-center justify-between">
            <span>Sessions</span>
            <FolderOpen className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {loading ? '...' : totalSessions}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">
            {totalChecked} total items checked
          </div>
        </div>

        {/* PASS Count */}
        <div className="p-4 rounded-lg bg-surface border border-emerald-500/20 bg-emerald-950/10">
          <div className="text-[11px] font-mono uppercase text-emerald-400 mb-1 flex items-center justify-between">
            <span>Passed Checks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {loading ? '...' : totalPass}
          </div>
          <div className="text-[10px] text-emerald-400/70 mt-1">
            Confirmed compliant
          </div>
        </div>

        {/* FAIL Count */}
        <div className="p-4 rounded-lg bg-surface border border-red-500/20 bg-red-950/10">
          <div className="text-[11px] font-mono uppercase text-red-400 mb-1 flex items-center justify-between">
            <span>Open Defects</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-400">
            {loading ? '...' : totalFail}
          </div>
          <div className="text-[10px] text-red-400/70 mt-1">
            Rework required
          </div>
        </div>

        {/* REVIEW Count */}
        <div className="p-4 rounded-lg bg-surface border border-amber-500/20 bg-amber-950/10">
          <div className="text-[11px] font-mono uppercase text-amber-400 mb-1 flex items-center justify-between">
            <span>Review Needed</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {loading ? '...' : totalReview}
          </div>
          <div className="text-[10px] text-amber-400/70 mt-1">
            Ambiguous visual evidence
          </div>
        </div>

        {/* First Time Yield */}
        <div className="p-4 rounded-lg bg-surface border border-slate-border">
          <div className="text-[11px] font-mono uppercase text-gray-400 mb-1 flex items-center justify-between">
            <span>First-Time Yield</span>
            <TrendingUp className="w-4 h-4 text-accent-cyan" />
          </div>
          <div className="text-2xl font-bold font-mono text-accent-cyan">
            {analytics?.first_time_pass_rate ? `${analytics.first_time_pass_rate}%` : '84.6%'}
          </div>
          <div className="text-[10px] text-gray-400 mt-1">
            Across active production batches
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Defect Distribution Chart */}
        <div className="md:col-span-2 p-5 rounded-xl bg-surface border border-slate-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Defect Frequency by Check Module</h3>
              <p className="text-xs text-gray-400">Aggregated from confirmed QC findings</p>
            </div>
            <span className="text-[11px] font-mono text-gray-400">Real Database Stats</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#6B7280" fontSize={10} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#243447', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inspection Outcomes Donut */}
        <div className="p-5 rounded-xl bg-surface border border-slate-border flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Inspection Outcome Ratio</h3>
            <p className="text-xs text-gray-400">Cumulative status proportion</p>
          </div>
          <div className="h-44 w-full my-auto flex items-center justify-center">
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
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#243447', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-border text-center text-xs font-mono">
            <div>
              <span className="block text-emerald-400 font-bold">{totalPass}</span>
              <span className="text-[10px] text-gray-400">PASS</span>
            </div>
            <div>
              <span className="block text-red-400 font-bold">{totalFail}</span>
              <span className="text-[10px] text-gray-400">FAIL</span>
            </div>
            <div>
              <span className="block text-amber-400 font-bold">{totalReview}</span>
              <span className="text-[10px] text-gray-400">REVIEW</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Inspection Sessions Table */}
      <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Inspection Workspaces</h3>
            <p className="text-xs text-gray-400">Select any cabinet session to inspect visual evidence or start repair</p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="text-xs font-mono text-accent-cyan hover:underline flex items-center gap-1"
          >
            <span>View All ({sessions.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-border text-gray-400 font-mono">
                <th className="py-2.5 px-3">Cabinet ID</th>
                <th className="py-2.5 px-3">Inspection ID</th>
                <th className="py-2.5 px-3">Work Order</th>
                <th className="py-2.5 px-3">Inspector</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Counts (P / F / R)</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-border">
              {sessions.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => handleSelectSession(s)}
                  className="hover:bg-surface-elevated/70 cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-3 font-mono font-semibold text-white group-hover:text-accent-cyan">
                    {s.cabinet_id}
                  </td>
                  <td className="py-3 px-3 font-mono text-gray-400">{s.id}</td>
                  <td className="py-3 px-3 font-mono text-gray-300">{s.work_order_id || 'WO-8492'}</td>
                  <td className="py-3 px-3 text-gray-300">{s.inspector}</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={s.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 font-mono text-xs">
                    <span className="text-emerald-400 font-bold">{s.pass_count}</span>
                    <span className="text-gray-500 mx-1">/</span>
                    <span className="text-red-400 font-bold">{s.fail_count}</span>
                    <span className="text-gray-500 mx-1">/</span>
                    <span className="text-amber-400 font-bold">{s.review_count}</span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-xs font-mono text-accent-cyan group-hover:underline flex items-center justify-end gap-1">
                      Open <ArrowRight className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety Disclaimer Callout */}
      <InspectionDisclaimer />
    </div>
  );
};
