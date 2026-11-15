import React, { useState } from 'react';
import type {
  FieldProfile,
  Strategy,
  PriorityWeights,
  ClimatePhase,
  FarmerConstraints,
  ClimateScenario,
} from '../../types/domain';
import type { Language } from '../../types/landing';
import { FieldProfileView } from '../field-profile/FieldProfileView';
import { PriorityControls } from '../priorities/PriorityControls';
import { BaselineEditor } from '../priorities/BaselineEditor';
import { BANYUMAS_CROPS, BANYUMAS_SEASONS } from '../../api/fieldshift';
import { StrategyBoard } from '../strategy-comparison/StrategyBoard';
import { SummaryBrief } from '../export/SummaryBrief';
import { ArrowLeft, Layers, Sliders, FileText, Database, MapPin, Sparkles, BookOpen } from 'lucide-react';
import { SNAPSHOT_DATE } from '../../api/mock/mockData';

interface PlotAnalysisWorkspaceProps {
  field: FieldProfile;
  strategies: Strategy[];
  weights: PriorityWeights;
  onWeightsChange: (weights: PriorityWeights) => void;
  climatePhase: ClimatePhase;
  onClimatePhaseChange: (phase: ClimatePhase) => void;
  constraints: FarmerConstraints;
  onConstraintsChange: (constraints: FarmerConstraints) => void;
  scenario: ClimateScenario;
  onScenarioChange: (scenario: ClimateScenario) => void;
  verifiedChecks: Record<string, boolean>;
  onOpenEvidence: (strategy: Strategy) => void;
  onBackToMap: () => void;
  onOpenGlossary?: () => void;
  onOpenDataSources?: () => void;
  currentLang?: Language;
  dataMode?: 'live' | 'snapshot';
  baseline?: Record<string, string>;
  initialBaseline?: Record<string, string>;
  cropLabels?: Record<string, string>;
  onBaselineChange?: (baseline: Record<string, string>) => void;
}

