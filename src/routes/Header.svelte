<script lang="ts">
  import { rassScore, anomalies } from '$lib/stores';
  import { getScoreColor } from '$lib/types';

  $: criticalCount = $anomalies.filter(a => a.severity === 'critical' || a.severity === 'high').length;
  $: overallScore = $rassScore.overall;
  $: scoreColor = getScoreColor(overallScore);
</script>

<header>
  <div class="header-container">
    <div class="header-left">
      <div class="logo-section">
        <div class="logo-icon">
          <img src="/digicert-logo.png" alt="DigiCert" class="digicert-logo" />
        </div>
        <div class="logo-text">
          <h1>RASS Sentinel</h1>
          <span class="tagline">Intelligent Health Score & Risk Detection</span>
        </div>
      </div>
    </div>

    <div class="header-center">
      {#if criticalCount > 0}
        <div class="alert-badge alert-critical">
          <span class="material-icons">warning</span>
          <span>{criticalCount} Critical Alert{criticalCount > 1 ? 's' : ''}</span>
        </div>
      {:else}
        <div class="alert-badge alert-ok">
          <span class="material-icons">check_circle</span>
          <span>All Systems Operational</span>
        </div>
      {/if}
    </div>

    <div class="header-right">
      <div class="score-badge" style="border-color: {scoreColor}; color: {scoreColor}">
        <span class="score-value">{Math.round(overallScore)}</span>
        <span class="score-label">RASS</span>
      </div>
    </div>
  </div>
</header>

<style>
  header {
    background: linear-gradient(135deg, rgba(30, 30, 40, 0.95) 0%, rgba(20, 20, 30, 0.98) 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0.75rem 1.5rem;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(10px);
  }

  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1600px;
    margin: 0 auto;
  }

  .header-left {
    display: flex;
    align-items: center;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .logo-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .digicert-logo {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }

  .logo-text h1 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: 0.5px;
  }

  .tagline {
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 0.5px;
  }

  .header-center {
    display: flex;
    align-items: center;
  }

  .alert-badge {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .alert-badge .material-icons {
    font-size: 16px;
  }

  .alert-critical {
    background: rgba(244, 67, 54, 0.15);
    color: #f44336;
    border: 1px solid rgba(244, 67, 54, 0.3);
    animation: pulse-alert 2s infinite;
  }

  @keyframes pulse-alert {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  .alert-ok {
    background: rgba(76, 175, 80, 0.12);
    color: #4caf50;
    border: 1px solid rgba(76, 175, 80, 0.2);
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .score-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.4rem 1rem;
    border: 2px solid;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.03);
  }

  .score-value {
    font-size: 1.3rem;
    font-weight: 700;
    font-family: 'Roboto Mono', monospace;
    line-height: 1;
  }

  .score-label {
    font-size: 0.55rem;
    letter-spacing: 1px;
    opacity: 0.7;
  }

  @media (max-width: 768px) {
    .header-container {
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .header-center {
      order: 3;
      width: 100%;
      justify-content: center;
    }

    .tagline {
      display: none;
    }
  }
</style>
