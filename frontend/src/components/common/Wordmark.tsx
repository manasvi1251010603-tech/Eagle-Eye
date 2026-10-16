import React from 'react';

interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Wordmark: React.FC<WordmarkProps> = ({ size = 'md', showSubtitle = true }) => {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 40 : 32;
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Custom Geometric Eye / Target Motif */}
      <div className="relative flex items-center justify-center">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 100 100"
          className="transition-transform duration-300 hover:rotate-45"
        >
          {/* Outer Reticle */}
          <circle cx="50" cy="50" r="44" fill="none" stroke="#1E3A5F" strokeWidth="4" />
          <circle cx="50" cy="50" r="44" fill="none" stroke="#3B82F6" strokeWidth="4" strokeDasharray="25 15" />
          
          {/* Inner Optical Chamber */}
          <circle cx="50" cy="50" r="26" fill="#0B1528" stroke="#2563EB" strokeWidth="2.5" />
          
          {/* Target Reticle Crosshairs */}
          <line x1="50" y1="2" x2="50" y2="18" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
          <line x1="50" y1="82" x2="50" y2="98" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
          <line x1="2" y1="50" x2="18" y2="50" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
          <line x1="82" y1="50" x2="98" y2="50" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
          
          {/* Active Sensor Core / Pupil */}
          <circle cx="50" cy="50" r="10" fill="#3B82F6" />
          <circle cx="50" cy="50" r="4" fill="#0B1528" />
        </svg>
        
        {/* Optical Sensor Glow */}
        <div className="absolute inset-0 bg-blue-500 opacity-20 blur-md rounded-full pointer-events-none" />
      </div>

      <div>
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-mono font-bold tracking-wider text-white ${textSize}`}>
            EAGLE<span className="text-blue-400">EYE</span>
          </span>
          <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-[#162744] border border-blue-900/60 text-slate-300 font-semibold">
            v1.0
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[10px] tracking-widest uppercase font-mono text-slate-400 mt-1">
            AI Industrial Inspection
          </p>
        )}
      </div>
    </div>
  );
};
