<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import HealthScoreGauge from '$lib/components/HealthScoreGauge.svelte';
  import MetricCard from '$lib/components/MetricCard.svelte';
  import MiniGauge from '$lib/components/MiniGauge.svelte';
  import AnomalyPanel from '$lib/components/AnomalyPanel.svelte';
  import RecommendationsPanel from '$lib/components/RecommendationsPanel.svelte';
  import TelemetryChart from '$lib/components/TelemetryChart.svelte';
  import MetricDetailModal from '$lib/components/MetricDetailModal.svelte';
  import TelemetryDetailModal from '$lib/components/TelemetryDetailModal.svelte';
  import FuturePrediction from '$lib/components/FuturePrediction.svelte';
  import ServiceLogAnalysis from '$lib/components/ServiceLogAnalysis.svelte';
  import ErrorInference from '$lib/components/ErrorInference.svelte';
  import HistoricalSolutions from '$lib/components/HistoricalSolutions.svelte';
  import TelemetryModal from '$lib/components/TelemetryModal.svelte';
  import { dashboardData, rassScore, anomalies, recommendations, telemetry, refreshData, refreshing, splunkLogs, errorInferences, historicalSolutions, futurePrediction, futurePredictionConfig } from '$lib/stores';
  import { getCategoryColor } from '$lib/types';
  import type { FuturePredictionConfig, SplunkLogEntry, TelemetryMetric } from '$lib/types';

  let refreshInterval: ReturnType<typeof setInterval>;
  let lastUpdated = '';

  // Modal state for metric cards
  let showDetailModal = false;
  let selectedCategory = '';
  let selectedScore = 0;
  let selectedMetrics: { key: string; metric: TelemetryMetric }[] = [];

  // Modal state for telemetry charts (legacy - kept for detail modal)
  let showTelemetryModal = false;
  let selectedTelemetryMetric: TelemetryMetric | null = null;
  let selectedTelemetryColor = '#42a5f5';

  // Modal state for full telemetry view
  let showTelemetryDataModal = false;
  let selectedTelemetryErrorLog: SplunkLogEntry | null = null;

  // Tab state for Insights & Alerts
  let activeInsightTab: 'anomalies' | 'recommendations' = 'anomalies';

  // Category to telemetry mapping
  const categoryMetrics: Record<string, string[]> = {
    reliability: ['errorRate', 'latencyP99', 'latencyP50'],
    availability: ['uptime', 'requestsPerSec'],
    scalability: ['cpuUsage', 'memoryUsage'],
    security: ['openVulnerabilities']
  };

  $: if ($dashboardData.lastUpdated) {
    lastUpdated = new Date($dashboardData.lastUpdated).toLocaleTimeString();
  }

  onMount(() => {
    refreshInterval = setInterval(refreshData, 30000);
  });

  onDestroy(() => {
    if (refreshInterval) clearInterval(refreshInterval);
  });

  function handleManualRefresh() {
    refreshData();
  }

  function handleCardClick(event: CustomEvent<{ category: string; score: number }>) {
    const { category, score } = event.detail;
    selectedCategory = category;
    selectedScore = score;
    
    // Get relevant metrics for this category
    const metricKeys = categoryMetrics[category] || [];
    selectedMetrics = metricKeys
      .filter(key => $telemetry[key])
      .map(key => ({ key, metric: $telemetry[key] }));
    
    showDetailModal = true;
  }

  function handleTelemetryClick(event: CustomEvent<{ label: string; data: any; current: number; threshold: number; status: string; unit: string; color: string }>) {
    const { label, data, current, threshold, status, unit, color } = event.detail;
    selectedTelemetryMetric = {
      name: label,
      unit,
      current,
      threshold,
      history: data,
      status: status as 'healthy' | 'warning' | 'critical'
    };
    selectedTelemetryColor = color;
    showTelemetryModal = true;
  }

  function closeModal() {
    showDetailModal = false;
  }

  function closeTelemetryModal() {
    showTelemetryModal = false;
  }

  function openTelemetryDataModal() {
    showTelemetryDataModal = true;
  }

  function closeTelemetryDataModal() {
    showTelemetryDataModal = false;
  }

  function handleLogErrorSelect(event: CustomEvent<SplunkLogEntry>) {
    selectedTelemetryErrorLog = event.detail;
    showTelemetryDataModal = true;
  }

  function clearTelemetryErrorFilter() {
    selectedTelemetryErrorLog = null;
  }

  function handlePredictionConfigChange(event: CustomEvent<FuturePredictionConfig>) {
    futurePredictionConfig.set(event.detail);
  }
