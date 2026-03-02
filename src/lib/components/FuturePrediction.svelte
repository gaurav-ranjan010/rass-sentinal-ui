<script lang="ts">
  import type { FuturePrediction } from '$lib/types';
  import { getScoreColor } from '$lib/types';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  export let prediction: FuturePrediction;

  const animatedCurrent = tweened(0, { duration: 1200, easing: cubicOut });
  const animatedPredicted = tweened(0, { duration: 1500, easing: cubicOut });

  $: {
    animatedCurrent.set(prediction.currentScore);
    animatedPredicted.set(prediction.predictedScore);
  }

  $: scoreChange = prediction.predictedScore - prediction.currentScore;
  $: changePercent = ((scoreChange / prediction.currentScore) * 100).toFixed(1);
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
        <span class="score-label">Predicted @ 2x</span>
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
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .header-title .material-icons {
    color: #ab47bc;
    font-size: 22px;
  }

  .header-title h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .load-badge {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: rgba(171, 71, 188, 0.15);
    border: 1px solid rgba(171, 71, 188, 0.3);
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.75rem;
    color: #ce93d8;
  }

  .load-badge .material-icons {
    font-size: 14px;
  }

  .prediction-content {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .score-comparison {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 10px;
  }

  .score-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 10px;
    min-width: 100px;
  }

  .score-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
    letter-spacing: 0.5px;
  }

  .score-value {
    font-size: 2.5rem;
    font-weight: 700;
  }

  .rps-label {
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.4);
    font-family: 'Roboto Mono', monospace;
  }

  .arrow-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
  }

  .arrow {
    font-size: 28px;
    color: rgba(255, 255, 255, 0.3);
  }

  .change-badge {
    background: rgba(76, 175, 80, 0.2);
    color: #81c784;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
  }

  .change-badge.negative {
    background: rgba(244, 67, 54, 0.2);
    color: #ef9a9a;
  }

  .breakdown-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .breakdown-item {
    background: rgba(255, 255, 255, 0.02);
    padding: 0.75rem;
    border-radius: 8px;
  }

  .category-name {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 0.4rem;
    display: block;
  }

  .breakdown-bar {
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    position: relative;
    margin-bottom: 0.4rem;
    overflow: hidden;
  }

  .bar-current {
    position: absolute;
    height: 100%;
    border-radius: 3px;
    opacity: 0.4;
  }

  .bar-predicted {
    position: absolute;
    height: 100%;
    border-radius: 3px;
  }

  .breakdown-values {
    display: flex;
    justify-content: flex-end;
    gap: 0.3rem;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .arrow-small {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.7rem;
  }

  .risks-section, .recommendations-section {
    background: rgba(255, 255, 255, 0.02);
    padding: 0.75rem;
    border-radius: 8px;
  }

  .risks-section h4, .recommendations-section h4 {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 0.5rem 0;
  }

  .risks-section h4 .material-icons {
    color: #ff9800;
    font-size: 16px;
  }

  .recommendations-section h4 .material-icons {
    color: #4caf50;
    font-size: 16px;
  }

  .risk-list, .recommendation-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .risk-list li, .recommendation-list li {
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.4;
  }

  .risk-list li .material-icons {
    color: #ff5722;
    font-size: 14px;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .recommendation-list li .material-icons {
    color: #66bb6a;
    font-size: 14px;
    flex-shrink: 0;
    margin-top: 1px;
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
  }
</style>
