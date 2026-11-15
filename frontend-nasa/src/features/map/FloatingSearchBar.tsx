import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { FieldProfile } from '../../types/domain';
import { Search, X, MapPin, Filter, LocateFixed, Loader2, Navigation } from 'lucide-react';
import { formatDistance, isWithinObservationalBasin, sortFieldsByProximity } from '../../lib/geoDistance';

export interface FloatingSearchBarProps {
  fields: FieldProfile[];
  selectedField: FieldProfile;
  onSelectField: (field: FieldProfile) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  userCoords?: { latitude: number; longitude: number } | null;
  onRequestLocation?: () => void;
  isLocating?: boolean;
  currentLang?: 'id' | 'en';
}

const QUICK_FILTERS_ID = [
  { id: 'all', label: 'Semua Petak' },
  { id: 'clay_loam', label: 'Clay Loam' },
  { id: 'steep', label: 'Lereng >8%' },
  { id: 'high_awc', label: 'AWC Tinggi (>140mm)' },
];

const QUICK_FILTERS_EN = [
  { id: 'all', label: 'All Plots' },
  { id: 'clay_loam', label: 'Clay Loam' },
  { id: 'steep', label: 'Slope >8%' },
  { id: 'high_awc', label: 'High AWC (>140mm)' },
];

interface FieldWithDist extends FieldProfile {
  distanceKm?: number;
}

