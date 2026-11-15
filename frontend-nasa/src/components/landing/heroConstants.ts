import type { WeatherPreset } from '../../lib/liveWeather';

export interface LocationData {
  id: string;
  name: string;
  region: string;
  coords: string;
  elevation: string;
  soilType: string;
  lat: number;
  lon: number;
}

export const LOCATIONS: LocationData[] = [
  {
    id: 'banyumas',
    name: 'Banyumas Agro-Basin',
    region: 'Central Java',
    coords: '7.5186°S, 109.2942°E',
    elevation: '48m ASL',
    soilType: 'Alluvial Lowland Clay',
    lat: -7.5186,
    lon: 109.2942,
  },
  {
    id: 'karawang',
    name: 'Karawang Rice Hub',
    region: 'West Java',
    coords: '6.3060°S, 107.3015°E',
    elevation: '15m ASL',
    soilType: 'Heavy Inceptisol Clay',
    lat: -6.3060,
    lon: 107.3015,
  },
  {
    id: 'subang',
    name: 'Subang Delta Plain',
    region: 'West Java',
    coords: '6.5595°S, 107.7584°E',
    elevation: '32m ASL',
    soilType: 'Vertisol Swell-Shrink',
    lat: -6.5595,
    lon: 107.7584,
  },
  {
    id: 'indramayu',
    name: 'Indramayu Coastal Belt',
    region: 'West Java',
    coords: '6.3264°S, 108.3200°E',
    elevation: '8m ASL',
    soilType: 'Coastal Saline-Alluvial',
    lat: -6.3264,
    lon: 108.3200,
  },
  {
    id: 'sidrap',
    name: 'Sidrap Granary Valley',
    region: 'South Sulawesi',
    coords: '3.9213°S, 119.8142°E',
    elevation: '55m ASL',
    soilType: 'Volcanic Fertile Loam',
    lat: -3.9213,
    lon: 119.8142,
  },
  {
    id: 'malang',
    name: 'Malang Highland Basin',
    region: 'East Java',
    coords: '7.9797°S, 112.6304°E',
    elevation: '450m ASL',
    soilType: 'Andosol Volcanic Loam',
    lat: -7.9797,
    lon: 112.6304,
  },
  {
    id: 'kediri',
    name: 'Kediri Corn & Rice Belt',
    region: 'East Java',
    coords: '7.8480°S, 112.0178°E',
    elevation: '68m ASL',
    soilType: 'Fluvisol River Basin',
    lat: -7.8480,
    lon: 112.0178,
  },
  {
    id: 'tabanan',
    name: 'Tabanan Subak Terraces',
    region: 'Bali',
    coords: '8.5411°S, 115.1252°E',
    elevation: '210m ASL',
    soilType: 'Volcanic Terraced Loam',
    lat: -8.5411,
    lon: 115.1252,
  },
];

export interface WeatherConfig {
  preset: WeatherPreset;
  label: string;
  timeLabel: string;
  hour: number;
  skyGradient: string;
  textColor: string;
  cardBg: string;
  cardBorder: string;
  sunPosition: { x: number; y: number };
  solarRadiation: string;
  temperature: string;
  soilMoisture: string;
  cloudCover: string;
  evapotranspiration: string;
  windSpeed: string;
  ndvi: string;
  advisoryEn: string;
  advisoryId: string;
  recommendedRotation: string;
  rotationScore: number;
}

