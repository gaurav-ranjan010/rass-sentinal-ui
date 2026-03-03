# RASS Sentinel - Complete Flow Diagrams and Integration Guide

This document provides comprehensive flow diagrams and integration details for the RASS Sentinel system.

---

## 📐 System Flow Summary

### All Flows Integrated

```mermaid
graph TB
    START([Dashboard Loads]) --> INIT[Initialize UI]
    
    INIT --> FLOW1[Flow 1: Telemetry Fetch]
    INIT --> FLOW2[Flow 2: Log Analysis]
    
    subgraph "Flow 1: Real-Time Telemetry"
        FLOW1 --> NR[New Relic API]
        NR --> METRICS[Parse Metrics]
        METRICS --> RASS[Calculate RASS]
        RASS --> GAUGE[Update Gauge]
    end
    
    subgraph "Flow 2: Log Collection"
        FLOW2 --> SPLUNK[Splunk Query]
        SPLUNK --> LOGS[Parse Error Logs]
        LOGS --> PATTERN[Detect Patterns]
        PATTERN --> LOG_UI[Display Logs]
    end
    
    GAUGE --> ANOMALY{Anomaly<br/>Detected?}
    LOG_UI --> USER_CLICK{User Clicks<br/>Error?}
    
    ANOMALY -->|Yes| FLOW2
    USER_CLICK -->|Yes| FLOW3[Flow 3: Error Inference]
    
    subgraph "Flow 3: AI Code Analysis"
        FLOW3 --> GH[GitHub API]
        GH --> CODE[Fetch Source]
        CODE --> AI[OpenAI Analysis]
        AI --> INFERENCE[Generate Inference]
        INFERENCE --> INFERENCE_UI[Display Root Cause]
    end
    
    INFERENCE_UI --> FLOW4[Flow 4: Solutions Search]
    
    subgraph "Flow 4: Historical Knowledge"
        FLOW4 --> SOP_DB[(SOP Database)]
        SOP_DB --> MATCH{SOP<br/>Found?}
        MATCH -->|Yes| EXISTING[Retrieve Solution]
        MATCH -->|No| AI_GEN[AI Generate Solution]
        EXISTING --> COMBINE[Combine Results]
        AI_GEN --> COMBINE
        COMBINE --> SOL_UI[Display Solutions]
    end
    
    SOL_UI --> USER_ACTION{User Applies<br/>Solution?}
    USER_ACTION -->|Yes| TRACK[Track Application]
    USER_ACTION -->|No| END1([Continue Monitoring])
    
    TRACK --> FLOW5[Flow 5: Follow-up]
    
    subgraph "Flow 5: Effectiveness Tracking"
        FLOW5 --> WAIT[Wait 5 minutes]
        WAIT --> CHECK[Check Error Gone?]
        CHECK --> VERIFY_NR[Query New Relic]
        VERIFY_NR --> VERIFY_SPL[Query Splunk]
        VERIFY_SPL --> SUCCESS{Error<br/>Resolved?}
        SUCCESS -->|Yes| UPDATE_EFF[Update Effectiveness +1]
        SUCCESS -->|No| UPDATE_FAIL[Mark Failure]
        UPDATE_EFF --> LEARN[Store Knowledge]
        UPDATE_FAIL --> AI_GEN
    end
    
    LEARN --> END2([Dashboard Updated])
    
    GAUGE --> PREDICT[Flow 6: Future Prediction]
    
    subgraph "Flow 6: Predictive Analytics"
        PREDICT --> BASELINE[Capture Baseline]
        BASELINE --> SIM[Simulate 2x Load]
        SIM --> CALC[Calculate Future RASS]
        CALC --> RISKS[Identify Risks]
        RISKS --> RECOM[Generate Recommendations]
        RECOM --> PRED_UI[Display Predictions]
    end
    
    PRED_UI --> END3([User Reviews Plan])
    
    style FLOW1 fill:#66bb6a,stroke:#388e3c,color:#fff
    style FLOW2 fill:#ab47bc,stroke:#7b1fa2,color:#fff
    style FLOW3 fill:#42a5f5,stroke:#1976d2,color:#fff
    style FLOW4 fill:#ffa726,stroke:#f57c00,color:#000
    style FLOW5 fill:#26c6da,stroke:#0097a7,color:#000
    style PREDICT fill:#ef5350,stroke:#c62828,color:#fff
```

---

## 📊 Data Flow Matrix

