// RASS Sentinel Mock Data
import type { DashboardData, TelemetryDataPoint } from './types';

function generateHistory(baseValue: number, variance: number, count: number = 24): TelemetryDataPoint[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const timestamp = new Date(now.getTime() - (count - i) * 3600000);
    const jitter = (Math.random() - 0.5) * 2 * variance;
    return {
      timestamp: timestamp.toISOString(),
      value: Math.max(0, Math.round((baseValue + jitter) * 100) / 100)
    };
  });
}

function generateSpikeHistory(baseValue: number, variance: number, spikeAt: number, spikeValue: number, count: number = 24): TelemetryDataPoint[] {
  const history = generateHistory(baseValue, variance, count);
  if (spikeAt >= 0 && spikeAt < count) {
    history[spikeAt].value = spikeValue;
    // Gradual recovery
    for (let i = spikeAt + 1; i < Math.min(spikeAt + 4, count); i++) {
      history[i].value = spikeValue - (spikeValue - baseValue) * ((i - spikeAt) / 4);
    }
  }
  return history;
}

export const mockDashboardData: DashboardData = {
  rassScore: {
    overall: 73,
    reliability: 68,
    availability: 92,
    scalability: 55,
    security: 78
  },
  telemetry: {
    errorRate: {
      name: 'Error Rate',
      unit: '%',
      current: 6.2,
      threshold: 5.0,
      history: generateSpikeHistory(2.1, 1.5, 20, 8.5),
      status: 'critical'
    },
    latencyP99: {
      name: 'P99 Latency',
      unit: 'ms',
      current: 342,
      threshold: 500,
      history: generateSpikeHistory(280, 60, 18, 680),
      status: 'healthy'
    },
    latencyP50: {
      name: 'P50 Latency',
      unit: 'ms',
      current: 85,
      threshold: 200,
      history: generateHistory(78, 15),
      status: 'healthy'
    },
    cpuUsage: {
      name: 'CPU Usage',
      unit: '%',
      current: 82,
      threshold: 80,
      history: generateSpikeHistory(65, 10, 19, 92),
      status: 'warning'
    },
    memoryUsage: {
      name: 'Memory Usage',
      unit: '%',
      current: 71,
      threshold: 85,
      history: generateHistory(68, 5),
      status: 'healthy'
    },
    requestsPerSec: {
      name: 'Requests/sec',
      unit: 'rps',
      current: 12450,
      threshold: 20000,
      history: generateHistory(11800, 2000),
      status: 'healthy'
    },
    uptime: {
      name: 'Uptime',
      unit: '%',
      current: 99.94,
      threshold: 99.9,
      history: generateHistory(99.96, 0.03),
      status: 'healthy'
    },
    openVulnerabilities: {
      name: 'Open Vulnerabilities',
      unit: 'count',
      current: 3,
      threshold: 0,
      history: generateHistory(2, 1.5),
      status: 'warning'
    }
  },
  anomalies: [
    {
      id: 'ANM-001',
      metric: 'Error Rate',
      severity: 'critical',
      message: 'Error rate spiked to 6.2%, exceeding the 5% threshold. Correlates with deployment v2.14.3 at 14:32 UTC.',
      detectedAt: new Date(Date.now() - 1800000).toISOString(),
      value: 6.2,
      expectedRange: '1.0% – 4.5%',
      category: 'reliability'
    },
    {
      id: 'ANM-002',
      metric: 'CPU Usage',
      severity: 'high',
      message: 'CPU usage sustained above 80% for 45+ minutes on nodes app-prod-03, app-prod-07. Possible resource exhaustion.',
      detectedAt: new Date(Date.now() - 2700000).toISOString(),
      value: 82,
      expectedRange: '40% – 75%',
      category: 'scalability'
    },
    {
      id: 'ANM-003',
      metric: 'P99 Latency',
      severity: 'medium',
      message: 'P99 latency spike detected at 680ms (6h ago). Pattern suggests database connection pool saturation.',
      detectedAt: new Date(Date.now() - 21600000).toISOString(),
      value: 680,
      expectedRange: '200ms – 450ms',
      category: 'reliability'
    },
    {
      id: 'ANM-004',
      metric: 'Open Vulnerabilities',
      severity: 'medium',
      message: '3 new CVEs detected in dependency tree: CVE-2026-1234 (high), CVE-2026-1235 (medium), CVE-2026-1236 (low).',
      detectedAt: new Date(Date.now() - 86400000).toISOString(),
      value: 3,
      expectedRange: '0',
      category: 'security'
    },
    {
      id: 'ANM-005',
      metric: 'Memory Usage',
      severity: 'low',
      message: 'Gradual memory increase trend detected over 72h. No immediate risk but may indicate a slow memory leak.',
      detectedAt: new Date(Date.now() - 3600000).toISOString(),
      value: 71,
      expectedRange: '55% – 70%',
      category: 'scalability'
    }
  ],
  recommendations: [
    {
      id: 'REC-001',
      title: 'Investigate Recent Deployment',
      description: 'Error rate exceeded 5% — strongly correlates with deployment v2.14.3. Consider rollback or hotfix.',
      priority: 'critical',
      category: 'reliability',
      action: 'Rollback to v2.14.2 or investigate error logs for root cause.',
      impact: 'Could reduce error rate by ~60% and restore reliability score to 85+.',
      icon: 'error'
    },
    {
      id: 'REC-002',
      title: 'Scale Horizontally',
      description: 'CPU sustained above 80% on multiple nodes — add capacity to prevent resource exhaustion.',
      priority: 'high',
      category: 'scalability',
      action: 'Add 2-3 additional app server nodes or enable auto-scaling with 70% CPU trigger.',
      impact: 'Reduces CPU pressure by ~30%, improves scalability score by 15+ points.',
      icon: 'dns'
    },
    {
      id: 'REC-003',
      title: 'Optimize Database Connections',
      description: 'P99 latency spikes correlate with connection pool saturation. Tune pool settings.',
      priority: 'medium',
      category: 'reliability',
      action: 'Increase connection pool max from 20 to 50. Enable connection pooling with PgBouncer.',
      impact: 'Reduces P99 latency spikes by ~40%, prevents cascading timeouts.',
      icon: 'storage'
    },
    {
      id: 'REC-004',
      title: 'Patch Critical Vulnerabilities',
      description: '3 CVEs detected — CVE-2026-1234 rated HIGH. Update affected dependencies immediately.',
      priority: 'high',
      category: 'security',
      action: 'Run dependency update: npm audit fix --force. Review breaking changes.',
      impact: 'Resolves all 3 CVEs, improves security score by 10+ points.',
      icon: 'security'
    },
    {
      id: 'REC-005',
      title: 'Investigate Memory Leak',
      description: 'Slow upward trend in memory over 72h. Profile heap usage to identify leak source.',
      priority: 'low',
      category: 'scalability',
      action: 'Enable heap profiling, capture snapshots at 1h intervals, compare retained objects.',
      impact: 'Prevents future OOM incidents, stabilizes memory at ~60%.',
      icon: 'memory'
    },
    {
      id: 'REC-006',
      title: 'Enable Rate Limiting',
      description: 'Request volume trending upward. Protect services with rate limiting before peak.',
      priority: 'medium',
      category: 'security',
      action: 'Configure rate limiting at API gateway: 1000 req/min per client.',
      impact: 'Prevents abuse, reduces DDoS risk, improves security posture.',
      icon: 'speed'
    }
  ],
  services: [
    { service: 'API Gateway', status: 'operational', uptime: 99.99, lastIncident: null, responseTime: 12 },
    { service: 'Auth Service', status: 'operational', uptime: 99.97, lastIncident: '2026-02-20T10:30:00Z', responseTime: 45 },
    { service: 'Core Platform', status: 'degraded', uptime: 99.85, lastIncident: '2026-02-23T14:32:00Z', responseTime: 342 },
    { service: 'Database Cluster', status: 'operational', uptime: 99.99, lastIncident: null, responseTime: 8 },
    { service: 'Cache Layer', status: 'operational', uptime: 99.98, lastIncident: '2026-02-18T03:15:00Z', responseTime: 2 },
    { service: 'Message Queue', status: 'operational', uptime: 99.96, lastIncident: '2026-02-19T22:10:00Z', responseTime: 15 },
    { service: 'CDN / Static Assets', status: 'operational', uptime: 100, lastIncident: null, responseTime: 5 },
    { service: 'Monitoring Stack', status: 'operational', uptime: 99.95, lastIncident: null, responseTime: 28 }
  ],
  lastUpdated: new Date().toISOString(),
  dataSource: 'RASS Sentinel'
};
