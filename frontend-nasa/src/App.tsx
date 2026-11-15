import { useState, useEffect, useMemo } from 'react';
import { applyWeights } from './lib/scoring';
import { MOCK_FIELDS } from './api/mock/mockData';
import { baselineFromRotation, siteOf } from './api/fieldshift';
import { useFieldsQuery, useSiteInfoQuery, useStrategiesQuery } from './features/rotations/useRotationsQuery';
import { FieldMap } from './features/map/FieldMap';
import { PlotAnalysisWorkspace } from './features/analysis/PlotAnalysisWorkspace';
import { EvidenceModal } from './features/evidence-card/EvidenceModal';
import { GlossaryModal } from './features/glossary/GlossaryModal';
import { DataSourcesModal } from './components/landing/DataSourcesModal';
import { GeolocationBanner } from './components/common/GeolocationBanner';
import { LandingPage } from './pages/LandingPage';
import { useGeolocation } from './hooks/useGeolocation';
import { parseHash, buildWorkspaceHash } from './lib/deepLink';
import type { FieldProfile, Strategy, PriorityWeights, ClimatePhase, FarmerConstraints, ClimateScenario } from './types/domain';
import type { Language } from './types/landing';

function isFieldProfile(obj: unknown): obj is FieldProfile {
  return Boolean(
    obj &&
    typeof obj === 'object' &&
    'id' in obj &&
    'coordinates' in obj &&
    Array.isArray((obj as FieldProfile).coordinates)
  );
}