| Source System | Data Fetched | Frequency | API Type | Cache Duration |
|---------------|--------------|-----------|----------|----------------|
| **New Relic** | Error Rate, Latency, CPU, Memory, RPS, Uptime | 30 seconds | GraphQL (NRQL) | 30 seconds |
| **Splunk** | Error logs, Stack traces, Frequency counts | On anomaly | REST API | 5 minutes |
| **GitHub** | Source code, Line context | On error click | REST API v3 | 1 hour |
| **SOP Database** | Historical solutions, Resolution steps | On inference | PostgreSQL | 15 minutes |
| **OpenAI** | Error analysis, Root cause, AI solutions | On demand | REST API | Not cached |

---

## 🔌 Integration Dependencies

```mermaid
graph TD
    subgraph "Required Services"
        NR[New Relic Account<br/>API Key Required]
        SPL[Splunk Enterprise<br/>Username/Password]
        GH[GitHub Organization<br/>Personal Access Token]
        PG[(PostgreSQL 14+<br/>with pgvector)]
        REDIS[(Redis 7+<br/>Cache Layer)]
        OPENAI[OpenAI API<br/>GPT-4 Access]
    end
    
    subgraph "Optional Services"
        CLAUDE[Anthropic Claude<br/>Alternative AI]
        PAGER[PagerDuty<br/>Alert Integration]
        SLACK[Slack<br/>Notifications]
    end
    
    subgraph "Environment Configuration"
        ENV[.env.local]
    end
    
    ENV -.-> NR
    ENV -.-> SPL
    ENV -.-> GH
    ENV -.-> PG
    ENV -.-> REDIS
    ENV -.-> OPENAI
    ENV -.-> CLAUDE
    
    style NR fill:#66bb6a,stroke:#388e3c,color:#fff
    style SPL fill:#ab47bc,stroke:#7b1fa2,color:#fff
    style GH fill:#ef5350,stroke:#c62828,color:#fff
    style OPENAI fill:#ffa726,stroke:#f57c00,color:#000
```

---

## ⚙️ Environment Variables Setup

```bash
# .env.local - RASS Sentinel Configuration

# New Relic Configuration
NEW_RELIC_ACCOUNT_ID=your_account_id
NEW_RELIC_API_KEY=NRAK-xxxxxxxxxxxxx
NEW_RELIC_APP_NAME=DigiCert-Platform

# Splunk Configuration
SPLUNK_HOST=splunk.example.com
SPLUNK_PORT=8089
SPLUNK_USERNAME=admin
SPLUNK_PASSWORD=your_password
SPLUNK_INDEX=application_logs

# GitHub Configuration  
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
GITHUB_ORG=digicert

# PostgreSQL (SOP Database)
DATABASE_URL=postgresql://user:password@localhost:5432/rass_sop
PGVECTOR_ENABLED=true

# Redis Cache
REDIS_URL=redis://localhost:6379
REDIS_TTL=1800

# OpenAI Configuration
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
OPENAI_MODEL=gpt-4-turbo-preview

# Optional: Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# Optional: Alert Integrations
PAGERDUTY_API_KEY=your_key
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz

# Application Settings
VITE_API_ENDPOINT=/api
VITE_REFRESH_INTERVAL=30000
VITE_ENABLE_MOCK_DATA=false
```

---

## 🎯 Quick Reference: Integration Points

