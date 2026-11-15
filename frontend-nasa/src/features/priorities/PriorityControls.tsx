import React from 'react';
import type { PriorityWeights, ClimatePhase, FarmerConstraints as FarmerConstraintsType, ClimateScenario } from '../../types/domain';
import type { Language } from '../../types/landing';
import { Sliders, Sun, CloudRain, Wind, Sparkles } from 'lucide-react';
import { FarmerConstraints } from './FarmerConstraints';
import { ClimateScenarioSlider } from './ClimateScenarioSlider';

interface PriorityControlsProps {
  weights: PriorityWeights;
  onWeightsChange: (weights: PriorityWeights) => void;
  climatePhase: ClimatePhase;
  onClimatePhaseChange: (phase: ClimatePhase) => void;
  constraints: FarmerConstraintsType;
  onConstraintsChange: (constraints: FarmerConstraintsType) => void;
  scenario: ClimateScenario;
  onScenarioChange: (scenario: ClimateScenario) => void;
  currentLang?: Language;
}

export const PriorityControls: React.FC<PriorityControlsProps> = ({
  weights,
  onWeightsChange,
  climatePhase,
  onClimatePhaseChange,
  constraints,
  onConstraintsChange,
  scenario,
  onScenarioChange,
  currentLang = 'id',
}) => {
  const isId = currentLang === 'id';

  const handleSliderChange = (key: keyof PriorityWeights, value: number) => {
    onWeightsChange({
      ...weights,
      [key]: value,
    });
  };

  const applyPreset = (preset: 'balanced' | 'drought' | 'soil' | 'pest') => {
    if (preset === 'balanced') {
      onWeightsChange({ waterEfficiency: 20, soilHealth: 20, coverDays: 20, erosionControl: 20, pestBreak: 20 });
    } else if (preset === 'drought') {
      onWeightsChange({ waterEfficiency: 45, soilHealth: 15, coverDays: 15, erosionControl: 15, pestBreak: 10 });
      onClimatePhaseChange('el_nino');
    } else if (preset === 'soil') {
      onWeightsChange({ waterEfficiency: 10, soilHealth: 35, coverDays: 20, erosionControl: 30, pestBreak: 5 });
    } else if (preset === 'pest') {
      onWeightsChange({ waterEfficiency: 15, soilHealth: 15, coverDays: 10, erosionControl: 10, pestBreak: 50 });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Climate Forcing Selector */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-gray-100 pb-4 gap-2">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-[#1a7a6d] uppercase">
              {isId ? '/ FORSING IKLIM ENSO' : '/ ENSO CLIMATE FORCING'}
            </span>
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base mt-1">
              <Sun className="h-4 w-4 text-[#d97706]" />
              {isId
                ? 'Fase Monsun Terproyeksi (Pacific ENSO / Indian Ocean Dipole)'
                : 'Projected Monsoon Phase (Pacific ENSO / Indian Ocean Dipole)'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isId
                ? 'Memilih tahun analog historis (1991–2024) dengan fase iklim yang sama sebagai dasar perhitungan'
                : 'Selecting historical analog years (1991–2024) with matching climate phases as calculation baseline'}
            </p>
          </div>
          <span className="text-xs text-[#1a7a6d] font-semibold bg-[#e8f5f2] px-3.5 py-1 rounded-full border border-[#bfe3db]">
            {isId ? 'Model Analog Aktif' : 'Active Analog Model'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => onClimatePhaseChange('el_nino')}
            className={`flex flex-col items-start rounded-2xl border p-4 text-left transition duration-150 cursor-pointer ${climatePhase === 'el_nino'
                ? 'border-[#dc2626] bg-red-50/40 ring-1 ring-[#dc2626] shadow-xs'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
          >
            <div className="flex items-center gap-2 font-bold text-[#dc2626] text-sm">
              <Sun className="h-4 w-4 shrink-0" />
              <span>{isId ? 'El Niño (Kekeringan Parah)' : 'El Niño (Severe Drought)'}</span>
            </div>
            <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
              {isId
                ? 'Memakai tahun-tahun El Niño historis (label ONI Agu–Okt) sebagai analog musim tanam berikutnya.'
                : 'Uses historical El Niño years (Aug–Oct ONI anomaly) as analogs for the upcoming planting seasons.'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onClimatePhaseChange('normal')}
            className={`flex flex-col items-start rounded-2xl border p-4 text-left transition duration-150 cursor-pointer ${climatePhase === 'normal'
                ? 'border-[#0891b2] bg-cyan-50/40 ring-1 ring-[#0891b2] shadow-xs'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
          >
            <div className="flex items-center gap-2 font-bold text-[#0891b2] text-sm">
              <Wind className="h-4 w-4 shrink-0" />
              <span>{isId ? 'Klimatologi Netral' : 'Neutral Climatology'}</span>
            </div>
            <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
              {isId
                ? 'Distribusi standar musiman. Awal musim hujan normal pada akhir Oktober.'
                : 'Standard seasonal distribution. Wet season onset typically late October.'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onClimatePhaseChange('la_nina')}
            className={`flex flex-col items-start rounded-2xl border p-4 text-left transition duration-150 cursor-pointer ${climatePhase === 'la_nina'
                ? 'border-[#1a7a6d] bg-[#e8f5f2]/40 ring-1 ring-[#1a7a6d] shadow-xs'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
          >
            <div className="flex items-center gap-2 font-bold text-[#1a7a6d] text-sm">
              <CloudRain className="h-4 w-4 shrink-0" />
              <span>{isId ? 'La Niña (Anomali Basah)' : 'La Niña (Wet Anomaly)'}</span>
            </div>
            <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
              {isId
                ? 'Curah hujan tinggi sepanjang kemarau. Risiko kekeringan rendah, risiko hama jamur & genangan tinggi.'
                : 'Persistent rainfall during dry season. Low drought risk, higher fungal disease & waterlogging risk.'}
            </p>
          </button>
        </div>
      </div>

      {/* 2. Interactive Climate Scenario Slider (Fitur F13) */}
      <ClimateScenarioSlider
        scenario={scenario}
        onScenarioChange={onScenarioChange}
        currentLang={currentLang}
      />

      {/* 3. Farmer Constraints (Fitur F3) */}
      <FarmerConstraints
        constraints={constraints}
        onConstraintsChange={onConstraintsChange}
        currentLang={currentLang}
      />

      {/* 4. Priority Sliders */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-[#1a7a6d] uppercase">
              {isId ? '/ BOBOT MULTI-OBJEKTIF' : '/ MULTI-OBJECTIVE WEIGHTING'}
            </span>
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base mt-1">
              <Sliders className="h-4 w-4 text-[#1a7a6d]" />
              {isId ? 'Bobot Preferensi Multi-Objektif Petani' : 'Farmer Multi-Objective Preference Weights'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {isId
                ? 'Atur prioritas antara kebutuhan air, kesehatan tanah, tutupan, erosi, dan siklus hama'
                : 'Balance priorities across water demand, soil health, ground cover, erosion risk, and pest break'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 mr-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-[#d97706]" />
              <span>{isId ? 'Preset Pilihan:' : 'Quick Presets:'}</span>
            </span>
            <button
              type="button"
              onClick={() => applyPreset('balanced')}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition cursor-pointer"
            >
              Balanced
            </button>
            <button
              type="button"
              onClick={() => applyPreset('drought')}
              className="rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-semibold text-[#dc2626] hover:bg-red-100 transition cursor-pointer"
            >
              Drought Shield
            </button>
            <button
              type="button"
              onClick={() => applyPreset('soil')}
              className="rounded-full bg-[#e8f5f2] border border-[#bfe3db] px-3 py-1 text-xs font-semibold text-[#1a7a6d] hover:bg-teal-100 transition cursor-pointer"
            >
              Soil Booster
            </button>
            <button
              type="button"
              onClick={() => applyPreset('pest')}
              className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              Pest Cycle
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {/* Erosion */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-800">
                {isId
                  ? 'Perlindungan Erosi (Hujan di Tanah Terbuka × Lereng)'
                  : 'Erosion Protection (Rain on Bare Soil × Slope)'}
              </span>
              <span className="font-mono text-[#1a7a6d] font-bold tabular-nums">{weights.erosionControl}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.erosionControl}
              onChange={(e) => handleSliderChange('erosionControl', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-100 accent-[#1a7a6d]"
            />
          </div>

          {/* Water */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-800">
                {isId ? 'Efisiensi Air & Ketahanan Kekeringan' : 'Water Efficiency & Drought Resilience'}
              </span>
              <span className="font-mono text-[#0891b2] font-bold tabular-nums">{weights.waterEfficiency}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.waterEfficiency}
              onChange={(e) => handleSliderChange('waterEfficiency', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-100 accent-[#0891b2]"
            />
          </div>

          {/* Soil */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-800">
                {isId
                  ? 'Kesehatan Tanah & Fiksasi Nitrogen Organik'
                  : 'Soil Health & Organic Nitrogen Fixation'}
              </span>
              <span className="font-mono text-[#d97706] font-bold tabular-nums">{weights.soilHealth}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.soilHealth}
              onChange={(e) => handleSliderChange('soilHealth', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-100 accent-[#d97706]"
            />
          </div>

          {/* Cover Days */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-800">
                {isId
                  ? 'Tutupan Kanopi (Meminimalkan Lahan Bera Terbuka)'
                  : 'Canopy Cover (Minimizing Bare Soil Fallow Days)'}
              </span>
              <span className="font-mono text-[#16a34a] font-bold tabular-nums">{weights.coverDays}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.coverDays}
              onChange={(e) => handleSliderChange('coverDays', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-100 accent-[#16a34a]"
            />
          </div>

          {/* Pest cycle */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-800">
                {isId
                  ? 'Pemutus Siklus Hama (Pergantian Famili Tanaman)'
                  : 'Pest Cycle Break (Crop Family Rotation)'}
              </span>
              <span className="font-mono text-slate-600 font-bold tabular-nums">{weights.pestBreak}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={weights.pestBreak}
              onChange={(e) => handleSliderChange('pestBreak', Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-100 accent-[#475569]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
