import React, { useId } from 'react';

export interface RotasiLogoProps {
  /** Display format */
  variant?: 'mark' | 'horizontal' | 'stacked';
  /** Preset size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Optional badge pill next to or under the brand name */
  badgeText?: string;
  /** Whether to display the full backronym tagline */
  showSubtitle?: boolean;
  /** Optional custom class name on the root container */
  className?: string;
  /** Custom click handler if clickable */
  onClick?: () => void;
  /** Accessible label */
  ariaLabel?: string;
}

const SIZE_MAP = {
  xs: { icon: 'h-6 w-6', text: 'text-sm', sub: 'text-[10px]', badge: 'text-[9px] px-1.5 py-0.5' },
  sm: { icon: 'h-8 w-8', text: 'text-base', sub: 'text-[11px]', badge: 'text-[10px] px-2 py-0.5' },
  md: { icon: 'h-10 w-10', text: 'text-lg', sub: 'text-xs', badge: 'text-[10px] px-2.5 py-0.5' },
  lg: { icon: 'h-14 w-14', text: 'text-2xl', sub: 'text-sm', badge: 'text-xs px-3 py-1' },
  xl: { icon: 'h-20 w-20', text: 'text-3xl', sub: 'text-base', badge: 'text-xs px-3.5 py-1' },
};

/**
 * Custom Vector Sticker Illustration of the ROTASI Logo
 * Features:
 * 1. Tri-arc orbital cycle (3-season crop rotation: MT1, MT2, MT3)
 * 2. Spaceborne agro-satellite with dual solar panels & telemetry scan rays
 * 3. Fertile furrow soil mound with an emergent resilient sprout & dew droplet
 * 4. Friendly die-cut sticker contour with soft drop-shadow
 */
