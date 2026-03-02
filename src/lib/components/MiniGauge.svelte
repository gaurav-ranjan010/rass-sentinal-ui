<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  export let score: number;
  export let label: string;
  export let color: string;
  export let icon: string;

  const animatedScore = tweened(0, { duration: 1200, easing: cubicOut });
  $: animatedScore.set(score);

  $: size = 64;
  $: radius = 26;
  $: circumference = 2 * Math.PI * radius;
  $: progress = ($animatedScore / 100) * circumference;
  $: dashOffset = circumference - progress;
  $: center = size / 2;
</script>

<div class="mini-gauge">
  <div class="gauge-ring">
    <svg width={size} height={size} viewBox="0 0 {size} {size}">
      <circle
        cx={center} cy={center} r={radius}
        fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="5"
      />
      <circle
        cx={center} cy={center} r={radius}
        fill="none" stroke={color} stroke-width="5"
        stroke-linecap="round"
        stroke-dasharray={circumference}
        stroke-dashoffset={dashOffset}
        transform="rotate(-90, {center}, {center})"
        class="progress"
      />
      <!-- Glow effect -->
      <circle
        cx={center} cy={center} r={radius}
        fill="none" stroke={color} stroke-width="8"
        stroke-linecap="round"
        stroke-dasharray={circumference}
        stroke-dashoffset={dashOffset}
        transform="rotate(-90, {center}, {center})"
        opacity="0.15"
        class="progress"
      />
    </svg>
    <span class="mini-score" style="color: {color}">{Math.round($animatedScore)}</span>
  </div>
  <div class="mini-label">
    <span class="material-icons" style="color: {color}; font-size: 14px">{icon}</span>
    <span>{label}</span>
  </div>
</div>

<style>
  .mini-gauge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    transition: transform 0.3s ease;
  }

  .mini-gauge:hover {
    transform: scale(1.05);
  }

  .gauge-ring {
    position: relative;
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .gauge-ring svg {
    position: absolute;
    top: 0;
    left: 0;
  }

  .progress {
    transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .mini-score {
    font-size: 1rem;
    font-weight: 700;
    font-family: 'Roboto Mono', monospace;
    z-index: 1;
  }

  .mini-label {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.55);
    text-transform: capitalize;
  }
</style>
