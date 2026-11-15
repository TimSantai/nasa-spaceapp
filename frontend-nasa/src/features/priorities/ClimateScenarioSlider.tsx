import React from 'react';
import type { ClimateScenario } from '../../types/domain';
import type { Language } from '../../types/landing';
import { CloudRain, Thermometer, RotateCcw } from 'lucide-react';

interface ClimateScenarioSliderProps {
  scenario: ClimateScenario;
  onScenarioChange: (scenario: ClimateScenario) => void;
  currentLang?: Language;
}

export const ClimateScenarioSlider: React.FC<ClimateScenarioSliderProps> = ({
  scenario,
  onScenarioChange,
  currentLang = 'id',
}) => {
  const isId = currentLang === 'id';

  const handleRainfallChange = (val: number) => {
    onScenarioChange({
      ...scenario,
      rainfallAnomalyPercent: val,
    });
  };

  const handleTempChange = (val: number) => {
    onScenarioChange({
      ...scenario,
      temperatureAnomalyDelta: val,
    });
  };

  const resetToBaseline = () => {
    onScenarioChange({
      rainfallAnomalyPercent: 0,
      temperatureAnomalyDelta: 0,
    });
  };

  const isDroughtScenario = scenario.rainfallAnomalyPercent < 0 || scenario.temperatureAnomalyDelta > 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-[#1a7a6d] uppercase">
            {isId ? '/ WHAT-IF UJI STRES IKLIM (FITUR F13)' : '/ WHAT-IF CLIMATE STRESS TEST (FEATURE F13)'}
          </span>
          <h3 className="text-base font-bold text-gray-900 mt-1 flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-[#0891b2]" />
            {isId ? 'Simulasi Skenario Stres Iklim & Curah Hujan' : 'Climate Stress & Precipitation Scenario Simulation'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {isId
              ? 'Uji ketahanan rotasi jika curah hujan berubah atau suhu menghangat: engine menghitung ulang ET0 dan kebutuhan irigasi di semua tahun analog'
              : 'Test rotation resilience under altered rainfall or warmer temperatures: engine recalculates ET0 and irrigation demands across all analog years'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDroughtScenario && (
            <span className="rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-bold text-[#dc2626]">
              {isId ? 'Simulasi Ekstrem Aktif' : 'Extreme Scenario Active'}
            </span>
          )}
          <button
            type="button"
            onClick={resetToBaseline}
            className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{isId ? 'Reset Normal' : 'Reset Baseline'}</span>
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Slider 1: Rainfall Anomaly */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-800 flex items-center gap-1.5">
              <CloudRain className="h-4 w-4 text-[#0891b2]" />
              {isId ? 'Anomali Curah Hujan' : 'Rainfall Anomaly'}
            </span>
            <span
              className={`font-mono font-bold tabular-nums text-xs px-2.5 py-0.5 rounded-full ${scenario.rainfallAnomalyPercent < 0
                  ? 'bg-red-100 text-[#dc2626]'
                  : scenario.rainfallAnomalyPercent > 0
                    ? 'bg-teal-100 text-[#1a7a6d]'
                    : 'bg-gray-200 text-gray-700'
                }`}
            >
              {scenario.rainfallAnomalyPercent > 0
                ? `+${scenario.rainfallAnomalyPercent}%`
                : `${scenario.rainfallAnomalyPercent}%`}
            </span>
          </div>
          <input
            type="range"
            min={-30}
            max={30}
            step={5}
            value={scenario.rainfallAnomalyPercent}
            onChange={(e) => handleRainfallChange(Number(e.target.value))}
            className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-[#0891b2]"
          />
          <div className="mt-2 flex justify-between text-[11px] text-gray-500">
            <span className="text-[#dc2626] font-medium">
              {isId ? '-30% (Kekeringan Parah)' : '-30% (Severe Drought)'}
            </span>
            <span>{isId ? '0% (Historis)' : '0% (Historical)'}</span>
            <span className="text-[#1a7a6d] font-medium">
              {isId ? '+30% (Basah/Banjir)' : '+30% (Wet / Flood)'}
            </span>
          </div>
        </div>

        {/* Slider 2: Temperature Delta */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-800 flex items-center gap-1.5">
              <Thermometer className="h-4 w-4 text-[#d97706]" />
              {isId ? 'Kenaikan Suhu Rata-Rata' : 'Temperature Increase'}
            </span>
            <span
              className={`font-mono font-bold tabular-nums text-xs px-2.5 py-0.5 rounded-full ${scenario.temperatureAnomalyDelta > 0
                  ? 'bg-amber-100 text-[#d97706]'
                  : 'bg-gray-200 text-gray-700'
                }`}
            >
              {scenario.temperatureAnomalyDelta > 0
                ? `+${scenario.temperatureAnomalyDelta.toFixed(1)}°C`
                : '0.0°C'}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={2.5}
            step={0.5}
            value={scenario.temperatureAnomalyDelta}
            onChange={(e) => handleTempChange(Number(e.target.value))}
            className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-[#d97706]"
          />
          <div className="mt-2 flex justify-between text-[11px] text-gray-500">
            <span>{isId ? '0.0°C (Normal)' : '0.0°C (Baseline)'}</span>
            <span className="text-[#d97706] font-medium">+1.0°C</span>
            <span className="text-[#dc2626] font-medium">
              {isId ? '+2.5°C (Gelombang Panas)' : '+2.5°C (Heatwave)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
