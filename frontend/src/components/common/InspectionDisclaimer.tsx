import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface InspectionDisclaimerProps {
  compact?: boolean;
}

export const InspectionDisclaimer: React.FC<InspectionDisclaimerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface border border-slate-border text-[11px] text-gray-400">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>Inspection Aid Only — Not an Electrical Safety Certificate. Physical LOTO & Continuity tests required before energization.</span>
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-lg bg-surface border border-slate-border flex items-start gap-3">
      <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
        <AlertTriangle className="w-4 h-4" />
      </div>
      <div className="text-xs text-gray-300 space-y-1">
        <p className="font-semibold text-gray-200 flex items-center gap-2">
          Industrial Safety & Operational Precaution
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-elevated text-gray-400 border border-slate-border">
            IEC 61439-1/2
          </span>
        </p>
        <p className="text-gray-400 leading-relaxed">
          EAGLE EYE visual quality inspection is a computer-vision decision support workstation. It does not replace 
          mandatory insulation resistance (megger), dielectric voltage testing, or torque checks. Rework must be 
          conducted exclusively by authorized electrical personnel under lock-out/tag-out (LOTO) procedures.
        </p>
      </div>
    </div>
  );
};
