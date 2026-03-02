<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { getCategoryColor, getCategoryIcon, getScoreColor, getScoreLevel } from '$lib/types';
  import type { TelemetryMetric } from '$lib/types';

  export let show: boolean = false;
  export let category: string;
  export let score: number;
  export let metrics: { key: string; metric: TelemetryMetric }[] = [];

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

  $: color = getCategoryColor(category);
  $: icon = getCategoryIcon(category);
  $: scoreColor = getScoreColor(score);
  $: level = getScoreLevel(score);

  // Chart dimensions
  const chartWidth = 600;
  const chartHeight = 180;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };

  $: innerWidth = chartWidth - padding.left - padding.right;
  $: innerHeight = chartHeight - padding.top - padding.bottom;

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

  function getChartPath(data: { timestamp: string; value: number }[], threshold: number) {
    const filtered = filterByTimeRange(data, selectedTimeRange);
    if (filtered.length < 2) return { path: '', area: '', points: [], yTicks: [], xLabels: [] };

    const values = filtered.map(d => d.value);
    const minVal = Math.min(...values) * 0.9;
    const maxVal = Math.max(...values, threshold) * 1.1;
    const range = maxVal - minVal || 1;

    const scaleX = (i: number) => padding.left + (i / (filtered.length - 1)) * innerWidth;
    const scaleY = (v: number) => padding.top + innerHeight - ((v - minVal) / range) * innerHeight;

    const path = filtered
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i).toFixed(1)} ${scaleY(d.value).toFixed(1)}`)
      .join(' ');

    const area = path + 
      ` L ${scaleX(filtered.length - 1).toFixed(1)} ${(padding.top + innerHeight).toFixed(1)}` +
      ` L ${padding.left} ${(padding.top + innerHeight).toFixed(1)} Z`;

    const points = filtered.map((d, i) => ({
      x: scaleX(i),
      y: scaleY(d.value),
      value: d.value,
      time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    const yTicks = Array.from({ length: 5 }, (_, i) => {
      const val = minVal + (range * i) / 4;
      return { value: val, y: scaleY(val) };
    });

    const xLabels = [0, Math.floor(filtered.length / 2), filtered.length - 1]
      .filter(i => i < filtered.length)
      .map(i => ({
        x: scaleX(i),
        label: new Date(filtered[i]?.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

    const thresholdY = scaleY(threshold);

    return { path, area, points, yTicks, xLabels, thresholdY };
  }

  function close() {
    dispatch('close');
  }
</script>

{#if show}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="modal-overlay" transition:fade={{ duration: 200 }} on:click={close}>
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div class="modal-content" transition:fly={{ y: 50, duration: 300 }} on:click|stopPropagation style="--category-color: {color}">
      <div class="modal-header">
        <div class="header-left">
          <div class="category-icon" style="background: {color}22; color: {color}">
            <span class="material-icons">{icon}</span>
          </div>
          <div class="header-text">
            <h2>{category.charAt(0).toUpperCase() + category.slice(1)} Details</h2>
            <span class="subtitle">Real-time performance metrics</span>
          </div>
        </div>
        <div class="header-right">
          <div class="score-display" style="color: {scoreColor}">
            <span class="score-value">{Math.round(score)}</span>
            <span class="score-label">{level.toUpperCase()}</span>
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

      <div class="charts-container">
        {#each metrics as { key, metric }}
          {@const chartData = getChartPath(metric.history, metric.threshold)}
          {@const statusColor = metric.status === 'critical' ? '#f44336' : metric.status === 'warning' ? '#ff9800' : '#4caf50'}
          <div class="chart-card">
            <div class="chart-header">
              <div class="chart-title">
                <span class="status-dot" style="background: {statusColor}"></span>
                <h3>{metric.name}</h3>
              </div>
              <div class="current-value" style="color: {statusColor}">
                <span class="value">{typeof metric.current === 'number' && metric.current % 1 !== 0 ? metric.current.toFixed(2) : metric.current.toLocaleString()}</span>
                <span class="unit">{metric.unit}</span>
              </div>
            </div>

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
                  <text x={padding.left - 8} y={tick.y + 4} text-anchor="end" class="axis-label">
                    {tick.value >= 1000 ? (tick.value / 1000).toFixed(1) + 'k' : tick.value.toFixed(tick.value < 10 ? 2 : 0)}
                  </text>
                {/each}

                <!-- X-axis labels -->
                {#each chartData.xLabels as xl}
                  <text x={xl.x} y={chartHeight - 5} text-anchor="middle" class="axis-label">{xl.label}</text>
                {/each}

                <!-- Threshold line -->
                {#if metric.threshold > 0 && chartData.thresholdY}
                  <line
                    x1={padding.left}
                    y1={chartData.thresholdY}
                    x2={chartWidth - padding.right}
                    y2={chartData.thresholdY}
                    stroke="#ff5722"
                    stroke-width="1.5"
                    stroke-dasharray="6,4"
                    opacity="0.7"
                  />
                  <text x={chartWidth - padding.right + 5} y={chartData.thresholdY + 4} class="threshold-label">
                    Threshold: {metric.threshold}
                  </text>
                {/if}

                <!-- Area fill -->
                {#if chartData.area}
                  <path d={chartData.area} fill="url(#areaGradient-{key})" opacity="0.3" />
                {/if}

                <!-- Line path -->
                {#if chartData.path}
                  <path d={chartData.path} fill="none" stroke={color} stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                {/if}

                <!-- Data points -->
                {#each chartData.points as point, i}
                  <circle cx={point.x} cy={point.y} r="4" fill={color} stroke="rgba(0,0,0,0.3)" stroke-width="1" class="data-point">
                    <title>{point.time}: {point.value.toFixed(2)} {metric.unit}</title>
                  </circle>
                {/each}

                <!-- Gradient definition -->
                <defs>
                  <linearGradient id="areaGradient-{key}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color={color} stop-opacity="0.4" />
                    <stop offset="100%" stop-color={color} stop-opacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div class="chart-footer">
              <span class="threshold-info">
                <span class="material-icons" style="font-size: 14px">warning</span>
                Threshold: {metric.threshold}{metric.unit}
              </span>
              <span class="status-badge" style="background: {statusColor}22; color: {statusColor}">
                {metric.status.toUpperCase()}
              </span>
            </div>
          </div>
        {/each}
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
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 2rem;
  }

  .modal-content {
    background: linear-gradient(135deg, rgba(30, 30, 45, 0.98) 0%, rgba(20, 20, 35, 0.98) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    max-width: 720px;
    width: 100%;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
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

  .category-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .category-icon .material-icons {
    font-size: 26px;
  }

  .header-text h2 {
    margin: 0;
    font-size: 1.25rem;
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
    gap: 1.5rem;
  }

  .score-display {
    text-align: center;
  }

  .score-value {
    font-size: 2rem;
    font-weight: 700;
    font-family: 'Roboto Mono', monospace;
    display: block;
    line-height: 1;
  }

  .score-label {
    font-size: 0.65rem;
    letter-spacing: 1px;
    opacity: 0.8;
  }

  .close-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
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
  }

  .time-label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .time-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .time-btn {
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .time-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .time-btn.active {
    background: var(--category-color);
    border-color: var(--category-color);
    color: white;
  }

  .charts-container {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .chart-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    overflow: hidden;
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }

  .chart-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .chart-title h3 {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.85);
  }

  .current-value {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
  }

  .current-value .value {
    font-size: 1.5rem;
    font-weight: 700;
    font-family: 'Roboto Mono', monospace;
  }

  .current-value .unit {
    font-size: 0.75rem;
    opacity: 0.7;
  }

  .chart-wrapper {
    padding: 0.5rem;
    overflow-x: auto;
  }

  .chart-wrapper svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .axis-label {
    font-size: 10px;
    fill: rgba(255, 255, 255, 0.4);
    font-family: 'Roboto Mono', monospace;
  }

  .threshold-label {
    font-size: 9px;
    fill: #ff5722;
    font-family: 'Roboto Mono', monospace;
  }

  .data-point {
    transition: r 0.15s ease;
    cursor: pointer;
  }

  .data-point:hover {
    r: 6;
  }

  .chart-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1.25rem;
    border-top: 1px solid rgba(255, 255, 255, 0.04);
    background: rgba(0, 0, 0, 0.1);
  }

  .threshold-info {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .threshold-info .material-icons {
    color: #ff9800;
  }

  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.5px;
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

    .time-selector {
      flex-direction: column;
      align-items: flex-start;
    }

    .time-buttons {
      flex-wrap: wrap;
    }
  }
</style>
