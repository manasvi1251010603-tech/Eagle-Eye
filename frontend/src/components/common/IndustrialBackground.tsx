import React, { useMemo, useEffect } from 'react';

interface IndustrialBackgroundProps {
  currentPath: string;
}

// 3 verified original industrial control-cabinet & technician photographs attached by the user
const BACKGROUND_ASSETS: Record<string, string> = {
  TABLET: '/images/backgrounds/industrial_tech_tablet.png',
  WALKIE: '/images/backgrounds/industrial_tech_walkie.png',
  LAMP: '/images/backgrounds/industrial_engineer_lamp.png',
};

// Route-to-image stable mapping to ensure consistent visual identity without render flicker
function getImageForPath(path: string): string {
  if (path === '/') return BACKGROUND_ASSETS.TABLET;
  if (path.startsWith('/new-inspection') || path.startsWith('/new')) return BACKGROUND_ASSETS.WALKIE;
  if (path.startsWith('/reference-alignment') || path.startsWith('/alignment')) return BACKGROUND_ASSETS.LAMP;
  if (path.startsWith('/processing')) return BACKGROUND_ASSETS.TABLET;
  if (path.startsWith('/results')) return BACKGROUND_ASSETS.TABLET;
  if (path.startsWith('/repair')) return BACKGROUND_ASSETS.WALKIE;
  if (path.startsWith('/reinspection')) return BACKGROUND_ASSETS.LAMP;
  if (path.startsWith('/history')) return BACKGROUND_ASSETS.TABLET;
  if (path.startsWith('/reports-analytics') || path.startsWith('/reports') || path.startsWith('/analytics')) return BACKGROUND_ASSETS.LAMP;
  return BACKGROUND_ASSETS.TABLET;
}

export const IndustrialBackground: React.FC<IndustrialBackgroundProps> = ({ currentPath }) => {
  const selectedImage = useMemo(() => getImageForPath(currentPath), [currentPath]);

  // Preload all background images on mount for instantaneous, zero-flicker route transitions
  useEffect(() => {
    Object.values(BACKGROUND_ASSETS).forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0A0F18]"
      aria-hidden="true"
    >
      {/* 1. Blurred Industrial Photograph Layer (Edge bleed prevented by -inset-8 + scale(1.08)) */}
      <div
        key={selectedImage}
        className="absolute -inset-8 bg-cover bg-center transition-all duration-700 ease-in-out"
        style={{
          backgroundImage: `url(${selectedImage})`,
          filter: 'blur(11px)',
          transform: 'scale(1.08)',
        }}
      />

      {/* 2. Deep Navy Atmospheric Translucent Overlay (Balanced for photo visibility & UI contrast) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080D16]/55 via-[#0A0F18]/65 to-[#0A0F18]/78" />

      {/* 3. Subtle Vignette Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_transparent_35%,_#0A0F18_92%)] opacity-35" />

      {/* 4. Subtle Industrial Blueprint Technical Grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-20" />
    </div>
  );
};

