<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { FuturePrediction } from '$lib/types';
  import { getScoreColor } from '$lib/types';
  import type { FuturePredictionConfig } from '$lib/types';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  export let prediction: FuturePrediction;
  export let config: FuturePredictionConfig;

  const dispatch = createEventDispatcher<{ configChange: FuturePredictionConfig }>();

  const animatedCurrent = tweened(0, { duration: 1200, easing: cubicOut });
  const animatedPredicted = tweened(0, { duration: 1500, easing: cubicOut });

  $: {
    animatedCurrent.set(prediction.currentScore);
    animatedPredicted.set(prediction.predictedScore);
  }

  $: scoreChange = prediction.predictedScore - prediction.currentScore;
  $: changePercent = ((scoreChange / prediction.currentScore) * 100).toFixed(1);

  function emitConfigChange(next: FuturePredictionConfig) {
    dispatch('configChange', next);
  }

  function handleRequestsInput(event: Event) {
    const value = Number((event.currentTarget as HTMLInputElement).value);
    emitConfigChange({ ...config, requests: Math.max(1, Math.round(value || 1)) });
  }

  function handlePodsInput(event: Event) {
    const value = Number((event.currentTarget as HTMLInputElement).value);
    emitConfigChange({ ...config, pods: Math.max(1, Math.round(value || 1)) });
  }
</script>

