import { useState, useEffect } from 'react';
import { X, Layers, CheckCircle, AlertTriangle, Filter, HelpCircle } from 'lucide-react';
import type { Language } from '../../types/landing';
import { getAllDataResources } from '../../data/landingContent';

interface DataSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
}

export function DataSourcesModal({ isOpen, onClose, currentLang }: DataSourcesModalProps) {
  const [filterAgency, setFilterAgency] = useState<string>('all');
  const isId = currentLang === 'id';
  const allResources = getAllDataResources(currentLang);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredResources = allResources.filter((res) => {
    if (filterAgency === 'all') return true;
    if (filterAgency === 'nasa') return res.agency.includes('NASA');
    if (filterAgency === 'soil') return res.id.includes('soil') || res.id.includes('srtm') || res.id.includes('ssurgo');
    if (filterAgency === 'global') return !res.agency.includes('NASA');
    return true;
  });

  const getStatusBadge = (status: 'active' | 'context' | 'optional' | 'backup') => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-[#2E7D4F] border border-emerald-200">
            <CheckCircle className="h-3 w-3 text-[#2E7D4F]" />
            <span>{isId ? 'Dipakai (Aktif)' : 'Active (Assimilated)'}</span>
          </span>
        );
      case 'context':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-bold text-sky-700 border border-sky-200">
            <Layers className="h-3 w-3 text-sky-600" />
            <span>{isId ? 'Konteks Wilayah' : 'Regional Context'}</span>
          </span>
        );
      case 'optional':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 border border-purple-200">
            <HelpCircle className="h-3 w-3 text-purple-600" />
            <span>{isId ? 'Opsional / Benchmark' : 'Optional / Benchmark'}</span>
          </span>
        );
      case 'backup':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
            <AlertTriangle className="h-3 w-3 text-amber-600" />
            <span>{isId ? 'Cadangan Validasi' : 'Backup / Cross-check'}</span>
          </span>
        );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="data-sources-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-[#E6EBF0] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6EBF0] bg-[#F7F9FB]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3F1F3] text-[#237F8E]">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="data-sources-title" className="text-lg font-bold text-[#14232B]">
                  {isId ? 'Daftar Sumber Data & Provenance Ilmiah' : 'Scientific Data Inventory & Provenance'}
                </h3>
                <span className="rounded-full bg-[#E3F1F3] px-2 py-0.5 text-[10px] font-bold text-[#1B6572]">
                  {allResources.length} {isId ? 'Sumber' : 'Datasets'}
                </span>
              </div>
              <p className="text-xs text-[#5F6B74]">
                {isId
                  ? 'Transparansi skala, resolusi spasial/temporal, dan peran dalam algoritma rotasi tanaman Field Shift'
                  : 'Spatial/temporal scale transparency and assigned algorithmic roles in Field Shift'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#5F6B74] hover:bg-gray-200 hover:text-[#14232B] transition"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-[#E6EBF0] bg-white overflow-x-auto text-xs font-semibold">
          <span className="text-[#5F6B74] flex items-center gap-1 mr-2">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter:</span>
          </span>
          <button
            onClick={() => setFilterAgency('all')}
            className={`rounded-full px-3 py-1 transition ${filterAgency === 'all'
                ? 'bg-[#237F8E] text-white font-bold'
                : 'bg-[#F7F9FB] text-[#5F6B74] hover:text-[#14232B]'
              }`}
          >
            {isId ? 'Semua Sumber' : 'All Resources'}
          </button>
          <button
            onClick={() => setFilterAgency('nasa')}
            className={`rounded-full px-3 py-1 transition ${filterAgency === 'nasa'
                ? 'bg-[#237F8E] text-white font-bold'
                : 'bg-[#F7F9FB] text-[#5F6B74] hover:text-[#14232B]'
              }`}
          >
            NASA Earth Science
          </button>
          <button
            onClick={() => setFilterAgency('soil')}
            className={`rounded-full px-3 py-1 transition ${filterAgency === 'soil'
                ? 'bg-[#237F8E] text-white font-bold'
                : 'bg-[#F7F9FB] text-[#5F6B74] hover:text-[#14232B]'
              }`}
          >
            {isId ? 'Pedologi & Topografi' : 'Soils & Topography'}
          </button>
          <button
            onClick={() => setFilterAgency('global')}
            className={`rounded-full px-3 py-1 transition ${filterAgency === 'global'
                ? 'bg-[#237F8E] text-white font-bold'
                : 'bg-[#F7F9FB] text-[#5F6B74] hover:text-[#14232B]'
              }`}
          >
            {isId ? 'Mitra Global & FAO' : 'Global & FAO Partners'}
          </button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E6EBF0] text-[#5F6B74] uppercase text-[10px] tracking-wider font-bold">
                <th className="pb-3 pr-4">{isId ? 'Nama Produk Dataset' : 'Dataset Product'}</th>
                <th className="pb-3 px-3">{isId ? 'Status Penggunaan' : 'Operational Status'}</th>
                <th className="pb-3 px-3">{isId ? 'Resolusi & Waktu' : 'Resolution & Revisit'}</th>
                <th className="pb-3 px-3">{isId ? 'Skala Validitas' : 'Validity Scale'}</th>
                <th className="pb-3 pl-3">{isId ? 'Peran dalam Field Shift' : 'Role in Field Shift'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6EBF0]">
              {filteredResources.map((res) => (
                <tr key={res.id} className="hover:bg-[#F7F9FB]/80 transition">
                  <td className="py-3.5 pr-4 font-bold text-[#14232B]">
                    <div>{res.name}</div>
                    <span className="text-[10px] text-[#5F6B74] font-normal">{res.agency}</span>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {getStatusBadge(res.status)}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-[#14232B]">{res.resolution}</div>
                    <div className="text-[10px] text-[#5F6B74]">{res.temporal}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${res.scaleType === 'plot'
                          ? 'bg-emerald-50 text-[#2E7D4F]'
                          : 'bg-amber-50 text-amber-700'
                        }`}
                    >
                      {res.scaleType === 'plot' ? (isId ? 'Resolusi Petak' : 'Plot Scale') : (isId ? 'Konteks Wilayah' : 'Regional Context')}
                    </span>
                  </td>
                  <td className="py-3.5 pl-3 text-[#5F6B74] leading-relaxed max-w-xs">
                    {res.role}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E6EBF0] bg-[#F7F9FB] text-xs">
          <span className="text-[#5F6B74]">
            {isId
              ? 'Seluruh data dapat diakses melalui portal terbuka NASA Earthdata & CMR API.'
              : 'All datasets are publicly accessible via NASA Earthdata Search & CMR APIs.'}
          </span>
          <button
            onClick={onClose}
            className="rounded-full bg-[#237F8E] px-5 py-2 font-bold text-white hover:bg-[#1B6572] transition"
          >
            {isId ? 'Tutup Ringkasan' : 'Close Audit'}
          </button>
        </div>
      </div>
    </div>
  );
}
export default DataSourcesModal;
