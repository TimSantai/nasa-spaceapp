import { Satellite, Database, CheckCircle, ExternalLink, Layers } from 'lucide-react';
import type { Language } from '../../types/landing';
import { getNasaSensors } from '../../data/landingContent';

interface NasaDataGridProps {
  currentLang: Language;
  onOpenDataSources: () => void;
}

  export function NasaDataGrid({ currentLang, onOpenDataSources }: NasaDataGridProps) {
    const isId = currentLang === 'id';
    const nasaSensors = getNasaSensors(currentLang);

    const getScaleBadge = (scale: 'plot' | 'regional' | 'basin') => {
      switch (scale) {
        case 'plot':
          return (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#2E7D4F] border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D4F]" />
              {isId ? 'Resolusi Petak (Valid)' : 'Plot Resolution (Valid)'}
            </span>
          );
        case 'basin':
          return (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              {isId ? 'Konteks Cekungan DAS' : 'Catchment Basin Context'}
            </span>
          );
        case 'regional':
        default:
          return (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {isId ? 'Konteks Wilayah Makro' : 'Macro-Regional Context'}
            </span>
          );
      }
    };

    return (
      <section id="data-nasa" className="py-16 sm:py-24 bg-[#F4F7FA]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Eyebrow & Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-8 border-b border-[#E6EBF0]">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#237F8E]/20 bg-[#E3F1F3] px-3.5 py-1 text-[11px] font-bold tracking-wider text-[#237F8E] uppercase mb-3">
                <Satellite className="h-3.5 w-3.5 text-[#237F8E]" />
                <span>✓ {isId ? 'DATA OBSERVASI SATELIT NASA' : 'NASA SATELLITE ASSIMILATION'}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#14232B]">
                {isId ? 'Didukung 26 Sumber Data Ilmiah Terverifikasi' : 'Backed by 26 Audited Earth Science Datasets'}
              </h2>

              <p className="mt-2 text-sm text-[#5F6B74] leading-relaxed">
                {isId
                  ? 'Prinsip kejujuran skala: kami membedakan data resolusi petak (30–70 m) dari data iklim regional (~9–50 km), sehingga petani tidak disesatkan oleh over-interpretasi resolusi.'
                  : 'Scale integrity: we strictly distinguish plot-level 30–70m observations from regional ~9–50km atmospheric context so users never suffer resolution illusions.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onOpenDataSources}
                className="flex items-center gap-2 rounded-full bg-white border border-[#E6EBF0] px-5 py-2.5 text-xs font-bold text-[#14232B] shadow-xs transition hover:border-[#237F8E] hover:text-[#237F8E]"
              >
                <Layers className="h-4 w-4 text-[#237F8E]" />
                <span>{isId ? 'Lihat Tabel 26 Data & Status Provenance' : 'View Full 26 Data Table & Provenance'}</span>
              </button>
            </div>
          </div>

          {/* Grid of NASA Sensors */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {
                nasaSensors.map((sensor) => (
                  <div
                    key={sensor.id}
                    className="rounded-2xl border border-[#E6EBF0] bg-white p-5 shadow-xs hover:shadow-md hover:border-[#237F8E]/40 transition duration-150 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-[#E6EBF0]">
                        <span className="text-[10px] font-bold text-[#5F6B74] uppercase tracking-wider">
                          {sensor.agency}
                        </span>
                        {getScaleBadge(sensor.scaleType)}
                      </div>

                      <h3 className="mt-3 font-bold text-sm text-[#14232B]">
                        {sensor.name}
                      </h3>

                      <div className="mt-2 flex items-center gap-3 text-[11px] text-[#5F6B74]">
                        <span>{isId ? 'Spasial:' : 'Spatial:'} <strong className="text-[#14232B]">{sensor.resolution}</strong></span>
                        <span>&middot;</span>
                        <span>{isId ? 'Waktu:' : 'Revisit:'} <strong className="text-[#14232B]">{sensor.temporal}</strong></span>
                      </div>

                      <p className="mt-3 text-xs text-[#5F6B74] leading-relaxed">
                        {sensor.role}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E6EBF0]/70 flex items-center justify-between text-[11px]">
                      <span className="text-[#1E5B4F] font-semibold">
                        {sensor.scaleType === 'plot' ? (isId ? 'Resolusi Petak Sawah' : 'Field Plot Scale') : (isId ? 'Konteks Kawasan' : 'Catchment Context')}
                      </span>
                      <span className="font-bold text-[#237F8E] flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-[#6BA544]" />
                        <span>{isId ? 'Aktif' : 'Assimilated'}</span>
                      </span>
                    </div>
                  </div>
                ))
              }
        </div>

          {/* Global Partners Note */}
          <div className="mt-8 rounded-2xl border border-[#237F8E]/20 bg-[#E3F1F3]/60 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#237F8E] shadow-xs">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#14232B]">
                  {isId ? 'Didukung Sumber Pedologi & Iklim Global' : 'Integrated with Global Agro-Pedology Datasets'}
                </h4>
                <p className="text-[11px] text-[#5F6B74]">
                  ISRIC SoilGrids 250m &middot; USDA Cropland Data Layer &middot; NOAA ONI / DMI climate indices
                </p>
              </div>
            </div>

            <button
              onClick={onOpenDataSources}
              className="shrink-0 flex items-center gap-1 text-xs font-bold text-[#237F8E] hover:text-[#1B6572]"
            >
              <span>{isId ? 'Pelajari Provenance' : 'Inspect Provenance Registry'}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>
    );
}
export default NasaDataGrid;
