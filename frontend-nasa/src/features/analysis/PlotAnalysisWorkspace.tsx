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
import {
  ArrowLeft,
  ArrowRight,
  Layers,
  Sliders,
  FileText,
  Database,
  MapPin,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  X,
  Printer,
  PanelLeftClose,
  PanelLeftOpen,
  Info,
} from 'lucide-react';
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
  onToggleLang?: () => void;
  dataMode?: 'live' | 'snapshot';
  isCalculating?: boolean;
  baseline?: Record<string, string>;
  initialBaseline?: Record<string, string>;
  cropLabels?: Record<string, string>;
  onBaselineChange?: (baseline: Record<string, string>) => void;
}

type SubTabKey = 'profile' | 'optimizer' | 'export';

interface StepDefinition {
  key: SubTabKey;
  stepNum: string;
  titleEn: string;
  titleId: string;
  shortTitleEn: string;
  shortTitleId: string;
  descEn: string;
  descId: string;
  icon: typeof Layers;
}

const WORKFLOW_STEPS: StepDefinition[] = [
  {
    key: 'profile',
    stepNum: '01',
    titleEn: 'Soil & Climatology',
    titleId: 'Karakteristik Lahan & Iklim',
    shortTitleEn: 'Characteristics',
    shortTitleId: 'Karakteristik',
    descEn: 'Pedology, NASA POWER rainfall & HLS NDVI',
    descId: 'Pedologi, curah hujan NASA & kurva NDVI',
    icon: Layers,
  },
  {
    key: 'optimizer',
    stepNum: '02',
    titleEn: 'Rotation Optimizer',
    titleId: 'Optimasi Pola Tanam',
    shortTitleEn: 'Optimizer',
    shortTitleId: 'Optimasi',
    descEn: '5-axis Pareto trade-offs & climate scenarios',
    descId: 'Simulasi Pareto 5-sumbu & skenario iklim',
    icon: Sliders,
  },
  {
    key: 'export',
    stepNum: '03',
    titleEn: 'Consultation Brief',
    titleId: 'Lembar Konsultasi PPL',
    shortTitleEn: 'PPL Brief',
    shortTitleId: 'Lembar PPL',
    descEn: 'Farmer action plan & printable brief',
    descId: 'Rencana aksi petani & dokumen cetak resmi',
    icon: FileText,
  },
];

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
  onToggleLang,
  dataMode = 'snapshot',
  isCalculating = false,
  baseline,
  initialBaseline,
  cropLabels,
  onBaselineChange,
}) => {
  const isId = currentLang === 'id';
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>('profile');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPlotDrawerOpen, setIsPlotDrawerOpen] = useState(false);

  // Helper step index (0, 1, 2)
  const currentStepIdx = WORKFLOW_STEPS.findIndex((s) => s.key === activeSubTab);

  const handleStepSelect = (key: SubTabKey) => {
    setActiveSubTab(key);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextStep = () => {
    if (activeSubTab === 'profile') {
      handleStepSelect('optimizer');
    } else if (activeSubTab === 'optimizer') {
      handleStepSelect('export');
    }
  };

  const handlePrevStep = () => {
    if (activeSubTab === 'export') {
      handleStepSelect('optimizer');
    } else if (activeSubTab === 'optimizer') {
      handleStepSelect('profile');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-[#14232B] flex flex-col md:flex-row relative">
      {/* ================================================================ */}
      {/* 0. MOBILE BACKDROP & PLOT SPECS DRAWER                           */}
      {/* ================================================================ */}
      <div
        role="presentation"
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 transition-opacity duration-300 md:hidden ${
          isPlotDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsPlotDrawerOpen(false)}
      />

      {/* Mobile Plot Details Slide-Over Sheet */}
      <aside
        className={`
          fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] bg-white flex flex-col justify-between overflow-y-auto p-5 shadow-2xl transition-transform duration-300 ease-out md:hidden
          ${isPlotDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6EBF0]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold tracking-tight text-[#14232B]">
                {isId ? 'Detail & Spesifikasi Petak' : 'Plot Specifications'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsPlotDrawerOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E6EBF0] bg-slate-50 text-[#5F6B74] hover:text-[#14232B] transition active:scale-95 cursor-pointer"
              aria-label={isId ? 'Tutup' : 'Close'}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Plot Card details */}
          <div className="rounded-2xl border border-[#E6EBF0] bg-[#F7F9FB] p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F1F3] text-[#237F8E] shrink-0 border border-[#237F8E]/25">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-extrabold text-[#14232B] truncate">{field.name}</h2>
                <p className="text-xs text-[#5F6B74] mt-0.5">
                  Desa {field.village}, Kec. {field.district}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E6EBF0] grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-white p-2 border border-[#E6EBF0]">
                <span className="text-[10px] font-bold text-[#5F6B74] uppercase block">
                  {isId ? 'Luas' : 'Area'}
                </span>
                <span className="text-xs font-extrabold text-[#237F8E] font-mono tabular-nums">
                  {field.areaHectares} ha
                </span>
              </div>
              <div className="rounded-lg bg-white p-2 border border-[#E6EBF0]">
                <span className="text-[10px] font-bold text-[#5F6B74] uppercase block">
                  {isId ? 'Elevasi' : 'Elevation'}
                </span>
                <span className="text-xs font-extrabold text-[#14232B] font-mono tabular-nums">
                  {field.elevationMeters} m
                </span>
              </div>
              <div className="rounded-lg bg-white p-2 border border-[#E6EBF0]">
                <span className="text-[10px] font-bold text-[#5F6B74] uppercase block">
                  {isId ? 'Lereng' : 'Slope'}
                </span>
                <span className="text-xs font-extrabold text-[#B7791F] font-mono tabular-nums">
                  {field.soil.slope}%
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsPlotDrawerOpen(false);
                onBackToMap();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#E6EBF0] bg-white hover:bg-[#E3F1F3] hover:border-[#237F8E] py-2 text-xs font-bold text-[#14232B] hover:text-[#237F8E] transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-[#237F8E]" />
              <span>{isId ? 'Ganti Petak / Peta 3D' : 'Change Plot / 3D Map'}</span>
            </button>
          </div>

          {/* Quick Dialog Actions */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6B74] block">
              {isId ? 'Referensi & Dokumentasi' : 'References & Docs'}
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {onOpenDataSources && (
                <button
                  type="button"
                  onClick={() => {
                    setIsPlotDrawerOpen(false);
                    onOpenDataSources();
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] hover:bg-[#E3F1F3] p-2.5 font-semibold text-[#14232B] text-xs transition cursor-pointer"
                >
                  <Database className="h-3.5 w-3.5 text-[#237F8E]" />
                  <span>{isId ? 'Katalog Data' : 'Data Catalog'}</span>
                </button>
              )}
              {onOpenGlossary && (
                <button
                  type="button"
                  onClick={() => {
                    setIsPlotDrawerOpen(false);
                    onOpenGlossary();
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] hover:bg-[#E3F1F3] p-2.5 font-semibold text-[#14232B] text-xs transition cursor-pointer"
                >
                  <BookOpen className="h-3.5 w-3.5 text-[#237F8E]" />
                  <span>{isId ? 'Glosarium' : 'Glossary'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E6EBF0] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#5F6B74] text-[11px]">{isId ? 'Sumber Data:' : 'Data Source:'}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold font-mono ${
                dataMode === 'live' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {dataMode === 'live' ? 'Live API' : `Offline (${SNAPSHOT_DATE})`}
            </span>
          </div>
          <div className="text-[10px] text-[#5F6B74] text-center font-mono">
            &copy; 2026 FIELD SHIFT &middot; NASA Space Apps
          </div>
        </div>
      </aside>

      {/* ================================================================ */}
      {/* 1. TABLET / DESKTOP COLLAPSIBLE SIDEBAR                          */}
      {/* ================================================================ */}
      <aside
        className={`
          hidden md:flex flex-col justify-between shrink-0 bg-white border-r border-[#E6EBF0] h-screen sticky top-0 transition-all duration-300 ease-in-out z-20 shadow-[4px_0_24px_rgba(15,23,42,0.03)]
          ${isSidebarCollapsed ? 'w-18 p-3' : 'w-76 lg:w-80 p-5 overflow-y-auto'}
        `}
      >
        {/* COLLAPSED (ICON-RAIL) MODE */}
        {isSidebarCollapsed ? (
          <div className="flex flex-col items-center justify-between h-full py-2">
            <div className="flex flex-col items-center gap-5 w-full">
              {/* Brand Icon & Expand Button */}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3F1F3] hover:bg-[#d6ebef] text-[#237F8E] transition active:scale-95 cursor-pointer shadow-2xs border border-[#237F8E]/25"
                title={isId ? 'Buka Sidebar (Expand)' : 'Expand Sidebar'}
              >
                <PanelLeftOpen className="h-5 w-5" />
              </button>

              {/* Plot Mini Pin with Tooltip */}
              <button
                type="button"
                onClick={onBackToMap}
                className="group relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#F7F9FB] hover:bg-[#E3F1F3] border border-[#E6EBF0] text-[#237F8E] transition active:scale-95 cursor-pointer"
                title={`${field.name} (${field.areaHectares} ha)`}
              >
                <MapPin className="h-4 w-4" />
              </button>

              <div className="w-8 border-t border-[#E6EBF0]" />

              {/* Stepper Icon Rail */}
              <div className="flex flex-col items-center gap-3 w-full">
                {WORKFLOW_STEPS.map((step, idx) => {
                  const isActive = activeSubTab === step.key;
                  const isCompleted = currentStepIdx > idx;
                  const StepIcon = step.icon;
                  return (
                    <button
                      key={step.key}
                      type="button"
                      onClick={() => handleStepSelect(step.key)}
                      className={`relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#237F8E] text-white shadow-md'
                          : isCompleted
                          ? 'bg-[#E3F1F3] text-[#1B6572] hover:bg-[#d6ebef]'
                          : 'bg-[#F7F9FB] text-[#5F6B74] hover:bg-slate-100 border border-[#E6EBF0]'
                      }`}
                      title={`${step.stepNum}. ${isId ? step.titleId : step.titleEn}`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-[#1B6572]" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-mono font-extrabold text-[#14232B] shadow-xs border border-[#E6EBF0]">
                        {step.stepNum}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Icon Rail Actions */}
            <div className="flex flex-col items-center gap-3 w-full pt-4 border-t border-[#E6EBF0]">
              {onToggleLang && (
                <button
                  type="button"
                  onClick={onToggleLang}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E6EBF0] bg-[#F7F9FB] hover:bg-[#E3F1F3] text-[10px] font-mono font-extrabold text-[#237F8E] transition active:scale-95 cursor-pointer"
                  title={isId ? 'Ganti Bahasa' : 'Switch Language'}
                >
                  {isId ? 'EN' : 'ID'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5F6B74] hover:text-[#14232B] hover:bg-[#F7F9FB] transition cursor-pointer"
                title={isId ? 'Buka Sidebar Penuh' : 'Expand Full Sidebar'}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          /* EXPANDED FULL SIDEBAR MODE */
          <>
            <div className="space-y-5">
              {/* Top Brand Header & Collapse Toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E6EBF0]">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold tracking-tight text-[#14232B]">
                    FIELD <span className="text-[#237F8E]">SHIFT</span>
                  </span>
                  <span className="rounded-full bg-[#E3F1F3] px-2 py-0.5 text-[9px] font-extrabold text-[#1B6572] font-mono border border-[#237F8E]/20">
                    WORKSPACE
                  </span>
                </div>

                {/* Sidebar Collapse Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] hover:bg-[#E3F1F3] text-[#5F6B74] hover:text-[#237F8E] transition active:scale-95 cursor-pointer shadow-2xs"
                  title={isId ? 'Ciutkan Sidebar (Maksimalkan Kanvas)' : 'Collapse Sidebar (Maximize Canvas)'}
                  aria-label={isId ? 'Ciutkan Sidebar' : 'Collapse Sidebar'}
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
              </div>

              {/* Plot Identity Summary Box */}
              <div className="rounded-2xl border border-[#E6EBF0] bg-[#F7F9FB] p-3.5 shadow-2xs space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E3F1F3] text-[#237F8E] shrink-0 border border-[#237F8E]/25">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xs font-extrabold text-[#14232B] truncate" title={field.name}>
                      {field.name}
                    </h2>
                    <p className="text-[11px] text-[#5F6B74] mt-0.5 truncate">
                      Desa {field.village}, Kec. {field.district}
                    </p>
                  </div>
                </div>

                {/* Quick Metrics Grid */}
                <div className="pt-2 border-t border-[#E6EBF0] grid grid-cols-3 gap-1.5 text-center">
                  <div className="rounded-lg bg-white p-1.5 border border-[#E6EBF0]">
                    <span className="text-[9px] font-bold text-[#5F6B74] uppercase block">
                      {isId ? 'Luas' : 'Area'}
                    </span>
                    <span className="text-xs font-extrabold text-[#237F8E] font-mono tabular-nums">
                      {field.areaHectares} ha
                    </span>
                  </div>
                  <div className="rounded-lg bg-white p-1.5 border border-[#E6EBF0]">
                    <span className="text-[9px] font-bold text-[#5F6B74] uppercase block">
                      {isId ? 'Elevasi' : 'Elevation'}
                    </span>
                    <span className="text-xs font-extrabold text-[#14232B] font-mono tabular-nums">
                      {field.elevationMeters} m
                    </span>
                  </div>
                  <div className="rounded-lg bg-white p-1.5 border border-[#E6EBF0]">
                    <span className="text-[9px] font-bold text-[#5F6B74] uppercase block">
                      {isId ? 'Lereng' : 'Slope'}
                    </span>
                    <span className="text-xs font-extrabold text-[#B7791F] font-mono tabular-nums">
                      {field.soil.slope}%
                    </span>
                  </div>
                </div>

                {/* Back to 3D Map Button inside Plot card */}
                <button
                  type="button"
                  onClick={onBackToMap}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-[#E6EBF0] bg-white hover:bg-[#E3F1F3] hover:border-[#237F8E] py-1.5 text-xs font-bold text-[#14232B] hover:text-[#237F8E] transition active:scale-95 cursor-pointer shadow-2xs"
                >
                  <ArrowLeft className="h-3.5 w-3.5 text-[#237F8E]" />
                  <span>{isId ? 'Ganti Petak / Peta 3D' : 'Change Plot / 3D Map'}</span>
                </button>
              </div>

              {/* Consultation Pipeline Stepper (Redesigned Continuous Timeline) */}
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#237F8E]">
                    {isId ? 'Alur Kerja Konsultasi' : 'Consultation Pipeline'}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#5F6B74]">
                    {currentStepIdx + 1}/3
                  </span>
                </div>

                {/* Stepper Timeline Container */}
                <div className="relative pl-6 space-y-4">
                  {/* Continuous Timeline Connecting Rail */}
                  <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-slate-200" />
                  {/* Progress portion of rail */}
                  <div
                    className="absolute left-2.5 top-3 w-0.5 bg-[#237F8E] transition-all duration-300"
                    style={{
                      height: `${(currentStepIdx / (WORKFLOW_STEPS.length - 1)) * 80}%`,
                    }}
                  />

                  {WORKFLOW_STEPS.map((step, idx) => {
                    const isActive = activeSubTab === step.key;
                    const isCompleted = currentStepIdx > idx;
                    const StepIcon = step.icon;

                    return (
                      <div key={step.key} className="relative">
                        {/* Stepper Circular Node */}
                        <div
                          className={`absolute -left-6 top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-mono font-bold transition-all z-10 ${
                            isActive
                              ? 'bg-[#237F8E] text-white ring-4 ring-[#E3F1F3] shadow-xs'
                              : isCompleted
                              ? 'bg-[#1E5B4F] text-white'
                              : 'bg-white border-2 border-slate-300 text-[#5F6B74]'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="h-3 w-3" /> : step.stepNum}
                        </div>

                        {/* Step Card Button */}
                        <button
                          type="button"
                          onClick={() => handleStepSelect(step.key)}
                          className={`w-full text-left rounded-xl p-3 transition-all duration-200 border cursor-pointer ${
                            isActive
                              ? 'bg-[#E3F1F3]/60 border-[#237F8E] shadow-2xs'
                              : 'bg-white hover:bg-[#F7F9FB] border-[#E6EBF0]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <StepIcon
                              className={`h-3.5 w-3.5 shrink-0 ${
                                isActive ? 'text-[#237F8E]' : 'text-[#5F6B74]'
                              }`}
                            />
                            <h3
                              className={`text-xs font-bold leading-tight truncate ${
                                isActive ? 'text-[#1B6572]' : 'text-[#14232B]'
                              }`}
                            >
                              {isId ? step.titleId : step.titleEn}
                            </h3>
                          </div>
                          <p className="text-[11px] text-[#5F6B74] mt-1 line-clamp-2 leading-relaxed">
                            {isId ? step.descId : step.descEn}
                          </p>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar Footer Info */}
            <div className="mt-6 pt-4 border-t border-[#E6EBF0] space-y-3">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-[#5F6B74] flex items-center gap-1.5 text-[11px]">
                  <Database className="h-3.5 w-3.5 text-[#237F8E]" />
                  {isId ? 'Sumber Data:' : 'Data Source:'}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold font-mono ${
                    dataMode === 'live' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {dataMode === 'live' ? 'Live API' : `Offline (${SNAPSHOT_DATE})`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {onOpenDataSources && (
                  <button
                    type="button"
                    onClick={onOpenDataSources}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] hover:bg-[#E3F1F3] hover:border-[#237F8E] p-2 font-semibold text-[#14232B] text-[11px] transition cursor-pointer"
                  >
                    <Database className="h-3.5 w-3.5 text-[#237F8E]" />
                    <span>{isId ? 'Katalog Data' : 'Data Catalog'}</span>
                  </button>
                )}
                {onOpenGlossary && (
                  <button
                    type="button"
                    onClick={onOpenGlossary}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] hover:bg-[#E3F1F3] hover:border-[#237F8E] p-2 font-semibold text-[#14232B] text-[11px] transition cursor-pointer"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-[#237F8E]" />
                    <span>{isId ? 'Glosarium' : 'Glossary'}</span>
                  </button>
                )}
              </div>

              <div className="text-[10px] text-[#5F6B74] text-center pt-1 font-mono">
                &copy; 2026 FIELD SHIFT &middot; NASA Space Apps
              </div>
            </div>
          </>
        )}
      </aside>

      {/* ================================================================ */}
      {/* 2. MAIN CONTENT VIEWPORT                                         */}
      {/* ================================================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Status Header */}
        <header className="sticky top-0 z-30 border-b border-[#E6EBF0] bg-white/95 px-3.5 sm:px-6 py-2.5 sm:py-3 shadow-2xs backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Quick Back to Map on Mobile (Leftmost) */}
            <button
              type="button"
              onClick={onBackToMap}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] hover:bg-[#E3F1F3] text-[#237F8E] transition active:scale-95 cursor-pointer shrink-0"
              title={isId ? 'Kembali ke Peta 3D' : 'Back to 3D Map'}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            {/* Context breadcrumb & plot identity */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-[#5F6B74]">
                <span className="font-extrabold text-[#14232B] truncate">{field.name}</span>
                <ChevronRight className="h-3 w-3 text-slate-400 shrink-0 hidden sm:inline" />
                <span className="text-[#237F8E] font-bold truncate hidden sm:inline">
                  {isId
                    ? WORKFLOW_STEPS[currentStepIdx].titleId
                    : WORKFLOW_STEPS[currentStepIdx].titleEn}
                </span>
              </div>
              <p className="text-[10px] text-[#5F6B74] truncate">
                Desa {field.village} &middot; <span className="font-mono text-[#237F8E] font-semibold">{field.areaHectares} ha</span>
              </p>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile Plot Specs Sheet Trigger Button */}
            <button
              type="button"
              onClick={() => setIsPlotDrawerOpen(true)}
              className="md:hidden flex items-center gap-1 rounded-full border border-[#E6EBF0] bg-[#F7F9FB] hover:bg-[#E3F1F3] px-2.5 py-1 text-xs font-bold text-[#14232B] transition active:scale-95 cursor-pointer shadow-2xs"
              title={isId ? 'Buka Detail Spesifikasi Petak' : 'Open Plot Details'}
            >
              <Info className="h-3.5 w-3.5 text-[#237F8E]" />
              <span className="text-[11px] text-[#237F8E]">{isId ? 'Info' : 'Info'}</span>
            </button>

            {/* Language Switcher */}
            {onToggleLang && (
              <button
                type="button"
                onClick={onToggleLang}
                className="flex items-center gap-1.5 rounded-full border border-[#E6EBF0] bg-white hover:bg-[#F7F9FB] px-2.5 sm:px-3 py-1.5 text-xs font-bold text-[#14232B] shadow-2xs transition active:scale-95 cursor-pointer"
                title={isId ? 'Ganti ke Bahasa Inggris' : 'Switch to Indonesian'}
              >
                <span className="text-[11px] font-mono font-extrabold text-[#237F8E]">
                  {isId ? 'EN' : 'ID'}
                </span>
                <span className="text-[10px] text-[#5F6B74] hidden sm:inline">
                  {isId ? 'English' : 'Indonesia'}
                </span>
              </button>
            )}

            {/* Desktop Step Action Advance Button */}
            <div className="hidden md:flex items-center gap-2">
              {activeSubTab === 'profile' && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-2 rounded-full bg-[#237F8E] hover:bg-[#1B6572] text-white px-4 py-2 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <span>{isId ? 'Lanjut ke Optimasi Rotasi' : 'Proceed to Optimizer'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}

              {activeSubTab === 'optimizer' && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-2 rounded-full bg-[#237F8E] hover:bg-[#1B6572] text-white px-4 py-2 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <span>{isId ? 'Buka Lembar Konsultasi PPL' : 'Open Consultation Brief'}</span>
                  <FileText className="h-3.5 w-3.5" />
                </button>
              )}

              {activeSubTab === 'export' && (
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 rounded-full border border-[#237F8E] bg-[#E3F1F3] hover:bg-[#d6ebef] text-[#1B6572] px-4 py-2 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer print:hidden"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>{isId ? 'Cetak Dokumen PPL' : 'Print Brief'}</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Step Viewport with extra bottom padding for mobile sticky action bar */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-28 md:pb-8">
          {/* Mobile High-Precision Segmented Stepper Bar */}
          <div className="md:hidden p-1 rounded-2xl bg-white border border-[#E6EBF0] mb-5 shadow-2xs grid grid-cols-3 gap-1">
            {WORKFLOW_STEPS.map((step, idx) => {
              const isActive = activeSubTab === step.key;
              const isCompleted = currentStepIdx > idx;
              const StepIcon = step.icon;
              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => handleStepSelect(step.key)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl transition cursor-pointer text-center ${
                    isActive
                      ? 'bg-[#237F8E] text-white shadow-xs font-bold'
                      : isCompleted
                      ? 'bg-[#E3F1F3]/50 text-[#1B6572] font-semibold'
                      : 'text-[#5F6B74] hover:bg-slate-50'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#1B6572] shrink-0" />
                  ) : (
                    <StepIcon className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span className="truncate text-[11px]">
                    {isId ? step.shortTitleId : step.shortTitleEn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* SUB-TAB 1: PEDOLOGY & NASA SATELLITE CLIMATOLOGY (WITH MINI MAP INSET) */}
          {activeSubTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-[#237F8E] uppercase">
                    {isId ? '/ LANGKAH 01 · PEDOLOGI & AGROKLIMAT' : '/ STEP 01 · PEDOLOGY & HYDROMETEOROLOGY'}
                  </span>
                  <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#14232B]">
                    {isId ? (
                      <>
                        Profil Tanah & NASA <span className="text-[#237F8E]">Agroklimat</span>
                      </>
                    ) : (
                      <>
                        Soil Profile & NASA <span className="text-[#237F8E]">Climatology</span>
                      </>
                    )}
                  </h2>
                  <p className="mt-1 max-w-2xl text-xs sm:text-sm text-[#5F6B74] leading-relaxed">
                    {isId
                      ? `Observasi satelit NASA POWER (normal 1991–2020), model elevasi SRTM 30 m dan estimasi tekstur tanah SoilGrids untuk petak ${field.name}.`
                      : `NASA POWER satellite observations (1991–2020 normals), SRTM 30m elevation model, and SoilGrids texture estimates for plot ${field.name}.`}
                  </p>
                </div>
              </div>

              {/* Field Profile View with Mini Satellite Map Inset embedded */}
              <FieldProfileView
                field={field}
                onOpenFullMap={onBackToMap}
                currentLang={currentLang}
              />
            </div>
          )}

          {/* SUB-TAB 2: ROTATION OPTIMIZER (SPRINT 1 DECISION ENGINE) */}
          {activeSubTab === 'optimizer' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-[#237F8E] uppercase">
                    {isId ? '/ LANGKAH 02 · MESIN KEPUTUSAN & UJI STRES' : '/ STEP 02 · DECISION ENGINE & STRESS-TEST'}
                  </span>
                  <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#14232B]">
                    {isId ? (
                      <>
                        Optimasi Multi-Objektif <span className="text-[#237F8E]">Pola Tanam</span>
                      </>
                    ) : (
                      <>
                        Crop Rotation Multi-Objective <span className="text-[#237F8E]">Optimizer</span>
                      </>
                    )}
                  </h2>
                  <p className="mt-1 max-w-2xl text-xs sm:text-sm text-[#5F6B74] leading-relaxed">
                    {isId
                      ? 'Simulasi trade-off multi-objektif Pareto dan estimasi Conditional Value at Risk (CVaR) berdasarkan skenario iklim ekstrem.'
                      : 'Pareto multi-objective trade-off simulation and Conditional Value at Risk (CVaR) estimation under extreme climate scenarios.'}
                  </p>
                </div>
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
                <p className="-mt-4 text-xs text-amber-700 font-medium">
                  {isId
                    ? 'Backend offline: rotasi baseline yang diubah baru dihitung saat API tersambung.'
                    : 'Backend offline: modified baseline rotation will be recalculated once the live API is connected.'}
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
                isCalculating={isCalculating}
              />
            </div>
          )}

          {/* SUB-TAB 3: EXTENSION CONSULTATION BRIEF (SPRINT 2 PRINT ENGINE) */}
          {activeSubTab === 'export' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-[#237F8E] uppercase">
                    {isId ? '/ LANGKAH 03 · LEMBAR KONSULTASI PPL & AUDIT RISIKO' : '/ STEP 03 · PPL EXTENSION BRIEF & RISK AUDIT'}
                  </span>
                  <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#14232B]">
                    {isId ? (
                      <>
                        Lembar Rekomendasi & <span className="text-[#237F8E]">Konsultasi PPL</span>
                      </>
                    ) : (
                      <>
                        Recommendation Brief & <span className="text-[#237F8E]">PPL Consultation</span>
                      </>
                    )}
                  </h2>
                  <p className="mt-1 max-w-2xl text-xs sm:text-sm text-[#5F6B74] leading-relaxed">
                    {isId
                      ? 'Dokumen cetak resmi untuk penyuluh pertanian lapangan (PPL) dan petani guna memverifikasi kondisi lapangan dan risiko lokal sebelum masa tanam.'
                      : 'Official printable brief for agricultural extension officers (PPL) and farmers to verify field conditions and local risks before planting.'}
                  </p>
                </div>
              </div>

              <SummaryBrief
                field={field}
                strategies={strategies}
                weights={weights}
                climatePhase={climatePhase}
                constraints={constraints}
                scenario={scenario}
                verifiedChecks={verifiedChecks}
              />
            </div>
          )}
        </main>

        {/* ================================================================ */}
        {/* 3. MOBILE DOCKED THUMB ACTION BAR (FIXED AT BOTTOM FOR MOBILE)   */}
        {/* ================================================================ */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E6EBF0] p-3 px-4 shadow-[0_-8px_25px_rgba(15,23,42,0.08)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {/* Previous Step Button if not on Step 1 */}
            {currentStepIdx > 0 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E6EBF0] bg-[#F7F9FB] hover:bg-[#E3F1F3] text-[#5F6B74] hover:text-[#237F8E] transition active:scale-95 cursor-pointer shrink-0"
                title={isId ? 'Kembali ke Langkah Sebelumnya' : 'Back to Previous Step'}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}

            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-mono text-[#5F6B74] uppercase tracking-wider font-bold">
                {isId ? `Langkah ${currentStepIdx + 1}/3` : `Step ${currentStepIdx + 1}/3`}
              </span>
              <span className="text-xs font-bold text-[#14232B] truncate">
                {isId ? WORKFLOW_STEPS[currentStepIdx].shortTitleId : WORKFLOW_STEPS[currentStepIdx].shortTitleEn}
              </span>
            </div>
          </div>

          <div className="shrink-0">
            {activeSubTab === 'profile' && (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-1.5 rounded-full bg-[#237F8E] hover:bg-[#1B6572] text-white px-4 py-2.5 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
              >
                <span>{isId ? 'Lanjut: Optimasi' : 'Next: Optimizer'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}

            {activeSubTab === 'optimizer' && (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-1.5 rounded-full bg-[#237F8E] hover:bg-[#1B6572] text-white px-4 py-2.5 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
              >
                <span>{isId ? 'Lanjut: Lembar PPL' : 'Next: Brief'}</span>
                <FileText className="h-3.5 w-3.5" />
              </button>
            )}

            {activeSubTab === 'export' && (
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-full border border-[#237F8E] bg-[#E3F1F3] hover:bg-[#d6ebef] text-[#1B6572] px-4 py-2.5 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>{isId ? 'Cetak Lembar PPL' : 'Print Brief'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
