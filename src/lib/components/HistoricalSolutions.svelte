<script lang="ts">
  import type { HistoricalSolution } from '$lib/types';

  export let solutions: HistoricalSolution[] = [];
  export let matchingLogPattern: string = '';

  let expandedSolution: string | null = null;

  // Find solutions matching the current log pattern
  $: matchingSolutions = matchingLogPattern 
    ? solutions.filter(s => 
        s.errorPattern.toLowerCase().includes(matchingLogPattern.toLowerCase()) ||
        matchingLogPattern.toLowerCase().includes(s.errorPattern.toLowerCase().split(':')[0])
      )
    : solutions;

  $: sortedSolutions = [...matchingSolutions].sort((a, b) => b.effectiveness - a.effectiveness);

  function toggleExpand(id: string) {
    expandedSolution = expandedSolution === id ? null : id;
  }

  function getEffectivenessColor(effectiveness: number): string {
    if (effectiveness >= 90) return '#4caf50';
    if (effectiveness >= 70) return '#8bc34a';
    if (effectiveness >= 50) return '#ff9800';
    return '#ff5722';
  }
</script>

<div class="solutions-panel">
  <div class="panel-header">
    <div class="header-title">
      <span class="material-icons">history_edu</span>
      <h3>Historical Solutions & Resolutions</h3>
    </div>
    <div class="solutions-count">
      {sortedSolutions.length} solutions available
    </div>
  </div>

  <div class="solutions-container">
    {#if sortedSolutions.length === 0}
      <div class="no-solutions">
        <span class="material-icons">search_off</span>
        <span>No matching solutions found</span>
      </div>
    {:else}
      {#each sortedSolutions as solution (solution.id)}
        <div 
          class="solution-card" 
          class:expanded={expandedSolution === solution.id}
          role="button"
          tabindex="0"
          on:click={() => toggleExpand(solution.id)}
          on:keypress={(e) => e.key === 'Enter' && toggleExpand(solution.id)}
        >
          <div class="solution-header">
            <div class="solution-title-row">
              <span class="service-badge">{solution.service}</span>
              <div class="effectiveness-badge" style="background: {getEffectivenessColor(solution.effectiveness)}20; color: {getEffectivenessColor(solution.effectiveness)}">
                <span class="material-icons">verified</span>
                {solution.effectiveness}% effective
              </div>
            </div>
            <div class="error-pattern">
              <span class="material-icons">error_outline</span>
              <code>{solution.errorPattern}</code>
            </div>
          </div>

          <div class="solution-summary">
            <span class="material-icons">lightbulb</span>
            <span>{solution.solution}</span>
          </div>

          {#if expandedSolution === solution.id}
            <div class="solution-details">
              <div class="steps-section">
                <h4>
                  <span class="material-icons">checklist</span>
                  Steps to Resolve
                </h4>
                <ol class="steps-list">
                  {#each solution.stepsToResolve as step, index}
                    <li>
                      <span class="step-number">{index + 1}</span>
                      <span class="step-text">{step}</span>
                    </li>
                  {/each}
                </ol>
              </div>

              <div class="meta-section">
                <div class="meta-item">
                  <span class="meta-label">Resolved by</span>
                  <span class="meta-value">
                    <span class="material-icons">person</span>
                    {solution.resolvedBy}
                  </span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Time to resolve</span>
                  <span class="meta-value">
                    <span class="material-icons">timer</span>
                    {solution.timeToResolve}
                  </span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Resolved on</span>
                  <span class="meta-value">
                    <span class="material-icons">calendar_today</span>
                    {new Date(solution.resolvedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div class="tags-section">
                {#each solution.tags as tag}
                  <span class="tag">#{tag}</span>
                {/each}
              </div>
            </div>
          {/if}

          <div class="expand-hint">
            <span class="material-icons">
              {expandedSolution === solution.id ? 'expand_less' : 'expand_more'}
            </span>
            {expandedSolution === solution.id ? 'Show less' : 'View resolution steps'}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .solutions-panel {
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
    color: #4caf50;
    font-size: 22px;
  }

  .header-title h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .solutions-count {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.05);
    padding: 0.3rem 0.6rem;
    border-radius: 12px;
  }

  .solutions-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 450px;
    overflow-y: auto;
  }

  .no-solutions {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 2rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .no-solutions .material-icons {
    font-size: 32px;
  }

  .solution-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .solution-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .solution-card.expanded {
    background: rgba(76, 175, 80, 0.05);
    border-color: rgba(76, 175, 80, 0.2);
  }

  .solution-header {
    margin-bottom: 0.75rem;
  }

  .solution-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .service-badge {
    font-size: 0.7rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    background: rgba(66, 165, 245, 0.15);
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
  }

  .effectiveness-badge {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
  }

  .effectiveness-badge .material-icons {
    font-size: 12px;
  }

  .error-pattern {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .error-pattern .material-icons {
    font-size: 16px;
    color: #f44336;
  }

  .error-pattern code {
    font-size: 0.75rem;
    color: #ef9a9a;
    word-break: break-all;
  }

  .solution-summary {
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
    padding: 0.75rem;
    background: rgba(76, 175, 80, 0.1);
    border-radius: 6px;
    margin-bottom: 0.75rem;
  }

  .solution-summary .material-icons {
    color: #81c784;
    font-size: 18px;
    flex-shrink: 0;
  }

  .solution-summary span {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.4;
  }

  .solution-details {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .steps-section h4 {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 0.75rem 0;
  }

  .steps-section h4 .material-icons {
    color: #66bb6a;
    font-size: 18px;
  }

  .steps-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .steps-list li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 6px;
  }

  .step-number {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(102, 187, 106, 0.2);
    color: #66bb6a;
    border-radius: 50%;
    font-size: 0.7rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  .step-text {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.4;
  }

  .meta-section {
    display: flex;
    gap: 1.5rem;
    margin: 1rem 0;
    flex-wrap: wrap;
  }

  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .meta-label {
    font-size: 0.65rem;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 0.5px;
  }

  .meta-value {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .meta-value .material-icons {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
  }

  .tags-section {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
  }

  .tag {
    font-size: 0.7rem;
    color: #90caf9;
    background: rgba(144, 202, 249, 0.1);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
  }

  .expand-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
    margin-top: 0.5rem;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .expand-hint .material-icons {
    font-size: 16px;
  }

  @media (max-width: 600px) {
    .meta-section {
      flex-direction: column;
      gap: 0.5rem;
    }

    .solution-title-row {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
