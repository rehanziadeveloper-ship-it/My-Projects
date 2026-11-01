import React, { useState, useRef } from 'react';
import { Sparkles } from 'lucide-react';

export const ResultsSection: React.FC = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [activeCase, setActiveCase] = useState<0 | 1 | 2>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // High-resolution clean dental photography (no baked-in lines or UI elements)
  const clinicalCases = [
    {
      title: 'Professional In-Office LED Laser Teeth Whitening',
      description: 'Severe tea, coffee, and intrinsic enamel stains lightened by 6 shades in one 45-minute treatment.',
      image: '/images/smile-whitening-macro.jpg',
      beforeFilter: 'sepia(0.55) saturate(2.0) hue-rotate(-18deg) brightness(0.9) contrast(1.05)',
      afterFilter: 'brightness(1.06) contrast(1.02)',
      timeframe: 'Single 45-min treatment',
      caseLabel: 'Teeth Whitening'
    },
    {
      title: 'Ultrasonic Scaling & Plaque Debridement',
      description: 'Plaque and calculus deposits along the gumline removed with painless ultrasonic vibrations, restoring healthy pink gums.',
      image: '/images/smile-teeth-macro.jpg',
      beforeFilter: 'sepia(0.4) saturate(1.5) hue-rotate(-15deg) brightness(0.92)',
      afterFilter: 'brightness(1.04) contrast(1.02)',
      timeframe: 'Single 40-min visit',
      caseLabel: 'Ultrasonic Scaling'
    },
    {
      title: 'Anterior Incisal Composite Resin Bonding',
      description: 'Chipped front tooth edge seamlessly restored with tooth-colored nano-hybrid composite resin layering.',
      image: '/images/smile-binkiewicz.jpg',
      beforeFilter: 'sepia(0.25) saturate(1.2) brightness(0.94)',
      afterFilter: 'brightness(1.04)',
      timeframe: 'Single 30-min visit',
      caseLabel: 'Composite Bonding'
    }
  ];

  const currentCase = clinicalCases[activeCase];

  // Drag anywhere on the container for seamless mouse & touch interaction
  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      handleMove(e.clientX);
    }
  };

  return (
    <section id="results" className="py-20 bg-clinic-bg border-b border-clinic-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-clinic-primary">
            Real Clinical Outcomes
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-forest-800 tracking-tight">
            Visible transformations.{' '}
            <span className="font-serif italic font-normal text-clinic-primary">
              Real treatment results.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-clinic-muted">
            Drag the interactive divider horizontally to compare real clinical before and after patient treatments.
          </p>

          {/* Case Selection Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            {clinicalCases.map((c, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveCase(i as any);
                  setSliderPosition(50);
                }}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeCase === i
                    ? 'bg-clinic-primary text-white shadow-soft scale-105'
                    : 'bg-white text-forest-800 border border-clinic-border hover:bg-clinic-lightGreen/40'
                }`}
              >
                {c.caseLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Slider Component */}
        <div className="max-w-3xl mx-auto">
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="relative h-[320px] sm:h-[440px] md:h-[480px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white select-none bg-forest-900 cursor-ew-resize"
          >
            
            {/* After Image (Full Background Layer) */}
            <img
              src={currentCase.image}
              alt="After treatment result"
              style={{ filter: currentCase.afterFilter }}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />

            {/* AFTER Badge (Frosted Translucent Pill Top-Right) */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wider uppercase text-white/95 bg-black/45 backdrop-blur-md border border-white/20 shadow-md pointer-events-none z-20">
              AFTER
            </div>

            {/* Before Image (Clipped Overlay Layer) */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img
                src={currentCase.image}
                alt="Before treatment presentation"
                style={{ filter: currentCase.beforeFilter }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* BEFORE Badge (Frosted Translucent Pill Top-Left) */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-wider uppercase text-white/95 bg-black/45 backdrop-blur-md border border-white/20 shadow-md pointer-events-none z-20">
              BEFORE
            </div>

            {/* Single Interactive Divider Line with Frosted < | > Handle */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-white pointer-events-none z-20 shadow-[0_0_8px_rgba(0,0,0,0.6)]"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/45 backdrop-blur-md border-2 border-white text-white flex items-center justify-center shadow-xl transition-transform hover:scale-110 active:scale-95">
                <div className="flex items-center gap-1 select-none text-xs font-bold text-white drop-shadow-md">
                  <span className="text-[13px] font-serif">‹</span>
                  <span className="opacity-80 text-[10px]">|</span>
                  <span className="text-[13px] font-serif">›</span>
                </div>
              </div>
            </div>

            {/* Native Slider Input for Accessibility & Mobile Touch */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              aria-label="Drag to compare before and after treatment"
              className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-30 touch-none"
            />
          </div>

          {/* Active Case Description Card */}
          <div className="mt-4 p-5 rounded-2xl bg-white border border-clinic-border/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-clinic-primary" />
                <h4 className="font-bold text-forest-800 text-sm">
                  {currentCase.title}
                </h4>
              </div>
              <p className="text-clinic-muted mt-1 leading-relaxed">
                {currentCase.description}
              </p>
            </div>
            <span className="font-semibold text-clinic-primary bg-clinic-lightGreen/50 px-3 py-1.5 rounded-full self-start sm:self-auto whitespace-nowrap border border-clinic-lightGreen">
              {currentCase.timeframe}
            </span>
          </div>

          <p className="text-center text-xs text-clinic-muted mt-2">
            Drag divider left or right to inspect before & after results
          </p>
        </div>

      </div>
    </section>
  );
};
