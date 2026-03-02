// RASS Sentinel Mock Data
import type { DashboardData, TelemetryDataPoint, SplunkLogEntry, ErrorInference, HistoricalSolution, FuturePrediction } from './types';

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

// Mock Splunk Logs - Service Level Error Analysis
export const mockSplunkLogs: SplunkLogEntry[] = [
  {
    id: 'LOG-001',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    service: 'CIS Service',
    level: 'ERROR',
    message: 'NullPointerException: CIS info is null at line 22',
    errorCode: 'NPE-001',
    stackTrace: 'com.digicert.cis.CISHandler.getCISInfo(CISHandler.java:22)\n  at com.digicert.api.CertificateController.issueCert(CertificateController.java:145)',
    frequency: 847,
    repo: 'cis-service',
    lineNumber: 22
  },
  {
    id: 'LOG-002',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    service: 'Auth Service',
    level: 'ERROR',
    message: 'TokenExpiredException: JWT token has expired',
    errorCode: 'AUTH-002',
    stackTrace: 'com.digicert.auth.JWTValidator.validate(JWTValidator.java:89)\n  at com.digicert.auth.AuthFilter.doFilter(AuthFilter.java:34)',
    frequency: 523,
    repo: 'auth-service',
    lineNumber: 89
  },
  {
    id: 'LOG-003',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    service: 'Certificate Service',
    level: 'FATAL',
    message: 'ConnectionPoolExhaustedException: Unable to acquire connection from pool',
    errorCode: 'DB-003',
    stackTrace: 'com.digicert.db.ConnectionPool.acquire(ConnectionPool.java:156)\n  at com.digicert.cert.CertificateRepository.findById(CertificateRepository.java:45)',
    frequency: 234,
    repo: 'certificate-service',
    lineNumber: 156
  },
  {
    id: 'LOG-004',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    service: 'Validation Service',
    level: 'ERROR',
    message: 'DomainValidationException: DNS record not found for domain',
    errorCode: 'VAL-004',
    stackTrace: 'com.digicert.validation.DNSValidator.validate(DNSValidator.java:78)\n  at com.digicert.validation.DomainValidator.validateDomain(DomainValidator.java:112)',
    frequency: 189,
    repo: 'validation-service',
    lineNumber: 78
  },
  {
    id: 'LOG-005',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    service: 'CIS Service',
    level: 'WARN',
    message: 'CISCacheExpired: CIS cache entry expired, fetching from upstream',
    errorCode: 'CACHE-001',
    stackTrace: 'com.digicert.cis.CISCache.get(CISCache.java:45)\n  at com.digicert.cis.CISHandler.getCISInfo(CISHandler.java:18)',
    frequency: 1256,
    repo: 'cis-service',
    lineNumber: 45
  },
  {
    id: 'LOG-006',
    timestamp: new Date(Date.now() - 2400000).toISOString(),
    service: 'API Gateway',
    level: 'ERROR',
    message: 'RateLimitExceededException: Client exceeded rate limit of 1000 req/min',
    errorCode: 'RATE-001',
    stackTrace: 'com.digicert.gateway.RateLimiter.check(RateLimiter.java:67)\n  at com.digicert.gateway.GatewayFilter.doFilter(GatewayFilter.java:29)',
    frequency: 456,
    repo: 'api-gateway',
    lineNumber: 67
  }
];

// Error Inference - Code Location Analysis
export const mockErrorInferences: ErrorInference[] = [
  {
    id: 'INF-001',
    logId: 'LOG-001',
    service: 'CIS Service',
    repo: 'cis-service',
    inferredLocation: 'CISHandler.java - getCISInfo() method',
    lineNumbers: [21, 22, 23],
    confidence: 'high',
    rootCause: 'CIS info is not populated before method call. Missing null check at line 21-22.',
    affectedComponent: 'Certificate Issuance Pipeline',
    relatedLogs: ['LOG-005']
  },
  {
    id: 'INF-002',
    logId: 'LOG-002',
    service: 'Auth Service',
    repo: 'auth-service',
    inferredLocation: 'JWTValidator.java - validate() method',
    lineNumbers: [87, 88, 89],
    confidence: 'high',
    rootCause: 'Token expiry check fails when clock skew exceeds 30 seconds. No grace period configured.',
    affectedComponent: 'Authentication Flow',
    relatedLogs: []
  },
  {
    id: 'INF-003',
    logId: 'LOG-003',
    service: 'Certificate Service',
    repo: 'certificate-service',
    inferredLocation: 'ConnectionPool.java - acquire() method',
    lineNumbers: [154, 155, 156],
    confidence: 'medium',
    rootCause: 'Connection pool size (20) insufficient for current load. Connections not being released properly in some code paths.',
    affectedComponent: 'Database Layer',
    relatedLogs: ['LOG-004']
  },
  {
    id: 'INF-004',
    logId: 'LOG-004',
    service: 'Validation Service',
    repo: 'validation-service',
    inferredLocation: 'DNSValidator.java - validate() method',
    lineNumbers: [76, 77, 78],
    confidence: 'medium',
    rootCause: 'DNS lookup timeout set too low (5s). Some DNS providers respond slowly.',
    affectedComponent: 'Domain Validation Pipeline',
    relatedLogs: []
  }
];

