<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import type { TelemetryMetric } from '$lib/types';

  export let show: boolean = false;
  export let metric: TelemetryMetric | null = null;
  export let color: string = '#42a5f5';

  const dispatch = createEventDispatcher();

  let selectedTimeRange = '1h';
  const timeRanges = [
    { value: '5m', label: '5 min' },
    { value: '10m', label: '10 min' },
    { value: '30m', label: '30 min' },
    { value: '1h', label: '1 hour' },
    { value: '6h', label: '6 hours' },
    { value: '24h', label: '24 hours' }
  ];

  // Chart dimensions
  const chartWidth = 650;
  const chartHeight = 220;
  const padding = { top: 25, right: 25, bottom: 35, left: 55 };

  $: innerWidth = chartWidth - padding.left - padding.right;
  $: innerHeight = chartHeight - padding.top - padding.bottom;

  $: statusColor = metric?.status === 'critical' ? '#f44336' : metric?.status === 'warning' ? '#ff9800' : '#4caf50';

  // Filter data based on time range
  function filterByTimeRange(data: { timestamp: string; value: number }[], range: string) {
    const now = Date.now();
    const rangeMs: Record<string, number> = {
      '5m': 5 * 60 * 1000,
      '10m': 10 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000
    };
    const cutoff = now - (rangeMs[range] || rangeMs['1h']);
    return data.filter(d => new Date(d.timestamp).getTime() >= cutoff);
  }

  // Calculate statistics for the filtered data
  function calculateStats(data: { timestamp: string; value: number }[]) {
    if (data.length === 0) return { min: 0, max: 0, avg: 0, current: 0, trend: 'stable', change: 0 };
    
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const current = values[values.length - 1];
    const first = values[0];
    const change = ((current - first) / first) * 100;
    const trend = change > 2 ? 'up' : change < -2 ? 'down' : 'stable';

    return { min, max, avg, current, trend, change };
  }

  $: filteredData = metric ? filterByTimeRange(metric.history, selectedTimeRange) : [];
  $: stats = calculateStats(filteredData);

  function getChartData(data: { timestamp: string; value: number }[], threshold: number) {
    if (data.length < 2) return { path: '', area: '', points: [], yTicks: [], xLabels: [], thresholdY: 0 };

    const values = data.map(d => d.value);
    const minVal = Math.min(...values) * 0.9;
    const maxVal = Math.max(...values, threshold) * 1.1;
    const range = maxVal - minVal || 1;

    const scaleX = (i: number) => padding.left + (i / (data.length - 1)) * innerWidth;
    const scaleY = (v: number) => padding.top + innerHeight - ((v - minVal) / range) * innerHeight;

    const path = data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i).toFixed(1)} ${scaleY(d.value).toFixed(1)}`)
      .join(' ');

    const area = path + 
      ` L ${scaleX(data.length - 1).toFixed(1)} ${(padding.top + innerHeight).toFixed(1)}` +
      ` L ${padding.left} ${(padding.top + innerHeight).toFixed(1)} Z`;

    const points = data.map((d, i) => ({
      x: scaleX(i),
      y: scaleY(d.value),
      value: d.value,
      time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }));

    const yTicks = Array.from({ length: 5 }, (_, i) => {
      const val = minVal + (range * i) / 4;
      return { value: val, y: scaleY(val) };
    });

    // More x-axis labels for detail view
    const labelIndices = data.length <= 6 
      ? data.map((_, i) => i)
      : [0, Math.floor(data.length / 4), Math.floor(data.length / 2), Math.floor(3 * data.length / 4), data.length - 1];
    
    const xLabels = labelIndices
      .filter(i => i < data.length)
      .map(i => ({
        x: scaleX(i),
        label: new Date(data[i]?.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

    const thresholdY = scaleY(threshold);

    return { path, area, points, yTicks, xLabels, thresholdY };
  }

  $: chartData = metric ? getChartData(filteredData, metric.threshold) : { path: '', area: '', points: [], yTicks: [], xLabels: [], thresholdY: 0 };

  function formatValue(val: number, unit: string): string {
    if (val >= 1000000) return (val / 1000000).toFixed(2) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(2) + 'k';
    return val.toFixed(val < 10 ? 2 : 0);
  }

  function close() {
    dispatch('close');
  }
</script>

{#if show && metric}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="modal-overlay" transition:fade={{ duration: 200 }} on:click={close}>
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div class="modal-content" transition:fly={{ y: 50, duration: 300 }} on:click|stopPropagation style="--metric-color: {color}">
      <div class="modal-header">
        <div class="header-left">
          <div class="metric-icon" style="background: {color}22; color: {color}">
            <span class="material-icons">show_chart</span>
          </div>
          <div class="header-text">
            <h2>{metric.name}</h2>
            <span class="subtitle">Detailed telemetry analysis</span>
          </div>
        </div>
        <div class="header-right">
          <div class="current-badge" style="color: {statusColor}">
            <span class="current-value">{formatValue(metric.current, metric.unit)}</span>
            <span class="current-unit">{metric.unit}</span>
          </div>
          <div class="status-badge" style="background: {statusColor}22; color: {statusColor}">
            {metric.status.toUpperCase()}
          </div>
          <button class="close-btn" on:click={close}>
            <span class="material-icons">close</span>
          </button>
        </div>
      </div>

      <div class="time-selector">
        <span class="time-label">Time Range:</span>
        <div class="time-buttons">
          {#each timeRanges as range}
            <button
              class="time-btn"
              class:active={selectedTimeRange === range.value}
              on:click={() => selectedTimeRange = range.value}
            >
              {range.label}
            </button>
          {/each}
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-icon material-icons">arrow_downward</span>
          <div class="stat-content">
            <span class="stat-value">{formatValue(stats.min, metric.unit)}</span>
            <span class="stat-label">Minimum</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon material-icons">arrow_upward</span>
          <div class="stat-content">
            <span class="stat-value">{formatValue(stats.max, metric.unit)}</span>
            <span class="stat-label">Maximum</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon material-icons">functions</span>
          <div class="stat-content">
            <span class="stat-value">{formatValue(stats.avg, metric.unit)}</span>
            <span class="stat-label">Average</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon material-icons" style="color: {stats.trend === 'up' ? '#f44336' : stats.trend === 'down' ? '#4caf50' : '#ff9800'}">
            {stats.trend === 'up' ? 'trending_up' : stats.trend === 'down' ? 'trending_down' : 'trending_flat'}
          </span>
          <div class="stat-content">
            <span class="stat-value" style="color: {stats.trend === 'up' ? '#f44336' : stats.trend === 'down' ? '#4caf50' : '#ff9800'}">
              {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(1)}%
            </span>
            <span class="stat-label">Change</span>
          </div>
        </div>
      </div>

      <!-- Chart -->
      <div class="chart-container">
        <div class="chart-wrapper">
          <svg width={chartWidth} height={chartHeight} viewBox="0 0 {chartWidth} {chartHeight}">
            <!-- Grid lines -->
            {#each chartData.yTicks as tick}
              <line
                x1={padding.left}
                y1={tick.y}
                x2={chartWidth - padding.right}
                y2={tick.y}
                stroke="rgba(255,255,255,0.06)"
                stroke-dasharray="3,3"
              />
              <text x={padding.left - 10} y={tick.y + 4} text-anchor="end" class="axis-label">
                {formatValue(tick.value, metric.unit)}
              </text>
            {/each}

            <!-- X-axis labels -->
            {#each chartData.xLabels as xl}
              <text x={xl.x} y={chartHeight - 8} text-anchor="middle" class="axis-label">{xl.label}</text>
            {/each}

            <!-- Threshold line -->
            {#if metric.threshold > 0}
              <line
                x1={padding.left}
                y1={chartData.thresholdY}
                x2={chartWidth - padding.right}
                y2={chartData.thresholdY}
                stroke="#ff5722"
                stroke-width="2"
                stroke-dasharray="8,4"
                opacity="0.8"
              />
              <rect x={chartWidth - padding.right + 5} y={chartData.thresholdY - 10} width="80" height="20" rx="4" fill="rgba(255,87,34,0.2)" />
              <text x={chartWidth - padding.right + 10} y={chartData.thresholdY + 4} class="threshold-label">
                Threshold: {metric.threshold}
              </text>
            {/if}

            <!-- Area fill -->
            {#if chartData.area}
              <path d={chartData.area} fill="url(#areaGrad)" opacity="0.4" />
            {/if}

            <!-- Line path -->
            {#if chartData.path}
              <path d={chartData.path} fill="none" stroke={color} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="chart-line" />
            {/if}

            <!-- Data points -->
            {#each chartData.points as point, i}
              <circle cx={point.x} cy={point.y} r="5" fill={color} stroke="rgba(0,0,0,0.4)" stroke-width="1.5" class="data-point">
                <title>{point.time}: {point.value.toFixed(2)} {metric.unit}</title>
              </circle>
            {/each}

            <!-- Gradient definition -->
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color={color} stop-opacity="0.5" />
                <stop offset="100%" stop-color={color} stop-opacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <!-- Info footer -->
      <div class="info-footer">
        <div class="info-item">
          <span class="material-icons">warning_amber</span>
          <span>Threshold: {metric.threshold} {metric.unit}</span>
        </div>
        <div class="info-item">
          <span class="material-icons">timeline</span>
          <span>{filteredData.length} data points</span>
        </div>
        <div class="info-item">
          <span class="material-icons">schedule</span>
          <span>Last {selectedTimeRange === '5m' ? '5 minutes' : selectedTimeRange === '10m' ? '10 minutes' : selectedTimeRange === '30m' ? '30 minutes' : selectedTimeRange === '1h' ? 'hour' : selectedTimeRange === '6h' ? '6 hours' : '24 hours'}</span>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 2rem;
  }

  .modal-content {
    background: linear-gradient(135deg, rgba(25, 25, 40, 0.98) 0%, rgba(18, 18, 32, 0.98) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    max-width: 750px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .metric-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .metric-icon .material-icons {
    font-size: 28px;
  }

  .header-text h2 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .subtitle {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .current-badge {
    text-align: right;
  }

  .current-value {
    font-size: 1.8rem;
    font-weight: 700;
    font-family: 'Roboto Mono', monospace;
    display: block;
    line-height: 1;
  }

  .current-unit {
    font-size: 0.75rem;
    opacity: 0.7;
  }

  .status-badge {
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .close-btn {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: none;
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.9);
  }

  .time-selector {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(0, 0, 0, 0.15);
  }

  .time-label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .time-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .time-btn {
    padding: 0.45rem 0.9rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.78rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .time-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .time-btn.active {
    background: var(--metric-color);
    border-color: var(--metric-color);
    color: white;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    padding: 1.25rem 1.5rem;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .stat-icon {
    font-size: 24px;
    color: var(--metric-color);
    opacity: 0.8;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-size: 1.1rem;
    font-weight: 700;
    font-family: 'Roboto Mono', monospace;
    color: rgba(255, 255, 255, 0.9);
  }

  .stat-label {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .chart-container {
    padding: 1rem 1.5rem;
  }

  .chart-wrapper {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    padding: 0.75rem;
    overflow-x: auto;
  }

  .chart-wrapper svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .axis-label {
    font-size: 10px;
    fill: rgba(255, 255, 255, 0.45);
    font-family: 'Roboto Mono', monospace;
  }

  .threshold-label {
    font-size: 9px;
    fill: #ff5722;
    font-family: 'Roboto Mono', monospace;
  }

  .chart-line {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  .data-point {
    transition: r 0.15s ease, filter 0.15s ease;
    cursor: pointer;
  }

  .data-point:hover {
    r: 8;
    filter: drop-shadow(0 0 6px var(--metric-color));
  }

  .info-footer {
    display: flex;
    justify-content: center;
    gap: 2rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(0, 0, 0, 0.1);
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .info-item .material-icons {
    font-size: 16px;
    opacity: 0.6;
  }

  @media (max-width: 768px) {
    .modal-overlay {
      padding: 1rem;
    }

    .modal-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    .header-right {
      width: 100%;
      justify-content: space-between;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .time-selector {
      flex-direction: column;
      align-items: flex-start;
    }

    .info-footer {
      flex-wrap: wrap;
      gap: 1rem;
    }
  }
</style>
