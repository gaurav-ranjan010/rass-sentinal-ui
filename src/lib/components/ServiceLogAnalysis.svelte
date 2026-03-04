<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { SplunkLogEntry } from '$lib/types';
  import { getLogLevelColor } from '$lib/types';

  export let logs: SplunkLogEntry[] = [];
  export let selectedService: string = 'all';

  const dispatch = createEventDispatcher<{ errorSelect: SplunkLogEntry }>();

  let expandedLog: string | null = null;

  $: services = ['all', ...new Set(logs.map(l => l.service))];
  $: filteredLogs = selectedService === 'all' 
    ? logs 
    : logs.filter(l => l.service === selectedService);
  $: sortedLogs = [...filteredLogs].sort((a, b) => b.frequency - a.frequency);

  function toggleExpand(logId: string) {
    expandedLog = expandedLog === logId ? null : logId;
  }

  function handleErrorClick(event: MouseEvent, log: SplunkLogEntry) {
    event.stopPropagation();
    dispatch('errorSelect', log);
  }

  function getTimeAgo(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }
</script>

<div class="log-analysis-panel">
  <div class="panel-header">
    <div class="header-title">
      <span class="material-icons">article</span>
      <h3>Common Error Logs</h3>
    </div>
    <select bind:value={selectedService} class="service-filter">
      {#each services as service}
        <option value={service}>{service === 'all' ? 'All Services' : service}</option>
      {/each}
    </select>
  </div>

  <div class="logs-container">
    {#if sortedLogs.length === 0}
      <div class="no-logs">
        <span class="material-icons">check_circle</span>
        <span>No error logs found</span>
      </div>
    {:else}
      {#each sortedLogs as log (log.id)}
        <div 
          class="log-entry" 
          class:expanded={expandedLog === log.id}
          role="button"
          tabindex="0"
          on:click={() => toggleExpand(log.id)}
          on:keypress={(e) => e.key === 'Enter' && toggleExpand(log.id)}
        >
          <div class="log-header">
            <div class="log-level" style="background: {getLogLevelColor(log.level)}20; color: {getLogLevelColor(log.level)}">
              {log.level}
            </div>
            <div class="log-service">{log.service}</div>
            <div class="log-frequency">
              <span class="material-icons">repeat</span>
              {log.frequency.toLocaleString()}x
            </div>
            <div class="log-time">{getTimeAgo(log.timestamp)}</div>
            <span class="material-icons expand-icon">
              {expandedLog === log.id ? 'expand_less' : 'expand_more'}
            </span>
          </div>
          
          <div class="log-message">
            <button
              class="error-link"
              type="button"
              on:click={(event) => handleErrorClick(event, log)}
              aria-label="Filter live telemetry for this error"
            >
              <code>{log.errorCode ? `[${log.errorCode}] ` : ''}{log.message}</code>
            </button>
          </div>

          {#if expandedLog === log.id}
            <div class="log-details">
              {#if log.stackTrace}
                <div class="stack-trace">
                  <span class="detail-label">Stack Trace:</span>
                  <pre>{log.stackTrace}</pre>
                </div>
              {/if}
              <div class="log-meta">
                {#if log.repo}
                  <span class="meta-item">
                    <span class="material-icons">folder</span>
                    {log.repo}
                  </span>
                {/if}
                {#if log.lineNumber}
                  <span class="meta-item">
                    <span class="material-icons">code</span>
                    Line {log.lineNumber}
                  </span>
                {/if}
                <span class="meta-item">
                  <span class="material-icons">schedule</span>
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </div>

  <div class="panel-footer">
    <span class="log-count">{sortedLogs.length} error logs found</span>
    <span class="total-occurrences">
      Total: {sortedLogs.reduce((sum, l) => sum + l.frequency, 0).toLocaleString()} occurrences
    </span>
  </div>
</div>

<style>
  .log-analysis-panel {
    background: linear-gradient(135deg, rgba(30, 30, 45, 0.95) 0%, rgba(20, 20, 35, 0.98) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.25rem;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .header-title .material-icons {
    color: #ff9800;
    font-size: 22px;
  }

  .header-title h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .service-filter {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    font-size: 0.8rem;
    cursor: pointer;
  }

  .service-filter option {
    background: #1e1e2e;
    color: rgba(255, 255, 255, 0.9);
  }

  .logs-container {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 400px;
  }

  .no-logs {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 2rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .no-logs .material-icons {
    font-size: 32px;
    color: #4caf50;
  }

  .log-entry {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    padding: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .log-entry:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .log-entry.expanded {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .log-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .log-level {
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    text-transform: uppercase;
  }

  .log-service {
    font-size: 0.8rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .log-frequency {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.7rem;
    color: #ff9800;
    background: rgba(255, 152, 0, 0.1);
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
  }

  .log-frequency .material-icons {
    font-size: 12px;
  }

  .log-time {
    margin-left: auto;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .expand-icon {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.4);
  }

  .log-message {
    margin-top: 0.5rem;
  }

  .error-link {
    all: unset;
    display: block;
    width: 100%;
    cursor: pointer;
  }

  .error-link:focus-visible {
    outline: 2px solid rgba(255, 152, 0, 0.7);
    outline-offset: 2px;
    border-radius: 4px;
  }

  .log-message code {
    font-size: 0.75rem;
    color: #f48fb1;
    background: rgba(244, 143, 177, 0.1);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    display: block;
    word-break: break-all;
    transition: background 0.2s ease, color 0.2s ease;
  }

  .error-link:hover code {
    background: rgba(244, 143, 177, 0.18);
    color: #f8bbd0;
  }

  .log-details {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .stack-trace {
    margin-bottom: 0.75rem;
  }

  .detail-label {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 0.25rem;
    display: block;
  }

  .stack-trace pre {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.6);
    background: rgba(0, 0, 0, 0.3);
    padding: 0.5rem;
    border-radius: 4px;
    margin: 0;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .log-meta {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .meta-item .material-icons {
    font-size: 14px;
  }

  .panel-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .total-occurrences {
    color: #ff9800;
  }

  @media (max-width: 600px) {
    .log-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .log-time {
      margin-left: 0;
    }

    .log-meta {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>
