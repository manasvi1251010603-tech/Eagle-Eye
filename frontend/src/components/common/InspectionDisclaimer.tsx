import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface InspectionDisclaimerProps {
  compact?: boolean;
}

export const InspectionDisclaimer: React.FC<InspectionDisclaimerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 shadow-sm">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>Inspection Aid Only — Not an Electrical Safety Certificate. Physical LOTO & Continuity tests required before energization.</span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-white/95 border border-amber-200 shadow-sm flex items-start gap-3">
      <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 shrink-0">
        <AlertTriangle className="w-4 h-4" />
      </div>
      <div className="text-xs text-slate-700 space-y-1">
        <p className="font-bold text-slate-900 flex items-center gap-2">
          Industrial Safety & Operational Precaution
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
            IEC 61439-1/2
          </span>
        </p>
        <p className="text-slate-600 leading-relaxed">
          EAGLE EYE visual quality inspection is a computer-vision decision support workstation. It does not replace 
          mandatory insulation resistance (megger), dielectric voltage testing, or torque checks. Rework must be 
          conducted exclusively by authorized electrical personnel under lock-out/tag-out (LOTO) procedures.
        </p>
      </div>
    </div>
  );
};