export function App() {
  // Mode: Landing Page (default) vs Fullscreen Interactive Map vs Deep-Dive Analysis
  const [viewMode, setViewMode] = useState<'landing' | 'workspace' | 'analysis'>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseHash(window.location.hash, MOCK_FIELDS);
      if (parsed.viewMode === 'analysis') return 'analysis';
      if (window.location.pathname.toLowerCase().includes('/app') || parsed.viewMode === 'workspace') {
        return 'workspace';
      }
    }
    return 'landing';
  });

  const [currentLang, setCurrentLang] = useState<Language>('id');

  // React Query: Fetch fields catalog (live with snapshot fallback)
  const { fields, dataMode: fieldsDataMode } = useFieldsQuery('banyumas');

  // Active selected field: starts as null for regional basin overview unless explicitly deep-linked
  const [userSelectedField, setUserSelectedField] = useState<FieldProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseHash(window.location.hash, MOCK_FIELDS);
      if (parsed.matchedField) return parsed.matchedField;
    }
    return null;
  });

  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const parsed = parseHash(window.location.hash, MOCK_FIELDS);
      return parsed.query;
    }
    return '';
  });

  const selectedField: FieldProfile | null = isFieldProfile(userSelectedField) ? userSelectedField : null;
  const activePlot = selectedField ?? fields[0];

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
  const initialBaseline = baselineFromRotation(activePlot);
  const currentBaseline = baselines[activePlot.id] ?? initialBaseline;

  // React Query: Fetch site info & metadata (crop labels, data sources)
  const { cropLabels } = useSiteInfoQuery('banyumas');

  // React Query: Reactive Pareto strategies with 300ms debounced scenario & keepPreviousData
  const {
    strategies: rawStrategies,
    dataMode: strategiesDataMode,
    isPlaceholderData: isCalculatingStrategies,
  } = useStrategiesQuery({
    site: siteOf(activePlot),
    phase: climatePhase,
    fieldId: activePlot.id,
    scenario,
    baseline: currentBaseline,
  });

  const dataMode = (fieldsDataMode === 'live' || strategiesDataMode === 'live') ? 'live' : 'snapshot';

  // Sync userSelectedField if fields array updates
  const [prevFields, setPrevFields] = useState<FieldProfile[]>(fields);
  if (fields !== prevFields) {
    setPrevFields(fields);
    if (userSelectedField) {
      const match = fields.find((f) => f.id === userSelectedField.id);
      if (match && match !== userSelectedField) {
        setUserSelectedField(match);
      }
    } else if (typeof window !== 'undefined') {
      const parsed = parseHash(window.location.hash, fields);
      if (parsed.matchedField) {
        setUserSelectedField(parsed.matchedField);
      }
    }
  }

  // Every score shown (cards, consultation brief) uses the farmer's current weights
  const weightedStrategies = useMemo(() => applyWeights(rawStrategies, weights), [rawStrategies, weights]);

  // Handle URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseHash(window.location.hash, fields);
      setViewMode(parsed.viewMode);
      if (parsed.viewMode === 'workspace') {
        setUserSelectedField(parsed.matchedField ?? null);
        setSearchQuery(parsed.query || '');
      } else {
        if (parsed.matchedField) setUserSelectedField(parsed.matchedField);
        if (parsed.query) setSearchQuery(parsed.query);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [fields]);

  // Browser Geolocation hook & nearest plot matching (Issue #19)
  const {
    coords: userCoords,
    status: geoStatus,
    nearestField,
    distanceKm: nearestDistanceKm,
    isPromptVisible,
    requestLocation,
    dismissPrompt,
  } = useGeolocation({
    fields,
    autoPrompt: true,
    lang: currentLang,
  });

  const handleSelectField = (field: FieldProfile) => {
    if (!isFieldProfile(field)) return;
    setUserSelectedField(field);
    setSearchQuery(field.name);
    if (viewMode === 'workspace') {
      const newHash = buildWorkspaceHash(field.id, field.name);
      if (window.location.hash !== newHash) {
        window.history.replaceState(null, '', newHash);
      }
    }
  };

  const handleWorkspaceQueryChange = (q: string) => {
    setSearchQuery(q);
    const newHash = buildWorkspaceHash(selectedField ? selectedField.id : undefined, q);
    if (window.location.hash !== newHash) {
      window.history.replaceState(null, '', newHash);
    }
  };

  const handleOpenWorkspace = (targetField?: FieldProfile, query?: string) => {
    const validTarget = isFieldProfile(targetField) ? targetField : undefined;
    setUserSelectedField(validTarget ?? null);

    const effectiveQuery = typeof query === 'string'
      ? query
      : (validTarget ? validTarget.name : searchQuery);

    if (typeof effectiveQuery === 'string') {
      setSearchQuery(effectiveQuery);
    }
    setViewMode('workspace');
    window.location.hash = buildWorkspaceHash(validTarget ? validTarget.id : undefined, effectiveQuery);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLanding = () => {
    setViewMode('landing');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAnalysis = (field?: FieldProfile) => {
    if (isFieldProfile(field)) {
      handleSelectField(field);
    } else if (!selectedField && fields.length > 0) {
      handleSelectField(fields[0]);
    }
    setViewMode('analysis');
    window.location.hash = '#analysis';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMap = () => {
    setViewMode('workspace');
    window.location.hash = buildWorkspaceHash(selectedField?.id, searchQuery);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleLang = () => {
    setCurrentLang((prev) => (prev === 'id' ? 'en' : 'id'));
  };

  // 1. If in Landing Mode, render the Landing Page
  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage
          onOpenWorkspace={handleOpenWorkspace}
          currentLang={currentLang}
          onToggleLang={handleToggleLang}
          userCoords={userCoords}
          onRequestLocation={requestLocation}
          nearestField={nearestField}
          nearestDistanceKm={nearestDistanceKm}
          isLocating={geoStatus === 'requesting'}
          fields={fields}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />

        {/* Floating Polite Geolocation Pre-Prompt Toast */}
        <GeolocationBanner
          isOpen={isPromptVisible}
          onAllow={requestLocation}
          onDismiss={dismissPrompt}
          isLoading={geoStatus === 'requesting'}
          currentLang={currentLang}
        />
      </>
    );
  }

  // 2. If in Deep-Dive Analysis Mode, render Dedicated Full-Page Workspace
  if (viewMode === 'analysis') {
    return (
      <div className="min-h-screen bg-[#F4F7FA] text-[#14232B]">
        <PlotAnalysisWorkspace
          field={activePlot}
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
          onToggleLang={handleToggleLang}
          dataMode={dataMode}
          isCalculating={isCalculatingStrategies}
          baseline={currentBaseline}
          initialBaseline={initialBaseline}
          cropLabels={cropLabels}
          onBaselineChange={(b) => setBaselines((prev) => ({ ...prev, [activePlot.id]: b }))}
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

        <GeolocationBanner
          isOpen={isPromptVisible}
          onAllow={requestLocation}
          onDismiss={dismissPrompt}
          isLoading={geoStatus === 'requesting'}
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
        onSelectField={handleSelectField}
        onOpenAnalysis={handleOpenAnalysis}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onOpenDataSources={() => setIsDataSourcesOpen(true)}
        onBackToLanding={handleBackToLanding}
        currentLang={currentLang}
        onToggleLang={handleToggleLang}
        userCoords={userCoords}
        onRequestLocation={requestLocation}
        isLocating={geoStatus === 'requesting'}
        initialSearchQuery={searchQuery}
        onSearchQueryChange={handleWorkspaceQueryChange}
        dataMode={dataMode}
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

      {/* Polite Geolocation Pre-Prompt Toast */}
      <GeolocationBanner
        isOpen={isPromptVisible}
        onAllow={requestLocation}
        onDismiss={dismissPrompt}
        isLoading={geoStatus === 'requesting'}
        currentLang={currentLang}
      />
    </div>
  );
}

export default App;
