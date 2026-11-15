import React, { useState } from 'react';
import { blendedScore } from '../../lib/scoring';
import type {
  FieldProfile,
  Strategy,
  PriorityWeights,
  ClimatePhase,
  FarmerConstraints,
  ClimateScenario,
  PplBriefMetadata,
} from '../../types/domain';
import type { Language } from '../../types/landing';
import { formatStrategyTitle, formatCropSequenceItem } from '../../lib/cropTranslation';
import { CropSequencePill } from '../../components/stickers/CropSequencePill';
import { PrintableConsultationSheet } from './PrintableConsultationSheet';
import {
  Printer,
  Copy,
  Check,
  CheckCircle2,
  Download,
  FileText,
  UserCheck,
  ShieldCheck,
  Droplets,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface SummaryBriefProps {
  field: FieldProfile;
  strategies: Strategy[];
  weights: PriorityWeights;
  climatePhase: ClimatePhase;
  constraints?: FarmerConstraints;
  scenario?: ClimateScenario;
  verifiedChecks?: Record<string, boolean>;
  onToggleCheck?: (checkText: string) => void;
  currentLang?: Language;
}

export const SummaryBrief: React.FC<SummaryBriefProps> = ({
  field,
  strategies,
  weights,
  climatePhase,
  constraints,
  scenario,
  verifiedChecks = {},
  onToggleCheck,
  currentLang = 'id',
}) => {
  const isId = currentLang === 'id';

  // Defensive check for empty strategies array
  const topStrategy =
    [...strategies].sort((a, b) => blendedScore(b) - blendedScore(a))[0] ?? strategies[0];
  const baselineStrategy =
    strategies.find((s) => s.isBaseline) || strategies[strategies.length - 1] || topStrategy;

  // Metadata form for farmer & PPL identities
  const [metadata, setMetadata] = useState<PplBriefMetadata>({
    farmerName: '',
    poktanName: '',
    pplOfficerName: '',
    notes: isId
      ? 'Rotasi adaptif ini direkomendasikan berdasarkan tahun analog iklim NASA POWER (1991–2025). Mengurangi kebutuhan irigasi musim kemarau dan memutus siklus hama melalui diversifikasi legum/palawija.'
      : 'This adaptive rotation is recommended based on NASA POWER historical climate analogs (1991–2025). Minimizes dry-season irrigation demand and breaks pest cycles via legume diversification.',
  });

  const [copiedToast, setCopiedToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'guided' | 'document'>('guided');

  if (!topStrategy) {
    return (
      <div className="rounded-2xl border border-[#E6EBF0] bg-white p-8 text-center text-sm text-[#5F6B74]">
        {isId
          ? 'Tidak ada strategi rotasi tanam yang tersedia untuk ditampilkan.'
          : 'No rotation strategies available to display.'}
      </div>
    );
  }

  // Key quantitative impact calculations
  const baselineWaterMm = baselineStrategy.metrics?.irrigationMeanMm ?? 0;
  const topWaterMm = topStrategy.metrics?.irrigationMeanMm ?? 0;
  const waterSavedMm = Math.max(0, Math.round(baselineWaterMm - topWaterMm));
  const waterSavedM3 = Math.round(waterSavedMm * 10 * field.areaHectares);
  const scoreGain = topStrategy.scores.mean.overall - baselineStrategy.scores.mean.overall;
  const scoreGainLabel = scoreGain >= 0 ? `+${scoreGain}` : `${scoreGain}`;

  const totalLocalChecks = topStrategy.evidence.localChecks.length;
  const verifiedLocalCount = topStrategy.evidence.localChecks.filter((c) => !!verifiedChecks[c]).length;
  const verificationProgress = totalLocalChecks > 0 ? Math.round((verifiedLocalCount / totalLocalChecks) * 100) : 100;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyWhatsApp = async () => {
    const translatedSequence = topStrategy.cropSequence
      .map((item) => `• ${formatCropSequenceItem(item, currentLang)}`)
      .join('\n');

    const waText = `🌾 *LEMBAR REKOMENDASI POLA ROTASI TANAM - FIELD SHIFT*
--------------------------------------------------
📍 *Lahan:* ${field.name}
🏡 *Lokasi:* Desa ${field.village}, Kec. ${field.district}, Kab. ${field.regency}
📐 *Luas Lahan:* ${field.areaHectares} ha | *Elevasi:* ${field.elevationMeters} mdpl
🌱 *Tekstur Tanah:* ${field.soil.texture} (Kemiringan ${field.soil.slope}%)

👤 *Identitas Petani / Kontak:*
• Petani: ${metadata.farmerName.trim() || (isId ? 'Belum diisi' : 'Not specified')}
• Kelompok Tani (Poktan): ${metadata.poktanName.trim() || (isId ? 'Poktan Wilayah' : 'Local Poktan')}
• Petugas PPL: ${metadata.pplOfficerName.trim() || (isId ? 'Penyuluh Pertanian Wilayah' : 'Field Extension Officer')}

🔄 *REKOMENDASI ADAPTASI POLA ROTASI (AI NASA):*
${translatedSequence}

📊 *Dampak & Penghematan vs Pola Sebelumnya:*
• 💧 Hemat Air Irigasi: ±${waterSavedMm} mm (~${waterSavedM3.toLocaleString('id-ID')} m³ air pada lahan ${field.areaHectares} ha)
• 🌱 Skor Ketahanan Lahan: ${topStrategy.scores.mean.overall}/100 (${scoreGainLabel} poin)
• 🛡️ Ketahanan Musim Kemarau (CVaR): ${topStrategy.scores.worstCase.overall}/100

📋 *Status Verifikasi Fisik PPL:* ${verifiedLocalCount}/${totalLocalChecks} Poin Lapangan Terverifikasi

📝 *Catatan Agronomi Penyuluh:*
"${metadata.notes.trim()}"

_Dianalisis menggunakan Model Prediksi Iklim NASA POWER & Algoritma Pareto Banyumas._`;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(waText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = waText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadJson = () => {
    const exportPayload = {
      metadata: {
        generatedAt: new Date().toISOString(),
        system: 'Field Shift - NASA Space Apps 2026',
        fieldId: field.id,
        fieldName: field.name,
        regency: field.regency,
        district: field.district,
        village: field.village,
        farmerName: metadata.farmerName,
        poktanName: metadata.poktanName,
        pplOfficer: metadata.pplOfficerName,
        pplNotes: metadata.notes,
      },
      fieldProfile: {
        areaHectares: field.areaHectares,
        elevationMeters: field.elevationMeters,
        soil: field.soil,
        coordinates: field.coordinates,
      },
      climateForcing: {
        phase: climatePhase,
        scenario,
        weights,
      },
      recommendedStrategy: {
        id: topStrategy.id,
        name: topStrategy.name,
        cropSequence: topStrategy.cropSequence,
        paretoStatus: topStrategy.paretoStatus,
        scores: topStrategy.scores,
        metrics: topStrategy.metrics,
        benefits: topStrategy.evidence.benefits,
        localChecks: topStrategy.evidence.localChecks.map((c) => ({
          check: c,
          isVerified: !!verifiedChecks[c],
        })),
      },
      baselineComparison: {
        id: baselineStrategy.id,
        name: baselineStrategy.name,
        cropSequence: baselineStrategy.cropSequence,
        scores: baselineStrategy.scores,
        metrics: baselineStrategy.metrics,
      },
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekomendasi-rotasi-${field.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ==================================================================== */}
      {/* 1. GUIDED WORKFLOW PROGRESS BANNER (CLEAR ALUR PANDUAN)             */}
      {/* ==================================================================== */}
      <div className="rounded-2xl border border-[#E6EBF0] bg-white p-5 sm:p-6 shadow-xs print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E6EBF0] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E3F1F3] px-3 py-1 text-xs font-bold text-[#1B6572]">
                <FileText className="h-3.5 w-3.5" />
                {isId ? 'Alur Aksi Penyuluh (PPL)' : 'PPL Extension Action Flow'}
              </span>
              <span className="text-xs font-semibold text-[#5F6B74]">
                Plot Ref: <strong className="text-[#14232B] font-mono">{field.id}</strong>
              </span>
            </div>
            <h3 className="mt-2 text-xl font-extrabold text-[#14232B]">
              {isId
                ? 'Panduan Finalisasi & Penerbitan Rekomendasi Lapangan'
                : 'Finalization & Field Recommendation Guide'}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[#5F6B74] leading-relaxed">
              {isId
                ? 'Ikuti 3 tahapan terpandu di bawah ini sebelum mencetak dokumen atau membagikan ke petani / Poktan.'
                : 'Follow the 3 guided stages below before printing documents or sharing to farmers / farmer groups.'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer ${
                copiedToast
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-[#E6EBF0] bg-[#F7F9FB] text-[#14232B] hover:border-[#237F8E] hover:text-[#237F8E]'
              }`}
              title={isId ? 'Salin format teks ringkas untuk chat WhatsApp' : 'Copy formatted text for WhatsApp'}
            >
              {copiedToast ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-[#237F8E]" />}
              <span>{copiedToast ? (isId ? 'Tersalin ke WhatsApp!' : 'Copied!') : isId ? 'Salin Teks WhatsApp' : 'Copy for WhatsApp'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="flex items-center gap-2 rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] px-3.5 py-2.5 text-xs font-bold text-[#14232B] hover:border-[#237F8E] hover:text-[#237F8E] transition shadow-xs active:scale-95 cursor-pointer"
              title={isId ? 'Unduh dataset lengkap dalam format JSON' : 'Download full dataset in JSON format'}
            >
              <Download className="h-4 w-4 text-[#237F8E]" />
              <span>{isId ? 'Unduh JSON' : 'Download JSON'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-xl bg-[#237F8E] hover:bg-[#1B6572] text-white px-4 py-2.5 text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>{isId ? 'Cetak Lembar Resmi (A4)' : 'Print Official Brief (A4)'}</span>
            </button>
          </div>
        </div>

        {/* 3 Step Visual Flow Cards */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] p-3.5 flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#237F8E] text-white font-bold text-xs">
              1
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#14232B] block">
                {isId ? 'Tinjau Selisih Dampak' : 'Review Impact Shifts'}
              </span>
              <p className="text-[11px] text-[#5F6B74] mt-0.5">
                {isId
                  ? `Hemat ±${waterSavedMm} mm air irigasi & kenaikan skor ketahanan ${scoreGainLabel} poin.`
                  : `Saves ±${waterSavedMm} mm water & gains ${scoreGainLabel} resilience score.`}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] p-3.5 flex items-start gap-3">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
                verificationProgress === 100
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 text-white'
              }`}
            >
              2
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#14232B] block">
                  {isId ? 'Verifikasi Lapangan PPL' : 'PPL Field Verification'}
                </span>
                <span className="text-[10px] font-bold text-[#237F8E] font-mono">
                  {verifiedLocalCount}/{totalLocalChecks}
                </span>
              </div>
              <p className="text-[11px] text-[#5F6B74] mt-0.5">
                {verificationProgress === 100
                  ? isId
                    ? 'Semua poin risiko lapangan terkonfirmasi.'
                    : 'All physical field checks confirmed.'
                  : isId
                  ? 'Centang checklist kesiapan air & benih di bawah.'
                  : 'Check readiness checklist below.'}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] p-3.5 flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#237F8E] text-white font-bold text-xs">
              3
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#14232B] block">
                {isId ? 'Identitas & Pengesahan' : 'Identity & Authorization'}
              </span>
              <p className="text-[11px] text-[#5F6B74] mt-0.5">
                {metadata.farmerName
                  ? `${metadata.farmerName} (${metadata.poktanName || 'Poktan'})`
                  : isId
                  ? 'Isi nama petani & PPL untuk kop tanda tangan.'
                  : 'Fill farmer & PPL names for sign-off.'}
              </p>
            </div>
          </div>
        </div>

        {/* View Segmented Tabs */}
        <div className="mt-5 flex items-center justify-between border-t border-[#E6EBF0] pt-4">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F0F4F8] border border-[#E6EBF0]">
            <button
              type="button"
              onClick={() => setActiveTab('guided')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'guided'
                  ? 'bg-white text-[#237F8E] shadow-2xs'
                  : 'text-[#5F6B74] hover:text-[#14232B]'
              }`}
            >
              {isId ? 'Tampilan Kerja Terpandu' : 'Interactive Workspace'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('document')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'document'
                  ? 'bg-white text-[#237F8E] shadow-2xs'
                  : 'text-[#5F6B74] hover:text-[#14232B]'
              }`}
            >
              {isId ? 'Pratinjau Dokumen Cetak' : 'Printable Sheet Preview'}
            </button>
          </div>

          <span className="text-[11px] text-[#5F6B74] hidden sm:inline">
            💡 {isId ? 'Tip: Tekan tombol Cetak atau Ctrl+P untuk mencetak dokumen format A4.' : 'Tip: Press Print or Ctrl+P to print A4 format.'}
          </span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. INTERACTIVE GUIDED WORKSPACE SECTIONS                             */}
      {/* ==================================================================== */}
      {activeTab === 'guided' && (
        <div className="space-y-6 print:hidden">
          {/* A. VISUAL COMPARISON CARDS (BASELINE VS RECOMMENDATION) */}
          <div className="rounded-2xl border border-[#E6EBF0] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#237F8E]">
                  {isId ? 'TAHAP 1 · TINJAU POLA ROTASI' : 'STAGE 1 · REVIEW ROTATION SHIFT'}
                </span>
                <h4 className="text-base font-extrabold text-[#14232B] mt-0.5">
                  {isId
                    ? 'Perbandingan Pola Eksisting Petani vs Rekomendasi Adaptif AI'
                    : 'Current Farmer Practice vs AI Adaptive Recommendation'}
                </h4>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                {isId ? 'Optimal (Pareto Front)' : 'Pareto Optimal'}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Baseline Card */}
              <div className="rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] p-4.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6B74] bg-gray-200 px-2 py-0.5 rounded-md">
                    {isId ? 'Praktek Eksisting (Baseline)' : 'Current Farmer Practice'}
                  </span>
                  <span className="text-xs font-bold text-[#5F6B74]">
                    {baselineStrategy.scores.mean.overall}/100
                  </span>
                </div>
                <h5 className="mt-2 text-sm font-bold text-[#14232B]">
                  {formatStrategyTitle(baselineStrategy.name, currentLang)}
                </h5>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {baselineStrategy.cropSequence.map((item, idx) => (
                    <CropSequencePill key={idx} item={item} currentLang={currentLang} size="xs" />
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-[#E6EBF0] pt-3">
                  <div>
                    <span className="text-[11px] text-[#5F6B74] block">
                      {isId ? 'Kebutuhan Air Irigasi:' : 'Irrigation Demand:'}
                    </span>
                    <strong className="text-sm font-extrabold text-[#14232B] tabular-nums">
                      {baselineWaterMm} mm
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#5F6B74] block">
                      {isId ? 'Kesehatan Tanah:' : 'Soil Health Index:'}
                    </span>
                    <strong className="text-sm font-extrabold text-[#14232B] tabular-nums">
                      {baselineStrategy.scores.mean.soilHealth}%
                    </strong>
                  </div>
                </div>
              </div>

              {/* Recommended Shift Card */}
              <div className="rounded-xl border-2 border-[#237F8E] bg-[#E3F1F3]/40 p-4.5 relative shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-[#237F8E] px-2.5 py-0.5 rounded-md shadow-2xs">
                    {isId ? 'Rekomendasi Adaptif AI' : 'AI Adaptive Recommendation'}
                  </span>
                  <span className="text-xs font-extrabold text-[#1B6572] bg-white px-2 py-0.5 rounded-full border border-[#237F8E]/30">
                    {topStrategy.scores.mean.overall}/100 ({scoreGainLabel})
                  </span>
                </div>
                <h5 className="mt-2 text-sm font-bold text-[#14232B]">
                  {formatStrategyTitle(topStrategy.name, currentLang)}
                </h5>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {topStrategy.cropSequence.map((item, idx) => (
                    <CropSequencePill key={idx} item={item} currentLang={currentLang} size="xs" />
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-[#237F8E]/20 pt-3">
                  <div>
                    <span className="text-[11px] text-[#1B6572] block font-semibold">
                      {isId ? 'Kebutuhan Air Irigasi:' : 'Irrigation Demand:'}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <strong className="text-sm font-black text-[#1B6572] tabular-nums">
                        {topWaterMm} mm
                      </strong>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                        - {waterSavedMm} mm
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#1B6572] block font-semibold">
                      {isId ? 'Kesehatan Tanah:' : 'Soil Health Index:'}
                    </span>
                    <strong className="text-sm font-black text-[#1B6572] tabular-nums">
                      {topStrategy.scores.mean.soilHealth}%
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Highlights Bar */}
            <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200/80 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  {isId ? (
                    <>
                      Estimasi Penghematan Air Riil: <strong>±${waterSavedM3.toLocaleString('id-ID')} m³ air</strong> untuk seluruh petak seluas {field.areaHectares} ha.
                    </>
                  ) : (
                    <>
                      Estimated Water Savings: <strong>±${waterSavedM3.toLocaleString('en-US')} m³</strong> for the whole {field.areaHectares} ha plot.
                    </>
                  )}
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-full border border-emerald-300">
                {isId ? 'Siklus Hama Terputus' : 'Pest Cycle Broken'}
              </span>
            </div>
          </div>

          {/* B. INTERACTIVE FIELD VERIFICATION CHECKLIST (PPL VERIFICATION) */}
          <div className="rounded-2xl border border-[#E6EBF0] bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#237F8E]">
                  {isId ? 'TAHAP 2 · CHECKLIST VERIFIKASI PPL' : 'STAGE 2 · PPL PHYSICAL VERIFICATION'}
                </span>
                <h4 className="text-base font-extrabold text-[#14232B] mt-0.5 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#237F8E]" />
                  {isId
                    ? 'Verifikasi Kesesuaian Fisik & Kesiapan Lapangan Petani'
                    : 'Physical Suitability & Field Readiness Verification'}
                </h4>
              </div>

              {/* Progress Pill */}
              <div className="flex items-center gap-2 bg-[#F7F9FB] border border-[#E6EBF0] px-3.5 py-1.5 rounded-full">
                <span className="text-xs font-semibold text-[#5F6B74]">
                  {isId ? 'Verifikasi:' : 'Verified:'}
                </span>
                <span className="text-xs font-extrabold text-[#237F8E] font-mono">
                  {verifiedLocalCount}/{totalLocalChecks} ({verificationProgress}%)
                </span>
              </div>
            </div>

            <p className="text-xs text-[#5F6B74] mb-4">
              {isId
                ? 'Klik untuk menandai poin-poin yang sudah dikonfirmasi secara langsung oleh Petugas PPL di lapangan. Checklist ini akan tercatat resmi pada dokumen cetak.'
                : 'Click to confirm points physically verified by the extension officer in the field. These checks will be recorded on the official print sheet.'}
            </p>

            <div className="space-y-2.5">
              {topStrategy.evidence.localChecks.map((checkItem, idx) => {
                const isVerified = !!verifiedChecks[checkItem];
                return (
                  <label
                    key={idx}
                    htmlFor={`check-item-${idx}`}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      isVerified
                        ? 'border-emerald-300 bg-emerald-50/60 text-emerald-950 shadow-2xs'
                        : 'border-[#E6EBF0] bg-[#F7F9FB] hover:border-[#237F8E]/50 hover:bg-white text-[#14232B]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={`check-item-${idx}`}
                      checked={isVerified}
                      onChange={() => onToggleCheck?.(checkItem)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#237F8E] focus:ring-[#237F8E] cursor-pointer shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-bold ${
                            isVerified ? 'text-emerald-900' : 'text-[#14232B]'
                          }`}
                        >
                          {checkItem}
                        </span>
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-100 border border-emerald-300 px-2 py-0.2 text-[10px] font-bold text-emerald-800">
                            <CheckCircle2 className="h-3 w-3" />
                            {isId ? 'Terverifikasi' : 'Verified'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-100 border border-amber-300 px-2 py-0.2 text-[10px] font-bold text-amber-800">
                            <AlertTriangle className="h-3 w-3" />
                            {isId ? 'Perlu Dikonfirmasi' : 'Pending Check'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#5F6B74] mt-1">
                        {isId
                          ? 'Pastikan petani memiliki akses sarana produksi dan ketersediaan air irigasi yang memadai untuk komoditas ini.'
                          : 'Ensure the farmer has production input access and sufficient water supply for this commodity.'}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* C. FARMER & PPL IDENTITY FORM */}
          <div className="rounded-2xl border border-[#E6EBF0] bg-white p-6 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#237F8E]">
              {isId ? 'TAHAP 3 · DATA IDENTITAS & CATATAN AGRONOMI' : 'STAGE 3 · IDENTITY & NOTES'}
            </span>
            <h4 className="text-base font-extrabold text-[#14232B] mt-0.5 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-[#237F8E]" />
              {isId ? 'Identitas Petani, Poktan & Petugas Penyuluh' : 'Farmer, Poktan & Extension Officer Info'}
            </h4>
            <p className="text-xs text-[#5F6B74] mt-0.5 mb-4">
              {isId
                ? 'Data ini akan otomatis muncul pada kop resmi dan kolom tanda tangan dokumen cetak / PDF.'
                : 'This data will automatically appear in the official letterhead and signature block of the printed document.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#14232B] mb-1">
                  {isId ? 'Nama Petani / Kontak' : 'Farmer Name'}
                </label>
                <input
                  type="text"
                  value={metadata.farmerName}
                  onChange={(e) => setMetadata({ ...metadata, farmerName: e.target.value })}
                  className="w-full rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] px-3.5 py-2 text-xs text-[#14232B] focus:border-[#237F8E] focus:bg-white focus:outline-hidden transition"
                  placeholder={isId ? 'Contoh: Bpk. Slamet Riyadi' : 'e.g. John Doe'}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14232B] mb-1">
                  {isId ? 'Kelompok Tani (Poktan)' : 'Farmer Group (Poktan)'}
                </label>
                <input
                  type="text"
                  value={metadata.poktanName}
                  onChange={(e) => setMetadata({ ...metadata, poktanName: e.target.value })}
                  className="w-full rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] px-3.5 py-2 text-xs text-[#14232B] focus:border-[#237F8E] focus:bg-white focus:outline-hidden transition"
                  placeholder={isId ? 'Contoh: Poktan Tani Makmur' : 'e.g. Makmur Group'}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14232B] mb-1">
                  {isId ? 'Nama Petugas Penyuluh (PPL)' : 'PPL Officer Name'}
                </label>
                <input
                  type="text"
                  value={metadata.pplOfficerName}
                  onChange={(e) => setMetadata({ ...metadata, pplOfficerName: e.target.value })}
                  className="w-full rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] px-3.5 py-2 text-xs text-[#14232B] focus:border-[#237F8E] focus:bg-white focus:outline-hidden transition"
                  placeholder={isId ? 'Contoh: Ir. Bambang Sutrisno, M.Si' : 'e.g. Officer Name'}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-[#14232B] mb-1">
                {isId ? 'Catatan Khusus Rekomendasi Agronomi PPL' : 'PPL Agronomic Recommendation Notes'}
              </label>
              <textarea
                rows={3}
                value={metadata.notes}
                onChange={(e) => setMetadata({ ...metadata, notes: e.target.value })}
                className="w-full rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] p-3 text-xs text-[#14232B] focus:border-[#237F8E] focus:bg-white focus:outline-hidden transition leading-relaxed"
                placeholder={isId ? 'Tuliskan catatan teknis operasional penanaman...' : 'Write operational notes...'}
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. OFFICIAL PRINTED DOCUMENT PREVIEW (PRINT CONTAINER)              */}
      {/* ==================================================================== */}
      <div className={activeTab === 'guided' ? 'print:block hidden' : 'block'}>
        <PrintableConsultationSheet
          field={field}
          topStrategy={topStrategy}
          baselineStrategy={baselineStrategy}
          climatePhase={climatePhase}
          constraints={constraints}
          scenario={scenario}
          metadata={metadata}
          verifiedChecks={verifiedChecks}
          verifiedLocalCount={verifiedLocalCount}
          totalLocalChecks={totalLocalChecks}
          waterSavedMm={waterSavedMm}
          currentLang={currentLang}
        />
      </div>
    </div>
  );
};