<div class="future-prediction-panel">
  <div class="panel-header">
    <div class="header-title">
      <span class="material-icons">trending_up</span>
      <h3>Future RASS Prediction</h3>
    </div>
    <div class="load-badge">
      <span class="material-icons">speed</span>
      <span>{prediction.currentRPS.toLocaleString()} → {prediction.predictedRPS.toLocaleString()} RPS</span>
    </div>
  </div>

  <div class="config-controls">
    <label class="control-field">
      <span>Target Requests</span>
      <input
        type="number"
        min="1"
        step="100"
        value={config.requests}
        on:input={handleRequestsInput}
      />
    </label>
    <label class="control-field">
      <span>Pods</span>
      <input
        type="number"
        min="1"
        step="1"
        value={config.pods}
        on:input={handlePodsInput}
      />
    </label>
  </div>

  <div class="prediction-content">
    <!-- Score Comparison -->
    <div class="score-comparison">
      <div class="score-box current">
        <span class="score-label">Current</span>
        <span class="score-value" style="color: {getScoreColor(prediction.currentScore)}">
          {Math.round($animatedCurrent)}
        </span>
        <span class="rps-label">{prediction.currentRPS.toLocaleString()} RPS</span>
      </div>
      
      <div class="arrow-container">
        <span class="material-icons arrow">arrow_forward</span>
        <div class="change-badge" class:negative={scoreChange < 0}>
          {scoreChange > 0 ? '+' : ''}{changePercent}%
        </div>
      </div>
      
      <div class="score-box predicted">
        <span class="score-label">Predicted @ Target</span>
        <span class="score-value" style="color: {getScoreColor(prediction.predictedScore)}">
          {Math.round($animatedPredicted)}
        </span>
        <span class="rps-label">{prediction.predictedRPS.toLocaleString()} RPS</span>
      </div>
    </div>

    <!-- Breakdown Grid -->
    <div class="breakdown-grid">
      {#each Object.entries(prediction.breakdown) as [category, values]}
        <div class="breakdown-item">
          <span class="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
          <div class="breakdown-bar">
            <div class="bar-current" style="width: {values.current}%; background: {getScoreColor(values.current)}"></div>
            <div class="bar-predicted" style="width: {values.predicted}%; background: {getScoreColor(values.predicted)}"></div>
          </div>
          <div class="breakdown-values">
            <span style="color: {getScoreColor(values.current)}">{Math.round(values.current)}</span>
            <span class="arrow-small">→</span>
            <span style="color: {getScoreColor(values.predicted)}">{Math.round(values.predicted)}</span>
          </div>
        </div>
      {/each}
    </div>

    <!-- Risks -->
    {#if prediction.risks.length > 0}
      <div class="risks-section">
        <h4>
          <span class="material-icons">warning</span>
          Identified Risks
        </h4>
        <ul class="risk-list">
          {#each prediction.risks as risk}
            <li>
              <span class="material-icons">error_outline</span>
              {risk}
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    <!-- Recommendations -->
    <div class="recommendations-section">
      <h4>
        <span class="material-icons">lightbulb</span>
        Scaling Recommendations
      </h4>
      <ul class="recommendation-list">
        {#each prediction.recommendations.slice(0, 4) as rec}
          <li>
            <span class="material-icons">check_circle</span>
            {rec}
          </li>
        {/each}
      </ul>
    </div>
  </div>
</div>

<style>
  .future-prediction-panel {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 16px;
    padding: 1.5rem;
    height: 100%;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .header-title .material-icons {
    color: #ab47bc;
    font-size: 24px;
  }

  .header-title h3 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: 0.01em;
  }

  .load-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(171, 71, 188, 0.12);
    border: 1px solid rgba(171, 71, 188, 0.25);
    padding: 0.45rem 0.9rem;
    border-radius: 20px;
    font-size: 0.78rem;
    color: #ce93d8;
  }

  .load-badge .material-icons {
    font-size: 16px;
  }

  .prediction-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    flex: 1;
    min-height: 0;
  }

  .config-controls {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  .control-field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .control-field span {
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
  }

  .control-field input {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    padding: 0.5rem 0.65rem;
    font-size: 0.82rem;
  }

  .control-field input:focus {
    outline: none;
    border-color: rgba(171, 71, 188, 0.6);
    box-shadow: 0 0 0 2px rgba(171, 71, 188, 0.2);
  }

  .score-comparison {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.025);
    border-radius: 12px;
  }

  .score-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    padding: 1.25rem 1.75rem;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 12px;
    min-width: 110px;
  }

  .score-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.55);
    letter-spacing: 0.6px;
    font-weight: 500;
  }

  .score-value {
    font-size: 2.5rem;
    font-weight: 700;
  }

  .rps-label {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.45);
    font-family: 'Roboto Mono', monospace;
  }

  .arrow-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .arrow {
    font-size: 32px;
    color: rgba(255, 255, 255, 0.35);
  }

  .change-badge {
    background: rgba(76, 175, 80, 0.18);
    color: #81c784;
    padding: 0.25rem 0.6rem;
    border-radius: 5px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .change-badge.negative {
    background: rgba(244, 67, 54, 0.2);
    color: #ef9a9a;
  }

  .breakdown-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .breakdown-item {
    background: rgba(255, 255, 255, 0.025);
    padding: 1rem;
    border-radius: 10px;
  }

  .category-name {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.75);
    margin-bottom: 0.5rem;
    display: block;
    font-weight: 500;
  }

  .breakdown-bar {
    height: 7px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 4px;
    position: relative;
    margin-bottom: 0.5rem;
    overflow: hidden;
  }

  .bar-current {
    position: absolute;
    height: 100%;
    border-radius: 4px;
    opacity: 0.4;
  }

  .bar-predicted {
    position: absolute;
    height: 100%;
    border-radius: 4px;
  }

  .breakdown-values {
    display: flex;
    justify-content: flex-end;
    gap: 0.4rem;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .arrow-small {
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.75rem;
  }

  .risks-section, .recommendations-section {
    background: rgba(255, 255, 255, 0.025);
    padding: 1rem;
    border-radius: 10px;
  }

  .recommendations-section {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .risks-section h4, .recommendations-section h4 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0 0 0.65rem 0;
  }

  .risks-section h4 .material-icons {
    color: #ff9800;
    font-size: 18px;
  }

  .recommendations-section h4 .material-icons {
    color: #4caf50;
    font-size: 18px;
  }

  .risk-list, .recommendation-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .recommendation-list {
    flex: 1;
  }

  .risk-list li, .recommendation-list li {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.5;
  }

  .risk-list li .material-icons {
    color: #ff5722;
    font-size: 16px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .recommendation-list li .material-icons {
    color: #66bb6a;
    font-size: 16px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  @media (max-width: 600px) {
    .score-comparison {
      flex-direction: column;
      gap: 1rem;
    }

    .arrow-container {
      transform: rotate(90deg);
    }

    .breakdown-grid {
      grid-template-columns: 1fr;
    }

    .config-controls {
      grid-template-columns: 1fr;
    }
  }
</style>
