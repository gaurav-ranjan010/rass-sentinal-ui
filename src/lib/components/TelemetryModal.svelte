<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import TelemetryChart from './TelemetryChart.svelte';
  import TelemetryDetailModal from './TelemetryDetailModal.svelte';
  import type { SplunkLogEntry, TelemetryDataPoint, TelemetryMetric } from '$lib/types';

  export let show: boolean = false;
  export let telemetryData: Record<string, TelemetryMetric>;
  export let splunkLogs: SplunkLogEntry[] = [];
  export let selectedErrorLog: SplunkLogEntry | null = null;

  const dispatch = createEventDispatcher();

  // Modal state for individual telemetry chart clicks
  let showTelemetryDetailModal = false;
  let selectedTelemetryMetric: TelemetryMetric | null = null;
  let selectedTelemetryColor = '#42a5f5';

  function close() {
    dispatch('close');
  }

  function clearErrorFilter() {
    dispatch('clearErrorFilter');
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

  function createFilteredErrorHistory(
    baseHistory: TelemetryDataPoint[],
    logs: SplunkLogEntry[],
    selected: SplunkLogEntry | null
  ): TelemetryDataPoint[] {
    if (!selected || !baseHistory?.length || !logs?.length) {
      return baseHistory;
    }

    const errorLogs = logs.filter((log) => log.level === 'ERROR' || log.level === 'FATAL');

    const matchingLogs = errorLogs.filter((log) => {
      if (selected.errorCode) {
        return log.errorCode === selected.errorCode;
      }
      return log.id === selected.id || log.service === selected.service;
    });

    if (!matchingLogs.length) {
      return baseHistory;
    }

    const totalErrorFrequency = Math.max(
      errorLogs.reduce((sum, log) => sum + Math.max(0, log.frequency), 0),
      1
    );
    const matchingFrequency = matchingLogs.reduce((sum, log) => sum + Math.max(0, log.frequency), 0);
    const frequencyShare = Math.max(0.05, Math.min(1, matchingFrequency / totalErrorFrequency));

    return baseHistory.map((point) => {
      const pointTime = new Date(point.timestamp).getTime();

      const influence = matchingLogs.reduce((sum, log) => {
        const logTime = new Date(log.timestamp).getTime();
        const hoursDiff = Math.abs(pointTime - logTime) / 3600000;
        const timeWeight = Math.exp(-(hoursDiff * hoursDiff) / 6);
        return sum + timeWeight;
      }, 0);

      const normalizedInfluence = Math.min(1, influence);
      const relevance = 0.45 + normalizedInfluence * 0.55;
      const filteredValue = point.value * frequencyShare * relevance;

      return {
        ...point,
        value: Math.round(filteredValue * 100) / 100
      };
    });
  }

  $: filteredErrorHistory = telemetryData?.errorRate
    ? createFilteredErrorHistory(telemetryData.errorRate.history, splunkLogs, selectedErrorLog)
    : [];

  $: filteredErrorCurrent = filteredErrorHistory.length > 0
    ? filteredErrorHistory[filteredErrorHistory.length - 1].value
    : telemetryData?.errorRate?.current;

  $: filteredErrorStatus = telemetryData?.errorRate
    ? filteredErrorCurrent > telemetryData.errorRate.threshold
      ? 'critical'
      : telemetryData.errorRate.status
    : 'healthy';

  $: errorFilterLabel = selectedErrorLog
    ? `${selectedErrorLog.service}${selectedErrorLog.errorCode ? ` • ${selectedErrorLog.errorCode}` : ''}`
    : '';
</script>

{#if show}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="modal-backdrop" on:click={handleBackdropClick}>
    <div class="modal-container">
      <div class="modal-header">
        <div class="header-title">
          <span class="material-icons">show_chart</span>
          <div class="header-text">
            <h2>Live Telemetry Data</h2>
            {#if selectedErrorLog}
              <div class="filter-badge">
                <span class="material-icons">filter_alt</span>
                <span>Filtered Error Rate: {errorFilterLabel}</span>
                <button type="button" class="clear-filter-btn" on:click={clearErrorFilter}>Clear</button>
              </div>
            {/if}
          </div>
        </div>
        <button class="close-btn" on:click={close}>
          <span class="material-icons">close</span>
        </button>
      </div>

      <div class="modal-content">
        <div class="telemetry-grid">
          {#if telemetryData.errorRate}
            <TelemetryChart
              data={filteredErrorHistory}
              label={telemetryData.errorRate.name}
              unit={telemetryData.errorRate.unit}
              current={filteredErrorCurrent}
              threshold={telemetryData.errorRate.threshold}
              status={filteredErrorStatus}
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
    align-items: flex-start;
    gap: 0.75rem;
  }

  .header-text {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
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

  .filter-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: rgba(244, 67, 54, 0.12);
    border: 1px solid rgba(244, 67, 54, 0.45);
    border-radius: 999px;
    padding: 0.2rem 0.55rem;
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.9);
  }

  .filter-badge .material-icons {
    font-size: 14px;
    color: #f48fb1;
  }

  .clear-filter-btn {
    border: none;
    background: transparent;
    color: #ffccbc;
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
  }

  .clear-filter-btn:hover {
    color: #ffffff;
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
