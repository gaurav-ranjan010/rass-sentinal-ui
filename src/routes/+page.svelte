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
  import { dashboardData, rassScore, anomalies, recommendations, telemetry, refreshData, refreshing } from '$lib/stores';
  import { getCategoryColor } from '$lib/types';
  import type { TelemetryMetric } from '$lib/types';

  let refreshInterval: ReturnType<typeof setInterval>;
  let lastUpdated = '';

  // Modal state for metric cards
  let showDetailModal = false;
  let selectedCategory = '';
  let selectedScore = 0;
  let selectedMetrics: { key: string; metric: TelemetryMetric }[] = [];

  // Modal state for telemetry charts
  let showTelemetryModal = false;
  let selectedTelemetryMetric: TelemetryMetric | null = null;
  let selectedTelemetryColor = '#42a5f5';

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

  <!-- Telemetry Charts -->
  <section class="telemetry-section">
    <h2 class="section-title">
      <span class="material-icons">show_chart</span>
      Live Telemetry Data
    </h2>
    <div class="telemetry-grid">
      {#if $telemetry.errorRate}
        <TelemetryChart
          data={$telemetry.errorRate.history}
          label={$telemetry.errorRate.name}
          unit={$telemetry.errorRate.unit}
          current={$telemetry.errorRate.current}
          threshold={$telemetry.errorRate.threshold}
          status={$telemetry.errorRate.status}
          color="#f44336"
          clickable={true}
          on:click={handleTelemetryClick}
        />
      {/if}
      {#if $telemetry.latencyP99}
        <TelemetryChart
          data={$telemetry.latencyP99.history}
          label={$telemetry.latencyP99.name}
          unit={$telemetry.latencyP99.unit}
          current={$telemetry.latencyP99.current}
          threshold={$telemetry.latencyP99.threshold}
          status={$telemetry.latencyP99.status}
          color="#2196f3"
          clickable={true}
          on:click={handleTelemetryClick}
        />
      {/if}
      {#if $telemetry.cpuUsage}
        <TelemetryChart
          data={$telemetry.cpuUsage.history}
          label={$telemetry.cpuUsage.name}
          unit={$telemetry.cpuUsage.unit}
          current={$telemetry.cpuUsage.current}
          threshold={$telemetry.cpuUsage.threshold}
          status={$telemetry.cpuUsage.status}
          color="#ab47bc"
          clickable={true}
          on:click={handleTelemetryClick}
        />
      {/if}
      {#if $telemetry.memoryUsage}
        <TelemetryChart
          data={$telemetry.memoryUsage.history}
          label={$telemetry.memoryUsage.name}
          unit={$telemetry.memoryUsage.unit}
          current={$telemetry.memoryUsage.current}
          threshold={$telemetry.memoryUsage.threshold}
          status={$telemetry.memoryUsage.status}
          color="#9c27b0"
          clickable={true}
          on:click={handleTelemetryClick}
        />
      {/if}
      {#if $telemetry.uptime}
        <TelemetryChart
          data={$telemetry.uptime.history}
          label={$telemetry.uptime.name}
          unit={$telemetry.uptime.unit}
          current={$telemetry.uptime.current}
          threshold={$telemetry.uptime.threshold}
          status={$telemetry.uptime.status}
          color="#4caf50"
          clickable={true}
          on:click={handleTelemetryClick}
        />
      {/if}
      {#if $telemetry.requestsPerSec}
        <TelemetryChart
          data={$telemetry.requestsPerSec.history}
          label={$telemetry.requestsPerSec.name}
          unit={$telemetry.requestsPerSec.unit}
          current={$telemetry.requestsPerSec.current}
          threshold={$telemetry.requestsPerSec.threshold}
          status={$telemetry.requestsPerSec.status}
          color="#00bcd4"
          clickable={true}
          on:click={handleTelemetryClick}
        />
      {/if}
    </div>
  </section>

  <!-- Anomalies & Recommendations -->
  <section class="insights-section">
    <div class="insights-grid">
      <AnomalyPanel anomalies={$anomalies} />
      <RecommendationsPanel recommendations={$recommendations} />
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

  /* Telemetry Section */
  .telemetry-section {
    margin-bottom: 2rem;
  }

  .telemetry-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    gap: 1.25rem;
  }

  /* Insights Section */
  .insights-section {
    margin-bottom: 2rem;
  }

  .insights-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
    gap: 1.5rem;
  }

  /* Responsive */
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
  }

  @media (max-width: 600px) {
    .dashboard {
      padding: 1rem;
    }

    .top-bar {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .component-scores {
      grid-template-columns: 1fr;
    }

    .telemetry-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
  