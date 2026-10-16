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
} from 'lucide-react';
import { Wordmark } from './Wordmark';
import { useInspectionSession } from '../../context/InspectionContext';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { currentSessionId, currentCabinetId } = useInspectionSession();

  // Exactly 8 Sidebar Items as requested:
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/new-inspection', label: 'New Inspection', icon: PlusCircle },
    { to: '/reference-alignment', label: 'Reference & Alignment', icon: Layers },
    { to: '/results', label: 'Inspection Results', icon: Crosshair, highlight: true },
    { to: '/repair', label: 'Guided Repair', icon: Wrench },
    { to: '/reinspection', label: 'Reinspection', icon: RefreshCw },
    { to: '/history', label: 'History & Audit', icon: History },
    { to: '/reports-analytics', label: 'QC Reports & Analytics', icon: FileBarChart },
  ];

  return (
    <aside className="w-64 bg-[#0B1528] border-r border-slate-800/90 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-20 shadow-md">
      {/* Top Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80">
          <Wordmark size="md" />
        </div>

        {/* Active Inspection Session Callout */}
        <div className="mx-3.5 my-3 p-2.5 rounded-lg bg-[#111F36] border border-blue-900/40 backdrop-blur-sm transition-all duration-200">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              ACTIVE SESSION
            </span>
            <span className="text-blue-300 font-bold">{currentCabinetId}</span>
          </div>
          <div className="text-xs font-mono text-slate-200 truncate" title={currentSessionId}>
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
                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm border border-blue-500 font-semibold'
                    : 'text-slate-300 hover:bg-[#15243E] hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors duration-150 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.highlight && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* System Health Status */}
      <div className="p-3.5 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Core API Online
          </span>
          <span className="text-slate-500">Port 8000</span>
        </div>
      </div>
    </aside>
  );
};
