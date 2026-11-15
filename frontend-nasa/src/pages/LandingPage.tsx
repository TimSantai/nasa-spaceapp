import { useState } from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { AboutSection } from '../components/landing/AboutSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSimple';
import { WhyFieldShiftSection } from '../components/landing/WhyFieldShiftSection';
import { CtaFooterSection } from '../components/landing/CtaFooterSection';
import { DataSourcesModal } from '../components/landing/DataSourcesModal';
import { GlossaryModal } from '../features/glossary/GlossaryModal';
import { EvidenceModal } from '../features/evidence-card/EvidenceModal';
import { MOCK_STRATEGIES } from '../api/mock/mockData';
import type { Language } from '../types/landing';
import type { Strategy, FieldProfile } from '../types/domain';

interface LandingPageProps {
  onOpenWorkspace: (targetField?: FieldProfile, query?: string) => void;
  currentLang?: Language;
  onToggleLang?: () => void;
  userCoords?: { latitude: number; longitude: number } | null;
  onRequestLocation?: () => void;
  nearestField?: FieldProfile | null;
  nearestDistanceKm?: number | null;
  isLocating?: boolean;
  fields?: FieldProfile[];
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

export function LandingPage({
  onOpenWorkspace,
  currentLang: externalLang,
  onToggleLang: externalToggleLang,
  userCoords,
  onRequestLocation,
  nearestField,
  nearestDistanceKm,
  isLocating,
  fields,
  searchQuery,
  onSearchQueryChange,
}: LandingPageProps) {
  const [internalLang, setInternalLang] = useState<Language>('en');
  const currentLang = externalLang || internalLang;

  const handleToggleLang = () => {
    if (externalToggleLang) {
      externalToggleLang();
    } else {
      setInternalLang((prev) => (prev === 'id' ? 'en' : 'id'));
    }
  };

  // Modals state
  const [isDataSourcesOpen, setIsDataSourcesOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [evidenceStrategy, setEvidenceStrategy] = useState<Strategy | null>(null);

  const handleOpenEvidence = (strategyId: string) => {
    const fieldStrategies = MOCK_STRATEGIES['banyumas-karangrau-01'] || Object.values(MOCK_STRATEGIES)[0];
    const matched = fieldStrategies.find((s) => s.id === strategyId) || fieldStrategies[0];
    setEvidenceStrategy(matched);
  };
  // Keep evidence handler accessible for potential deep-link use
  void handleOpenEvidence;

  const handleScrollToAbout = () => {
    const el = document.getElementById('about');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* 1. Navbar with Language Switcher */}
      <LandingNavbar
        onOpenWorkspace={() => onOpenWorkspace()}
        currentLang={currentLang}
        onToggleLang={handleToggleLang}
      />

      <main>
        {/* 1. Hero — Headline, description, farming photo, CTA */}
        <HeroSection
          currentLang={currentLang}
          onOpenWorkspace={onOpenWorkspace}
          onScrollToDemo={handleScrollToAbout}
          fields={fields}
          userCoords={userCoords}
          onRequestLocation={onRequestLocation}
          nearestField={nearestField}
          nearestDistanceKm={nearestDistanceKm}
          isLocating={isLocating}
          initialSearchQuery={searchQuery}
          onSearchQueryChange={onSearchQueryChange}
        />

        {/* 2. About — Brief explanation of Field Shift */}
        <AboutSection
          onOpenWorkspace={() => onOpenWorkspace()}
          currentLang={currentLang}
        />

        {/* 3. How It Works — Select Land → Analyze → Compare */}
        <HowItWorksSection
          onOpenWorkspace={() => onOpenWorkspace()}
          currentLang={currentLang}
        />

        {/* 4. Why Field Shift — NASA Data, Climate-Aware, Evidence-Based */}
        <WhyFieldShiftSection
          onOpenWorkspace={() => onOpenWorkspace()}
          currentLang={currentLang}
        />
      </main>

      {/* 5. CTA + Footer — Explore Field Shift */}
      <CtaFooterSection
        onOpenWorkspace={() => onOpenWorkspace()}
        currentLang={currentLang}
      />

      {/* Utility Modals (kept for deep-link compatibility) */}
      <DataSourcesModal
        isOpen={isDataSourcesOpen}
        onClose={() => setIsDataSourcesOpen(false)}
        currentLang={currentLang}
      />

      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      <EvidenceModal
        strategy={evidenceStrategy}
        isOpen={!!evidenceStrategy}
        onClose={() => setEvidenceStrategy(null)}
      />
    </div>
  );
}

export default LandingPage;
