# RASS Sentinel

**Intelligent Health Score & Risk Detection System**

RASS Sentinel is a lightweight intelligent monitoring layer that turns raw observability data into proactive platform protection.

## What is RASS?

| Component | Description | Metrics Monitored |
|-----------|-------------|-------------------|
| **R**eliability | System stability and error handling | Error Rate, P99 Latency |
| **A**vailability | Uptime and service responsiveness | Uptime %, Request Throughput |
| **S**calability | Resource utilization and capacity | CPU Usage, Memory Usage |
| **S**ecurity | Vulnerability and threat indicators | Open CVEs, Security Alerts |

## Features

### 🎯 RASS Score (0-100)
A single unified health score that combines all four dimensions, giving you instant visibility into overall platform health.

### 📊 Live Telemetry
Real-time charts showing:
- Error Rate
- P99/P50 Latency
- CPU & Memory Usage
- Request Throughput
- Uptime

### ⚠️ Anomaly Detection
Automatic detection of unusual patterns:
- Spike detection in metrics
- Threshold breach alerts
- Correlation with recent deployments

### 💡 Smart Recommendations
AI-powered actionable insights:
- "Error rate exceeded 5% — investigate recent deployment"
- "CPU sustained above 80% — scale horizontally"
- "3 new CVEs detected — patch dependencies"

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    RASS Sentinel UI                      │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Health   │  │ Anomaly  │  │ Telemetry│  │ Recom-  │ │
│  │ Gauge    │  │ Panel    │  │ Charts   │  │ mendations│ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
├─────────────────────────────────────────────────────────┤
│                   Svelte Stores                          │
├─────────────────────────────────────────────────────────┤
│            Observability Data (Datadog/Prometheus)       │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

- **Framework**: SvelteKit 2.0
- **Language**: TypeScript
- **Styling**: CSS with dark theme
- **Charts**: Custom SVG visualizations
- **State**: Svelte Stores

## Why RASS Sentinel?

Instead of reacting to outages, RASS Sentinel helps teams:
- ✅ Detect risks early
- ✅ Reduce downtime
- ✅ Prevent scaling failures
- ✅ Improve system stability
- ✅ Make faster decisions

---

**Hackathon 2026** | DigiCert


### Steps for use

1. Rename everywhere you see `svelte-ui-template` to whatever your project is.
2. You'll want to setup a github actions self hosted runner for your service in order to use all of the actions in [`.github/workflows`](https://github.com/digicert/svelte-ui-template/tree/master/.github/workflows). Specifically the actions for building a docker image and pushing to our registry will need to be updated after an action runner is created for your repo
3. Develop!

### Deployment

This project is designed to be deployed in a docker container using k8s. You'll need to setup a namespace or use an existing one and then configure the github actions to properly deploy to it.