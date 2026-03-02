<script lang="ts">
  import type { Recommendation } from '$lib/types';
  import { getSeverityColor, getCategoryColor, getCategoryIcon } from '$lib/types';

  export let recommendations: Recommendation[] = [];

  $: sortedRecs = [...recommendations].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
</script>

<div class="rec-panel">
  <div class="panel-header">
    <div class="header-left">
      <span class="material-icons header-icon">lightbulb</span>
      <h2>Smart Recommendations</h2>
    </div>
    <span class="rec-count">{recommendations.length} actions</span>
  </div>

  <div class="rec-list">
    {#each sortedRecs as rec (rec.id)}
      <div class="rec-item">
        <div class="rec-top">
          <div class="rec-icon-wrap" style="background: {getCategoryColor(rec.category)}18; color: {getCategoryColor(rec.category)}">
            <span class="material-icons">{rec.icon}</span>
          </div>
          <div class="rec-header">
            <div class="rec-title-row">
              <h3>{rec.title}</h3>
              <span class="priority-badge" style="background: {getSeverityColor(rec.priority)}22; color: {getSeverityColor(rec.priority)}">
                {rec.priority.toUpperCase()}
              </span>
            </div>
            <p class="rec-desc">{rec.description}</p>
          </div>
        </div>

        <div class="rec-details">
          <div class="rec-detail">
            <span class="material-icons detail-icon">play_circle</span>
            <div>
              <span class="detail-label">Action</span>
              <span class="detail-text">{rec.action}</span>
            </div>
          </div>
          <div class="rec-detail">
            <span class="material-icons detail-icon">trending_up</span>
            <div>
              <span class="detail-label">Expected Impact</span>
              <span class="detail-text">{rec.impact}</span>
            </div>
          </div>
        </div>

        <div class="rec-footer">
          <span class="category-tag" style="color: {getCategoryColor(rec.category)}">
            <span class="material-icons" style="font-size: 14px">{getCategoryIcon(rec.category)}</span>
            {rec.category}
          </span>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .rec-panel {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(255, 255, 255, 0.02);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .header-icon {
    color: #ffd54f;
    font-size: 20px;
  }

  .panel-header h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .rec-count {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 213, 79, 0.12);
    padding: 3px 10px;
    border-radius: 12px;
    font-family: 'Roboto Mono', monospace;
  }

  .rec-list {
    max-height: 600px;
    overflow-y: auto;
  }

  .rec-item {
    padding: 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    transition: background 0.2s ease;
  }

  .rec-item:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .rec-item:last-child {
    border-bottom: none;
  }

  .rec-top {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .rec-icon-wrap {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .rec-icon-wrap .material-icons {
    font-size: 20px;
  }

  .rec-header {
    flex: 1;
    min-width: 0;
  }

  .rec-title-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .rec-title-row h3 {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .priority-badge {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .rec-desc {
    margin: 4px 0 0;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.55);
    line-height: 1.4;
  }

  .rec-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-left: 52px;
    margin-bottom: 0.5rem;
  }

  .rec-detail {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .detail-icon {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.35);
    margin-top: 1px;
  }

  .detail-label {
    display: block;
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.35);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .detail-text {
    display: block;
    font-size: 0.78rem;
    color: rgba(255, 255, 255, 0.65);
    line-height: 1.4;
  }

  .rec-footer {
    margin-left: 52px;
  }

  .category-tag {
    font-size: 0.7rem;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    text-transform: capitalize;
  }
</style>
