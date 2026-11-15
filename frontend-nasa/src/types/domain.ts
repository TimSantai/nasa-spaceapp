export type ClimatePhase = 'el_nino' | 'normal' | 'la_nina';

export interface FarmerConstraints {
  irrigationAccess: boolean; // True if canal/pump is available for dry season
  machineryAccess: boolean;  // True if tractor/rotavator is accessible for tillage
  marketAccess: boolean;     // True if guaranteed buyer/off-taker exists locally
}

export interface ClimateScenario {
  rainfallAnomalyPercent: number; // -30% to +30%
  temperatureAnomalyDelta: number; // 0°C to +2.5°C
}

export interface StrategyConstraintRequirements {
  requiresIrrigationDrySeason: boolean;
  requiresMechanization: boolean;
  requiresSpecializedMarket: boolean;
}

// Objectives computed by the backend rotation engine (no yield or labour model exists).
export interface PriorityWeights {
  waterEfficiency: number;  // 0 - 100: low irrigation need
  soilHealth: number;       // 0 - 100: cover, legume share, crop diversity
  coverDays: number;        // 0 - 100: share of the year under living cover
  erosionControl: number;   // 0 - 100: little rain on bare soil (slope-weighted)
  pestBreak: number;        // 0 - 100: changes of crop family between seasons
}

export interface PplBriefMetadata {
  farmerName: string;
  poktanName: string;
  pplOfficerName: string;
  notes: string;
}

// 0-100 scores. waterEfficiency and erosionControl are relative to the strategies compared
// (100 = best of them); soilHealth, coverDays and pestBreak are absolute indicators x 100.
export interface ScoreSet {
  waterEfficiency: number;
  soilHealth: number;
  coverDays: number;
  erosionControl: number;
  pestBreak: number;
  overall: number;          // Weighted score 0 - 100
}

// Physical indicators from the engine, shown next to the relative scores.
export interface StrategyMetrics {
  irrigationMeanMm: number;   // per rotation year, mean of analog years
  irrigationWorstMm: number;  // CVaR20: mean of the driest 20 % of analog years
  coverShare: number;         // 0-1
  legumeShare: number;        // 0-1
  erosionIndex: number;       // rain on bare soil x RUSLE slope factor, per rotation year
  analogYears: number[];
  analogGrouping: string;     // e.g. "enso = el_nino"
}

export interface DataSource {
  id: string;
  name: string;
  resolution: string;
  type: 'Satellite' | 'Field Survey' | 'Reanalysis' | 'Agro Model';
  role: string;
  url?: string;
}

export interface EvidenceCardData {
  reasoning: string;
  evidence?: string[];      // quantitative evidence lines from the engine
  dataSources: DataSource[];
  benefits: string[];
  dataGaps: string[];
  localChecks: string[];
}

export type ConfidenceLevel = 'HIGH' | 'MODERATE' | 'LOW';

export interface Strategy {
  id: string;
  name: string;
  cropSequence: string[];
  isBaseline: boolean;
  paretoStatus: 'Optimal' | 'Tradeoff' | 'Dominated';
  confidence: ConfidenceLevel;
  confidenceReason: string;
  scores: {
    mean: ScoreSet;
    worstCase: ScoreSet; // CVaR (Conditional Value at Risk)
  };
  constraintRequirements?: StrategyConstraintRequirements;
  evidence: EvidenceCardData;
  metrics?: StrategyMetrics;
}

export interface ClimateMonthData {
  month: string;
  rainfall: number;      // mm
  tempMin: number;       // Celsius
  tempMax: number;       // Celsius
  soilMoisture: number;  // % or m³/m³
}

export interface NdviDataPoint {
  month: string;
  ndvi: number;          // 0.0 - 1.0
  phase: 'Land Prep' | 'Vegetative' | 'Reproductive' | 'Fallow (Bera)';
  observations?: number; // clear-sky HLS scenes behind the monthly median
}

export interface FieldSoilInfo {
  type: string;
  texture: string;
  organicMatter: string;
  awc: number;           // Available Water Capacity (mm/m)
  slope: number;         // %
  erosionRisk: 'Low' | 'Moderate' | 'High';
}

export interface DataAvailabilityStatus {
  hasObservedRotation: boolean;
  hasFieldSoilSurvey: boolean;
  hasSatelliteNdvi: boolean;
  hasDailyPrecipitation: boolean;
  overallConfidence: ConfidenceLevel;
  missingDataNotes: string[];
}

export interface FieldProfile {
  id: string;
  name: string;
  regency: string;       // e.g. "Banyumas"
  district: string;      // e.g. "Sumbang"
  village: string;       // e.g. "Karangrau"
  coordinates: [number, number]; // [lat, lng]
  elevationMeters: number;
  areaHectares: number;
  currentRotation: string[];
  soil: FieldSoilInfo;
  climateHistory: ClimateMonthData[];
  ndviTimeSeries: NdviDataPoint[];
  dataAvailability: DataAvailabilityStatus;
  provenance?: Record<string, string | null>;
}
