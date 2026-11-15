import React from 'react';
import { X, CheckCircle2, AlertTriangle, Database, FileText, CheckSquare, Square, ShieldCheck } from 'lucide-react';
import type { Strategy } from '../../types/domain';

interface EvidenceModalProps {
  strategy: Strategy | null;
  isOpen: boolean;
  onClose: () => void;
  verifiedChecks?: Record<string, boolean>;
  onToggleCheck?: (checkText: string) => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  strategy,
  isOpen,
  onClose,
  verifiedChecks = {},
  onToggleCheck,
}) => {
  if (!isOpen || !strategy) return null;

  const confidenceBadge = {
    HIGH: 'bg-[#E3F1F3] text-[#1B6572] border-[#237F8E]/30',
    MODERATE: 'bg-amber-50 text-amber-700 border-amber-200',
    LOW: 'bg-red-50 text-red-600 border-red-200',
  }[strategy.confidence];

  const totalChecks = strategy.evidence.localChecks.length;
  const verifiedCount = strategy.evidence.localChecks.filter((c) => !!verifiedChecks[c]).length;
  const verificationPercent = totalChecks > 0 ? Math.round((verifiedCount / totalChecks) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#E6EBF0] bg-white p-6 sm:p-8 text-[#14232B] shadow-float">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E6EBF0] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${confidenceBadge}`}>
                {strategy.confidence} Confidence Tier
              </span>
              <span className="text-xs text-[#5F6B74]">NASA Evidence Dossier &middot; Validasi Ilmiah Multi-Sensor</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#14232B]">{strategy.name}</h2>
            <p className="mt-1 text-xs text-[#5F6B74]">{strategy.confidenceReason}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Tutup Dossier"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="mt-6 space-y-6">
          {/* Section: Agronomic Rationale */}
          <div className="rounded-2xl border border-[#E6EBF0] bg-[#F7F9FB] p-5">
            <div className="flex items-center gap-2 text-[#237F8E]">
              <FileText className="h-4 w-4" />
              <h3 className="font-bold text-sm text-[#14232B]">Rasional Agronomi & Kesesuaian Musim</h3>
            </div>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#5F6B74]">
              {strategy.evidence.reasoning}
            </p>
            {strategy.evidence.evidence && strategy.evidence.evidence.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-[#5F6B74]">
                {strategy.evidence.evidence.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Section: NASA Sensor Inputs */}
          <div className="rounded-2xl border border-[#E6EBF0] bg-white p-5">
            <div className="flex items-center gap-2 text-[#237F8E]">
              <Database className="h-4 w-4" />
              <h3 className="font-bold text-sm text-[#14232B]">Asimilasi Sensor NASA Earth Science</h3>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {strategy.evidence.dataSources.map((source) => (
                <div
                  key={source.id}
                  className="rounded-xl border border-[#E6EBF0] bg-[#F7F9FB] p-3.5 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-[#14232B]">
                    <span>{source.name}</span>
                    <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] text-[#237F8E] font-mono border border-[#E6EBF0]">
                      {source.resolution}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[#5F6B74]">Peran: {source.role}</p>
                  <p className="mt-0.5 text-[11px] text-[#5F6B74]/80">Kategori: {source.type}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Expected Resilience Gains */}
          <div className="rounded-2xl border border-[#237F8E]/30 bg-[#E3F1F3]/50 p-5">
            <div className="flex items-center gap-2 text-[#1E5B4F]">
              <CheckCircle2 className="h-4 w-4" />
              <h3 className="font-bold text-sm text-[#1E5B4F]">Kuantifikasi Peningkatan Ketahanan Lahan</h3>
            </div>
            <ul className="mt-3 space-y-2">
              {strategy.evidence.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-[#1E5B4F]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#237F8E]" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Honest Limitations & Gaps */}
          <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <h3 className="font-bold text-sm text-red-700">Keterbatasan Informasi & Batasan Epistemik</h3>
            </div>
            <p className="mt-1 text-xs text-red-600">
              Mandat NASA Space Apps: Keterbukaan variabel lapangan yang belum terukur mencegah rekomendasi otomatis yang over-confident.
            </p>
            <ul className="mt-3 space-y-2">
              {strategy.evidence.dataGaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-red-900">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Interactive Extension Checklist */}
          <div className="rounded-2xl border border-[#237F8E]/30 bg-[#F7F9FB] p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#E6EBF0] pb-3">
              <div className="flex items-center gap-2 text-[#237F8E]">
                <CheckSquare className="h-5 w-5" />
                <div>
                  <h3 className="font-bold text-sm text-[#14232B]">
                    Checklist Verifikasi Lapangan Petugas PPL (Interaktif)
                  </h3>
                  <p className="text-[11px] text-[#5F6B74]">
                    Centang item verifikasi sebelum mencetak lembar rekomendasi konsultasi Poktan.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="rounded-full bg-[#E3F1F3] px-3 py-1 text-xs font-bold text-[#1B6572] border border-[#237F8E]/20">
                  {verifiedCount} / {totalChecks} Terverifikasi ({verificationPercent}%)
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-[#237F8E] transition-all duration-300"
                style={{ width: `${verificationPercent}%` }}
              />
            </div>

            <ul className="mt-4 space-y-2.5">
              {strategy.evidence.localChecks.map((check, i) => {
                const isChecked = !!verifiedChecks[check];
                return (
                  <li
                    key={i}
                    onClick={() => onToggleCheck && onToggleCheck(check)}
                    className={`cursor-pointer flex items-start gap-3 rounded-xl border p-3 transition duration-150 ${
                      isChecked
                        ? 'border-[#237F8E] bg-[#E3F1F3]/40 text-[#14232B]'
                        : 'border-[#E6EBF0] bg-white text-[#5F6B74] hover:border-gray-300'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isChecked ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#237F8E] text-white">
                          <CheckSquare className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-md border border-gray-300 bg-white hover:border-[#237F8E]">
                          <Square className="h-4 w-4 text-transparent hover:text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs sm:text-sm font-medium ${isChecked ? 'text-[#14232B] font-semibold' : 'text-[#5F6B74]'}`}>
                        {check}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#5F6B74]">
                        {isChecked ? '✓ Diverifikasi siap oleh PPL' : 'Klik kotak untuk mencatat verifikasi fisik di lapangan'}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            {verificationPercent === 100 && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Verifikasi Lapangan Selesai 100%!</strong> Dokumen rekomendasi siap ditandatangani dan diserahkan ke kelompok tani.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end border-t border-[#E6EBF0] pt-4">
          <button
            onClick={onClose}
            className="rounded-full bg-[#237F8E] px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#1B6572]"
          >
            Tutup Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