export const FloatingSearchBar: React.FC<FloatingSearchBarProps> = ({
  fields,
  selectedField,
  onSelectField,
  activeFilter,
  onFilterChange,
  userCoords,
  onRequestLocation,
  isLocating = false,
  currentLang = 'id',
}) => {
  const isId = currentLang === 'id';
  const quickFilters = isId ? QUICK_FILTERS_ID : QUICK_FILTERS_EN;

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute fields with distances and sort by proximity if coords available
  const fieldsWithDistances = useMemo<FieldWithDist[]>(() => {
    if (!userCoords) return fields;
    return sortFieldsByProximity(userCoords.latitude, userCoords.longitude, fields);
  }, [fields, userCoords]);

  // Filtered search suggestions
  const searchResults = useMemo(() => {
    if (!query.trim()) return fieldsWithDistances;
    const q = query.toLowerCase();
    return fieldsWithDistances.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.village.toLowerCase().includes(q) ||
        f.district.toLowerCase().includes(q) ||
        f.soil.texture.toLowerCase().includes(q) ||
        f.currentRotation.some((c) => c.toLowerCase().includes(q))
    );
  }, [fieldsWithDistances, query]);

  const nearestField = useMemo(() => {
    if (!userCoords || fieldsWithDistances.length === 0) return null;
    return fieldsWithDistances[0];
  }, [userCoords, fieldsWithDistances]);

  const handleSelect = (field: FieldProfile) => {
    onSelectField(field);
    setQuery('');
    setIsOpen(false);
  };

  const handleLocateClick = () => {
    if (onRequestLocation) {
      onRequestLocation();
    }
    if (nearestField && userCoords) {
      onSelectField(nearestField);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md sm:max-w-lg">
      {/* Floating Search Input Card */}
      <div className="flex items-center gap-2.5 rounded-2xl border border-[#E6EBF0] bg-white/95 px-4 py-2.5 shadow-float backdrop-blur-md transition focus-within:border-[#237F8E] focus-within:ring-2 focus-within:ring-[#237F8E]/20">
        <Search className="h-4 w-4 shrink-0 text-[#237F8E]" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={
            isId
              ? 'Cari petak, desa, tanah (misal: Karangrau, Clay Loam)...'
              : 'Search plots, villages, soil (e.g. Karangrau, Clay Loam)...'
          }
          className="w-full bg-transparent text-xs font-medium text-[#14232B] placeholder:text-[#5F6B74] focus:outline-hidden"
        />

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            aria-label={isId ? 'Hapus pencarian' : 'Clear search'}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* GPS Quick Action Button */}
        {onRequestLocation && (
          <button
            onClick={handleLocateClick}
            disabled={isLocating}
            title={
              userCoords
                ? isId
                  ? `Lokasi Aktif: ${nearestField?.distanceKm ? formatDistance(nearestField.distanceKm, 'id') : ''} dari ${nearestField?.village}`
                  : `Location Active: ${nearestField?.distanceKm ? formatDistance(nearestField.distanceKm, 'en') : ''} from ${nearestField?.village}`
                : isId
                  ? 'Gunakan Lokasi Perangkat Saya'
                  : 'Use My Device Location'
            }
            className={`flex items-center gap-1.5 shrink-0 rounded-xl px-2.5 py-1 text-[11px] font-semibold transition ${
              userCoords
                ? 'bg-[#E3F1F3] text-[#1B6572] hover:bg-[#d0ebef]'
                : 'border border-[#E6EBF0] text-[#5F6B74] hover:border-[#237F8E] hover:text-[#237F8E]'
            }`}
          >
            {isLocating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#237F8E]" />
            ) : (
              <LocateFixed
                className={`h-3.5 w-3.5 ${userCoords ? 'text-[#237F8E]' : 'text-[#5F6B74]'}`}
              />
            )}
            <span className="hidden sm:inline">
              {isLocating
                ? isId
                  ? 'Mencari...'
                  : 'Locating...'
                : userCoords
                  ? isId
                    ? 'GPS Aktif'
                    : 'GPS Active'
                  : isId
                    ? 'Lokasi Saya'
                    : 'My Location'}
            </span>
          </button>
        )}
      </div>

      {/* Detected Location Status Banner (when active) */}
      {userCoords && nearestField && (
        <div className="mt-1.5 flex items-center justify-between px-2 text-[10px] text-[#5F6B74]">
          <span className="flex items-center gap-1 font-medium text-[#1B6572]">
            <Navigation className="h-3 w-3 text-[#237F8E]" />
            {isId ? 'Terdekat dari posisi Anda: ' : 'Nearest to your position: '}
            <strong className="text-[#14232B]">{nearestField.village}</strong>
            {nearestField.distanceKm !== undefined && (
              <span>({formatDistance(nearestField.distanceKm, isId ? 'id' : 'en')})</span>
            )}
          </span>
          <button
            onClick={() => handleSelect(nearestField)}
            className="font-semibold text-[#237F8E] hover:underline"
          >
            {isId ? 'Pilih Petak Ini' : 'Select This Plot'}
          </button>
        </div>
      )}

      {/* Quick Filter Chips */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5 px-1">
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#5F6B74]">
          <Filter className="h-3 w-3 text-[#237F8E]" /> {isId ? 'Filter:' : 'Filter:'}
        </span>
        {quickFilters.map((chip) => {
          const isActive = activeFilter === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => onFilterChange(chip.id)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                isActive
                  ? 'bg-[#237F8E] text-white shadow-xs'
                  : 'border border-[#E6EBF0] bg-white/90 text-[#5F6B74] backdrop-blur-sm hover:border-[#237F8E] hover:text-[#14232B]'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Search Suggestion Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-[#E6EBF0] bg-white/95 p-2 shadow-float backdrop-blur-md">
          {searchResults.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#5F6B74]">
              {isId
                ? `Tidak ditemukan petak dengan kata kunci "${query}"`
                : `No plots found matching "${query}"`}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5F6B74]">
                <span>
                  {isId ? 'Hasil Penelusuran' : 'Search Results'} ({searchResults.length}{' '}
                  {isId ? 'petak' : 'plots'})
                </span>
                {userCoords && (
                  <span className="text-[#237F8E]">
                    {isId ? 'Diurutkan dari Terdekat' : 'Sorted by Proximity'}
                  </span>
                )}
              </div>

              {/* Inform if outside basin */}
              {userCoords &&
                nearestField &&
                nearestField.distanceKm !== undefined &&
                !isWithinObservationalBasin(nearestField.distanceKm) && (
                  <div className="mx-2 mb-2 rounded-xl bg-amber-50 p-2 text-[11px] text-amber-800 border border-amber-200">
                    {isId
                      ? `Posisi Anda terdeteksi di luar zona observasi Banyumas (${formatDistance(
                          nearestField.distanceKm,
                          'id'
                        )}). Menampilkan petak katalog terdekat.`
                      : `Your location is outside the Banyumas observation basin (${formatDistance(
                          nearestField.distanceKm,
                          'en'
                        )}). Showing closest catalog plots.`}
                  </div>
                )}

              {searchResults.map((field, idx) => {
                const isSelected = field.id === selectedField.id;
                const isClosest = idx === 0 && userCoords;
                return (
                  <div
                    key={field.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelect(field)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelect(field);
                      }
                    }}
                    className={`cursor-pointer flex items-start justify-between gap-3 rounded-xl p-3 transition focus:outline-none focus:ring-1 focus:ring-[#237F8E] ${
                      isSelected
                        ? 'bg-[#E3F1F3] text-[#1B6572] font-semibold'
                        : 'text-[#14232B] hover:bg-[#F7F9FB]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E3F1F3] text-[#237F8E]">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-[#14232B]">{field.name}</p>
                          {isClosest && (
                            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                              {isId ? 'Dekat Anda' : 'Nearest'}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#5F6B74]">
                          {isId ? 'Desa' : 'Village'} {field.village},{' '}
                          {isId ? 'Kec.' : 'Dist.'} {field.district}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {field.distanceKm !== undefined ? (
                        <span className="inline-block rounded-full bg-[#E3F1F3] px-2 py-0.5 text-[10px] font-bold text-[#1B6572]">
                          {formatDistance(field.distanceKm, isId ? 'id' : 'en')}
                        </span>
                      ) : (
                        <span className="inline-block rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-[#237F8E] border border-[#E6EBF0]">
                          {field.soil.texture}
                        </span>
                      )}
                      <p className="mt-0.5 text-[10px] text-[#5F6B74] tabular-nums">
                        {field.areaHectares} ha &middot; {field.soil.slope}% {isId ? 'lereng' : 'slope'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
