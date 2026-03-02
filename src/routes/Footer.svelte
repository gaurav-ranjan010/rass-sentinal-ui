<script lang="ts">
  const year = new Date().getFullYear();
</script>

<footer>
  <div class="footer-content">
    <div class="footer-left">
      <span class="material-icons">shield</span>
      <span class="brand">RASS Sentinel</span>
    </div>
    <div class="footer-center">
      <span>Hackathon 2026</span>
      <span class="divider">•</span>
      <span>Intelligent Health Monitoring</span>
    </div>
    <div class="footer-right">
      <span>© {year} DigiCert, Inc.</span>
    </div>
  </div>
</footer>

<style>
  footer {
    background: rgba(0, 0, 0, 0.3);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding: 1rem 1.5rem;
    margin-top: auto;
  }

  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1600px;
    margin: 0 auto;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .footer-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .footer-left .material-icons {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.3);
  }

  .brand {
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
  }

  .footer-center {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .divider {
    color: rgba(255, 255, 255, 0.2);
  }

  .footer-right {
    color: rgba(255, 255, 255, 0.3);
  }

  @media (max-width: 768px) {
    .footer-content {
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;
    }

    .footer-center {
      order: -1;
    }
  }
</style>
