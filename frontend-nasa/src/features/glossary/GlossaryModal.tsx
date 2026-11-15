import React from 'react';
import { BookOpen, X, Info } from 'lucide-react';

interface GlossaryItem {
  term: string;
  category: 'NASA Satellite' | 'Agronomy & Soil' | 'Decision Metrics';
  definition: string;
  formulaOrSensor?: string;
}

const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    term: 'NDVI (Normalized Difference Vegetation Index)',
    category: 'NASA Satellite',
    definition: 'Quantifies vegetation greenness and canopy photosynthetic density from -1.0 to +1.0. Used in Field Shift to detect crop emergence, peak vegetative vigor, harvest dates, and bare fallow (lahan bera) windows.',
    formulaOrSensor: 'HLS 30m (Landsat-8/9 + Sentinel-2 MSI)',
  },
  {
    term: 'CVaR (Conditional Value at Risk / Expected Shortfall)',
    category: 'Decision Metrics',
    definition: 'Calculates the average outcome in the worst 10–20% of historic analogue climate years (e.g., severe El Niño droughts). Unlike mean yield, CVaR informs farmers how disastrous a dry year will actually be.',
    formulaOrSensor: 'Expected Shortfall E[Loss | Loss > VaR_alpha]',
  },
  {
    term: 'ESI (Evaporative Stress Index)',
    category: 'NASA Satellite',
    definition: 'Measures anomalies in the ratio of actual evapotranspiration (ET) to potential evapotranspiration (PET). Highlights crop water stress before visual canopy wilting or browning occurs.',
    formulaOrSensor: 'ECOSTRESS 70m TIR (ISS onboard sensor)',
  },
  {
    term: 'Root Zone Soil Moisture',
    category: 'NASA Satellite',
    definition: 'Volumetric water content in the top 1 meter of soil where active crop roots absorb moisture. Essential for evaluating whether dry-season secondary crops (palawija) can survive without canal irrigation.',
    formulaOrSensor: 'NASA SMAP L4 (9km assimilation)',
  },
  {
    term: 'AWC (Available Water Capacity)',
    category: 'Agronomy & Soil',
    definition: 'The portion of water that can be retained by the soil between field capacity and permanent wilting point, available for crop uptake.',
    formulaOrSensor: 'ISRIC SoilGrids 250m & SSURGO',
  },
  {
    term: 'Crop Sequence & Fallow (Lahan Bera)',
    category: 'Agronomy & Soil',
    definition: 'The seasonal succession of crops on a field. Leaving land fallow (bera) during extreme dry spells risks erosion and weeds, whereas leguminous cover crops fix atmospheric nitrogen and conserve soil structure.',
    formulaOrSensor: 'CDL / CSB 8-Year Observational Transition',
  },
  {
    term: 'Pareto Optimal Strategy',
    category: 'Decision Metrics',
    definition: 'A rotation plan that cannot be improved in any objective (e.g. water efficiency) without deteriorating another objective (e.g. harvest yield). Dominated strategies are strictly inferior across all weights.',
    formulaOrSensor: 'Multi-Objective Trade-Off Optimization',
  },
];

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs">
      <div className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 text-gray-900 shadow-float">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#e8f5f2] p-2.5 text-[#1a7a6d]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900">NASA Earth Science & Agronomy Glossary</h2>
              <p className="text-xs text-gray-500">Essential remote sensing sensors, risk formulations, and agro-ecological metrics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {GLOSSARY_ITEMS.map((item) => (
            <div
              key={item.term}
              className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 transition duration-150 hover:border-[#1a7a6d] hover:bg-white"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-sm text-gray-900">{item.term}</h3>
                <span className="rounded-full bg-gray-100 px-3 py-0.5 text-[11px] font-semibold text-gray-600">
                  {item.category}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">{item.definition}</p>
              {item.formulaOrSensor && (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-[#0891b2]">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-mono text-[11px] font-semibold">{item.formulaOrSensor}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 rounded-2xl border border-[#bfe3db] bg-[#e8f5f2]/60 p-4 text-xs text-[#0f5347]">
          <p className="leading-relaxed">Data provenance is grounded in peer-reviewed agro-ecological criteria and NASA Earth Science specifications.</p>
          <button
            onClick={onClose}
            className="self-end sm:self-auto shrink-0 rounded-full bg-[#1a7a6d] px-5 py-2 font-semibold text-white transition hover:bg-[#15665b] shadow-xs"
          >
            Close Glossary
          </button>
        </div>
      </div>
    </div>
  );
};
