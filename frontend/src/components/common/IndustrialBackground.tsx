import React, { useMemo } from 'react';

interface IndustrialBackgroundProps {
  currentPath: string;
}

// 5 verified real industrial control-cabinet & technician assets
const BACKGROUND_ASSETS = [
  '/images/industrial_bg_1.png', // Technician with tablet in control cabinet aisle
  '/images/industrial_bg_2.png', // Technician with walkie-talkie inspecting cabinet
  '/images/industrial_bg_3.png', // Female engineer inspecting cabinet with handheld lamp
  '/images/industrial_bg_4.jpg', // Industrial control cabinet with DIN rails & breakers
  '/images/industrial_bg_5.jpg', // Wired industrial cabinet with switchgear
];

export const IndustrialBackground: React.FC<IndustrialBackgroundProps> = ({ currentPath }) => {
  // Stable background per major route to avoid flickering during user interaction
  const selectedImage = useMemo(() => {
    if (currentPath === '/') return BACKGROUND_ASSETS[0];
    if (currentPath.startsWith('/new-inspection') || currentPath.startsWith('/new')) return BACKGROUND_ASSETS[1];
    if (currentPath.startsWith('/reference-alignment') || currentPath.startsWith('/alignment')) return BACKGROUND_ASSETS[2];
    if (currentPath.startsWith('/results')) return BACKGROUND_ASSETS[3];
    if (currentPath.startsWith('/repair')) return BACKGROUND_ASSETS[1];
    if (currentPath.startsWith('/reinspection')) return BACKGROUND_ASSETS[4];
    if (currentPath.startsWith('/history')) return BACKGROUND_ASSETS[0];
    if (currentPath.startsWith('/reports-analytics') || currentPath.startsWith('/reports') || currentPath.startsWith('/analytics')) return BACKGROUND_ASSETS[2];
    return BACKGROUND_ASSETS[0];
  }, [currentPath]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Blurred Industrial Background Image */}
      <img
        src={selectedImage}
        alt=""
        className="w-full h-full object-cover filter blur-[12px] scale-110 opacity-20 transition-opacity duration-700 ease-in-out"
        onError={(e) => {
          // Graceful fallback to solid background if image is not reachable
          (e.target as HTMLElement).style.display = 'none';
        }}
      />

      {/* Dark Navy Atmospheric Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F18]/85 via-[#0A0F18]/90 to-[#0A0F18]/95" />

      {/* Subtle Technical Grid Motif */}
      <div className="absolute inset-0 bg-tech-grid opacity-50" />
    </div>
  );
};
