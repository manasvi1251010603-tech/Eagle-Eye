import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Layers,
  Crosshair,
  Wrench,
  RefreshCw,
  History,
  FileBarChart,
  Cpu,
} from 'lucide-react';
import { Wordmark } from './Wordmark';
import { useInspectionSession } from '../../context/InspectionContext';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { currentSessionId, currentCabinetId } = useInspectionSession();

  // Exactly 8 Sidebar Items as requested:
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/new-inspection', label: 'New Inspection', icon: PlusCircle, badge: 'Step 1' },
    { to: '/reference-alignment', label: 'Reference & Alignment', icon: Layers, badge: 'Step 2' },
    { to: '/results', label: 'Inspection Results', icon: Crosshair, highlight: true },
    { to: '/repair', label: 'Guided Repair', icon: Wrench },
    { to: '/reinspection', label: 'Reinspection', icon: RefreshCw },
    { to: '/history', label: 'History & Audit', icon: History },
    { to: '/reports-analytics', label: 'QC Reports & Analytics', icon: FileBarChart },
  ];

  return (
    <aside className="w-64 bg-graphite border-r border-slate-border flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
      {/* Top Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-border">
          <Wordmark size="md" />
        </div>

        {/* Active Inspection Session Callout */}
        <div className="mx-3.5 my-3 p-2.5 rounded-lg bg-surface border border-slate-border">
          <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
              ACTIVE SESSION
            </span>
            <span className="text-accent-cyan font-bold">{currentCabinetId}</span>
          </div>
          <div className="text-xs font-mono text-gray-200 truncate" title={currentSessionId}>
            {currentSessionId}
          </div>
        </div>

        {/* Navigation List */}
        <nav className="px-2 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.to ||
              (item.to !== '/' && location.pathname.startsWith(item.to));

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-surface-elevated text-accent-blue border border-accent-blue/40 shadow-technical'
                    : 'text-gray-300 hover:bg-surface hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-accent-blue' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-slate-border text-accent-cyan">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Mode Indicator & System Health */}
      <div className="p-3.5 border-t border-slate-border space-y-3">
        {/* Mode Badge */}
        <div className="p-2.5 rounded-lg bg-surface border border-slate-border">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider uppercase text-gray-400 flex items-center gap-1.5">
              <Cpu className="w-3 h-3 text-accent-blue" />
              INSPECTION ENGINE
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent-blue/10 text-accent-blue border border-accent-blue/30 font-bold">
              DEMO MODE
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1 leading-snug">
            Deterministic evaluation engine with verified realistic sample findings.
          </p>
        </div>

        {/* System Status Footnote */}
        <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Core API Online
          </span>
          <span className="text-gray-500">Port 8000</span>
        </div>
      </div>
    </aside>
  );
};