export const RotasiMark: React.FC<{ sizeClass?: string; className?: string }> = ({
  sizeClass = 'h-9 w-9',
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');

  return (
    <svg
      viewBox="0 0 120 120"
      className={`${sizeClass} shrink-0 select-none transition-transform duration-200 group-hover:scale-105 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="ROTASI Symbol"
    >
      <defs>
        <filter id={`rotasiShadow-${uid}`} x="-10%" y="-10%" width="128%" height="130%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.14" />
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#0F172A" floodOpacity="0.08" />
        </filter>

        <linearGradient id={`bgGrad-${uid}`} x1="16" y1="12" x2="104" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E8F8F5" />
          <stop offset="50%" stopColor="#F0FDF4" />
          <stop offset="100%" stopColor="#E0F2FE" />
        </linearGradient>

        <linearGradient id={`leafGrad-${uid}`} x1="50" y1="45" x2="70" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <linearGradient id={`soilGrad-${uid}`} x1="40" y1="80" x2="80" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        <linearGradient id={`solarGrad-${uid}`} x1="0" y1="0" x2="10" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>

      <g filter={`url(#rotasiShadow-${uid})`}>
        {/* Die-Cut White Border Shell */}
        <rect x="8" y="8" width="104" height="104" rx="32" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />

        {/* Inner Radiant Disc */}
        <rect x="12" y="12" width="96" height="96" rx="28" fill={`url(#bgGrad-${uid})`} />

        {/* 3-Season Rotation Orbital Flow */}
        {/* Arc 1: Monsoon Paddy (Teal) */}
        <path
          d="M34,42 A38,38 0 0,1 78,26"
          stroke="#237F8E"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <polygon points="76,21 86,27 75,32" fill="#237F8E" stroke="#FFFFFF" strokeWidth="1.2" />

        {/* Arc 2: Palawija 1 (Amber Gold) */}
        <path
          d="M94,54 A38,38 0 0,1 74,96"
          stroke="#F59E0B"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <polygon points="78,100 68,96 74,89" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.2" />

        {/* Arc 3: Palawija 2 (Emerald Green) */}
        <path
          d="M52,97 A38,38 0 0,1 24,62"
          stroke="#10B981"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <polygon points="20,68 24,56 30,65" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.2" />

        {/* NASA Satellite Telemetry Scan Rays */}
        <path
          d="M88,24 L64,62 M88,24 L56,66 M88,24 L72,66"
          stroke="#0284C7"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="2 3"
          opacity="0.6"
        />

        {/* Spaceborne Agro-Satellite */}
        <g transform="translate(86, 22) rotate(28)">
          <rect x="-14" y="-4" width="9" height="8" rx="1.5" fill={`url(#solarGrad-${uid})`} stroke="#FFFFFF" strokeWidth="1.2" />
          <line x1="-9.5" y1="-4" x2="-9.5" y2="4" stroke="#93C5FD" strokeWidth="0.8" />

          <rect x="5" y="-4" width="9" height="8" rx="1.5" fill={`url(#solarGrad-${uid})`} stroke="#FFFFFF" strokeWidth="1.2" />
          <line x1="9.5" y1="-4" x2="9.5" y2="4" stroke="#93C5FD" strokeWidth="0.8" />

          <rect x="-4.5" y="-5" width="9" height="10" rx="2" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.4" />
          <circle cx="0" cy="0" r="2.2" fill="#FFFFFF" />
          <circle cx="0" cy="0" r="1.2" fill="#0284C7" />

          <line x1="0" y1="-5" x2="0" y2="-9" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="0" cy="-9.5" r="1" fill="#EF4444" />
        </g>

        {/* Fertile Soil Furrow Mound */}
        <path
          d="M40,84 C48,78 72,78 80,84 C82,88 78,92 60,93 C42,92 38,88 40,84 Z"
          fill={`url(#soilGrad-${uid})`}
          stroke="#FFFFFF"
          strokeWidth="2"
        />
        <path
          d="M46,86 C54,82 66,82 74,86"
          stroke="#D97706"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Seedling Sprout */}
        <path
          d="M60,76 C52,72 44,60 48,50 C56,50 60,62 60,76 Z"
          fill={`url(#leafGrad-${uid})`}
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M52,60 C55,64 58,68 60,74"
          stroke="#A7F3D0"
          strokeWidth="1"
          strokeLinecap="round"
        />

        <path
          d="M60,76 C62,60 68,46 78,48 C82,58 72,70 60,76 Z"
          fill="#10B981"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M60,74 C66,68 70,60 74,54"
          stroke="#D1FAE5"
          strokeWidth="1"
          strokeLinecap="round"
        />

        <path
          d="M60,82 L60,68"
          stroke="#047857"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Moisture Dew Droplet */}
        <ellipse cx="68" cy="46" rx="2.5" ry="3.5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" transform="rotate(25 68 46)" />
        <circle cx="67" cy="44.5" r="0.8" fill="#FFFFFF" />

        {/* Sparkle */}
        <path
          d="M32,32 L33,35 L36,36 L33,37 L32,40 L31,37 L28,36 L31,35 Z"
          fill="#F59E0B"
          stroke="#FFFFFF"
          strokeWidth="0.8"
        />
      </g>
    </svg>
  );
};

export const RotasiLogo: React.FC<RotasiLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  badgeText,
  showSubtitle = false,
  className = '',
  onClick,
  ariaLabel = 'ROTASI: Resilient Optimization Tool for Agro-Satellite Insights',
}) => {
  const sizeConfig = SIZE_MAP[size];

  if (variant === 'mark') {
    if (onClick) {
      return (
        <button
          type="button"
          onClick={onClick}
          className={`inline-flex items-center justify-center cursor-pointer transition active:scale-95 ${className}`}
          aria-label={ariaLabel}
        >
          <RotasiMark sizeClass={sizeConfig.icon} />
        </button>
      );
    }
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 ${className}`}
        aria-label={ariaLabel}
      >
        <RotasiMark sizeClass={sizeConfig.icon} />
      </span>
    );
  }

  const content = (
    <>
      <RotasiMark sizeClass={sizeConfig.icon} />
      <div className={variant === 'stacked' ? 'text-center' : 'min-w-0 flex flex-col justify-center'}>
        <div className={`flex items-center gap-2 ${variant === 'stacked' ? 'justify-center' : ''}`}>
          <span className={`font-black tracking-tight text-[#14232B] leading-none ${sizeConfig.text}`}>
            ROT<span className="text-[#237F8E]">ASI</span>
          </span>
          {badgeText && (
            <span className={`rounded-full bg-[#E3F1F3] font-bold text-[#1B6572] border border-[#237F8E]/20 font-mono ${sizeConfig.badge}`}>
              {badgeText}
            </span>
          )}
        </div>
        {showSubtitle && (
          <p className={`font-medium text-[#5F6B74] mt-0.5 ${variant === 'stacked' ? 'max-w-xs' : 'truncate'} ${sizeConfig.sub}`}>
            Resilient Optimization Tool for Agro-Satellite Insights
          </p>
        )}
      </div>
    </>
  );

  if (variant === 'stacked') {
    if (onClick) {
      return (
        <button
          type="button"
          onClick={onClick}
          className={`flex flex-col items-center text-center gap-2 cursor-pointer group transition active:scale-95 ${className}`}
          aria-label={ariaLabel}
        >
          {content}
        </button>
      );
    }
    return (
      <div
        className={`flex flex-col items-center text-center gap-2 ${className}`}
        aria-label={ariaLabel}
      >
        {content}
      </div>
    );
  }

  // Default: 'horizontal'
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-2.5 cursor-pointer group text-left transition active:scale-95 ${className}`}
        aria-label={ariaLabel}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2.5 text-left ${className}`}
      aria-label={ariaLabel}
    >
      {content}
    </div>
  );
};

export default RotasiLogo;
