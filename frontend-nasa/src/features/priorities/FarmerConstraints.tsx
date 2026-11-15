import React from 'react';
import type { FarmerConstraints as FarmerConstraintsType } from '../../types/domain';
import { Droplets, Wrench, ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react';

interface FarmerConstraintsProps {
  constraints: FarmerConstraintsType;
  onConstraintsChange: (constraints: FarmerConstraintsType) => void;
}

export const FarmerConstraints: React.FC<FarmerConstraintsProps> = ({
  constraints,
  onConstraintsChange,
}) => {
  const toggleConstraint = (key: keyof FarmerConstraintsType) => {
    onConstraintsChange({
      ...constraints,
      [key]: !constraints[key],
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-gray-100 pb-4 gap-2">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-[#1a7a6d] uppercase">
            / REAL-WORLD OPERATIONAL FILTERS
          </span>
          <h3 className="text-base font-bold text-gray-900 mt-1">
            Kendala Lapangan & Sumber Daya Petani
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Menyaring kelayakan rotasi berdasarkan ketersediaan air irigasi, alat mekanisasi, dan akses pasar lokal
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="h-2 w-2 rounded-full bg-[#1a7a6d]" />
          <span>Filter Aktif Real-Time</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Constraint 1: Irrigation */}
        <button
          type="button"
          onClick={() => toggleConstraint('irrigationAccess')}
          className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition duration-150 ${
            constraints.irrigationAccess
              ? 'border-[#bfe3db] bg-[#f0f9f6] ring-1 ring-[#1a7a6d]/30'
              : 'border-red-200 bg-red-50/50 ring-1 ring-red-400'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                constraints.irrigationAccess ? 'bg-[#e8f5f2] text-[#1a7a6d]' : 'bg-red-100 text-[#dc2626]'
              }`}>
                <Droplets className="h-4 w-4" />
              </div>
              <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                constraints.irrigationAccess
                  ? 'bg-white text-[#1a7a6d] border border-[#bfe3db]'
                  : 'bg-white text-[#dc2626] border border-red-200'
              }`}>
                {constraints.irrigationAccess ? (
                  <><CheckCircle className="h-3 w-3" /> Tersedia</>
                ) : (
                  <><AlertCircle className="h-3 w-3" /> Terbatas/Mati</>
                )}
              </span>
            </div>
            <h4 className="mt-3 text-sm font-bold text-gray-900">Air Saluran Irigasi</h4>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
              Pasokan saluran irigasi sekunder/tersier Serayu aktif selama musim gadu/kemarau.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] font-semibold text-gray-600">
            {constraints.irrigationAccess ? 'Semua rotasi air layak' : '⚠️ Padi ganda berisiko gagal panen'}
          </div>
        </button>

        {/* Constraint 2: Machinery */}
        <button
          type="button"
          onClick={() => toggleConstraint('machineryAccess')}
          className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition duration-150 ${
            constraints.machineryAccess
              ? 'border-[#bfe3db] bg-[#f0f9f6] ring-1 ring-[#1a7a6d]/30'
              : 'border-amber-200 bg-amber-50/50 ring-1 ring-amber-400'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                constraints.machineryAccess ? 'bg-[#e8f5f2] text-[#1a7a6d]' : 'bg-amber-100 text-[#d97706]'
              }`}>
                <Wrench className="h-4 w-4" />
              </div>
              <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                constraints.machineryAccess
                  ? 'bg-white text-[#1a7a6d] border border-[#bfe3db]'
                  : 'bg-white text-[#d97706] border border-amber-200'
              }`}>
                {constraints.machineryAccess ? (
                  <><CheckCircle className="h-3 w-3" /> Siap Pakai</>
                ) : (
                  <><AlertCircle className="h-3 w-3" /> Terkendala</>
                )}
              </span>
            </div>
            <h4 className="mt-3 text-sm font-bold text-gray-900">Alat Olah Tanah (Traktor)</h4>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
              Ketersediaan traktor roda-2/rotavator untuk pembuatan guludan dan bedengan palawija.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] font-semibold text-gray-600">
            {constraints.machineryAccess ? 'Tersedia (belum memengaruhi skor)' : 'Tidak tersedia (belum dimodelkan)'}
          </div>
        </button>

        {/* Constraint 3: Market Access */}
        <button
          type="button"
          onClick={() => toggleConstraint('marketAccess')}
          className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition duration-150 ${
            constraints.marketAccess
              ? 'border-[#bfe3db] bg-[#f0f9f6] ring-1 ring-[#1a7a6d]/30'
              : 'border-blue-200 bg-blue-50/50 ring-1 ring-blue-400'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                constraints.marketAccess ? 'bg-[#e8f5f2] text-[#1a7a6d]' : 'bg-blue-100 text-[#0284c7]'
              }`}>
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                constraints.marketAccess
                  ? 'bg-white text-[#1a7a6d] border border-[#bfe3db]'
                  : 'bg-white text-[#0284c7] border border-blue-200'
              }`}>
                {constraints.marketAccess ? (
                  <><CheckCircle className="h-3 w-3" /> Ada Off-taker</>
                ) : (
                  <><AlertCircle className="h-3 w-3" /> Pasar Terbatas</>
                )}
              </span>
            </div>
            <h4 className="mt-3 text-sm font-bold text-gray-900">Akses Pasar & Pembeli</h4>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
              Kepastian pedagang pengumpul atau kontrak serap panen untuk komoditas sekunder lokal.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] font-semibold text-gray-600">
            {constraints.marketAccess ? 'Ada pembeli (belum memengaruhi skor)' : 'Terbatas (belum dimodelkan)'}
          </div>
        </button>
      </div>
    </div>
  );
};
