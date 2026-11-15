import React from 'react';
import { type StickerSize, SIZE_PX, normalizeSeasonKey } from './stickerUtils';

interface SeasonStickerProps {
  season: string;
  size?: StickerSize;
  className?: string;
  alt?: string;
}

export const SeasonSticker: React.FC<SeasonStickerProps> = ({
  season,
  size = 'sm',
  className = '',
  alt,
}) => {
  const key = normalizeSeasonKey(season);
  const px = SIZE_PX[size] ?? 22;

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 inline-block align-middle transition-transform duration-200 hover:scale-110 ${className}`}
      {...(alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': 'true' })}
    >
      <g style={{ filter: 'drop-shadow(0 1.5px 1.5px rgba(15, 23, 42, 0.16))' }}>
        {/* MT1: MUSIM PENGHUJAN (Nov - Feb) */}
        {key === 'mt1' && (
          <g>
            {/* White contour */}
            <path
              d="M10 18C7.8 18 6 19.8 6 22C6 24.2 7.8 26 10 26H26C28.2 26 30 24.2 30 22C30 19.8 28.2 18 26 18C26 13.6 22.4 10 18 10C14.5 10 11.5 12.3 10.4 15.6C10.3 15.6 10.1 15.6 10 15.6V18Z"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Blue Raincloud */}
            <path
              d="M10 18C8 18 6.5 19.5 6.5 21.5C6.5 23.5 8 25 10 25H25.5C27.5 25 29 23.5 29 21.5C29 19.5 27.5 18 25.5 18C25.5 14 22 11 18 11C14.7 11 11.8 13.2 10.8 16.3C10.5 16.3 10.2 16.3 10 16.3V18Z"
              fill="#38BDF8"
              stroke="#0284C7"
              strokeWidth="1.2"
            />
            {/* Sparkling Raindrops */}
            <path d="M12 28L10 32" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
            <path d="M18 28L16 32" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
            <path d="M24 28L22 32" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
            {/* Cloud Cheek highlights */}
            <ellipse cx="11" cy="21" rx="1.5" ry="1" fill="#BAE6FD" />
            <ellipse cx="24" cy="21" rx="1.5" ry="1" fill="#BAE6FD" />
          </g>
        )}

        {/* MT2: MUSIM GADU / TRANSISI (Mar - Jun) */}
        {key === 'mt2' && (
          <g>
            {/* White contour */}
            <circle cx="21" cy="14" r="8" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3" />
            <path
              d="M8 20C6 20 4.5 21.5 4.5 23.5C4.5 25.5 6 27 8 27H23C25 27 26.5 25.5 26.5 23.5C26.5 21.5 25 20 23 20C23 16 19.5 13 15.5 13C12.5 13 10 15 9 18V20Z"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Sun in background */}
            <circle cx="22" cy="13" r="7.5" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
            <path d="M22 3V5M29 6L27.5 7.5M32 13H30M29 20L27.5 18.5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
            {/* Drifting soft cloud in foreground */}
            <path
              d="M8 21C6.5 21 5.5 22 5.5 23.5C5.5 25 6.5 26 8 26H22.5C24 26 25 25 25 23.5C25 22 24 21 22.5 21C22.5 17.5 19.5 15 16 15C13 15 10.5 17 9.5 19.5V21Z"
              fill="#E0F2FE"
              stroke="#0284C7"
              strokeWidth="1.2"
            />
            {/* Little sprout flourishing below */}
            <path d="M15 28V24" stroke="#15803D" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M15 25C13 25 11 23 12 21C14 21 15 23 15 25Z" fill="#22C55E" />
            <path d="M15 24C17 24 19 22 18 20C16 20 15 22 15 24Z" fill="#4ADE80" />
          </g>
        )}

        {/* MT3: MUSIM KEMARAU / PALAWIJA (Jul - Okt) */}
        {key === 'mt3' && (
          <g>
            {/* White contour */}
            <circle cx="18" cy="18" r="14" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3" />
            {/* Golden Radiant Sun */}
            <circle cx="18" cy="18" r="11" fill="#F59E0B" stroke="#D97706" strokeWidth="1.2" />
            {/* Cheerful Sun Rays */}
            <path d="M18 3V5M18 31V33M3 18H5M31 18H33M7.5 7.5L9 9M27 27L28.5 28.5M7.5 28.5L9 27M27 9L28.5 7.5" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
            {/* Inner warm core */}
            <circle cx="18" cy="18" r="8" fill="#FDE047" />
            {/* Cheerful squinting eyes and smile for friendly approachable vibe */}
            <path d="M14.5 16.5C14.5 15.5 15.5 15.5 15.5 16.5" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M20.5 16.5C20.5 15.5 21.5 15.5 21.5 16.5" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M16 19.5C16.8 20.8 19.2 20.8 20 19.5" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" />
            {/* Cheek blush */}
            <circle cx="13.5" cy="18.5" r="1.2" fill="#F87171" opacity="0.7" />
            <circle cx="22.5" cy="18.5" r="1.2" fill="#F87171" opacity="0.7" />
          </g>
        )}

        {/* DEFAULT SEASON (Neutral Calendar) */}
        {key === 'default' && (
          <g>
            <rect x="6" y="8" width="24" height="22" rx="6" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3" />
            <rect x="7" y="9" width="22" height="20" rx="5" fill="#E2E8F0" stroke="#64748B" strokeWidth="1" />
            <rect x="7" y="9" width="22" height="7" rx="2" fill="#0EA5E9" />
            <circle cx="12" cy="7" r="1.5" fill="#64748B" />
            <circle cx="24" cy="7" r="1.5" fill="#64748B" />
            <circle cx="18" cy="21" r="3" fill="#F59E0B" />
          </g>
        )}
      </g>
    </svg>
  );
};
