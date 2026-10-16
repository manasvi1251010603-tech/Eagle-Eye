import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  ArrowRight,
  Clock,
  User,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Layers,
  ChevronDown,
  Eye
} from 'lucide-react';
import { api } from '../services/api';
import { useInspectionSession } from '../context/InspectionContext';
import { InspectionSessionSummary, InspectionDetail } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { InspectionDisclaimer } from '../components/common/InspectionDisclaimer';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSessionId, setCurrentSessionId } = useInspectionSession();
  const [sessions, setSessions] = useState<InspectionSessionSummary[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<InspectionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      try {
        const data = await api.getInspections(statusFilter === 'ALL' ? undefined : statusFilter, search || undefined);
        setSessions(data);
        if (data.length > 0 && !selectedSessionDetail) {
          const matched = data.find((s) => s.id === currentSessionId) || data[0];
          handleOpenTimeline(matched.id, matched.cabinet_id);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, [statusFilter, search]);

  const handleOpenTimeline = async (sessionId: string, cabinetId?: string) => {
    try {
      setCurrentSessionId(sessionId, cabinetId);
      const detail = await api.getInspection(sessionId);
      setSelectedSessionDetail(detail);
    } catch (err) {
      console.error('Failed to load session detail:', err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm animate-card-rise">
        <div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold uppercase">
            Quality Records & Compliance
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Inspection History & Digital Audit Trail
          </h2>
          <p className="text-xs text-slate-500">
            Immutable SQLite records of all control cabinet quality inspections, findings, technician notes, and reinspections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter by cabinet, work order, inspector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white w-64 font-mono placeholder-slate-400 font-medium"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs font-mono text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="REPAIR_REQUIRED">Repair Required</option>
            <option value="PASSED">Passed</option>
            <option value="CLOSED">Closed</option>
            <option value="NEEDS_REVIEW">Needs Review</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Sessions List + Selected Session Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: History Sessions Table */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm space-y-4 animate-card-rise">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">Archived Inspection Sessions</h3>
            <span className="text-xs font-mono text-slate-500 font-semibold">{sessions.length} sessions recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-mono">
                  <th className="py-2.5 px-3">Cabinet ID</th>
                  <th className="py-2.5 px-3">Work Order</th>
                  <th className="py-2.5 px-3">Inspector</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {sessions.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => handleOpenTimeline(s.id, s.cabinet_id)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-3 font-bold text-slate-900 group-hover:text-blue-600">
                      {s.cabinet_id}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{s.work_order_id || 'WO-8492'}</td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{s.inspector.split(' ')[0]}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={s.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTimeline(s.id, s.cabinet_id);
                        }}
                        className="text-xs text-blue-600 hover:underline flex items-center justify-end gap-1 font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Timeline</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 5 Cols: Selected Session Audit Trail */}
        <div className="lg:col-span-5 p-5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm space-y-4 animate-card-rise">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Audit Timeline</span>
              <h3 className="text-sm font-bold text-slate-900 font-mono">
                {selectedSessionDetail ? selectedSessionDetail.cabinet_id : 'Select a session'}
              </h3>
            </div>
            {selectedSessionDetail && (
              <button
                onClick={() => navigate('/results')}
                className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Open Results</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {selectedSessionDetail ? (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {/* Session Meta */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Session ID:</span>
                  <span className="text-slate-900 font-semibold">{selectedSessionDetail.id}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Inspector:</span>
                  <span className="text-slate-900 font-semibold">{selectedSessionDetail.inspector}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Findings:</span>
                  <span className="text-blue-700 font-bold">
                    {selectedSessionDetail.pass_count}P / {selectedSessionDetail.fail_count}F / {selectedSessionDetail.review_count}R
                  </span>
                </div>
              </div>

              {/* Event Timeline */}
              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {selectedSessionDetail.audit_events.map((ev: any, idx: number) => (
                  <div key={idx} className="relative pl-7 text-xs space-y-0.5">
                    <span className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-blue-600 shadow-sm" />
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span className="text-blue-700 font-bold">{ev.event_type}</span>
                      <span>{new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-800 leading-snug font-medium">{ev.description}</p>
                    <span className="text-[10px] text-slate-500 font-mono">Actor: {ev.actor}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-xs font-mono text-slate-400">
              Click on any row to load its immutable cryptographic audit timeline.
            </div>
          )}
        </div>
      </div>

      <InspectionDisclaimer />
    </div>
  );
};
