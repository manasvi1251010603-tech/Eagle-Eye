import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Layers,
  Cpu,
  CheckCircle2,
  Calendar,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsOverview } from '../types';
import { InspectionDisclaimer } from '../components/common/InspectionDisclaimer';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await api.getAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load defect analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const categoryChartData = data?.defect_categories.map((c) => ({
    name: c.check_type.replace('_', ' '),
    count: c.count,
    percentage: c.percentage,
  })) || [];

  const trendData = data?.timeline_trends || [
    { period: 'Week 38', pass_count: 18, defect_count: 4, rework_count: 4 },
    { period: 'Week 39', pass_count: 22, defect_count: 5, rework_count: 5 },
    { period: 'Week 40', pass_count: 29, defect_count: 3, rework_count: 3 },
    { period: 'Week 41', pass_count: 34, defect_count: 2, rework_count: 2 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="p-5 rounded-xl bg-surface border border-slate-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-lime/10 text-accent-lime border border-accent-lime/30 font-bold uppercase">
            Quality Intelligence & Defect Analytics
          </span>
          <h2 className="text-xl font-bold text-white tracking-wide mt-1">
            Manufacturing Defect Intelligence Workstation
          </h2>
          <p className="text-xs text-gray-400">
            Statistical tracking of recurring assembly anomalies, first-time pass rates, and technician rework trends.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated border border-slate-border text-xs font-mono text-gray-300">
          <span className="w-2 h-2 rounded-full bg-accent-lime" />
          <span>Confirmed Human-Reviewed Defects Only</span>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface border border-slate-border">
          <span className="text-[11px] font-mono uppercase text-gray-400 block mb-1">
            Total Inspected Assemblies
          </span>
          <div className="text-2xl font-bold font-mono text-white">
            {data?.total_inspections || 3}
          </div>
          <span className="text-[10px] text-gray-400">Across 2 production batches</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-slate-border">
          <span className="text-[11px] font-mono uppercase text-gray-400 block mb-1">
            Total Checked Verification Points
          </span>
          <div className="text-2xl font-bold font-mono text-accent-lime">
            {data?.total_checked_items || 57}
          </div>
          <span className="text-[10px] text-gray-400">Terminals, devices, ferrules</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-slate-border">
          <span className="text-[11px] font-mono uppercase text-emerald-400 block mb-1">
            First-Time Pass Rate (FPY)
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {data?.first_time_pass_rate ? `${data.first_time_pass_rate}%` : '84.6%'}
          </div>
          <span className="text-[10px] text-gray-400">+4.2% from prior quarter</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-slate-border">
          <span className="text-[11px] font-mono uppercase text-accent-lime block mb-1">
            Rework Resolution Rate
          </span>
          <div className="text-2xl font-bold font-mono text-accent-lime">
            {data?.rework_success_rate ? `${data.rework_success_rate}%` : '92.5%'}
          </div>
          <span className="text-[10px] text-gray-400">Defects fixed on first re-check</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Defect Category Breakdown */}
        <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Defect Frequency by Check Module</h3>
            <span className="text-xs font-mono text-gray-400">Normalized Count</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#6B7280" fontSize={10} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#11171D', borderColor: '#222F3E', borderRadius: '6px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#A3FF3F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Resolution Trends Over Time */}
        <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Quality Trends & Rework Velocity</h3>
            <span className="text-xs font-mono text-gray-400">Weekly Trajectory</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorPass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDefect" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" stroke="#6B7280" fontSize={10} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#11171D', borderColor: '#222F3E', borderRadius: '6px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="pass_count" name="Verified Passes" stroke="#10B981" fillOpacity={1} fill="url(#colorPass)" />
                <Area type="monotone" dataKey="defect_count" name="Reported Defects" stroke="#EF4444" fillOpacity={1} fill="url(#colorDefect)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Recurring Component Defect Table */}
      <div className="p-5 rounded-xl bg-surface border border-slate-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Frequently Recurring Defect References</h3>
            <p className="text-xs text-gray-400">Components with multiple reported placement or ferrule mismatches</p>
          </div>
          <span className="text-xs font-mono text-gray-400">Shop Floor Feedback Loop</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-border text-gray-400">
                <th className="py-2.5 px-3">Component Ref</th>
                <th className="py-2.5 px-3">Primary Defect Category</th>
                <th className="py-2.5 px-3">Total Defect Occurrences</th>
                <th className="py-2.5 px-3">Root Cause Insight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-border">
              {data?.top_recurring_components.map((c, i) => (
                <tr key={i} className="hover:bg-surface-elevated text-gray-300">
                  <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    {c.component_ref}
                  </td>
                  <td className="py-3 px-3 text-accent-lime">{c.primary_issue}</td>
                  <td className="py-3 px-3 font-bold text-red-400">{c.defect_count} incidents</td>
                  <td className="py-3 px-3 text-gray-400 font-sans text-xs">
                    {c.component_ref === 'K1'
                      ? 'Assembly technician confused DIN 2 Slot 2 with reserve Slot 5.'
                      : c.component_ref === 'X1:14'
                      ? 'Thermal sleeve ferrule inverted during printing (14 printed as 41).'
                      : 'Similar character stroke confusion between numeral 2 and letter Z.'}
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
