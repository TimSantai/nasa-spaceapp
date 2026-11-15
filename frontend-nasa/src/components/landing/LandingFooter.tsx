import { Sprout, ExternalLink, Code2, Satellite, BookOpen, Layers, ShieldCheck } from 'lucide-react';
import type { Language } from '../../types/landing';

interface LandingFooterProps {
  currentLang: Language;
  onOpenWorkspace: () => void;
  onOpenGlossary: () => void;
  onOpenDataSources: () => void;
}

  export function LandingFooter({
    currentLang,
    onOpenWorkspace,
    onOpenGlossary,
    onOpenDataSources,
}: LandingFooterProps) {
  const isId = currentLang === 'id';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#E6EBF0] bg-white pt-16 pb-12 text-[#5F6B74]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-[#E6EBF0]">
          {/* Brand & Mission (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E3F1F3] text-[#237F8E] shadow-xs">
                <Sprout className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#14232B]">
                FIELD <span className="text-[#237F8E]">SHIFT</span>
              </span>
            </div>

            <p className="text-xs text-[#5F6B74] leading-relaxed max-w-sm">
              {isId
                ? 'Platform pendukung keputusan rotasi tanaman berbasis asimilasi multi-sensor satelit NASA. Menilai trade-off resiliensi iklim, Conditional Value at Risk (CVaR), dan menjamin transparansi data bagi petani dan penyuluh.'
                : 'Decision-support crop rotation platform assimilating NASA multi-sensor Earth observations. Balancing climate trade-offs and Conditional Value at Risk (CVaR) with radical transparency.'}
            </p>

            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E3F1F3] px-3 py-1 text-[11px] font-bold text-[#1B6572] border border-[#237F8E]/20">
                NASA Space Apps Challenge 2026 &middot; Purwokerto
              </span>
            </div>
          </div>

          {/* Col 2: Product Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#14232B] mb-3">
              {isId ? 'Navigasi Produk' : 'Product Navigation'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={scrollToTop} className="hover:text-[#237F8E] transition">
                  {isId ? 'Beranda' : 'Overview'}
                </button>
              </li>
              <li>
                <button onClick={onOpenWorkspace} className="hover:text-[#237F8E] transition font-semibold text-[#237F8E]">
                  {isId ? 'Workspace Peta & Plot' : 'Interactive Workspace'}
                </button>
              </li>
              <li>
                <a href="#cara-kerja" className="hover:text-[#237F8E] transition">
                  {isId ? 'Alur Kerja 6 Langkah' : '6-Step Scientific Workflow'}
                </a>
              </li>
              <li>
                <a href="#pembeda" className="hover:text-[#237F8E] transition">
                  {isId ? '4 Pilar Novelty' : '4 Novelty Pillars'}
                </a>
              </li>
              <li>
                <a href="#preview-strategi" className="hover:text-[#237F8E] transition">
                  {isId ? 'Simulasi 3 Strategi' : 'Rotation Risk Simulator'}
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Science & Provenance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#14232B] mb-3">
              {isId ? 'Sains & Provenance' : 'Science & Provenance'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={onOpenDataSources} className="flex items-center gap-1.5 hover:text-[#237F8E] transition">
                  <Layers className="h-3.5 w-3.5 text-[#237F8E]" />
                  <span>{isId ? '26 Sumber Data Ilmiah' : '26 Scientific Datasets'}</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenGlossary} className="flex items-center gap-1.5 hover:text-[#237F8E] transition">
                  <BookOpen className="h-3.5 w-3.5 text-[#237F8E]" />
                  <span>{isId ? 'Glosarium Sensor & ET' : 'Sensor & ET Glossary'}</span>
                </button>
              </li>
              <li>
                <a href="#batasan" className="flex items-center gap-1.5 hover:text-[#237F8E] transition">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#237F8E]" />
                  <span>{isId ? 'Batasan & Etika Data' : 'Ethical Limitations'}</span>
                </a>
              </li>
              <li>
                <a
                  href="https://earthdata.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-[#237F8E] transition"
                >
                  <span>NASA Earthdata</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Project & Repository */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#14232B] mb-3">
              {isId ? 'Pengembang & Tim' : 'Project & Repository'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="font-semibold text-[#14232B]">Tim Santai</span>
                <span className="block text-[11px] text-[#5F6B74]">Pasukan Kebal When Yah</span>
              </li>
              <li className="pt-1">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#E6EBF0] px-3 py-1 text-xs font-semibold text-[#14232B] hover:border-[#237F8E] hover:text-[#237F8E] transition"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li className="text-[11px] text-[#5F6B74] pt-1">
                {isId ? 'Lisensi: MIT Terbuka' : 'License: Open Source & Open Science'}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sensor Attribution Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#5F6B74]">
            <Satellite className="h-3.5 w-3.5 text-[#237F8E]" />
            <span>{isId ? 'Asimilasi Sensor:' : 'Spaceborne Sensors:'}</span>
            <span className="font-medium text-[#14232B]">NASA HLS 30m</span>
            <span>&middot;</span>
            <span className="font-medium text-[#14232B]">SRTM 30m</span>
            <span>&middot;</span>
            <span className="font-medium text-[#14232B]">NASA SMAP 9km</span>
            <span>&middot;</span>
            <span className="font-medium text-[#14232B]">USDA CDL 30m</span>
            <span>&middot;</span>
            <span className="font-medium text-[#14232B]">NASA POWER AG</span>
          </div>

          <div className="text-[11px] text-[#5F6B74]">
            &copy; 2026 FIELD SHIFT &middot; NASA Space Apps Challenge &middot; Open Data Mandate
          </div>
        </div>
      </div>
    </footer>
  );
}
export default LandingFooter;
