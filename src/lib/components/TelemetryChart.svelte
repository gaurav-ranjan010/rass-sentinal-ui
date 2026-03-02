<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { TelemetryDataPoint } from '$lib/types';

  export let data: TelemetryDataPoint[] = [];
  export let label: string = '';
  export let unit: string = '';
  export let current: number = 0;
  export let threshold: number = 0;
  export let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  export let color: string = '#42a5f5';
  export let height: number = 120;
  export let clickable: boolean = false;

  const dispatch = createEventDispatcher();

  const padding = { top: 10, right: 12, bottom: 20, left: 45 };
  const width = 320;

  $: chartWidth = width - padding.left - padding.right;
  $: chartHeight = height - padding.top - padding.bottom;

  $: values = data.map((d) => d.value);
  $: minVal = Math.min(...values) * 0.9;
  $: maxVal = Math.max(...values, threshold) * 1.1;
  $: range = maxVal - minVal || 1;

  $: scaleX = (i: number) => padding.left + (i / (data.length - 1)) * chartWidth;
  $: scaleY = (v: number) => padding.top + chartHeight - ((v - minVal) / range) * chartHeight;

  $: pathD = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i).toFixed(1)} ${scaleY(d.value).toFixed(1)}`)
    .join(' ');

  $: areaD = pathD + ` L ${scaleX(data.length - 1).toFixed(1)} ${(padding.top + chartHeight).toFixed(1)} L ${padding.left} ${(padding.top + chartHeight).toFixed(1)} Z`;

  $: thresholdY = scaleY(threshold);

  $: statusColor = status === 'critical' ? '#f44336' : status === 'warning' ? '#ff9800' : '#4caf50';

  // Y-axis ticks
  $: yTicks = Array.from({ length: 4 }, (_, i) => {
    const val = minVal + (range * i) / 3;
    return { value: val, y: scaleY(val) };
  });

  // X-axis labels (show a few time labels)
  $: xLabels = data.length > 0
    ? [0, Math.floor(data.length / 2), data.length - 1].map((i) => ({
        x: scaleX(i),
        label: new Date(data[i]?.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }))
    : [];

  function handleClick() {
    if (clickable) {
      dispatch('click', { label, data, current, threshold, status, unit, color });
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (clickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      dispatch('click', { label, data, current, threshold, status, unit, color });
    }
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div 
  class="chart-card" 
  class:clickable
  on:click={handleClick}
  on:keydown={handleKeydown}
  role={clickable ? 'button' : undefined}
  tabindex={clickable ? 0 : undefined}
  style="--chart-color: {color}"
>
  <div class="chart-header">
    <div class="chart-title-row">
      <span class="status-dot" style="background: {statusColor}"></span>
      <h4>{label}</h4>
    </div>
    <div class="current-value" style="color: {statusColor}">
      <span class="value">{typeof current === 'number' && current % 1 !== 0 ? current.toFixed(2) : current.toLocaleString()}</span>
      <span class="unit">{unit}</span>
    </div>
  </div>

  <svg {width} {height} viewBox="0 0 {width} {height}" class="chart-svg">
    <!-- Grid lines -->
    {#each yTicks as tick}
      <line
        x1={padding.left}
        y1={tick.y}
        x2={width - padding.right}
        y2={tick.y}
        stroke="rgba(255,255,255,0.05)"
        stroke-dasharray="2,3"
      />
      <text x={padding.left - 5} y={tick.y + 3} text-anchor="end" class="axis-label">
        {tick.value >= 1000 ? (tick.value / 1000).toFixed(1) + 'k' : tick.value.toFixed(tick.value < 10 ? 2 : 0)}
      </text>
    {/each}

    <!-- X-axis labels -->
    {#each xLabels as xl}
      <text x={xl.x} y={height - 2} text-anchor="middle" class="axis-label">{xl.label}</text>
    {/each}

    <!-- Threshold line -->
    {#if threshold > 0}
      <line
        x1={padding.left}
        y1={thresholdY}
        x2={width - padding.right}
        y2={thresholdY}
        stroke="#ff5722"
        stroke-width="1"
        stroke-dasharray="4,3"
        opacity="0.6"
      />
      <text x={width - padding.right + 2} y={thresholdY + 3} class="threshold-label">
        {threshold >= 1000 ? (threshold / 1000).toFixed(1) + 'k' : threshold}
      </text>
    {/if}

    <!-- Area fill -->
    <defs>
      <linearGradient id="grad-{label.replace(/\s/g, '')}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color={color} stop-opacity="0.3" />
        <stop offset="100%" stop-color={color} stop-opacity="0.02" />
      </linearGradient>
    </defs>
    <path d={areaD} fill="url(#grad-{label.replace(/\s/g, '')})" />

    <!-- Line -->
    <path d={pathD} fill="none" stroke={color} stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />

    <!-- Current value dot -->
    {#if data.length > 0}
      <circle
        cx={scaleX(data.length - 1)}
        cy={scaleY(data[data.length - 1].value)}
        r="4"
        fill={statusColor}
        stroke="rgba(0,0,0,0.5)"
        stroke-width="1.5"
      />
      <circle
        cx={scaleX(data.length - 1)}
        cy={scaleY(data[data.length - 1].value)}
        r="8"
        fill={statusColor}
        opacity="0.2"
      />
    {/if}
  </svg>

  {#if clickable}
    <div class="click-hint">
      <span class="material-icons">open_in_new</span>
      <span>Click for detailed analysis</span>
    </div>
  {/if}
</div>

<style>
  .chart-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 0.85rem 1rem;
    transition: all 0.3s ease;
  }

  .chart-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.12);
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .chart-title-row {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  h4 {
    margin: 0;
    font-size: 0.8rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
  }

  .current-value {
    display: flex;
    align-items: baseline;
    gap: 3px;
  }

  .value {
    font-size: 1.1rem;
    font-weight: 700;
    font-family: 'Roboto Mono', monospace;
  }

  .unit {
    font-size: 0.7rem;
    opacity: 0.6;
  }

  .chart-svg {
    width: 100%;
    height: auto;
  }

  .axis-label {
    fill: rgba(255, 255, 255, 0.3);
    font-size: 9px;
    font-family: 'Roboto Mono', monospace;
  }

  .threshold-label {
    fill: #ff5722;
    font-size: 8px;
    font-family: 'Roboto Mono', monospace;
    opacity: 0.7;
  }

  .chart-card.clickable {
    cursor: pointer;
  }

  .chart-card.clickable:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    border-color: var(--chart-color);
  }

  .chart-card.clickable:focus {
    outline: 2px solid var(--chart-color);
    outline-offset: 2px;
  }

  .click-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.04);
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.25);
    transition: color 0.2s ease;
  }

  .click-hint .material-icons {
    font-size: 12px;
  }

  .chart-card.clickable:hover .click-hint {
    color: var(--chart-color);
  }
</style>