```mermaid
graph TB
    subgraph "Integration 1: New Relic"
        NR_FLOW[New Relic APM]
        NR_END[api.newrelic.com/graphql]
        NR_AUTH[API-Key Header]
        NR_DATA[Error Rate, Latency<br/>CPU, Memory, RPS, Uptime]
        NR_FREQ[Every 30 seconds]
        NR_IMPL[newrelic.ts]
        
        NR_FLOW --> NR_END
        NR_END --> NR_AUTH
        NR_AUTH --> NR_DATA
        NR_DATA --> NR_FREQ
        NR_FREQ --> NR_IMPL
    end
    
    subgraph "Integration 2: Splunk"
        SPL_FLOW[Splunk Enterprise]
        SPL_END[splunk.com:8089/search/jobs]
        SPL_AUTH[Basic Auth]
        SPL_DATA[Error Logs<br/>Stack Traces]
        SPL_TRIG[On Anomaly Detection]
        SPL_IMPL[splunk.ts]
        
        SPL_FLOW --> SPL_END
        SPL_END --> SPL_AUTH
        SPL_AUTH --> SPL_DATA
        SPL_DATA --> SPL_TRIG
        SPL_TRIG --> SPL_IMPL
    end
    
    subgraph "Integration 3: GitHub"
        GH_FLOW[GitHub API v3]
        GH_END[api.github.com/repos/.../contents]
        GH_AUTH[Bearer Token]
        GH_DATA[Source Code<br/>Line Context]
        GH_TRIG[On Error Click]
        GH_IMPL[github.ts]
        
        GH_FLOW --> GH_END
        GH_END --> GH_AUTH
        GH_AUTH --> GH_DATA
        GH_DATA --> GH_TRIG
        GH_TRIG --> GH_IMPL
    end
    
    subgraph "Integration 4: OpenAI"
        AI_FLOW[OpenAI GPT-4]
        AI_END[api.openai.com/chat/completions]
        AI_AUTH[Bearer Token]
        AI_DATA[Error Analysis<br/>Root Cause<br/>AI Solutions]
        AI_TRIG[After GitHub Fetch]
        AI_IMPL[ai.ts]
        
        AI_FLOW --> AI_END
        AI_END --> AI_AUTH
        AI_AUTH --> AI_DATA
        AI_DATA --> AI_TRIG
        AI_TRIG --> AI_IMPL
    end
    
    subgraph "Integration 5: SOP Database"
        SOP_FLOW[PostgreSQL + pgvector]
        SOP_END[localhost:5432/rass_sop]
        SOP_AUTH[Connection String]
        SOP_DATA[Historical Solutions<br/>Effectiveness Ratings]
        SOP_TRIG[After Inference]
        SOP_IMPL[sop.ts]
        
        SOP_FLOW --> SOP_END
        SOP_END --> SOP_AUTH
        SOP_AUTH --> SOP_DATA
        SOP_DATA --> SOP_TRIG
        SOP_TRIG --> SOP_IMPL
    end
    
    style NR_FLOW fill:#66bb6a,stroke:#388e3c,color:#fff
    style SPL_FLOW fill:#ab47bc,stroke:#7b1fa2,color:#fff
    style GH_FLOW fill:#ef5350,stroke:#c62828,color:#fff
    style AI_FLOW fill:#ffa726,stroke:#f57c00,color:#000
    style SOP_FLOW fill:#42a5f5,stroke:#1976d2,color:#fff
```

---

## 🔄 Complete Integration Flow Example

### Scenario: Production Error Spike (End-to-End)

```mermaid
flowchart TD
    START([Production System]) -->|Error Rate Spike| DETECT
    
    subgraph "Step 1: Detection"
        DETECT[New Relic Detects:<br/>Error Rate 2% → 8%]
        DETECT --> RASS_DROP[RASS Score:<br/>87 → 62]
        RASS_DROP --> ANOMALY[Anomaly Triggered]
    end
    
    ANOMALY --> SPLUNK_Q
    
    subgraph "Step 2: Log Analysis"
        SPLUNK_Q[Splunk Query:<br/>ERROR/FATAL last 1h]
        SPLUNK_Q --> LOGS[Returns:<br/>47 log entries]
        LOGS --> PATTERN[Pattern Detected:<br/>NullPointerException<br/>CIS-Service x23]
    end
    
    PATTERN --> USER_CLICK
    
    subgraph "Step 3: Code Analysis"
        USER_CLICK[User Clicks<br/>Log Entry]
        USER_CLICK --> GITHUB[GitHub Fetches:<br/>CISHandler.java<br/>Lines 11-31]
        GITHUB --> AI_ANALYZE[OpenAI Analyzes:<br/>Error + Code]
        AI_ANALYZE --> INFERENCE[Inference:<br/>Missing null check<br/>Line 21-22<br/>Confidence: 92%]
    end
    
    INFERENCE --> SOP_SEARCH
    
    subgraph "Step 4: Solution Retrieval"
        SOP_SEARCH[Search SOP DB:<br/>NullPointer + CIS]
        SOP_SEARCH --> FOUND[Found 2 Solutions:<br/>94% & 87% effective]
        FOUND --> AI_GEN[OpenAI Generates:<br/>Additional Solution]
        AI_GEN --> COMBINE[Combined:<br/>3 Solutions Presented]
    end
    
    COMBINE --> USER_APPLY
    
    subgraph "Step 5: Application"
        USER_APPLY[User Applies<br/>Solution #1]
        USER_APPLY --> TRACK[Track:<br/>john.doe @ 14:32]
        TRACK --> WAIT[Wait 5 minutes]
        WAIT --> VERIFY1[Verify New Relic:<br/>Error Rate → 2%]
        VERIFY1 --> VERIFY2[Verify Splunk:<br/>0 new occurrences]
        VERIFY2 --> UPDATE[Update SOP:<br/>94% → 95%]
    end
    
    UPDATE --> PREDICT
    
    subgraph "Step 6: Future Prediction"
        PREDICT[Simulate 2x Load]
        PREDICT --> CURRENT[Current:<br/>12,450 RPS<br/>RASS: 87]
        CURRENT --> FUTURE[Predicted:<br/>24,900 RPS<br/>RASS: 68]
        FUTURE --> REC[Recommendation:<br/>Scale horizontally<br/>Add 3 nodes]
    end
    
    REC --> END([Issue Resolved<br/>+ Capacity Planned])
    
    style DETECT fill:#ef5350,stroke:#c62828,color:#fff
    style PATTERN fill:#ab47bc,stroke:#7b1fa2,color:#fff
    style INFERENCE fill:#42a5f5,stroke:#1976d2,color:#fff
    style COMBINE fill:#ffa726,stroke:#f57c00,color:#000
    style UPDATE fill:#66bb6a,stroke:#388e3c,color:#fff
    style REC fill:#26c6da,stroke:#0097a7,color:#000
```