export const WEATHER_CONFIGS: Record<WeatherPreset, WeatherConfig> = {
  dawn: {
    preset: 'dawn',
    label: 'Dawn / Sunrise',
    timeLabel: '06:00 AM',
    hour: 6,
    skyGradient: 'from-[#12132C] via-[#3B254D] via-[#7B2D4A] via-[#C95340] to-[#FDB863]',
    textColor: 'text-amber-100',
    cardBg: 'bg-black/35 backdrop-blur-xl',
    cardBorder: 'border-white/20',
    sunPosition: { x: 26, y: 72 },
    solarRadiation: '7.4 MJ/m²',
    temperature: '22.8°C',
    soilMoisture: '42.1% AWC',
    cloudCover: '18% Morning Mist',
    evapotranspiration: '1.8 mm/day',
    windSpeed: '6 km/h ENE',
    ndvi: '0.78',
    advisoryEn: 'Morning dew peak. Optimal window for foliar nutrient uptake and low-drift spraying.',
    advisoryId: 'Puncak embun pagi. Jendela ideal untuk serapan hara daun dan pemupukan presisi.',
    recommendedRotation: 'Padi (Wet) → Kacang Hijau (Mungbean)',
    rotationScore: 88,
  },
  midday: {
    preset: 'midday',
    label: 'Clear Midday',
    timeLabel: '12:00 PM',
    hour: 12,
    skyGradient: 'from-[#0369A1] via-[#0EA5E9] via-[#38BDF8] to-[#99D5F7]',
    textColor: 'text-white',
    cardBg: 'bg-white/25 backdrop-blur-xl',
    cardBorder: 'border-white/40',
    sunPosition: { x: 50, y: 16 },
    solarRadiation: '23.6 MJ/m²',
    temperature: '31.6°C',
    soilMoisture: '32.4% AWC',
    cloudCover: '12% Scattered Cumulus',
    evapotranspiration: '5.2 mm/day',
    windSpeed: '14 km/h SSE',
    ndvi: '0.81',
    advisoryEn: 'Peak photosynthetic radiation. Avoid midday sprinkler irrigation to minimize evaporative loss.',
    advisoryId: 'Radiasi fotosintesis puncak. Hindari irigasi semprot siang hari untuk cegah evaporasi tinggi.',
    recommendedRotation: 'Padi → Kedelai (Soybean) → Jagung',
    rotationScore: 84,
  },
  golden: {
    preset: 'golden',
    label: 'Golden Dusk',
    timeLabel: '05:30 PM',
    hour: 17.5,
    skyGradient: 'from-[#23153C] via-[#521C42] via-[#8E2838] via-[#D95328] to-[#FBBF24]',
    textColor: 'text-amber-50',
    cardBg: 'bg-black/35 backdrop-blur-xl',
    cardBorder: 'border-amber-200/30',
    sunPosition: { x: 74, y: 74 },
    solarRadiation: '11.8 MJ/m²',
    temperature: '26.8°C',
    soilMoisture: '34.2% AWC',
    cloudCover: '22% Golden Cirrus',
    evapotranspiration: '3.1 mm/day',
    windSpeed: '9 km/h S',
    ndvi: '0.79',
    advisoryEn: 'Thermal stress dissipating. Favorable evening cooling for root respiration.',
    advisoryId: 'Stres termal menurun. Pendinginan sore hari yang menguntungkan bagi respirasi perakaran.',
    recommendedRotation: 'Padi → Kacang Hijau → Sorgum',
    rotationScore: 86,
  },
  storm: {
    preset: 'storm',
    label: 'Monsoon Rain',
    timeLabel: '03:15 PM',
    hour: 15.25,
    skyGradient: 'from-[#0F172A] via-[#1E293B] via-[#334155] via-[#475569] to-[#64748B]',
    textColor: 'text-slate-100',
    cardBg: 'bg-black/50 backdrop-blur-xl',
    cardBorder: 'border-sky-300/30',
    sunPosition: { x: 45, y: 35 },
    solarRadiation: '4.6 MJ/m²',
    temperature: '24.2°C',
    soilMoisture: '56.8% AWC',
    cloudCover: '94% Cumulonimbus',
    evapotranspiration: '1.2 mm/day',
    windSpeed: '22 km/h WNW',
    ndvi: '0.76',
    advisoryEn: 'Soil profile actively recharging (+18mm). Delay nitrogen fertilization to prevent leaching.',
    advisoryId: 'Profil lengas tanah terisi aktif (+18mm). Tunda pemupukan nitrogen untuk hindari pencucian hara.',
    recommendedRotation: 'Padi (Deep-water) → Bera Basah',
    rotationScore: 78,
  },
};

