// RASS Sentinel Type Definitions

export interface RASSScore {
  overall: number;
  reliability: number;
  availability: number;
  scalability: number;
  security: number;
}

export interface TelemetryDataPoint {
  timestamp: string;
  value: number;
}

export interface TelemetryMetric {
  name: string;
  unit: string;
  current: number;
  threshold: number;
  history: TelemetryDataPoint[];
  status: 'healthy' | 'warning' | 'critical';
}

export interface Anomaly {
  id: string;
  metric: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  detectedAt: string;
  value: number;
  expectedRange: string;
  category: 'reliability' | 'availability' | 'scalability' | 'security';
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'reliability' | 'availability' | 'scalability' | 'security';
  action: string;
  impact: string;
  icon: string;
}

export interface SystemStatus {
  service: string;
  status: 'operational' | 'degraded' | 'outage';
  uptime: number;
  lastIncident: string | null;
  responseTime: number;
}

export interface DashboardData {
  rassScore: RASSScore;
  telemetry: Record<string, TelemetryMetric>;
  anomalies: Anomaly[];
  recommendations: Recommendation[];
  services: SystemStatus[];
  lastUpdated: string;
  dataSource: string;
}

export type ScoreLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export function getScoreLevel(score: number): ScoreLevel {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  if (score >= 40) return 'poor';
  return 'critical';
}

export function getScoreColor(score: number): string {
  if (score >= 90) return '#4caf50';
  if (score >= 75) return '#8bc34a';
  if (score >= 60) return '#ff9800';
  if (score >= 40) return '#ff5722';
  return '#f44336';
}

export function getSeverityColor(severity: 'low' | 'medium' | 'high' | 'critical'): string {
  switch (severity) {
    case 'low': return '#4caf50';
    case 'medium': return '#ff9800';
    case 'high': return '#ff5722';
    case 'critical': return '#f44336';
  }
}

export function getCategoryIcon(category: string): string {
  switch (category) {
    case 'reliability': return 'verified';
    case 'availability': return 'cloud_done';
    case 'scalability': return 'trending_up';
    case 'security': return 'shield';
    default: return 'info';
  }
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'reliability': return '#42a5f5';
    case 'availability': return '#66bb6a';
    case 'scalability': return '#ab47bc';
    case 'security': return '#ef5350';
    default: return '#78909c';
  }
}

// Splunk Log Types
export interface SplunkLogEntry {
  id: string;
  timestamp: string;
  service: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  message: string;
  errorCode?: string;
  stackTrace?: string;
  frequency: number; // How many times this error occurred
  repo?: string;
  lineNumber?: number;
}

// Error Inference Types
export interface ErrorInference {
  id: string;
  logId: string;
  service: string;
  repo: string;
  inferredLocation: string;
  lineNumbers: number[];
  confidence: 'high' | 'medium' | 'low';
  rootCause: string;
  affectedComponent: string;
  relatedLogs: string[];
}

// Historical Solution Types
export interface HistoricalSolution {
  id: string;
  errorPattern: string;
  service: string;
  solution: string;
  stepsToResolve: string[];
  resolvedBy: string;
  resolvedAt: string;
  timeToResolve: string;
  effectiveness: number; // 0-100
  tags: string[];
}

// Future Prediction Types
export interface FuturePrediction {
  currentRPS: number;
  predictedRPS: number;
  currentScore: number;
  predictedScore: number;
  breakdown: {
    reliability: { current: number; predicted: number };
    availability: { current: number; predicted: number };
    scalability: { current: number; predicted: number };
    security: { current: number; predicted: number };
  };
  risks: string[];
  recommendations: string[];
}

export function getLogLevelColor(level: 'INFO' | 'WARN' | 'ERROR' | 'FATAL'): string {
  switch (level) {
    case 'INFO': return '#4caf50';
    case 'WARN': return '#ff9800';
    case 'ERROR': return '#f44336';
    case 'FATAL': return '#d32f2f';
  }
}

export function getConfidenceColor(confidence: 'high' | 'medium' | 'low'): string {
  switch (confidence) {
    case 'high': return '#4caf50';
    case 'medium': return '#ff9800';
    case 'low': return '#ff5722';
  }
}
