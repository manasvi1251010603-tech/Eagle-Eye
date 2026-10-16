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
      <span className={`inline-flex items-center gap-1.5 font-mono font-semibold rounded border border-emerald-300 bg-emerald-50 text-emerald-800 ${padding}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        PASS
      </span>
    );
  }

  if (norm === 'FAIL' || norm === 'REPAIR_REQUIRED') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-mono font-semibold rounded border border-red-300 bg-red-50 text-red-800 ${padding}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        {norm === 'REPAIR_REQUIRED' ? 'REPAIR REQ' : 'FAIL'}
      </span>
    );
  }

  if (norm === 'REVIEW' || norm === 'NEEDS_REVIEW' || norm === 'READY_FOR_REVIEW') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-mono font-semibold rounded border border-amber-300 bg-amber-50 text-amber-900 ${padding}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        REVIEW
      </span>
    );
  }

  if (norm === 'PROCESSING') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-mono font-semibold rounded border border-blue-300 bg-blue-50 text-blue-800 ${padding}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
        RUNNING
      </span>
    );
  }

  if (norm === 'CLOSED') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-mono font-semibold rounded border border-slate-300 bg-slate-100 text-slate-800 ${padding}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        CLOSED
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono font-semibold rounded border border-slate-300 bg-slate-100 text-slate-700 ${padding}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      {norm === 'NOT_CHECKED' ? 'NOT CHECKED' : norm || 'DRAFT'}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity?: string; size?: 'sm' | 'md' }> = ({ severity = 'MEDIUM', size = 'sm' }) => {
  const norm = (severity || 'MEDIUM').toUpperCase();
  const padding = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  if (norm === 'CRITICAL') {
    return (
      <span className={`inline-flex items-center gap-1 font-mono font-bold uppercase rounded border border-red-300 bg-red-100 text-red-900 ${padding}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
        CRITICAL
      </span>
    );
  }

  if (norm === 'HIGH') {
    return (
      <span className={`inline-flex items-center gap-1 font-mono font-bold uppercase rounded border border-orange-300 bg-orange-50 text-orange-900 ${padding}`}>
        HIGH
      </span>
    );
  }

  if (norm === 'LOW') {
    return (
      <span className={`inline-flex items-center gap-1 font-mono font-medium uppercase rounded border border-slate-300 bg-slate-100 text-slate-700 ${padding}`}>
        LOW
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-mono font-medium uppercase rounded border border-amber-300 bg-amber-50 text-amber-900 ${padding}`}>
      MEDIUM
    </span>
  );
};

export const SimulatedBadge: React.FC<{ isSimulated?: boolean }> = ({ isSimulated = true }) => {
  if (!isSimulated) return null;
  return (
    <span
      title="Deterministic demo scenario finding (Trained CV model offline)"
      className="inline-flex items-center gap-1 font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-300 font-semibold tracking-wider"
    >
      SIMULATED
    </span>
  );
};
