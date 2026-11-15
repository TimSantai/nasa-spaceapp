import React from 'react';
import { type StickerSize, type MetricStickerType, SIZE_PX } from './stickerUtils';

export type { MetricStickerType };

interface MetricStickerProps {
  type: MetricStickerType;
  size?: StickerSize;
  className?: string;
  alt?: string;
}

export const MetricSticker: React.FC<MetricStickerProps> = ({
  type,
  size = 'sm',
  className = '',
  alt,
}) => {
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
        {/* 1. AREA / LUAS LAHAN: Agricultural parcel grid with furrow lines */}
        {type === 'area' && (
          <g>
            {/* White sticker die-cut contour */}
            <path
              d="M7 11C7 8 9 6 12 6H24C27 6 29 8 29 11V23C29 26 27 28 24 28H12C9 28 7 26 7 23V11Z"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Emerald parcel base */}
            <rect x="8" y="7" width="20" height="20" rx="4" fill="#22C55E" stroke="#15803D" strokeWidth="1" />
            {/* Furrow rows / plot grid divisions */}
            <path d="M8 17H28" stroke="#16A34A" strokeWidth="1.2" strokeDasharray="2 1" />
            <path d="M18 7V27" stroke="#16A34A" strokeWidth="1.2" />
            {/* Mini seedlings growing in parcel */}
            <circle cx="13" cy="12" r="1.5" fill="#86EFAC" />
            <circle cx="23" cy="12" r="1.5" fill="#FEF08A" />
            <circle cx="13" cy="22" r="1.5" fill="#86EFAC" />
            <circle cx="23" cy="22" r="1.5" fill="#86EFAC" />
            {/* Golden corner corner-flag marker */}
            <path d="M10 9L12 8V11L10 10Z" fill="#FBBF24" />
          </g>
        )}

        {/* 2. SLOPE / KEMIRINGAN LERENG: Stepped agricultural terrace / incline */}
        {type === 'slope' && (
          <g>
            {/* White sticker contour */}
            <path
              d="M6 28L6 23C6 21 8 19 10 19H14C16 19 18 17 18 15V12C18 10 20 8 22 8H26C28 8 30 10 30 12V28H6Z"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Terraced Hill Incline */}
            <path
              d="M7 27V23C7 21.5 8.5 20 10 20H14C15.5 20 17 18.5 17 17V13C17 11.5 18.5 10 20 10H26C27.5 10 29 11.5 29 13V27H7Z"
              fill="#EAB308"
              stroke="#A16207"
              strokeWidth="1"
            />
            {/* Terrace grassy riser steps */}
            <path d="M9 20H15" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M16 14H22" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M22 10H28" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
            {/* Angle incline arrow */}
            <path d="M10 24L24 13M24 13H19M24 13V18" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}

        {/* 3. ELEVATION / KETINGGIAN ELEVASI: Mountain summits with elevation line */}
        {type === 'elevation' && (
          <g>
            {/* White contour */}
            <path
              d="M18 6L7 26C6 28 8 30 10 30H26C28 30 30 28 29 26L24 17L21 21L18 6Z"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Main Peak */}
            <path d="M18 7L8 27C7.5 28 8.5 29 9.5 29H26.5C27.5 29 28.5 28 28 27L23 18L20.5 21.5L18 7Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
            {/* Snow / sunlight cap */}
            <path d="M18 7L15 13L17 14L18 12L19 14L21 13L18 7Z" fill="#FFFFFF" />
            {/* Secondary lower peak */}
            <path d="M23 18L28 27H20L23 18Z" fill="#0284C7" opacity="0.4" />
            {/* Tiny summit sun */}
            <circle cx="26" cy="10" r="2.5" fill="#F59E0B" />
          </g>
        )}

        {/* 4. AWC / KAPASITAS AIR: High-capacity water droplet entering porous soil */}
        {type === 'awc' && (
          <g>
            {/* White contour */}
            <path
              d="M18 5C18 5 10 15 10 21C10 26 13.5 29 18 29C22.5 29 26 26 26 21C26 15 18 5 18 5Z"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Crystal Blue Water Droplet */}
            <path
              d="M18 6C18 6 11 15.5 11 21C11 25.5 14 28 18 28C22 28 25 25.5 25 21C25 15.5 18 6 18 6Z"
              fill="#06B6D4"
              stroke="#0891B2"
              strokeWidth="1.2"
            />
            {/* Water volume level wave */}
            <path
              d="M11 22C13 23 15 21 18 22C21 23 23 21 25 22V23C24.5 26 21.5 28 18 28C14.5 28 11.5 26 11 23V22Z"
              fill="#0284C7"
            />
            {/* Glossy specular curved highlight */}
            <ellipse cx="14.5" cy="17" rx="1.5" ry="3.5" transform="rotate(-30 14.5 17)" fill="#FFFFFF" opacity="0.7" />
            <circle cx="18" cy="11" r="1" fill="#FFFFFF" opacity="0.6" />
          </g>
        )}

        {/* 5. PEDOLOGY: Soil Horizons & Geological layers */}
        {type === 'pedology' && (
          <g>
            {/* White contour */}
            <path
              d="M8 8C8 6.5 9.5 5 11 5H25C26.5 5 28 6.5 28 8V26C28 27.5 26.5 29 25 29H11C9.5 29 8 27.5 8 26V8Z"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Topsoil: Dark rich humus with grass */}
            <path d="M9 6H27V12H9V6Z" fill="#15803D" />
            <path d="M12 6L13 8M17 6L18 8M22 6L23 8" stroke="#4ADE80" strokeWidth="1" strokeLinecap="round" />
            {/* Subsoil: Clay / Loam brown layer */}
            <path d="M9 12H27V20H9V12Z" fill="#A16207" />
            <circle cx="13" cy="16" r="1.2" fill="#CA8A04" />
            <circle cx="21" cy="15" r="1.5" fill="#78350F" />
            <circle cx="17" cy="18" r="1" fill="#CA8A04" />
            {/* Parent rock: Grey gravel layer */}
            <path d="M9 20H27V28H9V20Z" fill="#64748B" />
            <circle cx="13" cy="24" r="1.5" fill="#94A3B8" />
            <circle cx="18" cy="25" r="1.8" fill="#475569" />
            <circle cx="23" cy="23" r="1.4" fill="#94A3B8" />
          </g>
        )}
      </g>
    </svg>
  );
};
