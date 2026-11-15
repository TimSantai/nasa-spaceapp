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
  onOpenWorkspace: (targetField?: FieldProfile) => void;
  currentLang?: Language;
  onToggleLang?: () => void;
  userCoords?: { latitude: number; longitude: number } | null;
  onRequestLocation?: () => void;
  nearestField?: FieldProfile | null;
  nearestDistanceKm?: number | null;
  isLocating?: boolean;
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
}: LandingPageProps) {
  const [internalLang, setInternalLang] = useState<Language>('en');
  const currentLang = externalLang || internalLang;

  // Keep lang toggle available for future use
  if (externalToggleLang) {
    // external toggle provided
  } else {
    // internal toggle fallback (no-op unless wired)
    void setInternalLang;
  }

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
      {/* 1. Navbar */}
      <LandingNavbar onOpenWorkspace={onOpenWorkspace} />

      <main>
        {/* 1. Hero — Headline, description, farming photo, CTA */}
        <HeroSection
          currentLang={currentLang}
          onOpenWorkspace={onOpenWorkspace}
          onScrollToDemo={handleScrollToAbout}
          userCoords={userCoords}
          onRequestLocation={onRequestLocation}
          nearestField={nearestField}
          nearestDistanceKm={nearestDistanceKm}
          isLocating={isLocating}
        />

        {/* 2. About — Brief explanation of Field Shift */}
        <AboutSection onOpenWorkspace={onOpenWorkspace} />

        {/* 3. How It Works — Select Land → Analyze → Compare */}
        <HowItWorksSection onOpenWorkspace={onOpenWorkspace} />

        {/* 4. Why Field Shift — NASA Data, Climate-Aware, Evidence-Based */}
        <WhyFieldShiftSection onOpenWorkspace={onOpenWorkspace} />
      </main>

      {/* 5. CTA + Footer — Explore Field Shift */}
      <CtaFooterSection onOpenWorkspace={onOpenWorkspace} />

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
