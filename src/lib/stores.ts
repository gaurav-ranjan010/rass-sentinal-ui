import { writable, derived } from 'svelte/store';
import type { DashboardData, SplunkLogEntry, ErrorInference, HistoricalSolution, FuturePrediction } from './types';
import { mockDashboardData, mockSplunkLogs, mockErrorInferences, mockHistoricalSolutions, calculateFuturePrediction } from './mockData';

// Main dashboard data store
export const dashboardData = writable<DashboardData>(mockDashboardData);

// New data stores
export const splunkLogs = writable<SplunkLogEntry[]>(mockSplunkLogs);
export const errorInferences = writable<ErrorInference[]>(mockErrorInferences);
export const historicalSolutions = writable<HistoricalSolution[]>(mockHistoricalSolutions);

// Derived stores
export const rassScore = derived(dashboardData, ($d) => $d.rassScore);
export const anomalies = derived(dashboardData, ($d) => $d.anomalies);
export const recommendations = derived(dashboardData, ($d) => $d.recommendations);
export const telemetry = derived(dashboardData, ($d) => $d.telemetry);
export const services = derived(dashboardData, ($d) => $d.services);

// Future prediction derived store
export const futurePrediction = derived(dashboardData, ($d) => calculateFuturePrediction($d));

// UI state
export const selectedCategory = writable<string>('all');
export const darkMode = writable<boolean>(true);
export const refreshing = writable<boolean>(false);

// Simulate live refresh
export function refreshData() {
  refreshing.set(true);
  setTimeout(() => {
    dashboardData.update((data) => {
      // Slightly randomize values to simulate live data
      const jitter = (base: number, range: number) =>
        Math.round((base + (Math.random() - 0.5) * range) * 100) / 100;

      data.rassScore.overall = Math.min(100, Math.max(0, jitter(data.rassScore.overall, 4)));
      data.rassScore.reliability = Math.min(100, Math.max(0, jitter(data.rassScore.reliability, 6)));
      data.rassScore.availability = Math.min(100, Math.max(0, jitter(data.rassScore.availability, 2)));
      data.rassScore.scalability = Math.min(100, Math.max(0, jitter(data.rassScore.scalability, 5)));
      data.rassScore.security = Math.min(100, Math.max(0, jitter(data.rassScore.security, 3)));

      // Update telemetry current values
      for (const key of Object.keys(data.telemetry)) {
        const metric = data.telemetry[key];
        const newVal = jitter(metric.current, metric.current * 0.05);
        metric.current = Math.max(0, newVal);

        // Push new data point
        metric.history.push({
          timestamp: new Date().toISOString(),
          value: metric.current
        });
        if (metric.history.length > 24) {
          metric.history.shift();
        }
      }

      data.lastUpdated = new Date().toISOString();
      return data;
    });
    refreshing.set(false);
  }, 800);
}
