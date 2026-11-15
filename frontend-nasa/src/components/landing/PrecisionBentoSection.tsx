import { useState } from 'react';
import {
  Activity,
  Thermometer,
  Sun,
  Droplets,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { Language } from '../../types/landing';

interface PrecisionBentoSectionProps {
  currentLang: Language;
  onOpenWorkspace: () => void;
  onOpenDataSources?: () => void;
}

interface CropData {
  id: string;
  name: string;
  nameEn: string;
  score: number;
  resilienceTextId: string;
  resilienceTextEn: string;
  monthlyScores: { month: string; value: number }[];
}

const CROPS: CropData[] = [
  {
    id: 'rice',
    name: 'Padi Sawah',
    nameEn: 'Lowland Rice',
    score: 84,
    resilienceTextId: 'Baseline: kebutuhan irigasi terendah',
    resilienceTextEn: 'Baseline: lowest irrigation need',
    monthlyScores: [
      { month: 'Mei', value: 38 },
      { month: 'Jun', value: 52 },
      { month: 'Jul', value: 68 },
      { month: 'Ags', value: 78 },
      { month: 'Sep', value: 92 },
      { month: 'Okt', value: 84 },
    ],
  },
  {
    id: 'corn',
    name: 'Jagung Hibrida',
    nameEn: 'Hybrid Corn',
    score: 91,
    resilienceTextId: 'Rotasi padi–jagung–kacang: tutupan 96%',
    resilienceTextEn: 'Rice–maize–groundnut: 96% living cover',
    monthlyScores: [
      { month: 'Mei', value: 45 },
      { month: 'Jun', value: 60 },
      { month: 'Jul', value: 75 },
      { month: 'Ags', value: 88 },
      { month: 'Sep', value: 96 },
      { month: 'Okt', value: 91 },
    ],
  },
  {
    id: 'soybean',
    name: 'Kedelai Anjasmoro',
    nameEn: 'Soybean (Legume)',
    score: 88,
    resilienceTextId: 'Legum: menambah nitrogen biologis (tidak dikuantifikasi)',
    resilienceTextEn: 'Legume: adds biological nitrogen (not quantified)',
    monthlyScores: [
      { month: 'Mei', value: 30 },
      { month: 'Jun', value: 48 },
      { month: 'Jul', value: 65 },
      { month: 'Ags', value: 82 },
      { month: 'Sep', value: 88 },
      { month: 'Okt', value: 86 },
    ],
  },
  {
    id: 'mungbean',
    name: 'Kacang Hijau',
    nameEn: 'Mung Bean',
    score: 94,
    resilienceTextId: 'Siklus pendek, cocok untuk sisa lengas MT3',
    resilienceTextEn: 'Short cycle, suits residual MT3 moisture',
    monthlyScores: [
      { month: 'Mei', value: 40 },
      { month: 'Jun', value: 65 },
      { month: 'Jul', value: 85 },
      { month: 'Ags', value: 94 },
      { month: 'Sep', value: 92 },
      { month: 'Okt', value: 80 },
    ],
  },
];

export function PrecisionBentoSection({
  currentLang,
  onOpenWorkspace,
  onOpenDataSources,
}: PrecisionBentoSectionProps) {
  const isId = currentLang === 'id';
  const [selectedCropId, setSelectedCropId] = useState<string>('rice');
  const [activeTelemetryIndex, setActiveTelemetryIndex] = useState<number>(0);

  const activeCrop = CROPS.find((c) => c.id === selectedCropId) || CROPS[0];

  const precisionTelemetry = [
    {
      title: isId ? 'Indeks Kesehatan Vegetasi' : 'Crop Health Index',
      desc: isId ? 'NDVI HLS 30 m (sedang diproses AppEEARS)' : 'HLS 30 m NDVI (AppEEARS, in progress)',
      icon: Activity,
      stat: 'Pending',
    },
    {
      title: isId ? 'Suhu Permukaan Lahan' : 'Field Temperature',
      desc: isId ? 'NASA POWER Tmax harian (Jan, normal 1991–2020)' : 'NASA POWER daily Tmax (Jan, 1991–2020 normal)',
      icon: Thermometer,
      stat: '28.4°C',
    },
    {
      title: isId ? 'Radiasi Surya Aktif' : 'Sunlight Exposure',
      desc: isId ? 'NASA POWER All-Sky Insolation' : 'Optimal photosynthesis light intensity',
      icon: Sun,
      stat: '19.8 MJ/m²',
    },
    {
      title: isId ? 'Kadar Air Perakaran' : 'Soil Moisture Level',
      desc: isId ? 'NASA POWER soil wetness zona akar (SMAP menyusul)' : 'NASA POWER root-zone wetness (SMAP being added)',
      icon: Droplets,
      stat: '0.88 (Jan)',
    },
  ];

  const fieldMetrics = [
    {
      title: isId ? 'Lahan Pertanian Dianalisis' : 'Cropland Analysed',
      sub: isId ? 'Mason Valley, USDA CDL 30 m' : 'Mason Valley, USDA CDL 30 m',
      value: '21,700 Ha',
      img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=120&q=80',
    },
    {
      title: isId ? 'Plot Demo' : 'Demo Plots',
      sub: isId ? 'Banyumas, Jawa Tengah' : 'Banyumas, Central Java',
      value: '3 Plot',
      img: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=120&q=80',
    },
    {
      title: isId ? 'Paparan Erosi Lebih Rendah' : 'Lower Erosion Exposure',
      sub: isId ? 'Padi–jagung–kacang vs padi–padi–bera' : 'Rice–maize–groundnut vs rice–rice–fallow',
      value: '~8×',
      valueColor: 'text-emerald-700',
      img: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=120&q=80',
    },
    {
      title: isId ? 'Sensor Satelit NASA' : 'NASA Satellite Feeds',
      sub: isId ? 'POWER, SRTM, CDL, SoilGrids, ONI/DMI' : 'POWER, SRTM, CDL, SoilGrids, ONI/DMI',
      value: '6 Sources',
      img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=120&q=80',
    },
    {
      title: isId ? 'Efisiensi Irigasi Air' : 'Water Efficiency',
      sub: isId ? 'Keseimbangan evapotranspirasi' : 'Reduced water stress footprint',
      value: '18%',
      valueColor: 'text-sky-700',
      img: 'https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&w=120&q=80',
    },
  ];

  return (
    <section
      id="precision-bento"
      className="relative py-16 sm:py-24 bg-white border-b border-slate-200"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1 mb-4 text-[11px] font-semibold text-emerald-800 tracking-wide shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
            <span>
              {isId
                ? 'TEKNOLOGI KEPUTUSAN AGRO-KLIMATIK'
                : 'SMART FARMING & DECISION INTELLIGENCE'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.18]">
            {isId ? (
              <>
                Solusi Pertanian Cerdas untuk{' '}
                <span className="text-emerald-800 font-serif italic font-medium">
                  Pertanian Modern
                </span>
              </>
            ) : (
              <>
                Smart Farming Solutions for{' '}
                <span className="text-emerald-800 font-serif italic font-medium">
                  Modern Agriculture
                </span>
              </>
            )}
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            {isId
              ? 'Memberdayakan petani dan agronomis dengan integrasi data satelit NASA, kecerdasan buatan, dan simulasi rotasi tanaman adaptif untuk ketahanan panen jangka panjang.'
              : 'Empowering farmers with innovative satellite AI and NASA data-driven technology to improve crop yields and build climate-resilient food systems.'}
          </p>
        </div>

        {/* 3-CARD SHOWCASE BENTO GRID (MATCHING USER REFERENCE DESIGN) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* ============================================================== */}
          {/* CARD 1: PRECISION TELEMETRY AREAS (4 COLS)                      */}
          {/* ============================================================== */}
          <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {isId ? 'Area Presisi' : 'Precision Areas'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isId ? 'Pantau kondisi lahan secara akurat' : 'Monitor every inch precisely.'}
                  </p>
                </div>
                {onOpenDataSources && (
                  <button
                    type="button"
                    onClick={onOpenDataSources}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isId ? 'Lihat Semua' : 'View all'}</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* 4 Precision Metric List Items */}
              <div className="mt-5 space-y-3">
                {precisionTelemetry.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = activeTelemetryIndex === idx;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveTelemetryIndex(idx)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left cursor-pointer group ${
                        isSelected
                          ? 'border-emerald-500/80 bg-emerald-50/50 shadow-2xs'
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                            isSelected
                              ? 'bg-emerald-800 text-white'
                              : 'bg-emerald-50 text-emerald-800 group-hover:bg-emerald-100'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-900">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono font-bold text-slate-700">
                          {item.stat}
                        </span>
                        <ChevronRight
                          className={`h-4 w-4 transition ${
                            isSelected
                              ? 'text-emerald-700 translate-x-0.5'
                              : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Workspace Trigger */}
            <div className="pt-6 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onOpenWorkspace()}
                className="w-full py-2.5 px-4 rounded-xl border border-emerald-600/30 bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>{isId ? 'Buka Analisis Spasial Lahan' : 'Open Field Spatial Analysis'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* CARD 2: CROP GROWTH SCORE & BAR CHART (4 COLS)                  */}
          {/* ============================================================== */}
          <div className="lg:col-span-4 rounded-3xl relative overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow min-h-[460px] flex flex-col justify-between">
            {/* Background High-Res Agricultural Terrace Photo */}
            <img
              src="https://images.unsplash.com/photo-1544986581-efac024faf62?auto=format&fit=crop&w=1200&q=80"
              alt="Lush green terraced rice farmland"
              className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.88] contrast-[1.05]"
            />

            {/* Cinematic Readability Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-slate-900/60 pointer-events-none" />

            {/* Card Content Overlay */}
            <div className="relative z-10 p-6 flex flex-col justify-between h-full">
              {/* Top Score & Crop Selection Tabs */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/15">
                  <span className="text-sm font-bold text-white tracking-wide">
                    {isId ? 'Ilustrasi skor (bukan output model):' : 'Illustrative score (not model output):'}{' '}
                    <span className="text-emerald-400 font-mono text-base font-extrabold">
                      {activeCrop.score}%
                    </span>
                  </span>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                    Optimum
                  </span>
                </div>

                {/* Filter Tabs for Crops */}
                <div className="mt-3.5 grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
                  {CROPS.map((crop) => (
                    <button
                      key={crop.id}
                      type="button"
                      onClick={() => setSelectedCropId(crop.id)}
                      className={`py-1.5 px-1 rounded-lg text-[10px] font-semibold text-center transition cursor-pointer truncate ${
                        selectedCropId === crop.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                      title={isId ? crop.name : crop.nameEn}
                    >
                      {isId ? crop.name.split(' ')[0] : crop.nameEn.split(' ')[0]}
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-300 font-medium bg-emerald-950/60 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-emerald-500/20">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">
                    {isId ? activeCrop.resilienceTextId : activeCrop.resilienceTextEn}
                  </span>
                </div>
              </div>

              {/* Bottom Interactive Bar Chart Overlay */}
              <div className="mt-auto pt-6">
                <div className="rounded-2xl bg-slate-900/80 backdrop-blur-md p-4 border border-white/15 shadow-xl">
                  <div className="flex items-center justify-between text-[11px] text-slate-300 mb-3">
                    <span className="font-semibold">{isId ? 'Proyeksi Biomassa' : 'Biomass Progression'}</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {isId ? 'Ilustrasi' : 'Illustrative'}
                    </span>
                  </div>

                  {/* Vertical Growth Bars */}
                  <div className="flex items-end justify-between gap-2 h-28 pt-2">
                    {activeCrop.monthlyScores.map((item, i) => {
                      const isPeak = i === activeCrop.monthlyScores.length - 2;

                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                          <span className="text-[9px] font-mono text-emerald-300 opacity-0 group-hover:opacity-100 transition">
                            {item.value}
                          </span>
                          <div
                            className={`w-full rounded-t-md transition-all duration-500 ${
                              isPeak
                                ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                                : 'bg-white/80 group-hover:bg-emerald-300'
                            }`}
                            style={{ height: `${item.value}%` }}
                          />
                          <span className="text-[10px] font-medium text-slate-400">
                            {item.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenWorkspace()}
                  className="mt-3.5 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md active:scale-98 cursor-pointer"
                >
                  <span>{isId ? 'Simulasi Lahan Anda' : 'Simulate Your Farm'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* CARD 3: VERIFIABLE METRICS & IMPACT (4 COLS)                    */}
          {/* ============================================================== */}
          <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="pb-4 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">
                  {isId ? 'Dampak Terverifikasi' : 'Field Impact & Scale'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isId ? 'Diuji terhadap data historis iklim riil' : 'Validated against real-world NASA datasets.'}
                </p>
              </div>

              {/* 5 Impact Metrics with Image Avatars */}
              <div className="mt-4 space-y-3">
                {fieldMetrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={metric.img}
                        alt={metric.title}
                        className="h-9 w-9 rounded-full object-cover shrink-0 ring-2 ring-emerald-600/20"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">
                          {metric.title}
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          {metric.sub}
                        </p>
                      </div>
                    </div>

                    <div className="text-right pl-2">
                      <span
                        className={`text-sm font-extrabold font-mono tabular-nums ${
                          metric.valueColor || 'text-slate-900'
                        }`}
                      >
                        {metric.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct CTA Launch App Button */}
            <div className="pt-5 mt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onOpenWorkspace()}
                className="w-full py-3 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isId ? 'Buka Field Shift Workspace' : 'Launch Field Shift Workspace'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PrecisionBentoSection;
