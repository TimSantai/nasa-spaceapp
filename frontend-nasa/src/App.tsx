import { useState, useEffect, useMemo } from 'react';
import { applyWeights } from './lib/scoring';
import { MOCK_FIELDS, SNAPSHOT_CROP_LABELS, snapshotStrategies } from './api/mock/mockData';
import { baselineFromRotation, fetchFields, fetchSiteInfo, fetchStrategies, siteOf } from './api/fieldshift';
import { FieldMap } from './features/map/FieldMap';
import { PlotAnalysisWorkspace } from './features/analysis/PlotAnalysisWorkspace';
import { EvidenceModal } from './features/evidence-card/EvidenceModal';
import { GlossaryModal } from './features/glossary/GlossaryModal';
import { DataSourcesModal } from './components/landing/DataSourcesModal';
import { LandingPage } from './pages/LandingPage';
import type { FieldProfile, Strategy, PriorityWeights, ClimatePhase, FarmerConstraints, ClimateScenario } from './types/domain';
import type { Language } from './types/landing';

export function App() {
  // Mode: Landing Page (default) vs Fullscreen Interactive Map vs Deep-Dive Analysis
  const [viewMode, setViewMode] = useState<'landing' | 'workspace' | 'analysis'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash.includes('analysis')) return 'analysis';
      if (path.includes('/app') || hash.includes('app') || hash.includes('workspace')) {
        return 'workspace';
      }
    }
    return 'landing';
  });

  const [currentLang, setCurrentLang] = useState<Language>('en');
  // Real data from the backend; the offline snapshot (also real output) is shown until it loads
  const [fields, setFields] = useState<FieldProfile[]>(MOCK_FIELDS);
  const [selectedField, setSelectedField] = useState<FieldProfile>(MOCK_FIELDS[0]);
  const [dataMode, setDataMode] = useState<'live' | 'snapshot'>('snapshot');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isDataSourcesOpen, setIsDataSourcesOpen] = useState(false);
  const [evidenceStrategy, setEvidenceStrategy] = useState<Strategy | null>(null);

  // Climate forcing state (Aug-Oct 2025 ONI was ENSO-neutral)
  const [climatePhase, setClimatePhase] = useState<ClimatePhase>('normal');

  // Farmer constraints state
  const [constraints, setConstraints] = useState<FarmerConstraints>({
    irrigationAccess: true,
    machineryAccess: true,
    marketAccess: true,
  });

  // Interactive climate scenario stress test
  const [scenario, setScenario] = useState<ClimateScenario>({
    rainfallAnomalyPercent: 0,
    temperatureAnomalyDelta: 0,
  });

  // PPL Field Verification Checklist persistence
  // Nothing is verified until the extension officer ticks it in the evidence card
  const [verifiedChecks, setVerifiedChecks] = useState<Record<string, boolean>>({});

  const handleToggleCheck = (checkText: string) => {
    setVerifiedChecks((prev) => ({
      ...prev,
      [checkText]: !prev[checkText],
    }));
  };

  // Multi-objective weighting (sums to 100)
  const [weights, setWeights] = useState<PriorityWeights>({
    waterEfficiency: 25,
    soilHealth: 20,
    coverDays: 15,
    erosionControl: 25,
    pestBreak: 15,
  });

  // Farmer-entered current rotation per field (defaults to the field's recorded rotation)
  const [baselines, setBaselines] = useState<Record<string, Record<string, string>>>({});
  const [cropLabels, setCropLabels] = useState<Record<string, string>>(SNAPSHOT_CROP_LABELS);
  const initialBaseline = baselineFromRotation(selectedField);
  const currentBaseline = baselines[selectedField.id] ?? initialBaseline;
  const baselineKey = JSON.stringify(currentBaseline);

  useEffect(() => {
    let alive = true;
    fetchSiteInfo('banyumas')
      .then((info) => alive && info?.crop_labels && setCropLabels(info.crop_labels))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  // Strategies from the backend rotation engine for the selected field's site and ENSO phase
  const [currentStrategies, setCurrentStrategies] = useState<Strategy[]>(() => snapshotStrategies('normal'));

  useEffect(() => {
    let alive = true;
    fetchFields()
      .then((live) => {
        if (!alive || live.length === 0) return;
        setFields(live);
        setSelectedField((prev) => live.find((f) => f.id === prev.id) ?? live[0]);
        setDataMode('live');
      })
      .catch(() => alive && setDataMode('snapshot'));
    return () => {
      alive = false;
    };
  }, []);

  // Debounced so dragging the scenario sliders sends one request, not dozens
  useEffect(() => {
    let alive = true;
    const timer = window.setTimeout(() => {
      const fieldId = dataMode === 'live' ? selectedField.id : undefined;
      const baseline = dataMode === 'live' ? (JSON.parse(baselineKey) as Record<string, string>) : undefined;
      fetchStrategies(siteOf(selectedField), climatePhase, fieldId, scenario, baseline)
        .then((s) => alive && setCurrentStrategies(s))
        .catch(() => alive && setCurrentStrategies(snapshotStrategies(climatePhase)));
    }, 350);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [selectedField, climatePhase, scenario, dataMode, baselineKey]);

  // Every score shown (cards, consultation brief) uses the farmer's current weights
  const weightedStrategies = useMemo(() => applyWeights(currentStrategies, weights), [currentStrategies, weights]);

  // Handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('analysis')) {
        setViewMode('analysis');
      } else if (hash.includes('app') || hash.includes('workspace')) {
        setViewMode('workspace');
      } else if (hash.includes('landing') || hash === '' || hash === '#') {
        setViewMode('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleOpenWorkspace = () => {
    setViewMode('workspace');
    window.location.hash = '#workspace';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLanding = () => {
    setViewMode('landing');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAnalysis = (field?: FieldProfile) => {
    if (field) {
      setSelectedField(field);
    }
    setViewMode('analysis');
    window.location.hash = '#analysis';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMap = () => {
    setViewMode('workspace');
    window.location.hash = '#workspace';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleLang = () => {
    setCurrentLang((prev) => (prev === 'id' ? 'en' : 'id'));
  };

  // 1. If in Landing Mode, render the Landing Page
  if (viewMode === 'landing') {
    return (
      <LandingPage
        onOpenWorkspace={handleOpenWorkspace}
        currentLang={currentLang}
        onToggleLang={handleToggleLang}
      />
    );
  }

  // 2. If in Deep-Dive Analysis Mode, render Dedicated Full-Page Workspace
  if (viewMode === 'analysis') {
    return (
      <div className="min-h-screen bg-[#F4F7FA] text-[#14232B]">
        <PlotAnalysisWorkspace
          field={selectedField}
          strategies={weightedStrategies}
          weights={weights}
          onWeightsChange={setWeights}
          climatePhase={climatePhase}
          onClimatePhaseChange={setClimatePhase}
          constraints={constraints}
          onConstraintsChange={setConstraints}
          scenario={scenario}
          onScenarioChange={setScenario}
          verifiedChecks={verifiedChecks}
          onOpenEvidence={(strat) => setEvidenceStrategy(strat)}
          onBackToMap={handleBackToMap}
          onOpenGlossary={() => setIsGlossaryOpen(true)}
          onOpenDataSources={() => setIsDataSourcesOpen(true)}
          currentLang={currentLang}
          dataMode={dataMode}
          baseline={currentBaseline}
          initialBaseline={initialBaseline}
          cropLabels={cropLabels}
          onBaselineChange={(b) => setBaselines((prev) => ({ ...prev, [selectedField.id]: b }))}
        />

        {/* Global Modals accessible across modes */}
        <GlossaryModal
          isOpen={isGlossaryOpen}
          onClose={() => setIsGlossaryOpen(false)}
        />

        <EvidenceModal
          strategy={evidenceStrategy}
          isOpen={!!evidenceStrategy}
          onClose={() => setEvidenceStrategy(null)}
          verifiedChecks={verifiedChecks}
          onToggleCheck={handleToggleCheck}
        />

        <DataSourcesModal
          isOpen={isDataSourcesOpen}
          onClose={() => setIsDataSourcesOpen(false)}
          currentLang={currentLang}
        />
      </div>
    );
  }

  // 3. Otherwise, render 100% Full-Screen 3D Interactive Map Hub
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#F4F7FA]">
      <FieldMap
        fields={fields}
        selectedField={selectedField}
        onSelectField={setSelectedField}
        onOpenAnalysis={handleOpenAnalysis}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onOpenDataSources={() => setIsDataSourcesOpen(true)}
        onBackToLanding={handleBackToLanding}
        currentLang={currentLang}
        onToggleLang={handleToggleLang}
      />

      {/* Global Modals */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      <EvidenceModal
        strategy={evidenceStrategy}
        isOpen={!!evidenceStrategy}
        onClose={() => setEvidenceStrategy(null)}
        verifiedChecks={verifiedChecks}
        onToggleCheck={handleToggleCheck}
      />

      <DataSourcesModal
        isOpen={isDataSourcesOpen}
        onClose={() => setIsDataSourcesOpen(false)}
        currentLang={currentLang}
      />
    </div>
  );
}

export default App;
