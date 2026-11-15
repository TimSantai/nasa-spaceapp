import React from 'react';
import type { FarmerConstraints as FarmerConstraintsType } from '../../types/domain';
import type { Language } from '../../types/landing';
import { Droplets, Wrench, ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react';

interface FarmerConstraintsProps {
  constraints: FarmerConstraintsType;
  onConstraintsChange: (constraints: FarmerConstraintsType) => void;
  currentLang?: Language;
}

export const FarmerConstraints: React.FC<FarmerConstraintsProps> = ({
  constraints,
  onConstraintsChange,
  currentLang = 'id',
}) => {
  const isId = currentLang === 'id';

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
            {isId ? '/ KENDALA OPERASIONAL LAPANGAN' : '/ REAL-WORLD OPERATIONAL FILTERS'}
          </span>
          <h3 className="text-base font-bold text-gray-900 mt-1">
            {isId ? 'Kendala Lapangan & Sumber Daya Petani' : 'Field Operational Constraints & Resources'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {isId
              ? 'Menyaring kelayakan rotasi berdasarkan ketersediaan air irigasi, alat mekanisasi, dan akses pasar lokal'
              : 'Filter rotation feasibility by irrigation availability, mechanization equipment, and off-taker market access'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="h-2 w-2 rounded-full bg-[#1a7a6d]" />
          <span>{isId ? 'Filter Aktif Real-Time' : 'Active Real-Time Filter'}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Constraint 1: Irrigation */}
        <button
          type="button"
          onClick={() => toggleConstraint('irrigationAccess')}
          className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition duration-150 cursor-pointer ${constraints.irrigationAccess
              ? 'border-[#bfe3db] bg-[#f0f9f6] ring-1 ring-[#1a7a6d]/30'
              : 'border-red-200 bg-red-50/50 ring-1 ring-red-400'
            }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${constraints.irrigationAccess ? 'bg-[#e8f5f2] text-[#1a7a6d]' : 'bg-red-100 text-[#dc2626]'
                  }`}
              >
                <Droplets className="h-4 w-4" />
              </div>
              <span
                className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${constraints.irrigationAccess
                    ? 'bg-white text-[#1a7a6d] border border-[#bfe3db]'
                    : 'bg-white text-[#dc2626] border border-red-200'
                  }`}
              >
                {constraints.irrigationAccess ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    <span>{isId ? 'Tersedia' : 'Available'}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    <span>{isId ? 'Terbatas/Mati' : 'Constrained/Off'}</span>
                  </>
                )}
              </span>
            </div>
            <h4 className="mt-3 text-sm font-bold text-gray-900">
              {isId ? 'Air Saluran Irigasi' : 'Irrigation Canal Water'}
            </h4>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
              {isId
                ? 'Pasokan saluran irigasi sekunder/tersier Serayu aktif selama musim gadu/kemarau.'
                : 'Active secondary/tertiary canal supply during dry season cropping.'}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] font-semibold text-gray-600">
            {constraints.irrigationAccess
              ? isId
                ? 'Semua rotasi air layak'
                : 'All water rotations feasible'
              : isId
                ? '⚠️ Padi ganda berisiko gagal panen'
                : '⚠️ Double paddy risks severe crop failure'}
          </div>
        </button>

        {/* Constraint 2: Machinery */}
        <button
          type="button"
          onClick={() => toggleConstraint('machineryAccess')}
          className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition duration-150 cursor-pointer ${constraints.machineryAccess
              ? 'border-[#bfe3db] bg-[#f0f9f6] ring-1 ring-[#1a7a6d]/30'
              : 'border-amber-200 bg-amber-50/50 ring-1 ring-amber-400'
            }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${constraints.machineryAccess ? 'bg-[#e8f5f2] text-[#1a7a6d]' : 'bg-amber-100 text-[#d97706]'
                  }`}
              >
                <Wrench className="h-4 w-4" />
              </div>
              <span
                className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${constraints.machineryAccess
                    ? 'bg-white text-[#1a7a6d] border border-[#bfe3db]'
                    : 'bg-white text-[#d97706] border border-amber-200'
                  }`}
              >
                {constraints.machineryAccess ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    <span>{isId ? 'Siap Pakai' : 'Ready'}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    <span>{isId ? 'Terkendala' : 'Constrained'}</span>
                  </>
                )}
              </span>
            </div>
            <h4 className="mt-3 text-sm font-bold text-gray-900">
              {isId ? 'Alat Olah Tanah (Traktor)' : 'Tillage Machinery (Tractor)'}
            </h4>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
              {isId
                ? 'Ketersediaan traktor roda-2/rotavator untuk pembuatan guludan dan bedengan palawija.'
                : 'Availability of 2-wheel tractors/rotavators for palawija bed preparation.'}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] font-semibold text-gray-600">
            {constraints.machineryAccess
              ? isId
                ? 'Tersedia'
                : 'Available'
              : isId
                ? 'Tidak tersedia'
                : 'Unavailable'}
          </div>
        </button>

        {/* Constraint 3: Market Access */}
        <button
          type="button"
          onClick={() => toggleConstraint('marketAccess')}
          className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition duration-150 cursor-pointer ${constraints.marketAccess
              ? 'border-[#bfe3db] bg-[#f0f9f6] ring-1 ring-[#1a7a6d]/30'
              : 'border-blue-200 bg-blue-50/50 ring-1 ring-blue-400'
            }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${constraints.marketAccess ? 'bg-[#e8f5f2] text-[#1a7a6d]' : 'bg-blue-100 text-[#0284c7]'
                  }`}
              >
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span
                className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${constraints.marketAccess
                    ? 'bg-white text-[#1a7a6d] border border-[#bfe3db]'
                    : 'bg-white text-[#0284c7] border border-blue-200'
                  }`}
              >
                {constraints.marketAccess ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    <span>{isId ? 'Ada Off-taker' : 'Off-taker Exists'}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    <span>{isId ? 'Pasar Terbatas' : 'Limited Market'}</span>
                  </>
                )}
              </span>
            </div>
            <h4 className="mt-3 text-sm font-bold text-gray-900">
              {isId ? 'Akses Pasar & Pembeli' : 'Market Access & Buyers'}
            </h4>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
              {isId
                ? 'Kepastian pedagang pengumpul atau kontrak serap panen untuk komoditas sekunder lokal.'
                : 'Guaranteed local off-takers or purchase contracts for palawija secondary crops.'}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] font-semibold text-gray-600">
            {constraints.marketAccess
              ? isId
                ? 'Ada pembeli'
                : 'Buyers available'
              : isId
                ? 'Terbatas'
                : 'Constrained'}
          </div>
        </button>
      </div>
    </div>
  );
};