export const PlotAnalysisWorkspace: React.FC<PlotAnalysisWorkspaceProps> = ({
  field,
  strategies,
  weights,
  onWeightsChange,
  climatePhase,
  onClimatePhaseChange,
  constraints,
  onConstraintsChange,
  scenario,
  onScenarioChange,
  verifiedChecks,
  onOpenEvidence,
  onBackToMap,
  onOpenGlossary,
  onOpenDataSources,
  currentLang = 'id',
  dataMode = 'snapshot',
  baseline,
  initialBaseline,
  cropLabels,
  onBaselineChange,
}) => {
  const isId = currentLang === 'id';
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'optimizer' | 'export'>('profile');

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-[#14232B]">
      {/* Sticky Top Breadcrumb & Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-[#E6EBF0] bg-white/95 px-4 py-3 shadow-xs backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          {/* Back Button & Plot Context */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToMap}
              className="group flex items-center gap-2 rounded-2xl border border-[#E6EBF0] bg-[#F7F9FB] px-3.5 py-2 text-xs font-bold text-[#14232B] transition hover:border-[#237F8E] hover:bg-[#E3F1F3] hover:text-[#237F8E]"
            >
              <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
              <span>{isId ? 'Kembali ke Peta 3D' : 'Back to 3D Map'}</span>
            </button>

            <div className="hidden sm:block h-6 w-px bg-[#E6EBF0]" />

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E3F1F3] text-[#237F8E]">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-[#14232B] leading-tight">{field.name}</h1>
                <p className="text-[11px] text-[#5F6B74]">
                  Desa {field.village}, Kec. {field.district} &middot;{' '}
                  <span className="font-semibold text-[#237F8E]">{field.areaHectares} ha</span>
                </p>
              </div>
            </div>
          </div>

          {/* Sub-Tab Navigation Switcher & Global Modals */}
          <div className="flex items-center gap-3">
            {/* Global Info Modals */}
            <div className="hidden lg:flex items-center gap-1.5 border-r border-[#E6EBF0] pr-3">
              {onOpenDataSources && (
                <button
                  onClick={onOpenDataSources}
                  className="flex items-center gap-1.5 rounded-full border border-[#E6EBF0] bg-[#F7F9FB] px-3 py-1.5 text-xs font-semibold text-[#5F6B74] transition hover:border-[#237F8E] hover:text-[#237F8E]"
                  title="Data catalog: 26 resources reviewed"
                >
                  <Database className="h-3.5 w-3.5 text-[#237F8E]" />
                  <span>Data Catalog (26)</span>
                </button>
              )}
              {onOpenGlossary && (
                <button
                  onClick={onOpenGlossary}
                  className="flex items-center gap-1.5 rounded-full border border-[#E6EBF0] bg-[#F7F9FB] px-3 py-1.5 text-xs font-semibold text-[#5F6B74] transition hover:border-[#237F8E] hover:text-[#237F8E]"
                  title="Glossary"
                >
                  <BookOpen className="h-3.5 w-3.5 text-[#237F8E]" />
                  <span>{isId ? 'Glosarium' : 'Glossary'}</span>
                </button>
              )}
            </div>

            <nav className="flex items-center rounded-full border border-[#E6EBF0] bg-[#F7F9FB] p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('profile')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 transition ${
                activeSubTab === 'profile'
                  ? 'bg-[#237F8E] text-white font-bold shadow-xs'
                  : 'text-[#5F6B74] hover:text-[#14232B]'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{isId ? 'Profil Tanah & Agroklimat' : 'Soil & Climatology'}</span>
            </button>
            <button
              onClick={() => setActiveSubTab('optimizer')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 transition ${
                activeSubTab === 'optimizer'
                  ? 'bg-[#237F8E] text-white font-bold shadow-xs'
                  : 'text-[#5F6B74] hover:text-[#14232B]'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>{isId ? 'Optimasi Pola Tanam' : 'Rotation Optimizer'}</span>
            </button>
            <button
              onClick={() => setActiveSubTab('export')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 transition ${
                activeSubTab === 'export'
                  ? 'bg-[#237F8E] text-white font-bold shadow-xs'
                  : 'text-[#5F6B74] hover:text-[#14232B]'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>{isId ? 'Lembar Konsultasi PPL' : 'Consultation Brief'}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>

      {/* Main Content Viewport */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Context Provenance Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#E6EBF0] pb-3 text-xs text-[#5F6B74]">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[#237F8E]" />
            <span>
              Data Source:{' '}
              {dataMode === 'live' ? (
                <strong className="text-[#237F8E]">Field Shift API (live)</strong>
              ) : (
                <strong className="text-amber-700">Offline snapshot of API results ({SNAPSHOT_DATE})</strong>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#237F8E]" />
            <span>NASA POWER 1991–2025 &middot; SRTM 30 m &middot; ISRIC SoilGrids &middot; ONI/DMI{field.dataAvailability.hasSatelliteNdvi ? ' · HLS 30 m NDVI' : ''}</span>
          </div>
        </div>

        {/* SUB-TAB 1: PEDOLOGY & NASA SATELLITE CLIMATOLOGY */}
        {activeSubTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-[#237F8E] uppercase">
                  / PEDOLOGY & HYDROMETEOROLOGY
                </span>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#14232B]">
                  Profil Tanah & NASA <span className="text-[#237F8E]">Climatology</span>
                </h2>
                <p className="mt-1 max-w-2xl text-xs text-[#5F6B74]">
                  Iklim bulanan NASA POWER (normal 1991–2020), lereng SRTM 30 m dan tanah SoilGrids untuk petak {field.name}.{field.dataAvailability.hasSatelliteNdvi ? ' NDVI dari HLS 30 m.' : ' NDVI HLS menyusul.'}
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab('optimizer')}
                className="self-start sm:self-auto flex items-center gap-2 rounded-full bg-[#237F8E] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#1B6572]"
              >
                <span>{isId ? 'Lanjut ke Optimasi Rotasi' : 'Proceed to Rotation Optimizer'}</span>
                <Sparkles className="h-4 w-4" />
              </button>
            </div>

            <FieldProfileView field={field} />
          </div>
        )}

        {/* SUB-TAB 2: ROTATION OPTIMIZER (SPRINT 1 DECISION ENGINE) */}
        {activeSubTab === 'optimizer' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-[#237F8E] uppercase">
                  / DECISION ENGINE & STRESS-TEST
                </span>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#14232B]">
                  Crop Rotation Multi-Objective <span className="text-[#237F8E]">Optimizer</span>
                </h2>
                <p className="mt-1 max-w-2xl text-xs text-[#5F6B74]">
                  Simulasi trade-off multi-objektif Pareto dan estimasi Conditional Value at Risk (CVaR) berdasarkan skenario iklim ekstrem.
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab('export')}
                className="self-start sm:self-auto flex items-center gap-2 rounded-full border border-[#E6EBF0] bg-white px-5 py-2.5 text-xs font-semibold text-[#14232B] shadow-xs transition hover:border-[#237F8E] hover:text-[#237F8E]"
              >
                <span>{isId ? 'Buka Lembar Konsultasi PPL' : 'Open Consultation Sheet'}</span>
                <FileText className="h-4 w-4 text-[#237F8E]" />
              </button>
            </div>

            {baseline && initialBaseline && cropLabels && onBaselineChange && (
              <BaselineEditor
                seasons={BANYUMAS_SEASONS}
                cropLabels={Object.fromEntries(
                  Object.entries(cropLabels).filter(([key]) => BANYUMAS_CROPS.includes(key)),
                )}
                value={baseline}
                initial={initialBaseline}
                onChange={onBaselineChange}
              />
            )}
            {dataMode !== 'live' && (
              <p className="-mt-4 text-xs text-amber-700">
                Backend offline: rotasi baseline yang diubah baru dihitung saat API tersambung.
              </p>
            )}

            {/* Controls for Climate Forcing, Farmer Constraints & Stress-Test Slider */}
            <PriorityControls
              weights={weights}
              onWeightsChange={onWeightsChange}
              climatePhase={climatePhase}
              onClimatePhaseChange={onClimatePhaseChange}
              constraints={constraints}
              onConstraintsChange={onConstraintsChange}
              scenario={scenario}
              onScenarioChange={onScenarioChange}
            />

            {/* Strategy Comparison Columns */}
            <StrategyBoard
              strategies={strategies}
              weights={weights}
              climatePhase={climatePhase}
              constraints={constraints}
              scenario={scenario}
              onOpenEvidence={onOpenEvidence}
            />
          </div>
        )}

        {/* SUB-TAB 3: EXTENSION CONSULTATION BRIEF (SPRINT 2 PRINT ENGINE) */}
        {activeSubTab === 'export' && (
          <SummaryBrief
            field={field}
            strategies={strategies}
            weights={weights}
            climatePhase={climatePhase}
            constraints={constraints}
            scenario={scenario}
            verifiedChecks={verifiedChecks}
          />
        )}
      </main>
    </div>
  );
};
