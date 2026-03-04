<script lang="ts">
  import type { Anomaly } from '$lib/types';
  import { getSeverityColor, getCategoryIcon, getCategoryColor } from '$lib/types';

  export let anomalies: Anomaly[] = [];

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  $: sortedAnomalies = [...anomalies].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
</script>

<div class="anomaly-panel">
  <div class="panel-header">
    <div class="header-left">
      <span class="material-icons header-icon">warning</span>
      <h2>Infrastructural Error Trends</h2>
    </div>
    <span class="anomaly-count">{anomalies.length} detected</span>
  </div>

  <div class="anomaly-list">
    {#each sortedAnomalies as anomaly (anomaly.id)}
      <div class="anomaly-item" style="border-left: 3px solid {getSeverityColor(anomaly.severity)}">
        <div class="anomaly-top">
          <div class="anomaly-meta">
            <span class="severity-badge" style="background: {getSeverityColor(anomaly.severity)}22; color: {getSeverityColor(anomaly.severity)}">
              {anomaly.severity.toUpperCase()}
            </span>
            <span class="category-badge" style="color: {getCategoryColor(anomaly.category)}">
              <span class="material-icons" style="font-size: 14px">{getCategoryIcon(anomaly.category)}</span>
              {anomaly.category}
            </span>
            <span class="anomaly-id">{anomaly.id}</span>
          </div>
          <span class="time-ago">{timeAgo(anomaly.detectedAt)}</span>
        </div>

        <div class="anomaly-metric">
          <span class="metric-name">{anomaly.metric}</span>
          <span class="metric-value" style="color: {getSeverityColor(anomaly.severity)}">
            {anomaly.value}{anomaly.metric.includes('Rate') || anomaly.metric.includes('Usage') || anomaly.metric.includes('Uptime') ? '%' : anomaly.metric.includes('Latency') ? 'ms' : ''}
          </span>
          <span class="expected-range">expected: {anomaly.expectedRange}</span>
        </div>

        <p class="anomaly-message">{anomaly.message}</p>
      </div>
    {/each}
  </div>
</div>

<style>
  .anomaly-panel {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.025);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .header-icon {
    color: #ff9800;
    font-size: 24px;
  }

  .panel-header h2 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: 0.01em;
  }

  .anomaly-count {
    font-size: 0.82rem;
    color: rgba(255, 255, 255, 0.55);
    background: rgba(255, 152, 0, 0.12);
    padding: 0.35rem 0.85rem;
    border-radius: 14px;
    font-family: 'Roboto Mono', monospace;
    font-weight: 500;
  }

  .anomaly-list {
    max-height: 480px;
    overflow-y: auto;
  }

  .anomaly-item {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    transition: background 0.2s ease;
  }

  .anomaly-item:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .anomaly-item:last-child {
    border-bottom: none;
  }

  .anomaly-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.65rem;
  }

  .anomaly-meta {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    flex-wrap: wrap;
  }

  .severity-badge {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.6px;
    padding: 0.3rem 0.7rem;
    border-radius: 6px;
  }

  .category-badge {
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    text-transform: capitalize;
  }

  .anomaly-id {
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.35);
    font-family: 'Roboto Mono', monospace;
  }

  .time-ago {
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.45);
    white-space: nowrap;
  }

  .anomaly-metric {
    display: flex;
    align-items: baseline;
    gap: 0.65rem;
    margin-bottom: 0.5rem;
  }

  .metric-name {
    font-size: 0.9rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.85);
  }

  .metric-value {
    font-size: 1.05rem;
    font-weight: 700;
    font-family: 'Roboto Mono', monospace;
  }

  .expected-range {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .anomaly-message {
    margin: 0;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.6;
  }
</style>
