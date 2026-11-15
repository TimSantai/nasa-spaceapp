import React from 'react';
import { type StickerSize, SIZE_PX, normalizeCropKey } from './stickerUtils';

export type { StickerSize };

interface CropStickerProps {
  name: string;
  size?: StickerSize;
  className?: string;
  alt?: string;
}

export const CropSticker: React.FC<CropStickerProps> = ({
  name,
  size = 'sm',
  className = '',
  alt,
}) => {
  const crop = normalizeCropKey(name);
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
        {/* RICE / PADDY */}
        {crop === 'rice' && (
          <g>
            {/* White sticker die-cut contour background */}
            <path
              d="M18 4C11 9 8 18 10 27C12 30 16 32 20 31C24 30 26 26 27 20C28 13 24 6 18 4Z"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Main golden sheaf */}
            <path
              d="M18 5C12 10 9 18 11 26C12 29 16 31 19 30C23 29 25 25 26 19C27 13 23 7 18 5Z"
              fill="#F59E0B"
            />
            {/* Golden Rice Grains */}
            <ellipse cx="15" cy="12" rx="3.5" ry="5.5" transform="rotate(-25 15 12)" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
            <ellipse cx="21" cy="14" rx="3.5" ry="5.5" transform="rotate(25 21 14)" fill="#FDE68A" stroke="#D97706" strokeWidth="1" />
            <ellipse cx="14" cy="20" rx="3.5" ry="5.5" transform="rotate(-15 14 20)" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
            <ellipse cx="20" cy="21" rx="3.5" ry="5.5" transform="rotate(15 20 21)" fill="#FDE68A" stroke="#D97706" strokeWidth="1" />
            {/* Central stalk stem */}
            <path d="M17.5 7V29" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
            {/* Cute glossy highlight */}
            <circle cx="14" cy="10" r="1" fill="#FFFFFF" opacity="0.8" />
            <circle cx="20" cy="12" r="1" fill="#FFFFFF" opacity="0.8" />
          </g>
        )}

        {/* MAIZE / CORN */}
        {crop === 'maize' && (
          <g>
            {/* White sticker die-cut */}
            <path
              d="M18 4C14 4 11 8 11 14V22C11 27 14 31 18 31C22 31 25 27 25 22V14C25 8 22 4 18 4Z"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Yellow ear of corn */}
            <rect x="12" y="6" width="12" height="20" rx="6" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
            {/* Kernels grid */}
            <circle cx="15" cy="11" r="1.5" fill="#FDE68A" />
            <circle cx="21" cy="11" r="1.5" fill="#FDE68A" />
            <circle cx="15" cy="16" r="1.5" fill="#FDE68A" />
            <circle cx="21" cy="16" r="1.5" fill="#FDE68A" />
            <circle cx="18" cy="13.5" r="1.5" fill="#FEF08A" />
            <circle cx="18" cy="19" r="1.5" fill="#FEF08A" />
            <circle cx="15" cy="21.5" r="1.5" fill="#FDE68A" />
            <circle cx="21" cy="21.5" r="1.5" fill="#FDE68A" />
            {/* Green Husk Leaves */}
            <path
              d="M9 25C10 20 12 17 14 16C13 22 13 26 18 29C13 30 10 28 9 25Z"
              fill="#22C55E"
              stroke="#15803D"
              strokeWidth="1"
            />
            <path
              d="M27 25C26 20 24 17 22 16C23 22 23 26 18 29C23 30 26 28 27 25Z"
              fill="#16A34A"
              stroke="#15803D"
              strokeWidth="1"
            />
          </g>
        )}

        {/* SOYBEAN */}
        {crop === 'soybean' && (
          <g>
            {/* White contour */}
            <path
              d="M7 23C7 16 14 10 22 8C27 7 30 10 29 14C27 22 20 28 12 29C9 29 7 27 7 23Z"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Green Pod */}
            <path
              d="M8 22C8 15 15 10 23 9C27 8 29 11 28 14C26 21 19 27 12 28C9 28 8 26 8 22Z"
              fill="#4ADE80"
              stroke="#16A34A"
              strokeWidth="1.2"
            />
            {/* 3 Beans inside pod */}
            <circle cx="14" cy="21" r="3" fill="#86EFAC" stroke="#15803D" strokeWidth="0.8" />
            <circle cx="19" cy="16.5" r="3" fill="#86EFAC" stroke="#15803D" strokeWidth="0.8" />
            <circle cx="24" cy="12.5" r="2.8" fill="#86EFAC" stroke="#15803D" strokeWidth="0.8" />
            <path d="M28 9L31 6" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />
            <circle cx="13" cy="20" r="0.8" fill="#FFFFFF" />
            <circle cx="18" cy="15.5" r="0.8" fill="#FFFFFF" />
          </g>
        )}

        {/* GROUNDNUT / PEANUT */}
        {crop === 'groundnut' && (
          <g>
            {/* White contour */}
            <path
              d="M13 8C17 8 18 12 18 14C18 16 19 20 23 20C26 20 28 23 27 26C26 29 23 31 19 30C15 29 14 26 14 24C14 22 13 18 9 18C6 18 4 15 5 12C6 9 9 8 13 8Z"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Peanut double shell */}
            <path
              d="M13 9C17 9 17.5 13 17.5 15C17.5 17 18.5 20.5 22.5 20.5C25.5 20.5 27 23 26 25.5C25 28 22.5 29.5 19 29C15.5 28.5 14.5 25.5 14.5 23.5C14.5 21.5 13.5 18 9.5 18C6.5 18 5 15.5 6 13C7 10.5 9.5 9 13 9Z"
              fill="#D97706"
              stroke="#92400E"
              strokeWidth="1.2"
            />
            {/* Shell Texture lines */}
            <path d="M10 12C12 12 14 14 14 16" stroke="#B45309" strokeWidth="1" strokeLinecap="round" />
            <path d="M19 23C21 23 23 25 23 27" stroke="#B45309" strokeWidth="1" strokeLinecap="round" />
            <circle cx="11" cy="13" r="1.2" fill="#FDE68A" />
            <circle cx="21" cy="24" r="1.2" fill="#FDE68A" />
          </g>
        )}

        {/* CHILI */}
        {crop === 'chili' && (
          <g>
            {/* White contour */}
            <path
              d="M24 7C20 9 16 14 13 19C10 24 8 28 9 30C10 32 12 31 14 29C18 25 23 18 26 13C28 10 27 8 24 7Z"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Red Chili Body */}
            <path
              d="M23 8C19 10 15 15 12 20C9 25 8 28 9 29C10 30 12 29 14 27C18 23 22 17 25 12C27 9 25 8 23 8Z"
              fill="#EF4444"
              stroke="#B91C1C"
              strokeWidth="1.2"
            />
            {/* Glossy sheen */}
            <path
              d="M21 11C18 14 15 18 13 22"
              stroke="#FECACA"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.8"
            />
            {/* Green Stem */}
            <path
              d="M23 8C24 6 26 5 28 5"
              stroke="#15803D"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="23" cy="8" r="2" fill="#22C55E" />
          </g>
        )}

        {/* TOMATO */}
        {crop === 'tomato' && (
          <g>
            {/* White contour */}
            <circle cx="18" cy="19" r="11" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3" />
            {/* Red Body */}
            <circle cx="18" cy="19" r="10.5" fill="#EF4444" stroke="#DC2626" strokeWidth="1" />
            {/* Cute glossy specular */}
            <ellipse cx="14" cy="15" rx="3" ry="1.8" transform="rotate(-30 14 15)" fill="#FFFFFF" opacity="0.6" />
            {/* 5-leaf star calyx */}
            <path
              d="M18 9L19.5 13L23 12L20.5 14.5L23 17L19 16L18 19L17 16L13 17L15.5 14.5L13 12L16.5 13L18 9Z"
              fill="#22C55E"
              stroke="#15803D"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
            <path d="M18 9C18 7 19 6 20 5" stroke="#15803D" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        )}

        {/* ONION */}
        {crop === 'onion' && (
          <g>
            {/* White contour */}
            <path
              d="M18 6C13 12 9 17 9 22C9 27 13 31 18 31C23 31 27 27 27 22C27 17 23 12 18 6Z"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Purple onion body */}
            <path
              d="M18 7C13.5 13 10 17.5 10 22C10 26.5 13.5 30 18 30C22.5 30 26 26.5 26 22C26 17.5 22.5 13 18 7Z"
              fill="#A855F7"
              stroke="#7E22CE"
              strokeWidth="1.2"
            />
            {/* Onion layers curved lines */}
            <path d="M15 14C13.5 17 13 20 13.5 25" stroke="#E9D5FF" strokeWidth="1" strokeLinecap="round" />
            <path d="M21 14C22.5 17 23 20 22.5 25" stroke="#E9D5FF" strokeWidth="1" strokeLinecap="round" />
            {/* Top green sprout tip */}
            <path d="M18 7V4C18 3 19 2 20 2" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" />
            {/* Bottom roots */}
            <path d="M17 30L16 32" stroke="#D8B4FE" strokeWidth="1" strokeLinecap="round" />
            <path d="M19 30L20 32" stroke="#D8B4FE" strokeWidth="1" strokeLinecap="round" />
          </g>
        )}

        {/* FALLOW / REST */}
        {crop === 'fallow' && (
          <g>
            {/* White contour */}
            <path
              d="M6 25C9 22 15 21 21 21C26 21 30 23 32 25C31 29 25 31 19 31C13 31 7 29 6 25Z"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Resting soil mound */}
            <path
              d="M7 25C10 22.5 15 21.5 20 21.5C25 21.5 29 23 31 25C30 28.5 25 30 19 30C13 30 8 28.5 7 25Z"
              fill="#A16207"
              stroke="#78350F"
              strokeWidth="1"
            />
            {/* Gentle resting single sprout */}
            <path
              d="M17 22C17 16 21 13 24 13C24 16 22 20 18 22"
              fill="#86EFAC"
              stroke="#15803D"
              strokeWidth="1.2"
            />
            {/* Sleeping crescent / zzz element */}
            <path
              d="M14 12C15 11 16 11 17 12M13 14C14 13 15 13 16 14"
              stroke="#FDE047"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* DEFAULT SPROUT (Fallback for sorghum, mungbean, etc.) */}
        {crop !== 'rice' &&
          crop !== 'maize' &&
          crop !== 'soybean' &&
          crop !== 'groundnut' &&
          crop !== 'chili' &&
          crop !== 'tomato' &&
          crop !== 'onion' &&
          crop !== 'fallow' && (
            <g>
              <circle cx="18" cy="18" r="12" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="3" />
              <circle cx="18" cy="18" r="11" fill="#DCFCE7" stroke="#16A34A" strokeWidth="1" />
              {/* Sprout */}
              <path d="M18 26V14" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />
              <path
                d="M18 17C14 17 11 14 12 11C15 11 18 14 18 17Z"
                fill="#22C55E"
                stroke="#15803D"
                strokeWidth="1"
              />
              <path
                d="M18 15C22 15 25 12 24 9C21 9 18 12 18 15Z"
                fill="#4ADE80"
                stroke="#15803D"
                strokeWidth="1"
              />
            </g>
          )}
      </g>
    </svg>
  );
};
