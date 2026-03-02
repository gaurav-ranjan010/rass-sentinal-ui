<script lang="ts">
  import type { SystemStatus } from '$lib/types';

  export let services: SystemStatus[] = [];

  function statusColor(status: string): string {
    switch (status) {
      case 'operational': return '#4caf50';
      case 'degraded': return '#ff9800';
      case 'outage': return '#f44336';
      default: return '#78909c';
    }
  }

  function statusIcon(status: string): string {
    switch (status) {
      case 'operational': return 'check_circle';
      case 'degraded': return 'warning';
      case 'outage': return 'error';
      default: return 'help';
    }
  }

  function formatTime(isoStr: string | null): string {
    if (!isoStr) return 'None';
    return new Date(isoStr).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  $: operationalCount = services.filter((s) => s.status === 'operational').length;
</script>

<div class="services-panel">
  <div class="panel-header">
    <div class="header-left">
      <span class="material-icons header-icon">dns</span>
      <h2>Service Status</h2>
    </div>
    <span class="services-summary">
      <span class="op-count" style="color: #4caf50">{operationalCount}</span>/{services.length} operational
    </span>
  </div>

  <div class="services-list">
    {#each services as svc}
      <div class="service-row">
        <div class="service-left">
          <span class="material-icons status-icon" style="color: {statusColor(svc.status)}">
            {statusIcon(svc.status)}
          </span>
          <div class="service-info">
            <span class="service-name">{svc.service}</span>
            <span class="service-status" style="color: {statusColor(svc.status)}">{svc.status}</span>
          </div>
        </div>
        <div class="service-metrics">
          <div class="svc-metric">
            <span class="svc-label">Uptime</span>
            <span class="svc-value">{svc.uptime}%</span>
          </div>
          <div class="svc-metric">
            <span class="svc-label">Resp</span>
            <span class="svc-value">{svc.responseTime}ms</span>
          </div>
          <div class="svc-metric last-incident">
            <span class="svc-label">Last Incident</span>
            <span class="svc-value">{formatTime(svc.lastIncident)}</span>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .services-panel {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.02);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .header-icon {
    color: #42a5f5;
    font-size: 20px;
  }

  .panel-header h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .services-summary {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .op-count {
    font-weight: 700;
    font-family: 'Roboto Mono', monospace;
  }

  .services-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .service-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    transition: background 0.2s ease;
  }

  .service-row:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .service-row:last-child {
    border-bottom: none;
  }

  .service-left {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .status-icon {
    font-size: 18px;
  }

  .service-info {
    display: flex;
    flex-direction: column;
  }

  .service-name {
    font-size: 0.85rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.85);
  }

  .service-status {
    font-size: 0.7rem;
    text-transform: capitalize;
  }

  .service-metrics {
    display: flex;
    gap: 1.5rem;
  }

  .svc-metric {
    text-align: right;
  }

  .svc-label {
    display: block;
    font-size: 0.6rem;
    color: rgba(255, 255, 255, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .svc-value {
    font-size: 0.8rem;
    font-family: 'Roboto Mono', monospace;
    color: rgba(255, 255, 255, 0.7);
  }

  @media (max-width: 768px) {
    .last-incident {
      display: none;
    }
    .service-metrics {
      gap: 1rem;
    }
  }
</style>
