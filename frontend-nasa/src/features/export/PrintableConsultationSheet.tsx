import React from 'react';
import type {
  FieldProfile,
  Strategy,
  ClimatePhase,
  FarmerConstraints,
  ClimateScenario,
  PplBriefMetadata,
} from '../../types/domain';
import type { Language } from '../../types/landing';
import { formatCropSequenceItem } from '../../lib/cropTranslation';
import { Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PrintableConsultationSheetProps {
  field: FieldProfile;
  topStrategy: Strategy;
  baselineStrategy: Strategy;
  climatePhase: ClimatePhase;
  constraints?: FarmerConstraints;
  scenario?: ClimateScenario;
  metadata: PplBriefMetadata;
  verifiedChecks?: Record<string, boolean>;
  verifiedLocalCount: number;
  totalLocalChecks: number;
  waterSavedMm: number;
  currentLang?: Language;
}

export const PrintableConsultationSheet: React.FC<PrintableConsultationSheetProps> = ({
  field,
  topStrategy,
  baselineStrategy,
  climatePhase,
  constraints,
  scenario,
  metadata,
  verifiedChecks = {},
  verifiedLocalCount,
  totalLocalChecks,
  waterSavedMm,
  currentLang = 'id',
}) => {
  const isId = currentLang === 'id';

  return (
    <div className="print-document rounded-2xl border border-[#E6EBF0] bg-white p-6 sm:p-10 text-[#14232B] shadow-xs">
      {/* Document Formal Header (Kop Dokumen Resmi) */}
      <div className="border-b-2 border-slate-900 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#237F8E]">
              PEMERINTAH KABUPATEN BANYUMAS &middot; DINAS PERTANIAN DAN KETAHANAN PANGAN
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#14232B] mt-0.5 tracking-tight">
              LEMBAR KONSULTASI & REKOMENDASI POLA ROTASI TANAM
            </h2>
            <p className="text-xs text-[#5F6B74] mt-0.5">
              Dukungan Keputusan Agroklimat Lahan Berbasis Data Satelit NASA POWER & Model Optimasi AI
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="rounded-md border border-slate-300 bg-slate-50 px-2.5 py-1 font-mono text-xs font-bold text-slate-800">
              REF: {field.id}
            </span>
            <p className="text-[10px] text-[#5F6B74] mt-1 font-mono">
              {isId ? 'Tgl Cetak:' : 'Date:'} {new Date().toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>

        {/* Identity & Land Characteristics Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl bg-[#F7F9FB] border border-[#E6EBF0] p-3.5 text-xs">
          <div>
            <span className="text-[#5F6B74] block text-[10px] uppercase font-semibold">Petani / Poktan:</span>
            <p className="font-bold text-[#14232B]">{metadata.farmerName || '-'}</p>
            <p className="text-[11px] text-[#5F6B74]">{metadata.poktanName || '-'}</p>
          </div>
          <div>
            <span className="text-[#5F6B74] block text-[10px] uppercase font-semibold">Lokasi Petak:</span>
            <p className="font-bold text-[#14232B]">{field.name}</p>
            <p className="text-[11px] text-[#5F6B74]">
              Desa {field.village}, Kec. {field.district}
            </p>
          </div>
          <div>
            <span className="text-[#5F6B74] block text-[10px] uppercase font-semibold">Karakteristik Tanah:</span>
            <p className="font-bold text-[#14232B]">
              {field.soil.texture} ({field.soil.slope}%)
            </p>
            <p className="text-[11px] text-[#5F6B74]">
              Luas: {field.areaHectares} ha &middot; {field.elevationMeters} mdpl
            </p>
          </div>
          <div>
            <span className="text-[#5F6B74] block text-[10px] uppercase font-semibold">Kondisi Iklim Monsun:</span>
            <p className="font-bold text-emerald-800 uppercase">
              {climatePhase.replace('_', ' ')}
            </p>
            <p className="text-[11px] text-[#237F8E] font-medium">Confidence: {field.dataAvailability.overallConfidence}</p>
          </div>
        </div>

        {/* Operational Constraints & Resource Readiness */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white border border-[#E6EBF0] px-3.5 py-2 text-xs text-[#5F6B74]">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#14232B]">{isId ? 'Kesiapan Sarana:' : 'Resource Readiness:'}</span>
            <span>
              {isId ? 'Irigasi:' : 'Irrigation:'}{' '}
              <strong className={constraints?.irrigationAccess ? 'text-emerald-700' : 'text-red-600'}>
                {constraints?.irrigationAccess ? (isId ? 'Aktif' : 'Ready') : isId ? 'Terkendala' : 'Constrained'}
              </strong>
            </span>
            <span>
              {isId ? 'Traktor:' : 'Machinery:'}{' '}
              <strong className={constraints?.machineryAccess ? 'text-emerald-700' : 'text-red-600'}>
                {constraints?.machineryAccess ? (isId ? 'Tersedia' : 'Available') : isId ? 'Terkendala' : 'Constrained'}
              </strong>
            </span>
            <span>
              {isId ? 'Akses Pasar:' : 'Market Access:'}{' '}
              <strong className={constraints?.marketAccess ? 'text-emerald-700' : 'text-red-600'}>
                {constraints?.marketAccess ? (isId ? 'Terbuka' : 'Open') : isId ? 'Terbatas' : 'Limited'}
              </strong>
            </span>
          </div>
          {scenario && (scenario.rainfallAnomalyPercent !== 0 || scenario.temperatureAnomalyDelta !== 0) && (
            <span className="text-[11px] font-semibold text-[#237F8E]">
              Stress-Test: {scenario.rainfallAnomalyPercent}% {isId ? 'Hujan' : 'Rain'} &middot; +{scenario.temperatureAnomalyDelta}&deg;C
            </span>
          )}
        </div>
      </div>

      {/* Comparison Table Section */}
      <div className="mt-6 print-avoid-break">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#237F8E] mb-2.5">
          1. Perbandingan Rangkaian Pola Tanam Musiman (1 Tahun Kalender)
        </h4>

        <div className="overflow-x-auto rounded-xl border border-[#E6EBF0]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F0F4F8] border-b border-[#E6EBF0] text-[#14232B] font-bold">
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3">Pola Rotasi Musim Tanam</th>
                <th className="py-2.5 px-3 text-right">Kebutuhan Air</th>
                <th className="py-2.5 px-3 text-right">Ketahanan Tanah</th>
                <th className="py-2.5 px-3 text-right">Skor Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6EBF0]">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#5F6B74]">
                  Praktek Eksisting (Baseline)
                </td>
                <td className="py-2.5 px-3">
                  <span className="font-bold text-[#14232B]">
                    {baselineStrategy.cropSequence
                      .map((item) => formatCropSequenceItem(item, currentLang))
                      .join(' ➔ ')}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#14232B]">
                  {baselineStrategy.metrics?.irrigationMeanMm ?? 0} mm
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#14232B]">
                  {baselineStrategy.scores.mean.soilHealth}%
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-[#5F6B74]">
                  {baselineStrategy.scores.mean.overall}/100
                </td>
              </tr>

              <tr className="bg-emerald-50/50 font-medium">
                <td className="py-2.5 px-3 font-bold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  Rekomendasi Adaptif AI
                </td>
                <td className="py-2.5 px-3">
                  <span className="font-black text-[#14232B]">
                    {topStrategy.cropSequence
                      .map((item) => formatCropSequenceItem(item, currentLang))
                      .join(' ➔ ')}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-800">
                  {topStrategy.metrics?.irrigationMeanMm ?? 0} mm ({waterSavedMm > 0 ? `-${waterSavedMm} mm` : '0 mm'})
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-800">
                  {topStrategy.scores.mean.soilHealth}%
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-black text-[#237F8E]">
                  {topStrategy.scores.mean.overall}/100
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Benefits & Verified PPL Field Checks */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5 text-xs print-avoid-break">
        {/* Key Agronomic Benefits */}
        <div className="rounded-xl border border-[#E6EBF0] p-4 bg-[#F7F9FB]">
          <h5 className="font-bold text-[#14232B] flex items-center gap-1.5 mb-2.5">
            <CheckCircle2 className="h-4 w-4 text-[#237F8E]" />
            Keuntungan Utama Bagi Petani & Lahan
          </h5>
          <ul className="space-y-1.5 text-[#5F6B74]">
            {topStrategy.evidence.benefits.slice(0, 4).map((b, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-[#237F8E] font-bold">&bull;</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Physical Verification Checklist */}
        <div className="rounded-xl border border-[#E6EBF0] p-4 bg-[#F7F9FB]">
          <h5 className="font-bold text-[#14232B] flex items-center gap-1.5 mb-2.5">
            <ShieldCheck className="h-4 w-4 text-[#237F8E]" />
            Hasil Verifikasi Lapangan Petugas PPL ({verifiedLocalCount}/{totalLocalChecks})
          </h5>
          <ul className="space-y-1.5 text-[#5F6B74]">
            {topStrategy.evidence.localChecks.map((c, i) => {
              const isVerified = !!verifiedChecks[c];
              return (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono font-bold text-xs">
                    {isVerified ? '[✓]' : '[ ]'}
                  </span>
                  <span className={isVerified ? 'text-[#14232B] font-semibold' : 'text-[#5F6B74]'}>
                    {c}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Official PPL Agronomy Notes */}
      <div className="mt-5 rounded-xl border border-[#E6EBF0] p-4 bg-white text-xs print-avoid-break">
        <strong className="text-[#14232B] block mb-1">
          Catatan Teknis Rekomendasi Agronomi Petugas PPL:
        </strong>
        <p className="text-[#5F6B74] leading-relaxed italic">
          "{metadata.notes || 'Rekomendasi ini telah ditinjau bersama petani untuk musim tanam mendatang.'}"
        </p>
      </div>

      {/* Official Signatures Block */}
      <div className="mt-8 grid grid-cols-2 gap-8 border-t border-slate-300 pt-5 text-xs text-[#14232B] print-avoid-break">
        <div>
          <p className="font-bold">Menyetujui, Petani / Ketua Poktan:</p>
          <div className="mt-14 border-b border-slate-400 w-52" />
          <p className="mt-1 font-bold text-[#14232B]">
            ( {metadata.farmerName || '...........................................'} )
          </p>
          <p className="text-[10px] text-[#5F6B74]">Poktan: {metadata.poktanName || '-'}</p>
        </div>
        <div>
          <p className="font-bold">Petugas Penyuluh Lapangan (PPL):</p>
          <div className="mt-14 border-b border-slate-400 w-52" />
          <p className="mt-1 font-bold text-[#14232B]">
            ( {metadata.pplOfficerName || '...........................................'} )
          </p>
          <p className="text-[10px] text-[#5F6B74]">BPP / Dinas Pertanian Kab. Banyumas</p>
        </div>
      </div>

      {/* Document Footer */}
      <div className="mt-6 border-t border-slate-200 pt-2 text-center text-[10px] text-[#5F6B74] font-mono">
        &copy; 2026 FIELD SHIFT &middot; NASA Space Apps Challenge &middot; Powered by NASA POWER Climatology & Deck.gl
      </div>
    </div>
  );
};
