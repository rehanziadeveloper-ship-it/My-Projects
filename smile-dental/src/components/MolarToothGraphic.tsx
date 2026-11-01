import React from 'react';
import { Sparkles, ShieldCheck, Heart } from 'lucide-react';

export const MolarToothGraphic: React.FC = () => {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center p-6 select-none">
      
      {/* Ambient Radial Glow */}
      <div className="absolute w-72 h-72 sm:w-88 sm:h-88 bg-gradient-to-tr from-clinic-lightGreen via-emerald-100/60 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Decorative Outer Ring */}
      <div className="absolute inset-4 rounded-full border border-clinic-primary/10 border-dashed animate-[spin_60s_linear_infinite] pointer-events-none" />

      {/* Main Molar Tooth Container with Gentle Float */}
      <div className="relative z-10 w-64 h-64 sm:w-76 sm:h-76 flex items-center justify-center animate-[bounce_5s_ease-in-out_infinite]">
        
        {/* Anatomical Molar Vector Graphic with High-Luster Gradient Fill */}
        <svg
          viewBox="0 0 320 360"
          className="w-full h-full drop-shadow-[0_20px_35px_rgba(27,107,58,0.18)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Natural Enamel Multi-Stop Gradient */}
            <linearGradient id="enamelGrad" x1="60" y1="20" x2="260" y2="340" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#F5FAF6" />
              <stop offset="70%" stopColor="#E6F2EA" />
              <stop offset="100%" stopColor="#D5E8DC" />
            </linearGradient>

            {/* Specular Highlight Gradient */}
            <linearGradient id="highlightGrad" x1="100" y1="30" x2="160" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Root Shadowing */}
            <linearGradient id="rootShadow" x1="160" y1="160" x2="160" y2="340" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="100%" stopColor="#1B6B3A" stopOpacity="0.12" />
            </linearGradient>
          </defs>

          {/* Molar Body: Crown + Bi-Furcated Roots */}
          <path
            d="M 160,32 
               C 195,28 235,38 255,68
               C 275,98 270,145 255,185
               C 242,220 230,265 220,325
               C 215,355 195,350 188,320
               C 180,285 174,235 160,205
               C 146,235 140,285 132,320
               C 125,350 105,355 100,325
               C 90,265 78,220 65,185
               C 50,145 45,98 65,68
               C 85,38 125,28 160,32 Z"
            fill="url(#enamelGrad)"
            stroke="#D0E3D7"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Root Shading Overlay */}
          <path
            d="M 160,180
               C 174,225 180,280 188,320
               C 195,350 215,355 220,325
               C 230,265 242,220 255,185
               L 65,185
               C 78,220 90,265 100,325
               C 105,355 125,350 132,320
               C 140,280 146,225 160,180 Z"
            fill="url(#rootShadow)"
          />

          {/* Anatomical Occlusal Groove / Smile Line */}
          <path
            d="M 105,100 C 135,130 185,130 215,100"
            stroke="#1B6B3A"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Subtle Cusp Fissures */}
          <path
            d="M 160,65 L 160,115"
            stroke="#1B6B3A"
            strokeOpacity="0.25"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 125,72 C 145,82 175,82 195,72"
            stroke="#1B6B3A"
            strokeOpacity="0.2"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Specular Light Reflection (Enamel Glow) */}
          <ellipse cx="108" cy="72" rx="22" ry="12" transform="rotate(-25 108 72)" fill="url(#highlightGrad)" />
          <ellipse cx="212" cy="72" rx="18" ry="10" transform="rotate(25 212 72)" fill="url(#highlightGrad)" />

          {/* Sparkle Accent */}
          <g transform="translate(240, 45) scale(0.85)">
            <path d="M0,15 C8,15 15,8 15,0 C15,8 22,15 30,15 C22,15 15,22 15,30 C15,22 8,15 0,15 Z" fill="#1B6B3A" />
            <circle cx="15" cy="15" r="4" fill="#FFFFFF" />
          </g>
        </svg>

        {/* Central Clean Label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-2">
          <span className="text-[10px] font-bold tracking-widest uppercase text-clinic-primary bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full border border-clinic-border/60 shadow-xs">
            Natural Molar
          </span>
        </div>
      </div>

      {/* Floating Badge 1: Top Left */}
      <div className="absolute top-2 left-0 sm:-left-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-soft border border-clinic-border/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-clinic-lightGreen text-clinic-primary flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-forest-800 leading-tight">
            Modern Dental Technology
          </p>
          <p className="text-[11px] text-clinic-muted font-normal">
            Rotary RCT & Digital Scans
          </p>
        </div>
      </div>

      {/* Floating Badge 2: Bottom Right */}
      <div className="absolute bottom-2 right-0 sm:-right-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-soft border border-clinic-border/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-clinic-lightGreen text-clinic-primary flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-forest-800 leading-tight">
            Personalised Treatment Plans
          </p>
          <p className="text-[11px] text-clinic-muted font-normal">
            Dr. Zeeshan Ahmad
          </p>
        </div>
      </div>

    </div>
  );
};
