import React from 'react';
import { FindingStatus, InspectionStatus } from '../../types';

interface StatusBadgeProps {
  status: FindingStatus | InspectionStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = (status || '').toUpperCase();
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  if (norm === 'PASS' || norm === 'PASSED') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-mono font-medium rounded border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 ${padding}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        PASS
      </span>
    );
  }

  if (norm === 'FAIL' || norm === 'REPAIR_REQUIRED') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-mono font-medium rounded border border-red-500/40 bg-red-950/40 text-red-400 ${padding}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        {norm === 'REPAIR_REQUIRED' ? 'REPAIR REQ' : 'FAIL'}
      </span>
    );
  }

  if (norm === 'REVIEW' || norm === 'NEEDS_REVIEW' || norm === 'READY_FOR_REVIEW') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-mono font-medium rounded border border-amber-500/40 bg-amber-950/40 text-amber-400 ${padding}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        REVIEW
      </span>
    );
  }

  if (norm === 'PROCESSING') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-mono font-medium rounded border border-blue-500/40 bg-blue-950/30 text-blue-400 ${padding}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
        RUNNING
      </span>
    );
  }

  if (norm === 'CLOSED') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-mono font-medium rounded border border-slate-500/30 bg-slate-800/40 text-slate-300 ${padding}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        CLOSED
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono font-medium rounded border border-gray-700 bg-gray-900/50 text-gray-400 ${padding}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
      {norm === 'NOT_CHECKED' ? 'NOT CHECKED' : norm || 'DRAFT'}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity?: string; size?: 'sm' | 'md' }> = ({ severity = 'MEDIUM', size = 'sm' }) => {
  const norm = (severity || 'MEDIUM').toUpperCase();
  const padding = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  if (norm === 'CRITICAL') {
    return (
      <span className={`inline-flex items-center gap-1 font-mono font-bold uppercase rounded border border-red-500/50 bg-red-950/50 text-red-300 ${padding}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        CRITICAL
      </span>
    );
  }

  if (norm === 'HIGH') {
    return (
      <span className={`inline-flex items-center gap-1 font-mono font-bold uppercase rounded border border-orange-500/50 bg-orange-950/40 text-orange-300 ${padding}`}>
        HIGH
      </span>
    );
  }

  if (norm === 'LOW') {
    return (
      <span className={`inline-flex items-center gap-1 font-mono font-medium uppercase rounded border border-slate-600 bg-slate-800/60 text-slate-300 ${padding}`}>
        LOW
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-mono font-medium uppercase rounded border border-amber-500/40 bg-amber-950/30 text-amber-300 ${padding}`}>
      MEDIUM
    </span>
  );
};

export const SimulatedBadge: React.FC<{ isSimulated?: boolean }> = ({ isSimulated = true }) => {
  if (!isSimulated) return null;
  return (
    <span
      title="Deterministic demo scenario finding (Trained CV model offline)"
      className="inline-flex items-center gap-1 font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-500/40 font-semibold tracking-wider"
    >
      SIMULATED
    </span>
  );
};
