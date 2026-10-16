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
    <header className="h-16 bg-graphite/90 backdrop-blur border-b border-slate-border px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      {/* Title & Context */}
      <div>
        <h1 className="text-base font-semibold text-white flex items-center gap-2.5">
          {title}
          {currentCabinetId && (
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-surface border border-slate-border text-accent-cyan">
              {currentCabinetId}
            </span>
          )}
        </h1>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Session Switcher Dropdown */}
        {sessionsList.length > 0 && (
          <div className="relative flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded border border-slate-border text-xs font-mono">
            <span className="text-gray-400 text-[11px]">SESSION:</span>
            <select
              value={currentSessionId}
              onChange={(e) => {
                const s = sessionsList.find((item) => item.id === e.target.value);
                setCurrentSessionId(e.target.value, s?.cabinet_id);
              }}
              className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer pr-1"
            >
              {sessionsList.map((s) => (
                <option key={s.id} value={s.id} className="bg-graphite text-white font-mono">
                  {s.cabinet_id} ({s.id})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Inspector Profile */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded bg-surface border border-slate-border text-xs text-gray-300">
          <User className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-mono text-gray-200">Lead QC Inspector</span>
        </div>

        {/* New Inspection CTA */}
        <button
          onClick={() => navigate('/new-inspection')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-accent-blue text-white font-semibold text-xs transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-blue-glow hover:bg-accent-blue-dark"
        >
          <PlusCircle className="w-3.5 h-3.5 text-white" />
          <span>New Inspection</span>
        </button>
      </div>
    </header>
  );
};
