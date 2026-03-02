<script lang="ts">
  import { getScoreColor, getScoreLevel } from '$lib/types';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  export let score: number;
  export let label: string = 'RASS Score';
  export let size: number = 200;
  export let strokeWidth: number = 14;

  // Animated score value
  const animatedScore = tweened(0, {
    duration: 1500,
    easing: cubicOut
  });

  $: animatedScore.set(score);

  $: radius = (size - strokeWidth) / 2;
  $: circumference = 2 * Math.PI * radius;
  $: progress = ($animatedScore / 100) * circumference;
  $: dashOffset = circumference - progress;
  $: color = getScoreColor($animatedScore);
  $: level = getScoreLevel($animatedScore);
  $: center = size / 2;
</script>

<div class="gauge-container" style="width: {size}px; height: {size}px;">
  <svg width={size} height={size} viewBox="0 0 {size} {size}">
    <!-- Decorative outer ring -->
    <circle
      cx={center}
      cy={center}
      r={radius + strokeWidth/2 + 8}
      fill="none"
      stroke="rgba(255,255,255,0.03)"
      stroke-width="1"
      stroke-dasharray="4,8"
    />

    <!-- Background circle -->
    <circle
      cx={center}
      cy={center}
      r={radius}
      fill="none"
      stroke="rgba(255,255,255,0.08)"
      stroke-width={strokeWidth}
    />
    
    <!-- Progress arc -->
    <circle
      cx={center}
      cy={center}
      r={radius}
      fill="none"
      stroke={color}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-dasharray={circumference}
      stroke-dashoffset={dashOffset}
      transform="rotate(-90, {center}, {center})"
      class="progress-ring"
    />
    
    <!-- Glow effect -->
    <circle
      cx={center}
      cy={center}
      r={radius}
      fill="none"
      stroke={color}
      stroke-width={strokeWidth + 6}
      stroke-linecap="round"
      stroke-dasharray={circumference}
      stroke-dashoffset={dashOffset}
      transform="rotate(-90, {center}, {center})"
      opacity="0.15"
      class="progress-ring"
    />

    <!-- Gradient defs -->
    <defs>
      <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color={color} stop-opacity="0.1" />
        <stop offset="100%" stop-color={color} stop-opacity="0" />
      </radialGradient>
    </defs>
    <circle cx={center} cy={center} r={radius - strokeWidth/2 - 5} fill="url(#centerGlow)" />
  </svg>
  <div class="gauge-text">
    <span class="score" style="color: {color}">{Math.round($animatedScore)}</span>
    <span class="label">{label}</span>
    <span class="level" style="color: {color}">{level.toUpperCase()}</span>
  </div>
</div>

<style>
  .gauge-container {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  svg {
    position: absolute;
    top: 0;
    left: 0;
  }

  .progress-ring {
    transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease;
  }

  .gauge-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }

  .score {
    font-size: 3rem;
    font-weight: 700;
    line-height: 1;
    font-family: 'Roboto Mono', monospace;
  }

  .label {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-top: 4px;
  }

  .level {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 1px;
    margin-top: 2px;
  }
</style>
