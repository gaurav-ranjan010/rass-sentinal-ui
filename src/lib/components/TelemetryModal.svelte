<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import TelemetryChart from './TelemetryChart.svelte';
  import TelemetryDetailModal from './TelemetryDetailModal.svelte';
  import type { TelemetryMetric } from '$lib/types';

  export let show: boolean = false;
  export let telemetryData: Record<string, TelemetryMetric>;

  const dispatch = createEventDispatcher();

  // Modal state for individual telemetry chart clicks
  let showTelemetryDetailModal = false;
  let selectedTelemetryMetric: TelemetryMetric | null = null;
  let selectedTelemetryColor = '#42a5f5';

  function close() {
    dispatch('close');
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      close();
    }
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
    showTelemetryDetailModal = true;
  }

  function closeTelemetryDetailModal() {
    showTelemetryDetailModal = false;
  }
</script>

{#if show}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="modal-backdrop" on:click={handleBackdropClick}>
    <div class="modal-container">
      <div class="modal-header">
        <div class="header-title">
          <span class="material-icons">show_chart</span>
          <h2>Live Telemetry Data</h2>
        </div>
        <button class="close-btn" on:click={close}>
          <span class="material-icons">close</span>
        </button>
      </div>

      <div class="modal-content">
        <div class="telemetry-grid">
          {#if telemetryData.errorRate}
            <TelemetryChart
              data={telemetryData.errorRate.history}
              label={telemetryData.errorRate.name}
              unit={telemetryData.errorRate.unit}
              current={telemetryData.errorRate.current}
              threshold={telemetryData.errorRate.threshold}
              status={telemetryData.errorRate.status}
              color="#f44336"
              clickable={true}
              on:click={handleTelemetryClick}
            />
          {/if}
          {#if telemetryData.latencyP99}
            <TelemetryChart
              data={telemetryData.latencyP99.history}
              label={telemetryData.latencyP99.name}
              unit={telemetryData.latencyP99.unit}
              current={telemetryData.latencyP99.current}
              threshold={telemetryData.latencyP99.threshold}
              status={telemetryData.latencyP99.status}
              color="#2196f3"
              clickable={true}
              on:click={handleTelemetryClick}
            />
          {/if}
          {#if telemetryData.cpuUsage}
            <TelemetryChart
              data={telemetryData.cpuUsage.history}
              label={telemetryData.cpuUsage.name}
              unit={telemetryData.cpuUsage.unit}
              current={telemetryData.cpuUsage.current}
              threshold={telemetryData.cpuUsage.threshold}
              status={telemetryData.cpuUsage.status}
              color="#ab47bc"
              clickable={true}
              on:click={handleTelemetryClick}
            />
          {/if}
          {#if telemetryData.memoryUsage}
            <TelemetryChart
              data={telemetryData.memoryUsage.history}
              label={telemetryData.memoryUsage.name}
              unit={telemetryData.memoryUsage.unit}
              current={telemetryData.memoryUsage.current}
              threshold={telemetryData.memoryUsage.threshold}
              status={telemetryData.memoryUsage.status}
              color="#9c27b0"
              clickable={true}
              on:click={handleTelemetryClick}
            />
          {/if}
          {#if telemetryData.uptime}
            <TelemetryChart
              data={telemetryData.uptime.history}
              label={telemetryData.uptime.name}
              unit={telemetryData.uptime.unit}
              current={telemetryData.uptime.current}
              threshold={telemetryData.uptime.threshold}
              status={telemetryData.uptime.status}
              color="#4caf50"
              clickable={true}
              on:click={handleTelemetryClick}
            />
          {/if}
          {#if telemetryData.requestsPerSec}
            <TelemetryChart
              data={telemetryData.requestsPerSec.history}
              label={telemetryData.requestsPerSec.name}
              unit={telemetryData.requestsPerSec.unit}
              current={telemetryData.requestsPerSec.current}
              threshold={telemetryData.requestsPerSec.threshold}
              status={telemetryData.requestsPerSec.status}
              color="#00bcd4"
              clickable={true}
              on:click={handleTelemetryClick}
            />
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Nested Telemetry Detail Modal -->
  <TelemetryDetailModal
    show={showTelemetryDetailModal}
    metric={selectedTelemetryMetric}
    color={selectedTelemetryColor}
    on:close={closeTelemetryDetailModal}
  />
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-container {
    background: linear-gradient(135deg, rgba(30, 30, 45, 0.98) 0%, rgba(20, 20, 35, 0.98) 100%);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    width: 100%;
    max-width: 1400px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .header-title .material-icons {
    color: #00bcd4;
    font-size: 28px;
  }

  .header-title h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .close-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.95);
  }

  .close-btn .material-icons {
    font-size: 20px;
  }

  .modal-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }

  .telemetry-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: 1.5rem;
  }

  @media (max-width: 900px) {
    .modal-container {
      max-height: 95vh;
    }

    .telemetry-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 600px) {
    .modal-backdrop {
      padding: 0.5rem;
    }

    .modal-header {
      padding: 1rem;
    }

    .modal-content {
      padding: 1rem;
    }

    .header-title h2 {
      font-size: 1.1rem;
    }
  }
</style>
