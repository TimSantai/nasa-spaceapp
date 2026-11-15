import { blendedScore } from '../../lib/scoring';
import React, { useState } from 'react';
import type { FieldProfile, Strategy, PriorityWeights, ClimatePhase, FarmerConstraints, ClimateScenario, PplBriefMetadata } from '../../types/domain';
import { Printer, CheckCircle2, FileText, UserCheck, ShieldCheck, Edit3 } from 'lucide-react';

interface SummaryBriefProps {
  field: FieldProfile;
  strategies: Strategy[];
  weights: PriorityWeights;
  climatePhase: ClimatePhase;
  constraints?: FarmerConstraints;
  scenario?: ClimateScenario;
  verifiedChecks?: Record<string, boolean>;
}

export const SummaryBrief: React.FC<SummaryBriefProps> = ({
  field,
  strategies,
  weights,
  climatePhase,
  constraints,
  scenario,
  verifiedChecks = {},
}) => {
  // Same ranking as the strategy board at its default caution level
  const topStrategy = [...strategies].sort((a, b) => blendedScore(b) - blendedScore(a))[0] ?? strategies[0];
  const baselineStrategy = strategies.find((s) => s.isBaseline) || strategies[strategies.length - 1];

  const [metadata, setMetadata] = useState<PplBriefMetadata>({
    farmerName: '',
    poktanName: '',
    pplOfficerName: '',
    notes: 'Perbandingan berbasis tahun analog iklim NASA POWER (1991–2025) dan indikator air, tanah, erosi. Perlu dicek PPL: ketersediaan air musim kemarau, benih, drainase, dan pasar.',
  });

  const [isEditingMetadata, setIsEditingMetadata] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const totalLocalChecks = topStrategy.evidence.localChecks.length;
  const verifiedLocalCount = topStrategy.evidence.localChecks.filter((c) => !!verifiedChecks[c]).length;

  return (
    <div className="space-y-6">
      {/* Action Header & Pre-fill Control (Hidden during print) */}
      <div className="rounded-2xl border border-[#E6EBF0] bg-white p-6 shadow-xs print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-[#237F8E] uppercase">
              / EXTENSION CONSULTATION BRIEF
            </span>
            <h3 className="text-base font-bold text-[#14232B] flex items-center gap-2 mt-0.5">
              <FileText className="h-5 w-5 text-[#237F8E]" />
              Lembar Rekomendasi Konsultasi Penyuluh Lapangan (PPL)
            </h3>
            <p className="text-xs text-[#5F6B74] mt-0.5">
              Format 1 halaman terstandarisasi untuk Poktan, PPL, dan Dinas Pertanian Kabupaten Banyumas.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsEditingMetadata(!isEditingMetadata)}
              className="flex items-center gap-2 rounded-full border border-[#E6EBF0] bg-[#F7F9FB] px-4 py-2.5 text-xs font-semibold text-[#14232B] hover:border-[#237F8E] hover:text-[#237F8E] transition"
            >
              <Edit3 className="h-4 w-4" />
              <span>{isEditingMetadata ? 'Tutup Form Data' : 'Ubah Data Petani / PPL'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-full bg-[#237F8E] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#1B6572]"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Pre-fill Form (Toggleable) */}
        {isEditingMetadata && (
          <div className="mt-5 rounded-xl border border-[#237F8E]/25 bg-[#F7F9FB] p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#237F8E] flex items-center gap-1.5 mb-3">
              <UserCheck className="h-4 w-4" /> Lengkapi Data Identitas untuk Dokumen Cetak
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#14232B] mb-1">
                  Nama Petani / Kontak
                </label>
                <input
                  type="text"
                  value={metadata.farmerName}
                  onChange={(e) => setMetadata({ ...metadata, farmerName: e.target.value })}
                  className="w-full rounded-lg border border-[#E6EBF0] bg-white px-3 py-2 text-xs text-[#14232B] focus:border-[#237F8E] focus:outline-hidden"
                  placeholder="Nama Lengkap Petani"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#14232B] mb-1">
                  Nama Kelompok Tani (Poktan)
                </label>
                <input
                  type="text"
                  value={metadata.poktanName}
                  onChange={(e) => setMetadata({ ...metadata, poktanName: e.target.value })}
                  className="w-full rounded-lg border border-[#E6EBF0] bg-white px-3 py-2 text-xs text-[#14232B] focus:border-[#237F8E] focus:outline-hidden"
                  placeholder="Kelompok Tani"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#14232B] mb-1">
                  Petugas Penyuluh Lapangan (PPL)
                </label>
                <input
                  type="text"
                  value={metadata.pplOfficerName}
                  onChange={(e) => setMetadata({ ...metadata, pplOfficerName: e.target.value })}
                  className="w-full rounded-lg border border-[#E6EBF0] bg-white px-3 py-2 text-xs text-[#14232B] focus:border-[#237F8E] focus:outline-hidden"
                  placeholder="Nama & Gelar Petugas PPL"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-[11px] font-bold text-[#14232B] mb-1">
                Catatan Khusus Rekomendasi Agronomi PPL
              </label>
              <textarea
                rows={2}
                value={metadata.notes}
                onChange={(e) => setMetadata({ ...metadata, notes: e.target.value })}
                className="w-full rounded-lg border border-[#E6EBF0] bg-white px-3 py-2 text-xs text-[#14232B] focus:border-[#237F8E] focus:outline-hidden"
                placeholder="Tuliskan catatan teknis operasional penanaman..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Official Printed Document */}
      <div className="rounded-2xl border border-[#E6EBF0] bg-white p-8 text-[#14232B] shadow-xs print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-[#E6EBF0] pb-5 print:border-slate-300">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#237F8E]">
                NASA Space Apps Challenge 2026 &middot; Agro-Ecological Decision Support
              </span>
              <h2 className="text-2xl font-black text-[#14232B] print:text-black mt-1">
                Field Shift Recommendation Summary
              </h2>
              <p className="text-xs text-[#5F6B74] mt-0.5">
                Rekomendasi Adaptasi Pola Rotasi Tanam Berbasis Data NASA & Indikator Agronomi (perlu verifikasi PPL)
              </p>
            </div>
            <div className="text-right">
              <span className="rounded-full bg-[#E3F1F3] px-3.5 py-1 font-mono text-xs font-semibold text-[#1B6572] print:bg-slate-100 print:text-slate-800">
                Plot Ref: {field.id}
              </span>
              <p className="text-[10px] text-[#5F6B74] mt-1">Tanggal Cetak: {new Date().toLocaleDateString('id-ID')}</p>
            </div>
          </div>

          {/* Identity & Agro-Climatology metadata grid */}
          <div className="mt-5 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4 rounded-xl bg-[#F7F9FB] border border-[#E6EBF0] p-4 print:bg-slate-50 print:border-slate-200">
            <div>
              <span className="text-[#5F6B74] block text-[11px]">Petani / Poktan:</span>
              <p className="font-bold text-[#14232B] print:text-black">
                {metadata.farmerName}
              </p>
              <p className="text-[11px] text-[#5F6B74]">{metadata.poktanName}</p>
            </div>
            <div>
              <span className="text-[#5F6B74] block text-[11px]">Lokasi Plot:</span>
              <p className="font-bold text-[#14232B] print:text-black">
                {field.name}
              </p>
              <p className="text-[11px] text-[#5F6B74]">
                {field.village}, Kec. {field.district}
              </p>
            </div>
            <div>
              <span className="text-[#5F6B74] block text-[11px]">Karakteristik Lahan:</span>
              <p className="font-bold text-[#14232B] print:text-black">
                {field.soil.texture} ({field.soil.slope}%)
              </p>
              <p className="text-[11px] text-[#5F6B74]">Luas: {field.areaHectares} ha</p>
            </div>
            <div>
              <span className="text-[#5F6B74] block text-[11px]">Proyeksi Iklim Monsun:</span>
              <p className="font-bold text-[#dc2626] uppercase">
                {climatePhase.replace('_', ' ')}
              </p>
              <p className="text-[11px] text-[#237F8E] font-medium">Tier: {field.dataAvailability.overallConfidence} Confidence</p>
            </div>
          </div>

          {/* Operational Constraints & Scenario Bar */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white border border-[#E6EBF0] px-4 py-2.5 text-xs text-[#5F6B74]">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#14232B]">Status Sumber Daya:</span>
              <span>Irigasi: <strong className={constraints?.irrigationAccess ? 'text-[#1E5B4F]' : 'text-red-600'}>{constraints?.irrigationAccess ? 'Aktif' : 'Terkendala'}</strong></span>
              <span>Traktor: <strong className={constraints?.machineryAccess ? 'text-[#1E5B4F]' : 'text-red-600'}>{constraints?.machineryAccess ? 'Tersedia' : 'Terkendala'}</strong></span>
              <span>Pasar: <strong className={constraints?.marketAccess ? 'text-[#1E5B4F]' : 'text-red-600'}>{constraints?.marketAccess ? 'Terbuka' : 'Terbatas'}</strong></span>
            </div>
            {scenario && (scenario.rainfallAnomalyPercent !== 0 || scenario.temperatureAnomalyDelta !== 0) && (
              <div className="text-[11px] text-[#237F8E] font-semibold">
                Stress-Test: Hujan {scenario.rainfallAnomalyPercent}% &middot; Suhu +{scenario.temperatureAnomalyDelta}&deg;C
              </div>
            )}
          </div>

          {/* Calibrated Weights Bar */}
          <div className="mt-2 rounded-xl bg-[#F7F9FB] border border-[#E6EBF0] px-4 py-2 text-[11px] text-[#5F6B74]">
            <strong>Bobot Multi-Objektif Terkalibrasi:</strong> Efisiensi Air {weights.waterEfficiency}% &middot; Kesehatan Tanah {weights.soilHealth}% &middot; Tutupan Tanah {weights.coverDays}% &middot; Perlindungan Erosi {weights.erosionControl}% &middot; Pemutus Siklus Hama {weights.pestBreak}%
          </div>
        </div>

        {/* Comparison Section */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Baseline */}
          <div className="rounded-2xl border border-[#E6EBF0] bg-[#F7F9FB] p-5 print:border-slate-300 print:bg-slate-50">
            <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-[10px] font-semibold text-gray-700 print:bg-slate-200 print:text-slate-800">
              PRAKTEK EKSISTING (BASELINE)
            </span>
            <h4 className="mt-2 text-base font-bold text-[#14232B] print:text-black">
              {baselineStrategy.name}
            </h4>
            <div className="mt-3 space-y-1 text-xs text-[#5F6B74] print:text-slate-600">
              <p>Skor Rata-Rata Ketahanan: <strong className="text-[#14232B] print:text-black tabular-nums">{baselineStrategy.scores.mean.overall}/100</strong></p>
              <p>Skenario Terburuk (CVaR): <strong className="text-[#dc2626] tabular-nums">{baselineStrategy.scores.worstCase.overall}/100</strong></p>
            </div>
            <p className="mt-3 text-xs text-[#5F6B74] leading-relaxed print:text-slate-700">
              {baselineStrategy.evidence.reasoning}
            </p>
          </div>

          {/* Recommended Shift */}
          <div className="rounded-2xl border border-[#237F8E] bg-[#E3F1F3]/40 p-5 ring-1 ring-[#237F8E] shadow-xs print:border-[#1E5B4F] print:bg-teal-50">
            <span className="rounded-full bg-[#237F8E] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              ADAPTASI YANG DIREKOMENDASIKAN
            </span>
            <h4 className="mt-2 text-base font-bold text-[#14232B] print:text-teal-950">
              {topStrategy.name}
            </h4>
            <div className="mt-3 space-y-1 text-xs text-[#1E5B4F] print:text-teal-800">
              <p>Skor Rata-Rata Ketahanan: <strong className="text-[#14232B] print:text-black tabular-nums">{topStrategy.scores.mean.overall}/100</strong></p>
              <p>Skenario Terburuk (CVaR): <strong className="text-[#237F8E] font-bold print:text-teal-700 tabular-nums">{topStrategy.scores.worstCase.overall}/100</strong></p>
            </div>
            <p className="mt-3 text-xs text-[#5F6B74] leading-relaxed print:text-slate-800">
              {topStrategy.evidence.reasoning}
            </p>
          </div>
        </div>

        {/* Actionable Benefits & Local PPL Checks */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h5 className="font-bold text-xs text-[#14232B] print:text-black flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#237F8E]" /> Keuntungan Agroklimat Lahan
            </h5>
            <ul className="space-y-1.5 text-xs text-[#5F6B74] print:text-slate-700">
              {topStrategy.evidence.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-[#237F8E] font-bold">&bull;</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-xs text-[#14232B] print:text-black flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#237F8E]" /> Status Verifikasi Fisik PPL ({verifiedLocalCount}/{totalLocalChecks})
              </h5>
            </div>
            <ul className="space-y-2 text-xs">
              {topStrategy.evidence.localChecks.map((c, i) => {
                const isVerified = !!verifiedChecks[c];
                return (
                  <li key={i} className="flex items-start gap-2">
                    {isVerified ? (
                      <span className="shrink-0 mt-0.5 inline-flex items-center gap-1 rounded bg-[#E3F1F3] px-1.5 py-0.5 text-[10px] font-bold text-[#1B6572] border border-[#237F8E]/30">
                        [✓ Diverifikasi]
                      </span>
                    ) : (
                      <span className="shrink-0 mt-0.5 inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                        [⚠️ Belum Dicek]
                      </span>
                    )}
                    <span className={isVerified ? 'text-[#14232B] font-medium' : 'text-[#5F6B74]'}>{c}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* PPL Notes */}
        {metadata.notes && (
          <div className="mt-6 rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] p-4 text-xs text-[#5F6B74] print:bg-slate-50 print:border-slate-300">
            <strong className="text-[#14232B] block mb-1">Catatan Agronomi Penyuluh (PPL):</strong>
            <p className="leading-relaxed">{metadata.notes}</p>
          </div>
        )}

        {/* Official Signatures */}
        <div className="mt-10 grid grid-cols-2 gap-8 border-t border-[#E6EBF0] pt-6 text-xs text-[#5F6B74] print:border-slate-300 print:text-slate-700">
          <div>
            <p className="font-semibold text-[#14232B] print:text-black">Petani / Perwakilan Kelompok Tani:</p>
            <div className="mt-14 border-b border-gray-400 w-52 print:border-slate-500" />
            <p className="mt-1 font-bold text-[#14232B]">{metadata.farmerName}</p>
            <p className="text-[11px] text-[#5F6B74]">{metadata.poktanName}</p>
          </div>
          <div>
            <p className="font-semibold text-[#14232B] print:text-black">Petugas Penyuluh Pertanian Lapangan (PPL):</p>
            <div className="mt-14 border-b border-gray-400 w-52 print:border-slate-500" />
            <p className="mt-1 font-bold text-[#14232B]">{metadata.pplOfficerName}</p>
            <p className="text-[11px] text-[#5F6B74]">Dinas Pertanian & Ketahanan Pangan Kab. Banyumas</p>
          </div>
        </div>
      </div>
    </div>
  );
};
