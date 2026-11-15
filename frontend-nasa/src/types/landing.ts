export type Language = 'id' | 'en';

export interface DataSensor {
  id: string;
  name: string;
  agency: string;
  resolution: string;
  temporal: string;
  role: string;
  scaleType: 'plot' | 'regional' | 'basin';
  status: 'active' | 'context' | 'optional' | 'backup';
  description: string;
  citationUrl?: string;
}

export interface PipelineStep {
  number: string;
  title: string;
  shortDesc: string;
  detail: string;
  sensors: string[];
  iconName: string;
}

export interface DifferentiatorItem {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  iconName: string;
  tag: string;
}

export interface ProblemPoint {
  title: string;
  desc: string;
}

export interface StatItem {
  number: string;
  label: string;
  detail: string;
  source: string;
}