---

## 📈 Performance Metrics

### Response Time & Caching Architecture

```mermaid
graph LR
    subgraph "Performance Metrics"
        direction TB
        
        subgraph "Fast Operations < 500ms"
            NR[New Relic<br/>200-500ms<br/>Cache: 30s]
            GH[GitHub<br/>100-300ms<br/>Cache: 1h]
            DB[SOP Database<br/>50-150ms<br/>Cache: 15m]
        end
        
        subgraph "Medium Operations 2-8s"
            SPL[Splunk<br/>2-5s<br/>Cache: 5m]
            AI[OpenAI<br/>3-8s<br/>No Cache]
        end
        
        subgraph "Priority Levels"
            HIGH[🔴 High Priority<br/>Timeout: 5-10s]
            MED[🟡 Medium Priority<br/>Timeout: 30s]
        end
        
        NR -.-> HIGH
        GH -.-> HIGH
        DB -.-> HIGH
        SPL -.-> MED
        AI -.-> MED
    end
    
    subgraph "Caching Layer"
        REDIS[(Redis Cache)]
        
        CACHE1[Telemetry: 30s<br/>Time-based]
        CACHE2[Logs: 5m<br/>Time-based]
        CACHE3[Code: 1h<br/>Deployment]
        CACHE4[Solutions: 15m<br/>Write-through]
        CACHE5[AI: No Cache<br/>Always Fresh]
        
        REDIS --> CACHE1
        REDIS --> CACHE2
        REDIS --> CACHE3
        REDIS --> CACHE4
    end
    
    NR -->|Stores| CACHE1
    SPL -->|Stores| CACHE2
    GH -->|Stores| CACHE3
    DB -->|Stores| CACHE4
    AI -->|Bypasses| CACHE5
    
    style NR fill:#66bb6a,stroke:#388e3c,color:#fff
    style GH fill:#ef5350,stroke:#c62828,color:#fff
    style DB fill:#42a5f5,stroke:#1976d2,color:#fff
    style SPL fill:#ab47bc,stroke:#7b1fa2,color:#fff
    style AI fill:#ffa726,stroke:#f57c00,color:#000
    style HIGH fill:#ef5350,stroke:#c62828,color:#fff
    style MED fill:#ffa726,stroke:#f57c00,color:#000
    style REDIS fill:#26c6da,stroke:#0097a7,color:#000
```

---

## 🛡️ Error Handling & Fallback Strategies

