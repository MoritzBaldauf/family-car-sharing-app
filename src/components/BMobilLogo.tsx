import React from 'react';

interface BMobilLogoProps {
  className?: string;
  size?: number;
}

export const BMobilLogo: React.FC<BMobilLogoProps> = ({ className = 'w-9 h-9', size = 36 }) => {
  return (
    <div
      className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white shadow-md shadow-black/40 border border-zinc-700/60 overflow-hidden shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Subtle Batmobil Stealth Accent Glow */}
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500/20 rounded-full blur-xs pointer-events-none" />
      <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-sky-500/20 rounded-full blur-xs pointer-events-none" />

      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[78%] h-[78%] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
      >
        <defs>
          <linearGradient id="bmobilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
        </defs>

        {/* Batmobil Sweeping Aero Wing Fins */}
        {/* Left Wing fin */}
        <path
          d="M 16 32 C 24 44, 27 62, 12 76 C 24 72, 33 66, 38 58 Z"
          fill="#475569"
          opacity="0.9"
        />
        {/* Right Wing fin */}
        <path
          d="M 84 32 C 76 44, 73 62, 88 76 C 76 72, 67 66, 62 58 Z"
          fill="#475569"
          opacity="0.9"
        />

        {/* Central Iconic Futuristic 'B' fused with Bat-Shield */}
        <path
          d="M 30 22 L 58 22 C 71 22, 77 28, 77 36 C 77 43, 71 47, 63 49 C 73 51, 79 57, 79 66 C 79 76, 71 80, 56 80 L 30 80 Z"
          fill="url(#bmobilGrad)"
        />

        {/* Cutouts to form the sharp B loops */}
        <path
          d="M 42 32 L 55 32 C 61 32, 65 34, 65 38 C 65 42, 61 44, 55 44 L 42 44 Z"
          fill="#09090b"
        />
        <path
          d="M 42 54 L 56 54 C 63 54, 67 57, 67 62 C 67 67, 63 70, 56 70 L 42 70 Z"
          fill="#09090b"
        />

        {/* Center Aerodynamic Bat-Cockpit Notch */}
        <polygon points="50,18 46,25 54,25" fill="#f59e0b" />

        {/* Dual Batmobil Headlight Beams */}
        <circle cx="36" cy="80" r="2.5" fill="#38bdf8" />
        <circle cx="64" cy="80" r="2.5" fill="#38bdf8" />
      </svg>
    </div>
  );
};