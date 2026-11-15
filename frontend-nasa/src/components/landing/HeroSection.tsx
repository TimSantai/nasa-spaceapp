import { useState, useEffect } from 'react';
import {
  ArrowRight,
  Compass,
  Sun,
  MapPin,
  Droplets,
  Activity,
  CheckCircle2,
  Wind,
  Thermometer,
  LocateFixed,
  Search,
  X,
  Loader2,
} from 'lucide-react';
import type { Language } from '../../types/landing';
import {
  fetchLiveWeather,
  type LiveWeatherData,
  type WeatherPreset,
} from '../../lib/liveWeather';
import {
  LOCATIONS,
  WEATHER_CONFIGS,
  type LocationData,
} from './heroConstants';

interface HeroSectionProps {
  currentLang: Language;
  onOpenWorkspace: () => void;
  onScrollToDemo: () => void;
}

export function HeroSection({
  currentLang,
  onOpenWorkspace,
  onScrollToDemo,
}: HeroSectionProps) {
  const isId = currentLang === 'id';

  // State: Weather Preset & Location
  const [activeWeather, setActiveWeather] = useState<WeatherPreset>('midday');
  const [customGpsLocation, setCustomGpsLocation] = useState<LocationData | null>(null);

  // State: Live Automatic Sync
  const [isLiveMode, setIsLiveMode] = useState<boolean>(true);
  const [liveData, setLiveData] = useState<LiveWeatherData | null>(null);
  const [, setIsLoadingLive] = useState<boolean>(false);

  // State: City Searchbar
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const currentLocation = customGpsLocation || LOCATIONS[0];
  const defaultWeather = WEATHER_CONFIGS[activeWeather];

  // Derive effective weather data (combining live API telemetry if active)
  const effectiveWeather = {
    ...defaultWeather,
    temperature: isLiveMode && liveData ? `${liveData.temperature.toFixed(1)}°C` : defaultWeather.temperature,
    solarRadiation: isLiveMode && liveData ? liveData.solarRadiation : defaultWeather.solarRadiation,
    soilMoisture: isLiveMode && liveData ? liveData.soilMoistureEst : defaultWeather.soilMoisture,
    cloudCover: isLiveMode && liveData ? `${liveData.cloudCover}% (${isId ? liveData.descriptionId : liveData.descriptionEn})` : defaultWeather.cloudCover,
    evapotranspiration: isLiveMode && liveData ? liveData.evapotranspirationEst : defaultWeather.evapotranspiration,
    windSpeed: isLiveMode && liveData ? `${liveData.windSpeed.toFixed(1)} km/h` : defaultWeather.windSpeed,
    advisoryEn: isLiveMode && liveData ? liveData.agroAdvisoryEn : defaultWeather.advisoryEn,
    advisoryId: isLiveMode && liveData ? liveData.agroAdvisoryId : defaultWeather.advisoryId,
    recommendedRotation: isLiveMode && liveData ? liveData.recommendedRotation : defaultWeather.recommendedRotation,
    rotationScore: isLiveMode && liveData ? liveData.rotationScore : defaultWeather.rotationScore,
    timeLabel: isLiveMode && liveData ? liveData.localTime : defaultWeather.timeLabel,
  };

  // Trigger live weather fetch whenever location or live mode changes
  useEffect(() => {
    let isCancelled = false;
    if (isLiveMode) {
      fetchLiveWeather(currentLocation.lat, currentLocation.lon)
        .then((data) => {
          if (!isCancelled) {
            setLiveData(data);
            setActiveWeather(data.preset);
            setIsLoadingLive(false);
          }
        })
        .catch((err) => {
          console.warn('Unable to load live weather, using simulated data:', err);
          if (!isCancelled) {
            setIsLoadingLive(false);
          }
        });
    }
    return () => {
      isCancelled = true;
    };
  }, [isLiveMode, currentLocation.lat, currentLocation.lon]);

  // Real-time Geocoding Search for any City or Regency
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      return;
    }

    let isCancelled = false;
    const timer = setTimeout(() => {
      setIsSearching(true);
      fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=id&format=json`
      )
        .then((res) => res.json())
        .then((data) => {
          if (isCancelled) return;
          interface OpenMeteoGeoItem {
            id: number;
            name: string;
            latitude: number;
            longitude: number;
            elevation?: number;
            admin1?: string;
            country?: string;
          }
          if (data.results && Array.isArray(data.results) && data.results.length > 0) {
            const mapped: LocationData[] = (data.results as OpenMeteoGeoItem[]).map((r) => {
              const regionText = [r.admin1, r.country].filter(Boolean).join(', ');
              const latDir = r.latitude >= 0 ? 'N' : 'S';
              const lonDir = r.longitude >= 0 ? 'E' : 'W';
              return {
                id: `geo-${r.id}`,
                name: r.name,
                region: regionText || 'Indonesia',
                coords: `${Math.abs(r.latitude).toFixed(4)}°${latDir}, ${Math.abs(r.longitude).toFixed(4)}°${lonDir}`,
                elevation: `${Math.round(r.elevation || 35)}m ASL`,
                soilType: 'Agricultural Basin & Farmland',
                lat: r.latitude,
                lon: r.longitude,
              };
            });
            setSearchResults(mapped);
          } else {
            const localMatches = LOCATIONS.filter(
              (l) =>
                l.name.toLowerCase().includes(query.toLowerCase()) ||
                l.region.toLowerCase().includes(query.toLowerCase())
            );
            setSearchResults(localMatches);
          }
          setIsSearching(false);
        })
        .catch(() => {
          if (isCancelled) return;
          const localMatches = LOCATIONS.filter(
            (l) =>
              l.name.toLowerCase().includes(query.toLowerCase()) ||
              l.region.toLowerCase().includes(query.toLowerCase())
          );
          setSearchResults(localMatches);
          setIsSearching(false);
        });
    }, 280);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleSelectSearchResult = (loc: LocationData) => {
    setCustomGpsLocation(loc);
    setSearchQuery(loc.name);
    setIsSearchOpen(false);
    setIsLiveMode(true);
    setIsLoadingLive(true);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchResults.length > 0) {
      handleSelectSearchResult(searchResults[0]);
    }
    onOpenWorkspace();
  };

  const handleDetectDeviceGps = () => {
    if (!navigator.geolocation) {
      alert(isId ? 'Geolokasi tidak didukung oleh browser Anda.' : 'Geolocation is not supported by your browser.');
      return;
    }

    setIsLoadingLive(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const gpsLoc: LocationData = {
          id: 'user-gps',
          name: isId ? 'Lokasi Saya (GPS)' : 'My Device Location',
          region: isId ? 'Koordinat Lokal' : 'Local Coordinates',
          coords: `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(4)}°${lon >= 0 ? 'E' : 'W'}`,
          elevation: `${Math.round(pos.coords.altitude || 20)}m ASL`,
          soilType: isId ? 'Zona Pertanian Lokal' : 'Local Agricultural Basin',
          lat,
          lon,
        };
        setCustomGpsLocation(gpsLoc);
        setSearchQuery(gpsLoc.name);
        setIsLiveMode(true);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLoadingLive(false);
        alert(isId ? 'Izin akses lokasi ditolak. Menampilkan data Banyumas.' : 'Location permission denied. Showing Banyumas data.');
      },
      { timeout: 8000 }
    );
  };

  return (
    <section
      id="hero"
      aria-label="Field Shift Agricultural Decision Platform"
      className="relative min-h-[92vh] sm:min-h-screen overflow-hidden bg-white flex flex-col justify-between pt-6 pb-12 sm:pt-10 sm:pb-16"
    >
      {/* Background Soft Radiant Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(35,127,142,0.08),rgba(255,255,255,0))] pointer-events-none" />

      {/* ================================================================= */}
      {/* ATMOSPHERIC SKY & SUN GLOW LAYERS                                 */}
      {/* ================================================================= */}

      {/* Radiant Agricultural Sun Glow */}
      <div
        className="absolute pointer-events-none transition-all duration-1000 ease-out z-0"
        style={{
          left: `${defaultWeather.sunPosition.x}%`,
          top: `${defaultWeather.sunPosition.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="relative flex items-center justify-center">
          <div
            className={`h-28 w-28 sm:h-44 sm:w-44 rounded-full ${
              activeWeather === 'storm'
                ? 'bg-slate-300/30 blur-2xl'
                : activeWeather === 'golden'
                ? 'bg-gradient-to-r from-amber-300/40 to-orange-400/30 blur-2xl shadow-[0_0_100px_rgba(251,191,36,0.25)]'
                : 'bg-gradient-to-r from-amber-200/40 via-yellow-200/30 to-amber-100/20 blur-2xl shadow-[0_0_120px_rgba(253,224,71,0.25)]'
            }`}
          />
        </div>
      </div>

      {/* Volumetric Soft Clouds Drift Layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute -top-10 -left-1/4 w-[150%] h-64 animate-cloud-slow">
          <svg viewBox="0 0 1200 300" className="w-full h-full fill-slate-300/25 filter blur-xl">
            <path d="M50 150 Q200 80 400 130 T800 110 Q1050 90 1200 140 L1200 0 L0 0 Z" />
          </svg>
        </div>

        <div className="absolute top-1/4 -right-1/4 w-[160%] h-80 animate-cloud-fast">
          <svg viewBox="0 0 1400 400" className="w-full h-full fill-slate-200/30 filter blur-lg">
            <path d="M100 280 C200 200, 320 220, 380 250 C450 180, 580 190, 640 240 C720 160, 880 170, 960 230 C1050 190, 1180 210, 1280 280 L1400 400 L0 400 Z" />
          </svg>
        </div>
      </div>

      {/* Realistic Agricultural Farmland & Fertile Soil Base Layer */}
      <div className="absolute bottom-0 inset-x-0 h-[340px] sm:h-[400px] pointer-events-none z-10 overflow-hidden">
        {/* High-Resolution Farmland & Soil Photography */}
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=80"
          alt="Lush agricultural green farmland fields and fertile soil"
          className="absolute inset-0 w-full h-full object-cover object-bottom transition-all duration-1000 brightness-100 contrast-105"
        />

        {/* Soft Natural Light Overlay */}
        <div className="absolute inset-0 bg-[#1E5B4F]/10 mix-blend-multiply" />

        {/* Seamless Clean Mist Transition from Pure White to Farmland */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/50 to-white" />

        {/* Organic Terraced Farmland Horizon Contour in Pure White */}
        <div className="absolute top-0 inset-x-0 h-20 pointer-events-none">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-full fill-white">
            <path d="M0,50 C180,25 340,65 520,35 C700,10 880,50 1060,25 C1240,10 1380,45 1440,30 L1440,0 L0,0 Z" />
          </svg>
        </div>
      </div>

      {/* Organic Wave Shape Divider — Farmland ➜ Next Section Transition */}
      <div className="absolute -bottom-1 inset-x-0 z-30 pointer-events-none">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="w-full h-16 sm:h-20 md:h-24 block"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,60 C240,110 480,20 720,70 C960,120 1200,40 1440,80 L1440,120 L0,120 Z"
            className="fill-white"
          />
        </svg>
      </div>

      {/* ================================================================= */}
      {/* SKY STUDYO FLOATING CONTROL PANELS & EDITORIAL CONTENT            */}
      {/* ================================================================= */}
      <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 w-full flex flex-col justify-between flex-1">
        
        {/* MAIN CENTER EDITORIAL CONTENT */}
        <div className="my-auto py-10 sm:py-16 text-center max-w-4xl mx-auto">
          {/* Main Headline with Field Shift Primary Palette */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#14232B] leading-[1.14]">
            Grow Smarter. Adapt Better.{' '}
            <span className="block sm:inline text-[#237F8E] font-medium">
              Harvest with Confidence.
            </span>
          </h1>

          {/* Subtitle with Clean Crisp Legibility */}
          <p className="mt-4 text-base sm:text-lg text-[#5F6B74] leading-relaxed max-w-2xl mx-auto">
            {isId
              ? 'Eksplorasi strategi rotasi tanaman adaptif berlandaskan asimilasi cuaca satelit NASA, dinamika iklim lokal, dan mitigasi risiko agronomi nyata.'
              : 'Explore smarter crop rotation strategies conditioned on live atmospheric dynamics, NASA satellite weather data, and real-world agricultural evidence.'}
          </p>

          {/* INTERACTIVE CITY / FARMLAND SEARCHBAR */}
          <div className="mt-8 max-w-2xl mx-auto w-full relative">
            <form
              onSubmit={handleSearchSubmit}
              className="relative rounded-2xl border border-[#E6EBF0] bg-white/95 backdrop-blur-xl p-1.5 sm:p-2 shadow-xs transition-all hover:border-[#237F8E]/50 focus-within:border-[#237F8E] focus-within:ring-4 focus-within:ring-[#237F8E]/15 flex items-center gap-1.5 sm:gap-2"
            >
              <div className="flex items-center pl-2.5 sm:pl-3 pointer-events-none text-[#237F8E]">
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  setIsSearchOpen(true);
                  if (val.trim().length < 2) {
                    setSearchResults([]);
                    setIsSearching(false);
                  }
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder={
                  isId
                    ? 'Ketik nama kota, kabupaten, atau sentra sawah (cth. Banyumas, Malang, Karawang)...'
                    : 'Search city, regency, or farmland basin (e.g. Banyumas, Malang, Karawang)...'
                }
                className="w-full bg-transparent text-xs sm:text-sm text-[#14232B] placeholder:text-slate-400 focus:outline-hidden px-1 sm:px-2 font-medium"
              />

              {/* Clear search query button */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  title={isId ? 'Hapus teks' : 'Clear search'}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Quick GPS button inside searchbar */}
              <button
                type="button"
                onClick={handleDetectDeviceGps}
                className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-[#E3F1F3] text-[#237F8E] hover:text-[#1B6572] transition cursor-pointer shrink-0 border border-[#E6EBF0]"
                title={isId ? 'Gunakan Lokasi GPS Saya' : 'Detect My Device GPS'}
              >
                <LocateFixed className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>

              {/* Primary CTA Explore Button - Field Shift Signature Gradient */}
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-[#237F8E] to-[#1E5B4F] hover:from-[#1B6572] hover:to-[#17463c] px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:shadow transition active:scale-[0.98] flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>{isId ? 'Buka Analisis' : 'Explore'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* FLOATING GEOCODING & PRESET RESULTS DROPDOWN (LIGHT THEME) */}
            {isSearchOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsSearchOpen(false)}
                />

                <div className="absolute top-full mt-2 inset-x-0 rounded-2xl border border-slate-200 bg-white/98 backdrop-blur-2xl p-3 shadow-2xl z-50 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B6572] flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-[#237F8E]" />
                      <span>
                        {searchQuery.trim().length >= 2
                          ? isId
                            ? 'Hasil Pencarian Kota & Satelit NASA'
                            : 'Matching City & Satellite Basins'
                          : isId
                          ? 'Sentra Lumbung Padi & Pertanian Unggulan'
                          : 'Prime Agricultural Rice Basins'}
                      </span>
                    </span>
                    {isSearching && (
                      <span className="flex items-center gap-1 text-[10px] text-[#237F8E] font-mono">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>{isId ? 'Mencari...' : 'Searching...'}</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {/* If searching or has results */}
                    {searchQuery.trim().length >= 2 ? (
                      searchResults.length > 0 ? (
                        searchResults.map((loc) => (
                          <button
                            key={loc.id}
                            type="button"
                            onClick={() => handleSelectSearchResult(loc)}
                            className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-[#E3F1F3]/60 transition group cursor-pointer border border-transparent hover:border-[#237F8E]/30"
                          >
                            <div>
                              <span className="block font-bold text-[#14232B] group-hover:text-[#237F8E]">
                                {loc.name}
                              </span>
                              <span className="block text-[11px] text-slate-500">
                                {loc.region} &middot; {loc.coords}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-[#1B6572] rounded-md bg-[#E3F1F3] border border-[#237F8E]/20 px-2 py-0.5">
                              {loc.elevation}
                            </span>
                          </button>
                        ))
                      ) : !isSearching ? (
                        <div className="p-3 text-center text-slate-500 text-xs">
                          {isId
                            ? 'Tidak ada lokasi cocok. Coba cari nama kota atau kabupaten lain.'
                            : 'No matching locations found. Try another city or regency name.'}
                        </div>
                      ) : null
                    ) : (
                      /* Default recommendations when input is empty */
                      LOCATIONS.map((loc) => (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => handleSelectSearchResult(loc)}
                          className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-left transition group cursor-pointer ${
                            currentLocation.name === loc.name
                              ? 'bg-[#E3F1F3] border border-[#237F8E]/50 text-[#14232B] font-bold'
                              : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          <div>
                            <span className="block font-medium">{loc.name}</span>
                            <span className="block text-[10px] text-slate-500">
                              {loc.region} &middot; {loc.elevation} &middot; {loc.soilType}
                            </span>
                          </div>
                          {currentLocation.name === loc.name && (
                            <CheckCircle2 className="h-4 w-4 text-[#237F8E] shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Quick Popular Chips & Learn More Link */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center sm:justify-between gap-2.5 text-xs text-slate-600 px-1">
              {/* Popular quick chips */}
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-medium mr-0.5">
                  {isId ? 'Sentra:' : 'Basins:'}
                </span>
                {LOCATIONS.slice(0, 5).map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handleSelectSearchResult(loc)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition cursor-pointer border ${
                      currentLocation.name === loc.name
                        ? 'bg-[#237F8E] border-[#237F8E] text-white shadow-2xs font-semibold'
                        : 'bg-white hover:bg-[#E3F1F3]/50 border-slate-200 text-slate-600 hover:text-[#1B6572] shadow-2xs'
                    }`}
                  >
                    {loc.name.replace(/ Agro-Basin| Rice Hub| Delta Plain| Coastal Belt| Granary Valley| Highland Basin| Corn & Rice Belt| Subak Terraces/g, '')}
                  </button>
                ))}
              </div>

              {/* Discover How It Works CTA */}
              <button
                type="button"
                onClick={onScrollToDemo}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#237F8E] hover:text-[#1B6572] underline-offset-4 hover:underline transition cursor-pointer"
              >
                <Compass className="h-3.5 w-3.5 text-[#237F8E]" />
                <span>{isId ? 'Pelajari Cara Kerja' : 'Discover How It Works'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM HERO CARDS (Brightly Clean Modern Style with Primary Palette) */}
        <div className="pb-4 sm:pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            
            {/* Card 1: Solar & Atmospheric Feed */}
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-5 sm:p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-lg hover:border-[#237F8E]/40 transition-all duration-300 flex flex-col justify-between group">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E3F1F3] text-[#237F8E] group-hover:bg-[#d5ebed] transition">
                  <Sun className="h-6 w-6 text-[#237F8E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-bold text-[#14232B] text-sm sm:text-base leading-snug">
                      Solar + Atmosphere
                    </h3>
                    <span className="text-[10px] font-mono text-[#5F6B74] shrink-0">
                      {effectiveWeather.timeLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#5F6B74] leading-relaxed">
                    Integrated NASA POWER solar flux, surface air temperature, and wind speed dynamics.
                  </p>
                </div>
              </div>

              {/* Live Metric Data Pill */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#E3F1F3] px-2.5 py-1 font-mono font-bold text-[#1B6572] border border-[#237F8E]/25">
                  <Thermometer className="h-3 w-3 text-rose-500" />
                  <span>{effectiveWeather.temperature}</span>
                  <span className="text-slate-300">&middot;</span>
                  <span>{effectiveWeather.solarRadiation}</span>
                </span>
                <span className="text-[11px] text-[#5F6B74] font-mono flex items-center gap-1">
                  <Wind className="h-3 w-3 text-[#237F8E]" />
                  <span>{effectiveWeather.windSpeed}</span>
                </span>
              </div>
            </div>

            {/* Card 2: Soil moisture & terrain (NASA POWER, SRTM) */}
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-5 sm:p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-lg hover:border-[#237F8E]/40 transition-all duration-300 flex flex-col justify-between group">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E3F1F3] text-[#237F8E] group-hover:bg-[#d5ebed] transition">
                  <Droplets className="h-6 w-6 text-[#237F8E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-bold text-[#14232B] text-sm sm:text-base leading-snug">
                      Soil + Canopy Health
                    </h3>
                    <span className="rounded-md bg-[#E3F1F3] border border-[#237F8E]/30 px-2 py-0.5 text-[9px] font-bold text-[#1B6572] shrink-0">
                      Root Active
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#5F6B74] leading-relaxed">
                    NASA POWER root-zone soil wetness (SMAP L4 being added) and SRTM slope for erosion risk.
                  </p>
                </div>
              </div>

              {/* Live Metric Data Pill */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#E3F1F3] px-2.5 py-1 font-mono font-bold text-[#1B6572] border border-[#237F8E]/25">
                  <span>Root (est.): {effectiveWeather.soilMoisture}</span>
                </span>
                <span className="text-[11px] text-[#5F6B74] font-mono">
                  {effectiveWeather.evapotranspiration}
                </span>
              </div>
            </div>

            {/* Card 3: Real-Time Crop Rotation Recommendation */}
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-5 sm:p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-lg hover:border-[#237F8E]/40 transition-all duration-300 flex flex-col justify-between group">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E3F1F3] text-[#237F8E] group-hover:bg-[#d5ebed] transition">
                  <Activity className="h-6 w-6 text-[#237F8E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-bold text-[#14232B] text-sm sm:text-base leading-snug">
                      Adaptive Rotation
                    </h3>
                    <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[9px] font-bold text-amber-700 shrink-0">
                      Weather hint, not model output
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#5F6B74] leading-relaxed truncate" title={effectiveWeather.recommendedRotation}>
                    {effectiveWeather.recommendedRotation}
                  </p>
                </div>
              </div>

              {/* Live Metric Data Pill */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#E3F1F3] px-2.5 py-1 text-xs font-semibold text-[#1B6572] border border-[#237F8E]/25 truncate max-w-[220px]">
                  <CheckCircle2 className="h-3 w-3 text-[#237F8E] shrink-0" />
                  <span className="truncate">{effectiveWeather.recommendedRotation}</span>
                </span>
                <span className="text-[10px] text-[#5F6B74] font-mono">
                  WGS84 30m
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

export default HeroSection;
