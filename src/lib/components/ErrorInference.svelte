<script lang="ts">
  import type { ErrorInference } from '$lib/types';
  import { getConfidenceColor } from '$lib/types';

  export let inferences: ErrorInference[] = [];

  let selectedInference: ErrorInference | null = null;

  function selectInference(inf: ErrorInference) {
    selectedInference = selectedInference?.id === inf.id ? null : inf;
  }
</script>

<div class="inference-panel">
  <div class="panel-header">
    <div class="header-title">
      <span class="material-icons">psychology</span>
      <h3>Error Inference & Code Analysis</h3>
    </div>
    <div class="inference-count">
      <span class="material-icons">bug_report</span>
      {inferences.length} issues detected
    </div>
  </div>

  <div class="inference-content">
    <div class="inference-list">
      {#each inferences as inf (inf.id)}
        <div 
          class="inference-item" 
          class:selected={selectedInference?.id === inf.id}
          role="button"
          tabindex="0"
          on:click={() => selectInference(inf)}
          on:keypress={(e) => e.key === 'Enter' && selectInference(inf)}
        >
          <div class="inference-header">
            <span class="service-badge">{inf.service}</span>
            <span class="confidence-badge" style="background: {getConfidenceColor(inf.confidence)}20; color: {getConfidenceColor(inf.confidence)}">
              {inf.confidence} confidence
            </span>
          </div>
          <div class="inferred-location">
            <span class="material-icons">folder</span>
            <code>{inf.repo}</code>
            <span class="material-icons">chevron_right</span>
            <code>{inf.inferredLocation}</code>
          </div>
          <div class="line-numbers">
            <span class="material-icons">code</span>
            Lines: {inf.lineNumbers.join(', ')}
          </div>
        </div>
      {/each}
    </div>

    {#if selectedInference}
      <div class="inference-details">
        <h4>
          <span class="material-icons">search</span>
          Root Cause Analysis
        </h4>
        
        <div class="detail-section">
          <span class="detail-label">Inferred Location</span>
          <div class="code-location">
            <span class="repo">{selectedInference.repo}</span>
            <span class="separator">/</span>
            <span class="file">{selectedInference.inferredLocation}</span>
          </div>
        </div>

        <div class="detail-section">
          <span class="detail-label">Suspected Lines</span>
          <div class="line-highlight">
            {#each selectedInference.lineNumbers as line}
              <span class="line-badge">Line {line}</span>
            {/each}
          </div>
        </div>

        <div class="detail-section">
          <span class="detail-label">Root Cause</span>
          <p class="root-cause">{selectedInference.rootCause}</p>
        </div>

        <div class="detail-section">
          <span class="detail-label">Affected Component</span>
          <div class="affected-component">
            <span class="material-icons">settings</span>
            {selectedInference.affectedComponent}
          </div>
        </div>

        {#if selectedInference.relatedLogs.length > 0}
          <div class="detail-section">
            <span class="detail-label">Related Logs</span>
            <div class="related-logs">
              {#each selectedInference.relatedLogs as logId}
                <span class="log-ref">{logId}</span>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {:else}
      <div class="no-selection">
        <span class="material-icons">touch_app</span>
        <span>Select an inference to view details</span>
      </div>
    {/if}
  </div>
</div>

<style>
  .inference-panel {
    background: linear-gradient(135deg, rgba(30, 30, 45, 0.95) 0%, rgba(20, 20, 35, 0.98) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.25rem;
    height: 100%;
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
    color: #7c4dff;
    font-size: 22px;
  }

  .header-title h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .inference-count {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.75rem;
    color: #ff5722;
    background: rgba(255, 87, 34, 0.1);
    padding: 0.3rem 0.6rem;
    border-radius: 12px;
  }

  .inference-count .material-icons {
    font-size: 14px;
  }

  .inference-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    min-height: 300px;
  }

  .inference-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    overflow-y: auto;
    max-height: 350px;
  }

  .inference-item {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    padding: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .inference-item:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .inference-item.selected {
    background: rgba(124, 77, 255, 0.1);
    border-color: rgba(124, 77, 255, 0.3);
  }

  .inference-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .service-badge {
    font-size: 0.7rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.1);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
  }

  .confidence-badge {
    font-size: 0.65rem;
    font-weight: 600;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    text-transform: capitalize;
  }

  .inferred-location {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-bottom: 0.4rem;
    flex-wrap: wrap;
  }

  .inferred-location .material-icons {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.4);
  }

  .inferred-location code {
    font-size: 0.7rem;
    color: #64b5f6;
  }

  .line-numbers {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .line-numbers .material-icons {
    font-size: 14px;
  }

  .inference-details {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
    padding: 1rem;
  }

  .inference-details h4 {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0 0 1rem 0;
  }

  .inference-details h4 .material-icons {
    color: #7c4dff;
    font-size: 18px;
  }

  .detail-section {
    margin-bottom: 1rem;
  }

  .detail-label {
    font-size: 0.65rem;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 0.5px;
    margin-bottom: 0.3rem;
    display: block;
  }

  .code-location {
    font-size: 0.8rem;
    font-family: 'Roboto Mono', monospace;
  }

  .repo {
    color: #81c784;
  }

  .separator {
    color: rgba(255, 255, 255, 0.3);
    margin: 0 0.25rem;
  }

  .file {
    color: #64b5f6;
  }

  .line-highlight {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .line-badge {
    background: rgba(255, 87, 34, 0.15);
    color: #ff8a65;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.7rem;
    font-family: 'Roboto Mono', monospace;
  }

  .root-cause {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.5;
    margin: 0;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    border-left: 3px solid #7c4dff;
  }

  .affected-component {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    color: #ce93d8;
  }

  .affected-component .material-icons {
    font-size: 16px;
  }

  .related-logs {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .log-ref {
    font-size: 0.7rem;
    color: #90caf9;
    background: rgba(144, 202, 249, 0.1);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Roboto Mono', monospace;
  }

  .no-selection {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    height: 100%;
    color: rgba(255, 255, 255, 0.3);
  }

  .no-selection .material-icons {
    font-size: 32px;
  }

  @media (max-width: 900px) {
    .inference-content {
      grid-template-columns: 1fr;
    }

    .inference-list {
      max-height: 200px;
    }
  }
</style>
