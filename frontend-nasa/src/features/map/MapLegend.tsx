import React from 'react';
import { Mountain } from 'lucide-react';
import type { ThematicLayerMode } from './mapUtils';

export interface MapLegendProps {
  thematicLayer: ThematicLayerMode;
  currentLang?: 'id' | 'en';
}

export const MapLegend: React.FC<MapLegendProps> = ({
  thematicLayer,
  currentLang = 'id',
}) => {
  const isId = currentLang === 'id';

  return (
    <aside
      className="pointer-events-auto fixed bottom-18 sm:bottom-6 left-4 sm:left-6 z-30 flex flex-wrap items-center gap-3 rounded-full border border-[#E6EBF0] bg-white/95 px-4 py-2 text-xs text-[#5F6B74] backdrop-blur-md shadow-float transition-all duration-300 ease-out motion-reduce:transition-none"
      aria-label={isId ? 'Legenda Peta Interaktif' : 'Interactive Map Legend'}
    >
      {thematicLayer === 'status' && (
        <>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#237F8E]" />
            <span className="font-semibold text-[#14232B]">{isId ? 'Petak Aktif' : 'Active Plot'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0891b2]" />
            <span>{isId ? 'Petak Terkatalog' : 'Cataloged Plots'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mountain className="h-3.5 w-3.5 text-amber-600" />
            <span>{isId ? 'Elevasi 3D' : '3D Elevation'}</span>
          </div>
        </>
      )}

      {thematicLayer === 'slope' && (
        <>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>{isId ? '<8% Landai (Stabil)' : '<8% Gentle (Stable)'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span>{isId ? '8-15% Moderat' : '8-15% Moderate'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="font-semibold text-red-700">{isId ? '>15% Rentan Erosi' : '>15% High Erosion Risk'}</span>
          </div>
        </>
      )}

      {thematicLayer === 'awc' && (
        <>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-700" />
            <span>{isId ? '>140mm Air Melimpah' : '>140mm High Moisture'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
            <span>{isId ? '120-140mm Sedang' : '120-140mm Moderate'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            <span className="font-semibold text-orange-700">{isId ? '<120mm Defisit Kelembaban' : '<120mm Moisture Deficit'}</span>
          </div>
        </>
      )}
    </aside>
  );
};
