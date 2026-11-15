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
} from 'recharts';
import type { FieldProfile } from '../../types/domain';
import { ShieldAlert, Thermometer, Activity, Droplets, Mountain, Sprout } from 'lucide-react';

interface FieldProfileViewProps {
  field: FieldProfile;
}

export const FieldProfileView: React.FC<FieldProfileViewProps> = ({ field }) => {
  return (
    <div className="space-y-6">
      {/* AgriPluse Stat Grid (Replacing old ledger with clean AgriPluse metric cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Soil Texture & Type */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pedological Matrix</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f5f2] text-[#1a7a6d]">
              <Sprout className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-3 text-2xl font-bold tracking-tight text-gray-900">{field.soil.texture}</h3>
          <p className="mt-1 text-xs text-gray-500">{field.soil.type}</p>
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
            <span>Organic Matter:</span>
            <strong className="text-gray-900 font-semibold">{field.soil.organicMatter}</strong>
          </div>
        </div>

        {/* Metric 2: Available Water Capacity */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Water Capacity (AWC)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-50 text-[#0891b2]">
              <Droplets className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-[#0891b2] font-mono tabular-nums">{field.soil.awc}</span>
            <span className="text-xs font-semibold text-gray-500">mm/m</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">ISRIC SoilGrids & SMAP Assimilated</p>
          <div className="mt-4 pt-3 border-t border-gray-100 text-xs font-medium text-[#0891b2]">
            Sufficient for deep-root legumes
          </div>
        </div>

        {/* Metric 3: Topographic Slope & Elevation */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Topographic Hazard</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-[#d97706]">
              <Mountain className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-gray-900 font-mono tabular-nums">{field.soil.slope}%</span>
            <span className="text-xs font-semibold text-gray-500">slope gradient</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">{field.elevationMeters}m MSL &middot; {field.soil.erosionRisk}</p>
          <div className="mt-4 pt-3 border-t border-gray-100 text-xs font-medium text-[#dc2626]">
            Requires continuous ground cover
          </div>
        </div>

        {/* Metric 4: Observed Current Practice */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Monoculture</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-[#dc2626]">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <h3 className="mt-3 text-xl font-bold tracking-tight text-gray-900">{field.currentRotation[0]}</h3>
          <p className="mt-1 text-xs text-gray-500">Dry Season Fallow Gap: 90+ days</p>
          <div className="mt-4 pt-3 border-t border-gray-100 text-xs font-medium text-[#dc2626]">
            Vulnerable to El Niño flash drought
          </div>
        </div>
      </div>

      {/* Climate chart */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-[#d97706]" />
              Monthly Climatology 1991–2020 (NASA POWER)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              25-year monthly precipitation totals and diurnal temperature extremes in Serayu Valley
            </p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 font-mono tabular-nums">
            2000–2025 Calibrated
          </span>
        </div>

        <div className="mt-5 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={field.climateHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis
                yAxisId="left"
                stroke="#1a7a6d"
                tick={{ fontSize: 11, fill: '#1a7a6d' }}
                label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', fill: '#1a7a6d', fontSize: 10 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[15, 36]}
                stroke="#d97706"
                tick={{ fontSize: 11, fill: '#d97706' }}
                label={{ value: 'Temp (°C)', angle: 90, position: 'insideRight', fill: '#d97706', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e5e7eb',
                  borderRadius: '16px',
                  fontSize: '12px',
                  color: '#111827',
                  boxShadow: '0 4px 16px rgba(17, 24, 39, 0.08)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar yAxisId="left" dataKey="rainfall" name="Precipitation (mm)" fill="#1a7a6d" radius={[6, 6, 0, 0]} opacity={0.85} />
              <Line yAxisId="right" type="monotone" dataKey="tempMax" name="Max Temp (°C)" stroke="#d97706" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="tempMin" name="Min Temp (°C)" stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NDVI & Fallow detection chart */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#1a7a6d]" />
              Canopy Phenology & Bare Fallow Detection (NASA HLS 30m)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Harmonized Landsat-Sentinel vegetation index tracking crop vigor vs bare fallow soil exposure
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[#1a7a6d] font-semibold">
              <span className="h-2 w-2 rounded-full bg-[#1a7a6d]" /> &gt;0.6 Dense Canopy
            </span>
            <span className="flex items-center gap-1.5 text-[#dc2626] font-semibold">
              <span className="h-2 w-2 rounded-full bg-[#dc2626]" /> &lt;0.2 Bare Fallow
            </span>
          </div>
        </div>

        <div className="mt-5 h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={field.ndviTimeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a7a6d" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1a7a6d" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 1]} stroke="#94a3b8" tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-2xl border border-gray-200 bg-white p-3 text-xs shadow-card text-gray-900">
                        <p className="font-bold text-gray-900">{data.month}</p>
                        <p className="text-[#1a7a6d] font-mono font-semibold mt-0.5">NDVI: {data.ndvi}</p>
                        <p className="text-gray-500 mt-0.5">
                          Phase: <strong className={data.ndvi < 0.25 ? 'text-[#dc2626]' : 'text-[#1a7a6d]'}>{data.phase}</strong>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="ndvi" stroke="#1a7a6d" strokeWidth={2.5} fillOpacity={1} fill="url(#ndviGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Honest Data Availability & Limitations Card */}
      <div className="rounded-2xl border border-[#bfe3db] bg-[#e8f5f2]/70 p-5 text-xs text-[#0f5347]">
        <div className="flex items-center gap-2 font-bold text-[#0f5347]">
          <ShieldAlert className="h-4 w-4" />
          <span>NASA Remote Sensing Epistemic Limitations</span>
        </div>
        <ul className="mt-2 space-y-1.5 text-gray-600 list-disc pl-5 leading-relaxed">
          {field.dataAvailability.missingDataNotes.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
