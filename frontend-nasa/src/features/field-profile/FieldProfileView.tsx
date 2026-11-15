import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceArea,
} from 'recharts';
import type { FieldProfile } from '../../types/domain';
import type { Language } from '../../types/landing';
import { ShieldAlert, Thermometer, Activity, Droplets, Mountain, Sprout, Info } from 'lucide-react';
import { MiniParcelMap } from '../map/MiniParcelMap';

interface FieldProfileViewProps {
  field: FieldProfile;
  onOpenFullMap?: () => void;
  currentLang?: Language;
}

export const FieldProfileView: React.FC<FieldProfileViewProps> = ({
  field,
  onOpenFullMap,
  currentLang = 'id',
}) => {
  const isId = currentLang === 'id';

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 0. MINI SATELLITE MAP PREVIEW PETAK (INSET SPATIAL CARD)       */}
      {/* ============================================================== */}
      <MiniParcelMap
        field={field}
        onOpenFullMap={onOpenFullMap}
        currentLang={currentLang}
      />

      {/* ============================================================== */}
      {/* 1. AGRI-PLUSE 4-COLUMN STAT GRID                               */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Pedology & Soil Texture */}
        <div className="rounded-2xl border border-[#E6EBF0] bg-white p-5 shadow-xs hover:border-[#237F8E]/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6B74]">
              {isId ? 'Matriks Pedologi' : 'Pedological Matrix'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E3F1F3] text-[#237F8E] border border-[#237F8E]/20">
              <Sprout className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2.5 text-xl font-bold tracking-tight text-[#14232B] truncate">
            {field.soil.texture}
          </h3>
          <p className="mt-0.5 text-xs text-[#5F6B74] truncate">{field.soil.type}</p>
          <div className="mt-3.5 pt-3 border-t border-[#E6EBF0] flex items-center justify-between text-xs">
            <span className="text-[#5F6B74]">
              {isId ? 'Bahan Organik (SOM):' : 'Organic Matter (SOM):'}
            </span>
            <strong className="text-[#14232B] font-mono tabular-nums font-semibold">
              {field.soil.organicMatter}
            </strong>
          </div>
        </div>

        {/* Metric 2: Available Water Capacity (AWC) */}
        <div className="rounded-2xl border border-[#E6EBF0] bg-white p-5 shadow-xs hover:border-[#237F8E]/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6B74]">
              {isId ? 'Kapasitas Lengas (AWC)' : 'Available Water Cap. (AWC)'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E3F1F3] text-[#237F8E] border border-[#237F8E]/20">
              <Droplets className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-[#237F8E] font-mono tabular-nums">
              {field.soil.awc}
            </span>
            <span className="text-xs font-semibold text-[#5F6B74]">mm/m</span>
          </div>
          <p className="mt-0.5 text-xs text-[#5F6B74]">SoilGrids 0–30 cm &middot; Saxton &amp; Rawls (2006)</p>
          <div className="mt-3.5 pt-3 border-t border-[#E6EBF0] text-xs font-medium text-[#1E5B4F] flex items-center gap-1">
            <span>
              {isId
                ? field.soil.awc >= 140
                  ? 'Cadangan tinggi: membawa surplus musim hujan ke MT3'
                  : field.soil.awc >= 100
                  ? 'Kapasitas simpan moderat antar musim'
                  : 'Kapasitas rendah: tanaman musim kemarau butuh irigasi'
                : field.soil.awc >= 140
                  ? 'High capacity: carries wet season surplus to MT3'
                  : field.soil.awc >= 100
                  ? 'Moderate water retention between seasons'
                  : 'Low capacity: dry season crops need irrigation'}
            </span>
          </div>
        </div>

        {/* Metric 3: Topographic Slope & Elevation */}
        <div className="rounded-2xl border border-[#E6EBF0] bg-white p-5 shadow-xs hover:border-[#237F8E]/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6B74]">
              {isId ? 'Topografi & Elevasi' : 'Topography & Elevation'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-[#B7791F] border border-amber-200/50">
              <Mountain className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-[#14232B] font-mono tabular-nums">
              {field.soil.slope}%
            </span>
            <span className="text-xs font-semibold text-[#5F6B74]">{isId ? 'lereng' : 'slope'}</span>
          </div>
          <p className="mt-0.5 text-xs text-[#5F6B74]">
            <strong className="font-mono tabular-nums text-[#14232B]">{field.elevationMeters} mdpl</strong> &middot; {isId ? 'Risiko Erosi' : 'Erosion Risk'} {field.soil.erosionRisk}
          </p>
          <div className="mt-3.5 pt-3 border-t border-[#E6EBF0] text-xs font-medium text-[#B7791F]">
            {isId
              ? field.soil.erosionRisk === 'High'
                ? 'Lereng curam: hindari bera terbuka, jaga tutupan tanah'
                : field.soil.erosionRisk === 'Moderate'
                ? 'Hindari periode bera panjang di musim hujan'
                : 'Lereng landai: erosi terutama dari bera saat hujan lebat'
              : field.soil.erosionRisk === 'High'
                ? 'Steep slope: avoid bare fallow, keep continuous cover'
                : field.soil.erosionRisk === 'Moderate'
                ? 'Avoid extended fallow periods during rainy season'
                : 'Gentle slope: erosion risk mainly from heavy downpours'}
          </div>
        </div>

        {/* Metric 4: Existing Monoculture Sequence */}
        <div className="rounded-2xl border border-[#E6EBF0] bg-white p-5 shadow-xs hover:border-[#237F8E]/30 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5F6B74]">
              {isId ? 'Pola Eksisting Petani' : 'Current Rotation Baseline'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-[#B4443A] border border-red-200/50">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-2.5 text-base font-bold tracking-tight text-[#14232B] line-clamp-1">
            {field.currentRotation[0]}
          </h3>
          <p className="mt-0.5 text-xs text-[#5F6B74] truncate">
            {field.currentRotation[1]} &middot; {field.currentRotation[2]}
          </p>
          <div className="mt-3.5 pt-3 border-t border-[#E6EBF0] text-xs font-medium text-[#B4443A] flex items-center justify-between">
            <span>{isId ? 'Rentan cekaman El Niño' : 'Vulnerable to El Niño'}</span>
            <span className="font-mono tabular-nums font-bold">{field.areaHectares} ha</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. NASA POWER CLIMATE & TEMPERATURE HISTORY                   */}
      {/* ============================================================== */}
      <div className="rounded-2xl border border-[#E6EBF0] bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6EBF0] pb-4">
          <div>
            <h3 className="font-bold text-[#14232B] text-base flex items-center gap-2">
              <Thermometer className="h-4.5 w-4.5 text-[#B7791F]" />
              {isId ? 'Siklus Klimatologi Bulanan (NASA POWER · SMAP)' : 'Monthly Climatology Cycle (NASA POWER · SMAP)'}
            </h3>
            <p className="text-xs text-[#5F6B74] mt-0.5">
              {isId
                ? 'Presipitasi bulanan, batas suhu ekstrem, dan estimasi lengas tanah di grid sel NASA POWER'
                : 'Monthly precipitation, temperature extremes, and root soil moisture from NASA POWER grid'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#E3F1F3] px-3.5 py-1 text-xs text-[#1B6572] font-mono tabular-nums font-bold border border-[#237F8E]/25">
              1991–2025 NASA POWER
            </span>
          </div>
        </div>

        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={field.climateHistory} margin={{ top: 12, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#237F8E" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#1E5B4F" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" stroke="#94A3B8" tick={{ fontSize: 11, fill: '#5F6B74' }} tickLine={false} />
              <YAxis
                yAxisId="left"
                stroke="#237F8E"
                tick={{ fontSize: 11, fill: '#237F8E' }}
                tickLine={false}
                axisLine={false}
                label={{ value: isId ? 'Curah Hujan (mm)' : 'Rainfall (mm)', angle: -90, position: 'insideLeft', fill: '#237F8E', fontSize: 10 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[14, 36]}
                stroke="#B7791F"
                tick={{ fontSize: 11, fill: '#B7791F' }}
                tickLine={false}
                axisLine={false}
                label={{ value: isId ? 'Suhu (°C)' : 'Temperature (°C)', angle: 90, position: 'insideRight', fill: '#B7791F', fontSize: 10 }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-2xl border border-[#E6EBF0] bg-white/95 backdrop-blur-md p-4 text-xs shadow-[0_8px_30px_rgba(15,23,42,0.08)] text-[#14232B] space-y-1.5 min-w-[200px]">
                        <p className="font-extrabold text-[#14232B] text-sm border-b border-[#E6EBF0] pb-1">
                          {isId ? `Bulan ${label}` : `Month of ${label}`}
                        </p>
                        <div className="flex items-center justify-between text-[#237F8E]">
                          <span>{isId ? 'Curah Hujan:' : 'Rainfall:'}</span>
                          <strong className="font-mono tabular-nums">{data.rainfall} mm</strong>
                        </div>
                        <div className="flex items-center justify-between text-[#B7791F]">
                          <span>{isId ? 'Suhu Maksimum:' : 'Max Temp:'}</span>
                          <strong className="font-mono tabular-nums">{data.tempMax}°C</strong>
                        </div>
                        <div className="flex items-center justify-between text-[#5F6B74]">
                          <span>{isId ? 'Suhu Minimum:' : 'Min Temp:'}</span>
                          <strong className="font-mono tabular-nums">{data.tempMin}°C</strong>
                        </div>
                        <div className="flex items-center justify-between text-[#1E5B4F] pt-1 border-t border-[#E6EBF0]">
                          <span>{isId ? 'Lengas Tanah (SMAP):' : 'Soil Moisture (SMAP):'}</span>
                          <strong className="font-mono tabular-nums">{data.soilMoisture} m³/m³</strong>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
              <Bar yAxisId="left" dataKey="rainfall" name={isId ? 'Curah Hujan (mm)' : 'Rainfall (mm)'} fill="url(#rainGradient)" radius={[6, 6, 0, 0]} barSize={26} />
              <Line yAxisId="right" type="monotone" dataKey="tempMax" name={isId ? 'Suhu Maksimal (°C)' : 'Max Temp (°C)'} stroke="#B7791F" strokeWidth={2.5} dot={{ r: 3, fill: '#FFFFFF', stroke: '#B7791F', strokeWidth: 2 }} />
              <Line yAxisId="right" type="monotone" dataKey="tempMin" name={isId ? 'Suhu Minimal (°C)' : 'Min Temp (°C)'} stroke="#8A949B" strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. NDVI FENOLOGI VEGETASI DENGAN 4 ZONA WARNA FASE TANAM      */}
      {/* ============================================================== */}
      <div className="rounded-2xl border border-[#E6EBF0] bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6EBF0] pb-4">
          <div>
            <h3 className="font-bold text-[#14232B] text-base flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-[#237F8E]" />
              {isId ? 'Kurva Fenologi Kanopi & Deteksi Lahan Bera (NASA HLS 30m)' : 'Canopy Phenology Curve & Fallow Detection (NASA HLS 30m)'}
            </h3>
            <p className="text-xs text-[#5F6B74] mt-0.5">
              {isId
                ? 'Tren indeks vegetasi tahunan dengan pembagian 4 zona fase tanam untuk deteksi dini risiko erosi tanah'
                : 'Annual vegetation index trajectory with 4 crop phase zones for erosion risk mitigation'}
            </p>
          </div>
          
          {/* Phase Legend Indicators */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-[#1E5B4F] font-semibold bg-[#E3F1F3] px-2.5 py-0.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-[#1E5B4F]" /> {isId ? 'Kanopi Rapat (>0.7)' : 'Dense Canopy (>0.7)'}
            </span>
            <span className="flex items-center gap-1.5 text-[#237F8E] font-semibold bg-cyan-50 px-2.5 py-0.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-[#237F8E]" /> {isId ? 'Vegetatif (0.4–0.7)' : 'Vegetative (0.4–0.7)'}
            </span>
            <span className="flex items-center gap-1.5 text-[#5F6B74] font-semibold bg-slate-100 px-2.5 py-0.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-[#8A949B]" /> {isId ? 'Olah Lahan (0.25–0.4)' : 'Land Prep (0.25–0.4)'}
            </span>
            <span className="flex items-center gap-1.5 text-[#B4443A] font-semibold bg-red-50 px-2.5 py-0.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-[#B4443A]" /> {isId ? 'Bera/Terbuka (<0.25)' : 'Fallow/Bare (<0.25)'}
            </span>
          </div>
        </div>

        <div className="mt-6 h-56 w-full">
          {field.ndviTimeSeries.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-xs text-[#5F6B74]">
              {isId
                ? 'HLS 30 m NDVI untuk petak ini sedang diekstraksi oleh NASA AppEEARS. Grafik akan otomatis terisi saat data selesai diproses.'
                : 'HLS 30m NDVI for this plot is being processed by NASA AppEEARS. The chart will populate automatically.'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={field.ndviTimeSeries} margin={{ top: 12, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#237F8E" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#237F8E" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              
              {/* Reference Phase Color Bands across NDVI Y-scale */}
              <ReferenceArea y1={0.7} y2={1.0} fill="#E7F2EB" fillOpacity={0.35} />
              <ReferenceArea y1={0.4} y2={0.7} fill="#E3F1F3" fillOpacity={0.25} />
              <ReferenceArea y1={0.25} y2={0.4} fill="#F4F7FA" fillOpacity={0.4} />
              <ReferenceArea y1={0.0} y2={0.25} fill="#FDF4F3" fillOpacity={0.45} />

              <XAxis dataKey="month" stroke="#94A3B8" tick={{ fontSize: 11, fill: '#5F6B74' }} tickLine={false} />
              <YAxis domain={[0, 1]} stroke="#94A3B8" tick={{ fontSize: 11, fill: '#5F6B74' }} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const isFallow = data.ndvi < 0.25;
                    return (
                      <div className="rounded-2xl border border-[#E6EBF0] bg-white/95 backdrop-blur-md p-3.5 text-xs shadow-[0_8px_30px_rgba(15,23,42,0.08)] text-[#14232B] min-w-[190px]">
                        <p className="font-extrabold text-[#14232B] text-sm border-b border-[#E6EBF0] pb-1">
                          {isId ? `Bulan ${data.month}` : `Month of ${data.month}`}
                        </p>
                        <p className="text-[#237F8E] font-mono font-bold mt-1.5 text-sm tabular-nums">
                          NDVI: {data.ndvi}
                        </p>
                        <div className="mt-1 flex items-center justify-between text-xs">
                          <span className="text-[#5F6B74]">{isId ? 'Fase Tanam:' : 'Crop Phase:'}</span>
                          <span className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                            isFallow ? 'bg-red-50 text-[#B4443A]' : 'bg-[#E3F1F3] text-[#1B6572]'
                          }`}>
                            {data.phase}
                          </span>
                        </div>
                        {isFallow && (
                          <p className="text-[10px] text-[#B4443A] mt-1 pt-1 border-t border-red-100 flex items-center gap-1">
                            <Info className="h-3 w-3 shrink-0" />
                            {isId ? 'Tanah telanjang rentan erosi & gulma' : 'Bare soil exposed to erosion & weeds'}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="ndvi"
                name={isId ? 'Nilai NDVI' : 'NDVI Value'}
                stroke="#237F8E"
                strokeWidth={2.8}
                fillOpacity={1}
                fill="url(#ndviGradient)"
                dot={{ r: 3, fill: '#FFFFFF', stroke: '#237F8E', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. HONEST DATA AVAILABILITY & NASA LIMITATIONS                */}
      {/* ============================================================== */}
      <div className="rounded-2xl border border-[#BFE3DB] bg-[#E3F1F3]/50 p-5 text-xs text-[#1E5B4F]">
        <div className="flex items-center justify-between border-b border-[#BFE3DB]/60 pb-3">
          <div className="flex items-center gap-2 font-bold text-[#144F59] text-sm">
            <ShieldAlert className="h-4.5 w-4.5 text-[#237F8E]" />
            <span>Batasan Epistemik & Provenansi Data Satelit NASA</span>
          </div>
          <span className="rounded-full bg-white px-3 py-0.5 font-bold text-[10px] text-[#1B6572] border border-[#237F8E]/25">
            Tingkat Keyakinan: {field.dataAvailability.overallConfidence}
          </span>
        </div>
        <ul className="mt-3 space-y-1.5 text-[#2C3E4A] list-disc pl-5 leading-relaxed">
          {field.dataAvailability.missingDataNotes.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FieldProfileView;
