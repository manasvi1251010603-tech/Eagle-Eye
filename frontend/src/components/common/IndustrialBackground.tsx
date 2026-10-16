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
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#EAF1F8]"
      aria-hidden="true"
    >
      {/* 1. Blurred Industrial Photograph Layer (Reduced blur to 8.5px, scale(1.06) prevents edge clipping) */}
      <div
        key={selectedImage}
        className="absolute -inset-8 bg-cover bg-center transition-all duration-700 ease-in-out"
        style={{
          backgroundImage: `url(${selectedImage})`,
          filter: 'blur(8.5px)',
          transform: 'scale(1.06)',
        }}
      />

      {/* 2. Light Blue & Slate Translucent Atmosphere Overlay (Crisp contrast for white cards) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#EEF4FA]/82 via-[#E4EEF8]/86 to-[#D8E6F5]/90" />

      {/* 3. Subtle Technical Vignette Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_45%,_rgba(11,21,40,0.08)_100%)] pointer-events-none" />

      {/* 4. Subtle Industrial Blueprint Technical Grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-35 pointer-events-none" />
    </div>
  );
};

