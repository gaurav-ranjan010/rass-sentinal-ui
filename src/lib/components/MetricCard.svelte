<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { getScoreColor, getCategoryColor, getCategoryIcon, getScoreLevel } from '$lib/types';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  export let title: string;
  export let score: number;
  export let category: string;
  export let details: { label: string; value: string }[] = [];
  export let clickable: boolean = false;

  const dispatch = createEventDispatcher();

  const animatedScore = tweened(0, { duration: 1200, easing: cubicOut });
  $: animatedScore.set(score);

  $: color = getCategoryColor(category);
  $: icon = getCategoryIcon(category);
  $: scoreColor = getScoreColor($animatedScore);
  $: level = getScoreLevel($animatedScore);
  $: barWidth = Math.min(100, Math.max(0, $animatedScore));

  // Determine trend (this would normally come from real data)
  $: trend = score >= 75 ? 'up' : score >= 50 ? 'stable' : 'down';

  function handleClick() {
    if (clickable) {
      dispatch('click', { category, score });
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (clickable && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      dispatch('click', { category, score });
    }
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div 
  class="metric-card" 
  class:clickable 
  style="--card-color: {color}"
  on:click={handleClick}
  on:keydown={handleKeydown}
  role={clickable ? 'button' : undefined}
  tabindex={clickable ? 0 : undefined}
>
  <div class="card-header">
    <div class="icon-wrapper" style="background: {color}22; color: {color}">
      <span class="material-icons">{icon}</span>
    </div>
    <div class="header-text">
      <h3>{title}</h3>
      <div class="meta-row">
        <span class="category-tag" style="color: {color}">{category}</span>
        <span class="trend-indicator {trend}">
          <span class="material-icons" style="font-size: 14px">
            {trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat'}
          </span>
        </span>
      </div>
    </div>
    <div class="score-badge" style="background: {scoreColor}22; color: {scoreColor}; border: 1px solid {scoreColor}44">
      {Math.round($animatedScore)}
    </div>
  </div>

  <div class="score-bar-track">
    <div class="score-bar-fill" style="width: {barWidth}%; background: linear-gradient(90deg, {color}, {scoreColor})"></div>
    <div class="score-bar-glow" style="width: {barWidth}%; background: {color}"></div>
  </div>

  <div class="level-indicator">
    <span class="level-text" style="color: {scoreColor}">{level.toUpperCase()}</span>
    <span class="level-dots">
      {#each [1, 2, 3, 4, 5] as i}
        <span 
          class="dot" 
          style="background: {$animatedScore >= i * 20 ? scoreColor : 'rgba(255,255,255,0.1)'}"
        ></span>
      {/each}
    </span>
  </div>

  {#if details.length > 0}
    <div class="details">
      {#each details as detail}
        <div class="detail-row">
          <span class="detail-label">{detail.label}</span>
          <span class="detail-value">{detail.value}</span>
        </div>
      {/each}
    </div>
  {/if}

  {#if clickable}
    <div class="click-hint">
      <span class="material-icons">open_in_new</span>
      <span>Click for details</span>
    </div>
  {/if}
</div>

<style>
  .metric-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 1.25rem;
    transition: all 0.3s ease;
    cursor: default;
    position: relative;
    overflow: hidden;
  }

  .metric-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--card-color), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .metric-card:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .metric-card:hover::before {
    opacity: 1;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.3s ease;
  }

  .metric-card:hover .icon-wrapper {
    transform: scale(1.1);
  }

  .icon-wrapper .material-icons {
    font-size: 20px;
  }

  .header-text {
    flex: 1;
    min-width: 0;
  }

  .header-text h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .meta-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 2px;
  }

  .category-tag {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 500;
  }

  .trend-indicator {
    display: flex;
    align-items: center;
  }

  .trend-indicator.up { color: #66bb6a; }
  .trend-indicator.down { color: #f44336; }
  .trend-indicator.stable { color: #ff9800; }

  .score-badge {
    font-size: 1.25rem;
    font-weight: 700;
    font-family: 'Roboto Mono', monospace;
    padding: 4px 12px;
    border-radius: 8px;
    flex-shrink: 0;
  }

  .score-bar-track {
    position: relative;
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }

  .score-bar-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    border-radius: 2px;
    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .score-bar-glow {
    position: absolute;
    top: -2px;
    left: 0;
    height: 8px;
    border-radius: 4px;
    filter: blur(4px);
    opacity: 0.3;
    transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .level-indicator {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .level-text {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 1px;
  }

  .level-dots {
    display: flex;
    gap: 3px;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    transition: background 0.3s ease;
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding-top: 0.6rem;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
  }

  .detail-label {
    color: rgba(255, 255, 255, 0.45);
  }

  .detail-value {
    color: rgba(255, 255, 255, 0.8);
    font-family: 'Roboto Mono', monospace;
    font-size: 0.78rem;
  }

  .metric-card.clickable {
    cursor: pointer;
  }

  .metric-card.clickable:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
    border-color: var(--card-color);
  }

  .metric-card.clickable:focus {
    outline: 2px solid var(--card-color);
    outline-offset: 2px;
  }

  .click-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.3);
    transition: color 0.2s ease;
  }

  .click-hint .material-icons {
    font-size: 14px;
  }

  .metric-card.clickable:hover .click-hint {
    color: var(--card-color);
  }
</style>