```mermaid
graph TD
    START[API Request] --> CHECK{Service<br/>Available?}
    
    CHECK -->|New Relic Down| NR_FALLBACK
    CHECK -->|Splunk Timeout| SPL_FALLBACK
    CHECK -->|GitHub Rate Limit| GH_FALLBACK
    CHECK -->|OpenAI Error| AI_FALLBACK
    CHECK -->|SOP DB Down| SOP_FALLBACK
    CHECK -->|All OK| SUCCESS[Return Data]
    
    subgraph "New Relic Fallback"
        NR_FALLBACK[Check Cache]
        NR_FALLBACK --> NR_CACHE{Cache < 5m?}
        NR_CACHE -->|Yes| NR_STALE[Use Cached Metrics<br/>Show 'Stale Data']
        NR_CACHE -->|No| NR_LAST[Use Last Known<br/>RASS Score]
    end
    
    subgraph "Splunk Fallback"
        SPL_FALLBACK[Show Loading]
        SPL_FALLBACK --> SPL_RETRY[Retry with<br/>Reduced Time Range]
        SPL_RETRY --> SPL_SUCCESS{Success?}
        SPL_SUCCESS -->|Yes| SUCCESS
        SPL_SUCCESS -->|No| SPL_CACHE[Use Cached Logs]
    end
    
    subgraph "GitHub Fallback"
        GH_FALLBACK[Check Cache]
        GH_FALLBACK --> GH_HAS{Cached<br/>Code?}
        GH_HAS -->|Yes| GH_USE[Use Cached Code]
        GH_HAS -->|No| GH_PROCEED[Proceed Without<br/>Fresh Code<br/>Show Warning]
    end
    
    subgraph "OpenAI Fallback"
        AI_FALLBACK[Switch Strategy]
        AI_FALLBACK --> AI_RULE[Use Rule-Based<br/>Inference]
        AI_RULE --> AI_HIST[Use Historical<br/>Patterns Only]
        AI_HIST --> AI_LOG[Log for<br/>Manual Review]
    end
    
    subgraph "SOP Database Fallback"
        SOP_FALLBACK[Use AI Only]
        SOP_FALLBACK --> SOP_GEN[OpenAI Generates<br/>Solutions]
        SOP_GEN --> SOP_DISC[Display<br/>Disclaimer]
        SOP_DISC --> SOP_QUEUE[Queue for<br/>Later Storage]
    end
    
    NR_STALE --> END[Continue<br/>Operation]
    NR_LAST --> END
    SPL_CACHE --> END
    GH_USE --> END
    GH_PROCEED --> END
    AI_LOG --> END
    SOP_QUEUE --> END
    SUCCESS --> END
    
    style NR_FALLBACK fill:#66bb6a,stroke:#388e3c,color:#fff
    style SPL_FALLBACK fill:#ab47bc,stroke:#7b1fa2,color:#fff
    style GH_FALLBACK fill:#ef5350,stroke:#c62828,color:#fff
    style AI_FALLBACK fill:#ffa726,stroke:#f57c00,color:#000
    style SOP_FALLBACK fill:#42a5f5,stroke:#1976d2,color:#fff
    style END fill:#26c6da,stroke:#0097a7,color:#000
```

---

## 🔒 Security Architecture

```mermaid
graph TB
    subgraph "Security Layer 1: API Key Management"
        ENV[Environment Variables]
        ENV --> NO_COMMIT[Never Commit<br/>to Repository]
        ENV --> ROTATE[Rotate Keys<br/>Quarterly]
        ENV --> SEPARATE[Separate Keys:<br/>Dev/Staging/Prod]
    end
    
    subgraph "Security Layer 2: Data Privacy"
        DATA[Data Flow]
        DATA --> SANITIZE[Sanitize Stack Traces<br/>Before AI Calls]
        DATA --> NO_SENSITIVE[No Sensitive Data<br/>to OpenAI]
        DATA --> MASK[Mask Credentials<br/>in Logs]
        DATA --> AUDIT[Audit All<br/>External API Calls]
    end
    
    subgraph "Security Layer 3: Access Control"
        ACCESS[Access Management]
        
        NR_ACCESS[New Relic:<br/>Read-Only API Key]
        SPL_ACCESS[Splunk:<br/>Limited Search<br/>Permissions]
        GH_ACCESS[GitHub:<br/>Read-Only<br/>Repo Access]
        SOP_ACCESS[SOP Database:<br/>Role-Based<br/>Access Control]
        
        ACCESS --> NR_ACCESS
        ACCESS --> SPL_ACCESS
        ACCESS --> GH_ACCESS
        ACCESS --> SOP_ACCESS
    end
    
    subgraph "Security Layer 4: Network Security"
        NETWORK[Network Layer]
        NETWORK --> TLS[TLS 1.3<br/>All Connections]
        NETWORK --> VPN[VPN for<br/>Internal Services]
        NETWORK --> FIREWALL[Firewall Rules<br/>IP Whitelisting]
    end
    
    subgraph "Security Layer 5: Monitoring"
        MONITOR[Security Monitoring]
        MONITOR --> RATE[Rate Limiting<br/>API Calls]
        MONITOR --> ALERT[Alert on<br/>Suspicious Activity]
        MONITOR --> LOG_SEC[Security Event<br/>Logging]
    end
    
    ENV --> DATA
    DATA --> ACCESS
    ACCESS --> NETWORK
    NETWORK --> MONITOR
    
    style ENV fill:#ef5350,stroke:#c62828,color:#fff
    style DATA fill:#ab47bc,stroke:#7b1fa2,color:#fff
    style ACCESS fill:#42a5f5,stroke:#1976d2,color:#fff
    style NETWORK fill:#66bb6a,stroke:#388e3c,color:#fff
    style MONITOR fill:#ffa726,stroke:#f57c00,color:#000
```

---

**For complete implementation details, see the main [README.md](README.md)**
