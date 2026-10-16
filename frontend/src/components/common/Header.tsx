import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, User, ChevronDown } from 'lucide-react';
import { useInspectionSession } from '../../context/InspectionContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const navigate = useNavigate();
  const { currentSessionId, currentCabinetId, sessionsList, setCurrentSessionId } = useInspectionSession();

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-sm">
      {/* Title & Context */}
      <div>
        <h1 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
          {title}
          {currentCabinetId && (
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700">
              {currentCabinetId}
            </span>
          )}
        </h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Session Switcher Dropdown */}
        {sessionsList.length > 0 && (
          <div className="relative flex items-center gap-1.5 bg-slate-50/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono shadow-sm">
            <span className="text-slate-500 text-[11px] font-semibold">SESSION:</span>
            <select
              value={currentSessionId}
              onChange={(e) => {
                const s = sessionsList.find((item) => item.id === e.target.value);
                setCurrentSessionId(e.target.value, s?.cabinet_id);
              }}
              className="bg-transparent text-slate-800 font-mono text-xs focus:outline-none cursor-pointer pr-1 font-medium"
            >
              {sessionsList.map((s) => (
                <option key={s.id} value={s.id} className="bg-white text-slate-800 font-mono">
                  {s.cabinet_id} ({s.id})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Inspector Profile */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 shadow-sm">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-mono text-slate-800 font-medium">Lead QC Inspector</span>
        </div>

        {/* New Inspection CTA */}
        <button
          onClick={() => navigate('/new-inspection')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F2B5C] hover:bg-[#163A75] text-white font-semibold text-xs btn-lift shadow-sm transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5 text-white" />
          <span>New Inspection</span>
        </button>
      </div>
    </header>
  );
};