// Historical Solutions - Previously Taken Steps
export const mockHistoricalSolutions: HistoricalSolution[] = [
  {
    id: 'SOL-001',
    errorPattern: 'NullPointerException: CIS info is null',
    service: 'CIS Service',
    solution: 'Handle null CIS info case with fail-fast approach',
    stepsToResolve: [
      'Add null check at CISHandler.java:21 before accessing CIS info',
      'Implement fail-fast pattern: throw CISNotPopulatedException if CIS info is null',
      'Add circuit breaker to prevent cascading failures',
      'Log warning when CIS info is not available for debugging'
    ],
    resolvedBy: 'John Smith',
    resolvedAt: '2026-02-15T10:30:00Z',
    timeToResolve: '2h 15m',
    effectiveness: 94,
    tags: ['null-pointer', 'cis', 'fail-fast', 'circuit-breaker']
  },
  {
    id: 'SOL-002',
    errorPattern: 'TokenExpiredException: JWT token has expired',
    service: 'Auth Service',
    solution: 'Implement token refresh mechanism with grace period',
    stepsToResolve: [
      'Add 60-second grace period for token expiry validation',
      'Implement automatic token refresh in AuthFilter before expiry',
      'Add clock skew tolerance configuration (default: 30s)',
      'Return 419 status with refresh token hint instead of 401'
    ],
    resolvedBy: 'Sarah Johnson',
    resolvedAt: '2026-02-10T14:45:00Z',
    timeToResolve: '1h 30m',
    effectiveness: 98,
    tags: ['jwt', 'auth', 'token-refresh', 'grace-period']
  },
  {
    id: 'SOL-003',
    errorPattern: 'ConnectionPoolExhaustedException',
    service: 'Certificate Service',
    solution: 'Increase connection pool and add connection leak detection',
    stepsToResolve: [
      'Increase maxPoolSize from 20 to 50 in database config',
      'Enable connection leak detection with 30s threshold',
      'Add connection timeout of 5s to prevent indefinite waits',
      'Implement connection pooling with HikariCP for better performance',
      'Add metrics for active/idle connections monitoring'
    ],
    resolvedBy: 'Mike Chen',
    resolvedAt: '2026-02-20T09:15:00Z',
    timeToResolve: '3h 45m',
    effectiveness: 87,
    tags: ['database', 'connection-pool', 'hikari', 'performance']
  },
  {
    id: 'SOL-004',
    errorPattern: 'DomainValidationException: DNS record not found',
    service: 'Validation Service',
    solution: 'Increase DNS timeout and add retry mechanism',
    stepsToResolve: [
      'Increase DNS lookup timeout from 5s to 15s',
      'Implement exponential backoff retry (3 attempts)',
      'Add fallback to secondary DNS resolver',
      'Cache successful DNS lookups for 5 minutes'
    ],
    resolvedBy: 'Emily Davis',
    resolvedAt: '2026-02-18T16:20:00Z',
    timeToResolve: '1h 45m',
    effectiveness: 91,
    tags: ['dns', 'validation', 'retry', 'timeout']
  }
];

// Calculate Future RASS Prediction based on 2x RPS
export function calculateFuturePrediction(currentData: DashboardData): FuturePrediction {
  const currentRPS = currentData.telemetry.requestsPerSec?.current || 12000;
  const predictedRPS = currentRPS * 2;
  
  // Simulate degradation at higher load
  const loadFactor = 1.8; // Impact multiplier for doubling load
  
  const currentScore = currentData.rassScore.overall;
  const reliability = currentData.rassScore.reliability;
  const availability = currentData.rassScore.availability;
  const scalability = currentData.rassScore.scalability;
  const security = currentData.rassScore.security;
  
  // Scalability takes biggest hit, then reliability, availability less affected
  const predictedScalability = Math.max(20, scalability - (scalability * 0.35));
  const predictedReliability = Math.max(30, reliability - (reliability * 0.15));
  const predictedAvailability = Math.max(40, availability - (availability * 0.08));
  const predictedSecurity = security; // Security doesn't change with load
  
  const predictedScore = Math.round(
    (predictedReliability + predictedAvailability + predictedScalability + predictedSecurity) / 4
  );
  
  const risks: string[] = [];
  const recommendations: string[] = [];
  
  if (predictedScalability < 50) {
    risks.push('Scalability will drop below acceptable threshold');
    recommendations.push('Scale horizontally: Add 4-6 more app nodes before load increase');
  }
  if (predictedReliability < 60) {
    risks.push('Error rate likely to exceed 8% at 2x load');
    recommendations.push('Implement circuit breakers on all external dependencies');
  }
  if (currentData.telemetry.cpuUsage?.current > 70) {
    risks.push('CPU exhaustion risk at 2x RPS - currently at ' + currentData.telemetry.cpuUsage.current + '%');
    recommendations.push('Upgrade to compute-optimized instances (c5.2xlarge or higher)');
  }
  if (currentData.telemetry.memoryUsage?.current > 60) {
    risks.push('Memory pressure will increase significantly');
    recommendations.push('Fix memory leak before scaling to prevent OOM cascades');
  }
  
  recommendations.push('Enable auto-scaling with 65% CPU threshold');
  recommendations.push('Add read replicas for database to handle query load');
  recommendations.push('Implement request queuing with backpressure for graceful degradation');
  
  return {
    currentRPS,
    predictedRPS,
    currentScore,
    predictedScore,
    breakdown: {
      reliability: { current: reliability, predicted: predictedReliability },
      availability: { current: availability, predicted: predictedAvailability },
      scalability: { current: scalability, predicted: predictedScalability },
      security: { current: security, predicted: predictedSecurity }
    },
    risks,
    recommendations
  };
}