</script>

<svelte:head>
  <title>RASS Sentinel | Health Score Dashboard</title>
  <meta name="description" content="RASS Sentinel - Intelligent Health Score & Risk Detection System" />
</svelte:head>

<main class="dashboard">
  <!-- Top Bar -->
  <div class="top-bar">
    <div class="status-info">
      <span class="material-icons pulse">sensors</span>
      <span>Live Monitoring</span>
      <span class="data-source">Source: {$dashboardData.dataSource}</span>
    </div>
    <div class="refresh-section">
      <span class="last-updated">Last updated: {lastUpdated}</span>
      <button class="telemetry-btn" on:click={openTelemetryDataModal}>
        <span class="material-icons">show_chart</span>
        Show Telemetry Data
      </button>
      <button class="refresh-btn" on:click={handleManualRefresh} disabled={$refreshing}>
        <span class="material-icons" class:spinning={$refreshing}>refresh</span>
        {$refreshing ? 'Refreshing...' : 'Refresh'}
      </button>
    </div>
  </div>

  <!-- Hero Section: RASS Score -->
  <section class="hero-section">
    <div class="hero-content">
      <div class="main-gauge">
        <HealthScoreGauge score={$rassScore.overall} label="RASS Score" size={240} />
      </div>
      <div class="component-scores">
        <div class="component-card" style="border-color: {getCategoryColor('reliability')}">
          <MiniGauge score={$rassScore.reliability} size={80} color={getCategoryColor('reliability')} />
          <div class="component-info">
            <span class="component-label">Reliability</span>
            <span class="component-desc">Errors, Latency</span>
          </div>
        </div>
        <div class="component-card" style="border-color: {getCategoryColor('availability')}">
          <MiniGauge score={$rassScore.availability} size={80} color={getCategoryColor('availability')} />
          <div class="component-info">
            <span class="component-label">Availability</span>
            <span class="component-desc">Uptime, Response</span>
          </div>
        </div>
        <div class="component-card" style="border-color: {getCategoryColor('scalability')}">
          <MiniGauge score={$rassScore.scalability} size={80} color={getCategoryColor('scalability')} />
          <div class="component-info">
            <span class="component-label">Scalability</span>
            <span class="component-desc">CPU, Memory</span>
          </div>
        </div>
        <div class="component-card" style="border-color: {getCategoryColor('security')}">
          <MiniGauge score={$rassScore.security} size={80} color={getCategoryColor('security')} />
          <div class="component-info">
            <span class="component-label">Security</span>
            <span class="component-desc">Vulnerabilities</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- RASS Metrics Cards -->
  <section class="metrics-section">
    <h2 class="section-title">
      <span class="material-icons">analytics</span>
      RASS Component Breakdown
    </h2>
    <div class="metrics-grid">
      <MetricCard
        title="Reliability"
        score={$rassScore.reliability}
        category="reliability"
        clickable={true}
        on:click={handleCardClick}
        details={[
          { label: 'Error Rate', value: `${$telemetry.errorRate?.current.toFixed(2)}%` },
          { label: 'P99 Latency', value: `${$telemetry.latencyP99?.current}ms` }
        ]}
      />
      <MetricCard
        title="Availability"
        score={$rassScore.availability}
        category="availability"
        clickable={true}
        on:click={handleCardClick}
        details={[
          { label: 'Uptime', value: `${$telemetry.uptime?.current.toFixed(2)}%` },
          { label: 'Requests/sec', value: `${$telemetry.requestsPerSec?.current.toLocaleString()}` }
        ]}
      />
      <MetricCard
        title="Scalability"
        score={$rassScore.scalability}
        category="scalability"
        clickable={true}
        on:click={handleCardClick}
        details={[
          { label: 'CPU Usage', value: `${$telemetry.cpuUsage?.current}%` },
          { label: 'Memory', value: `${$telemetry.memoryUsage?.current}%` }
        ]}
      />
      <MetricCard
        title="Security"
        score={$rassScore.security}
        category="security"
        clickable={true}
        on:click={handleCardClick}
        details={[
          { label: 'Open CVEs', value: `${$telemetry.openVulnerabilities?.current}` },
          { label: 'Status', value: $telemetry.openVulnerabilities?.current > 0 ? 'Action Needed' : 'Secure' }
        ]}
      />
    </div>
  </section>

  <!-- Future Prediction & Log Analysis -->
  <section class="prediction-section">
    <h2 class="section-title">
      <span class="material-icons">auto_graph</span>
      AI-Powered Insights & Predictions
    </h2>
    <div class="prediction-grid">
      <FuturePrediction
        prediction={$futurePrediction}
        config={$futurePredictionConfig}
        on:configChange={handlePredictionConfigChange}
      />
      <ServiceLogAnalysis logs={$splunkLogs} on:errorSelect={handleLogErrorSelect} />
    </div>
  </section>

  <!-- Error Inference & Historical Solutions -->
  <section class="analysis-section">
    <h2 class="section-title">
      <span class="material-icons">troubleshoot</span>
      Root Cause Analysis & Resolution History
    </h2>
    <div class="analysis-grid">
      <ErrorInference inferences={$errorInferences} />
      <HistoricalSolutions solutions={$historicalSolutions} />
    </div>
  </section>

  <!-- Intelligent Insights & Alerts (Tabbed) -->
  <section class="insights-section">
    <div class="insights-header">
      <div class="header-left">
        <span class="material-icons">insights</span>
        <h2>Intelligent Insights & Alerts</h2>
      </div>
      <div class="tab-controls">
        <button 
          class="tab-btn" 
          class:active={activeInsightTab === 'anomalies'}
          on:click={() => activeInsightTab = 'anomalies'}
        >
          <span class="material-icons">warning</span>
          Anomaly Detection
          <span class="badge">{$anomalies.length}</span>
        </button>
        <button 
          class="tab-btn" 
          class:active={activeInsightTab === 'recommendations'}
          on:click={() => activeInsightTab = 'recommendations'}
        >
          <span class="material-icons">lightbulb</span>
          Smart Recommendations
          <span class="badge">{$recommendations.length}</span>
        </button>
      </div>
    </div>
    
    <div class="insights-content">
      {#if activeInsightTab === 'anomalies'}
        <AnomalyPanel anomalies={$anomalies} />
      {:else}
        <RecommendationsPanel recommendations={$recommendations} />
      {/if}
    </div>
  </section>
</main>

<!-- Metric Detail Modal -->
<MetricDetailModal
  show={showDetailModal}
  category={selectedCategory}
  score={selectedScore}
  metrics={selectedMetrics}
  on:close={closeModal}
/>

<!-- Telemetry Data Modal -->
<TelemetryModal
  show={showTelemetryDataModal}
  telemetryData={$telemetry}
  splunkLogs={$splunkLogs}
  selectedErrorLog={selectedTelemetryErrorLog}
  on:clearErrorFilter={clearTelemetryErrorFilter}
  on:close={closeTelemetryDataModal}
/>

<!-- Telemetry Detail Modal -->
<TelemetryDetailModal
  show={showTelemetryModal}
  metric={selectedTelemetryMetric}
  color={selectedTelemetryColor}
  on:close={closeTelemetryModal}
/>

<style>
  .dashboard {
    padding: 1.5rem;
    max-width: 1600px;
    margin: 0 auto;
  }

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1.25rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    margin-bottom: 1.5rem;
  }

  .status-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .status-info .material-icons {
    color: #4caf50;
    font-size: 18px;
  }

  .pulse {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .data-source {
    background: rgba(255, 255, 255, 0.06);
    padding: 2px 10px;
    border-radius: 12px;
    font-family: 'Roboto Mono', monospace;
    font-size: 0.75rem;
  }

  .refresh-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .last-updated {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .telemetry-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: linear-gradient(135deg, rgba(0, 188, 212, 0.15) 0%, rgba(0, 151, 167, 0.15) 100%);
    border: 1px solid rgba(0, 188, 212, 0.3);
    color: #00bcd4;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .telemetry-btn:hover {
    background: linear-gradient(135deg, rgba(0, 188, 212, 0.25) 0%, rgba(0, 151, 167, 0.25) 100%);
    border-color: rgba(0, 188, 212, 0.5);
    color: #26c6da;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 188, 212, 0.2);
  }

  .telemetry-btn .material-icons {
    font-size: 16px;
  }

  .refresh-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.2s ease;
  }

  .refresh-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .refresh-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .refresh-btn .material-icons {
    font-size: 16px;
  }

  .spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Hero Section */
  .hero-section {
    margin-bottom: 2rem;
  }

  .hero-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4rem;
    padding: 2rem;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
  }

  .main-gauge {
    flex-shrink: 0;
  }

  .component-scores {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .component-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-left-width: 3px;
    border-radius: 10px;
    transition: all 0.2s ease;
  }

  .component-card:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateX(4px);
  }

  .component-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .component-label {
    font-weight: 600;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.9);
  }

  .component-desc {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.4);
  }

  /* Section Titles */
  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 1rem;
  }

  .section-title .material-icons {
    font-size: 20px;
    color: rgba(255, 255, 255, 0.5);
  }

  /* Metrics Section */
  .metrics-section {
    margin-bottom: 2rem;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.25rem;
  }

  /* Insights Section */
  .insights-section {
    margin-bottom: 2rem;
  }

  .insights-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .insights-header .header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .insights-header .header-left .material-icons {
    color: #ffa726;
    font-size: 28px;
  }

  .insights-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
  }

  .tab-controls {
    display: flex;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.03);
    padding: 0.4rem;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .tab-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    padding: 0.6rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.2s ease;
    position: relative;
  }

  .tab-btn .material-icons {
    font-size: 18px;
  }

  .tab-btn .badge {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.5);
    padding: 0.15rem 0.5rem;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 600;
    min-width: 24px;
    text-align: center;
  }

  .tab-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.9);
  }

  .tab-btn.active {
    background: linear-gradient(135deg, rgba(255, 167, 38, 0.15) 0%, rgba(251, 140, 0, 0.15) 100%);
    color: #ffb74d;
    border: 1px solid rgba(255, 167, 38, 0.3);
  }

  .tab-btn.active .badge {
    background: rgba(255, 167, 38, 0.2);
    color: #ffb74d;
  }

  .insights-content {
    background: linear-gradient(135deg, rgba(30, 30, 45, 0.95) 0%, rgba(20, 20, 35, 0.98) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.5rem;
  }

  .insights-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
  }

  /* Prediction Section */
  .prediction-section {
    margin-bottom: 2rem;
  }

  .prediction-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
    gap: 1.5rem;
  }

  /* Analysis Section */
  .analysis-section {
    margin-bottom: 2rem;
  }

  .analysis-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
    gap: 1.5rem;
  }

  /* Responsive - Tablet */
  @media (max-width: 1200px) {
    .prediction-grid,
    .analysis-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Responsive - Large Mobile */
  @media (max-width: 900px) {
    .hero-content {
      flex-direction: column;
      gap: 2rem;
    }

    .component-scores {
      grid-template-columns: repeat(2, 1fr);
      width: 100%;
    }

    .insights-grid {
      grid-template-columns: 1fr;
    }

    .metrics-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .insights-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .tab-controls {
      width: 100%;
    }

    .tab-btn {
      flex: 1;
      justify-content: center;
      font-size: 0.8rem;
      padding: 0.5rem 0.75rem;
    }
  }

  /* Responsive - Mobile */
  @media (max-width: 600px) {
    .dashboard {
      padding: 0.75rem;
    }

    .top-bar {
      flex-direction: column;
      gap: 0.75rem;
      text-align: center;
      padding: 0.5rem;
    }

    .status-info {
      flex-wrap: wrap;
      justify-content: center;
    }

    .refresh-section {
      flex-direction: column;
      gap: 0.5rem;
    }

    .component-scores {
      grid-template-columns: 1fr;
    }

    .metrics-grid {
      grid-template-columns: 1fr;
    }

    .section-title {
      font-size: 0.9rem;
    }

    .hero-content {
      padding: 1rem;
    }

    .main-gauge {
      transform: scale(0.85);
    }

    .insights-content {
      padding: 1rem;
    }

    .tab-btn {
      font-size: 0.75rem;
      padding: 0.5rem;
      gap: 0.3rem;
    }

    .tab-btn .material-icons {
      font-size: 16px;
    }

    .tab-btn .badge {
      font-size: 0.65rem;
      padding: 0.1rem 0.4rem;
    }
  }

  /* Responsive - Small Mobile */
  @media (max-width: 400px) {
    .dashboard {
      padding: 0.5rem;
    }

    .main-gauge {
      transform: scale(0.75);
    }

    .component-card {
      padding: 0.75rem;
    }
  }
</style>
  