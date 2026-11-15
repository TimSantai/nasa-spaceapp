import { useState, useEffect } from 'react';
import { Sprout, ArrowRight, Menu, X, Globe } from 'lucide-react';
import type { Language } from '../../types/landing';

interface LandingNavbarProps {
  onOpenWorkspace: () => void;
  currentLang?: Language;
  onToggleLang?: () => void;
}

export function LandingNavbar({
  onOpenWorkspace,
  currentLang = 'en',
  onToggleLang,
}: LandingNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('hero');
  const isId = currentLang === 'id';

  // Dynamic Scroll Spy: automatically update active nav pill as the user scrolls
  useEffect(() => {
    const handleScroll = () => {
      // Bottom of page check
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 80
      ) {
        setActiveNav('why-field-shift');
        return;
      }

      // Top of page check
      if (window.scrollY < 140) {
        setActiveNav('hero');
        return;
      }

      // Offset from top accounting for floating island navbar
      const scrollPosition = window.scrollY + 200;
      const sectionIds = ['why-field-shift', 'how-it-works', 'about', 'hero'];

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          if (scrollPosition >= top) {
            setActiveNav(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollTo = (id: string) => {
    setActiveNav(id);
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 90;
      const targetY = element.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'smooth',
      });
    }
  };

  const NAV_ITEMS = [
    { id: 'hero', label: isId ? 'Beranda' : 'Home' },
    { id: 'about', label: isId ? 'Tentang Kami' : 'About Us' },
    { id: 'how-it-works', label: isId ? 'Cara Kerja' : 'How It Works' },
    { id: 'why-field-shift', label: isId ? 'Keunggulan' : 'Why Us' },
  ];

  return (
    <header className="sticky top-3 sm:top-4 z-50 mx-auto max-w-7xl px-3 sm:px-6 transition-all duration-300 pointer-events-none">
      <div className="pointer-events-auto rounded-full bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] px-4 py-2 sm:py-2.5 sm:px-6 flex items-center justify-between">
        
        {/* Left: Brand with Fresh Light Mint Container */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E3F1F3] text-[#237F8E] border border-[#237F8E]/25 shadow-2xs">
            <Sprout className="h-4.5 w-4.5" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-[#14232B]">
            FIELD <span className="text-[#237F8E]">SHIFT</span>
          </span>
        </div>

        {/* Center: Clean & Airy Frosted Nav Bar with Rounded Pill Shape */}
        <nav className="hidden md:flex items-center gap-1 rounded-full bg-slate-100/80 backdrop-blur-md p-1 border border-slate-200/80 shadow-2xs">
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.id;
            return isActive ? (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-[#237F8E] shadow-2xs border border-slate-200/70 transition cursor-pointer"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#237F8E] inline-block" />
                <span>{item.label}</span>
              </button>
            ) : (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#5F6B74] hover:text-[#14232B] hover:bg-white/60 transition cursor-pointer"
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Language Switch + Signature Teal CTA Button & Mobile Toggle */}
        <div className="flex items-center gap-2">
          {onToggleLang && (
            <button
              type="button"
              onClick={onToggleLang}
              className="flex items-center gap-1 rounded-full border border-slate-200/90 bg-slate-100/90 hover:bg-white text-xs font-bold text-[#14232B] px-3 py-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
              aria-label={isId ? 'Ganti ke Bahasa Inggris' : 'Switch to Indonesian'}
              title={isId ? 'Ganti ke Bahasa Inggris' : 'Switch to Indonesian'}
            >
              <Globe className="h-3.5 w-3.5 text-[#237F8E]" />
              <span className={isId ? 'text-[#237F8E] font-extrabold' : 'text-[#5F6B74]'}>ID</span>
              <span className="text-slate-300">/</span>
              <span className={!isId ? 'text-[#237F8E] font-extrabold' : 'text-[#5F6B74]'}>EN</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenWorkspace()}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#237F8E] to-[#1E5B4F] hover:from-[#1B6572] hover:to-[#17463c] text-white font-bold px-4 sm:px-5 py-2 text-xs shadow-xs hover:shadow transition active:scale-[0.98] cursor-pointer"
          >
            <span>{isId ? 'Buka Aplikasi' : 'Launch App'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="pointer-events-auto mt-2 md:hidden rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xl p-3 shadow-xl">
          <div className="grid grid-cols-2 gap-1.5 text-xs font-medium">
            {NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  className={`rounded-xl p-2.5 text-left transition cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#E3F1F3] text-[#1B6572] font-bold border border-[#237F8E]/25'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#237F8E]" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {onToggleLang && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                {isId ? 'Bahasa:' : 'Language:'}
              </span>
              <button
                type="button"
                onClick={onToggleLang}
                className="flex items-center gap-1 rounded-full border border-slate-200/90 bg-slate-100 px-3 py-1 font-bold text-xs"
              >
                <Globe className="h-3.5 w-3.5 text-[#237F8E]" />
                <span className={isId ? 'text-[#237F8E] font-extrabold' : 'text-[#5F6B74]'}>ID</span>
                <span className="text-slate-300">/</span>
                <span className={!isId ? 'text-[#237F8E] font-extrabold' : 'text-[#5F6B74]'}>EN</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default LandingNavbar;
