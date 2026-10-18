import React from 'react';

/**
 * Tagtique Brand Logo (Floating Transparent Vector)
 * 
 * - Architectural 'T' monogram in metallic warm champagne gold
 * - Triple concentric NFC wireless radar pulses in electric cyan (#3DDCFF) with neon glow
 * - Crisp geometric typography 'TAGTIQUE' with tracked 'SMART IDENTITY' subtext
 * - 100% transparent background - zero boxes, zero rectangles, zero borders
 */
export default function TagtiqueLogo({ 
  variant = 'light', // 'light' (white text on dark bgs) | 'dark' (black text on light bgs)
  className = '',
  size = 'md', // 'sm' | 'md' | 'lg'
  showTagline = true
}) {
  const isLight = variant === 'light';
  const textColor = isLight ? '#FFFFFF' : '#0E1015';
  const subtextColor = isLight ? 'rgba(255, 255, 255, 0.55)' : 'rgba(0, 0, 0, 0.5)';

  const heights = {
    sm: 28,
    md: 36,
    lg: 46
  };
  const h = heights[size] || 36;
  const markHeight = h;
  const markWidth = markHeight * 1.05;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Floating Mark (T + Cyan Radar Arcs) */}
      <svg 
        viewBox="0 0 100 85" 
        style={{ height: markHeight, width: markWidth }}
        className="shrink-0 overflow-visible"
        aria-hidden="true"
      >
        <defs>
          {/* Metallic 24K Brushed Champagne Gold Gradient */}
          <linearGradient id="tGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF0C8" />
            <stop offset="25%" stopColor="#E2C17C" />
            <stop offset="65%" stopColor="#C99B41" />
            <stop offset="100%" stopColor="#966E18" />
          </linearGradient>

          {/* Electric Cyan Pulse Gradient */}
          <linearGradient id="tCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6EE7FF" />
            <stop offset="50%" stopColor="#3DDCFF" />
            <stop offset="100%" stopColor="#00A8E8" />
          </linearGradient>

          {/* Soft Neon Bloom for Cyan Waves */}
          <filter id="tCyanGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur1" />
            <feGaussianBlur stdDeviation="4" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Subtle 3D Bevel Shadow for Gold T */}
          <filter id="tGoldDepth" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Monogram Architectural 'T' */}
        <g filter="url(#tGoldDepth)">
          {/* Main T Crossbar with Beveled Edge */}
          <path
            d="M 12 18 H 58 V 28 H 43 C 43 28 41 28 40 30 C 39 32 39 35 39 38 V 74 H 25 V 38 C 25 35 25 32 24 30 C 23 28 21 28 21 28 H 12 V 18 Z"
            fill="url(#tGoldGrad)"
          />
          {/* Inner Highlight Inset Accent */}
          <path
            d="M 16 21 H 54 V 25 H 39 V 71 H 29 V 25 H 16 V 21 Z"
            fill="rgba(255, 255, 255, 0.22)"
          />
        </g>

        {/* Radiating Triple Wireless NFC Radar Arcs in Electric Cyan */}
        <g 
          fill="none" 
          stroke="url(#tCyanGrad)" 
          strokeLinecap="round" 
          filter="url(#tCyanGlow)"
        >
          {/* Inner Arc */}
          <path 
            d="M 45 48 A 12 12 0 0 1 45 66" 
            strokeWidth="3.6" 
          />
          {/* Middle Arc */}
          <path 
            d="M 54 40 A 21 21 0 0 1 54 74" 
            strokeWidth="3.6" 
            opacity="0.9" 
          />
          {/* Outer Arc */}
          <path 
            d="M 64 32 A 31 31 0 0 1 64 82" 
            strokeWidth="3.8" 
            opacity="0.75" 
          />
        </g>
      </svg>

      {/* Typography Lockup */}
      <div className="flex flex-col justify-center leading-none">
        <span 
          className="font-manrope font-extrabold tracking-[0.06em] uppercase"
          style={{ 
            color: textColor,
            fontSize: h * 0.58,
            letterSpacing: '0.08em'
          }}
        >
          TAGTIQUE
        </span>
        {showTagline && (
          <span 
            className="font-mono font-bold uppercase mt-1 tracking-widest text-[9px]"
            style={{ 
              color: subtextColor,
              fontSize: Math.max(7.5, h * 0.22),
              letterSpacing: '0.24em'
            }}
          >
            SMART IDENTITY
          </span>
        )}
      </div>
    </div>
  );
}
