Here is the complete, ground-up Product Requirements and Build Architecture document for the browser-based CurbAI system.

***

# CurbAI Browser Edition — Complete Product Requirements & Build Architecture

***

## How to Read This Document

This is your full build specification. It tells you what to build, why each piece exists, what technology to use, and in what order. Every decision is made with three constraints: buildable by a small team, demonstrable to a real user or client, and a foundation you can scale — not something you throw away after V1. Work through this in the sequence it is written. Each phase produces something functional that can be shown.

***

## Product Vision
 CurbAI Browser Edition is a browser-based behavioral intelligence platform. It monitors user browser activity through a lightweight Chrome extension, scores that activity using a machine learning model, routes high-risk or anomalous patterns to an AI agent for reasoning, and presents the agent's decision to a qualified human for approval before any action is taken. The entire system is operated through a web dashboard.

The pivot from a desktop agent to a browser extension is correct for V1. You remove MSI packaging, Windows Service management, Windows Event Log parsing, and OS-level privilege requirements. You gain cross-platform support, simpler deployment, and a faster feedback loop between development and demonstration. You accept a narrowed data surface — you see everything that happens in the browser and nothing outside it. For V1, that data surface is sufficient to demonstrate the full product loop.

***

## Product Requirements

These are the things the system must do from a user's perspective. Everything in this document serves these requirements.

- The system must collect behavioral data from a user's browser through a lightweight extension without meaningfully slowing their browsing experience.
- The system must detect anomalous browsing patterns using a trained ML model and produce a risk score with a human-readable explanation.
- The system must detect productivity risk patterns and produce a recommendation for the relevant manager.
- The system must use an AI agent to reason about high-risk events and produce a human-readable decision package.
- The system must present that decision package to a qualified human for approval before any significant action is taken.
- The system must execute approved actions — notifications, session warnings, access flags.
- The system must record every event, score, agent decision, human approval, and action in a tamper-evident audit log.
- The system must present all of this through a clean, role-aware web dashboard.
- The system must support three user roles: Security Analyst, Manager, and Administrator.
- The system must send notifications through email and Slack or Teams when critical events occur.
- The system must generate a downloadable incident report PDF for any confirmed incident.
- The system must provide two-way communication between the backend and the extension so the backend can push commands (warnings, flags, session messages) to the active extension.

These requirements, fully implemented, constitute CurbAI Browser Edition V1.

***

## Tech Stack Decisions

Every choice below is deliberate. The reasoning is included because your team needs to understand why a choice was made before arguing for an alternative.

**Python 3.11** is the backend language. The ML ecosystem, the LLM agent libraries, the API frameworks, and the async tooling are all strongest in Python. There is no credible alternative for this kind of system.

**FastAPI** is the API framework. It is asynchronous by default, which matters when your services are simultaneously waiting on database queries, ML inference, and LLM API calls. It auto-generates API documentation, which keeps your extension developer and backend developer synchronized. It has native WebSocket support, which you need for two-way extension communication. [videosdk](https://www.videosdk.live/developer-hub/websocket/fastapi-websocket)

**PostgreSQL 15** is the primary database. Reliable, well-understood, handles both transactional and time-series-style analytical queries adequately for V1, and available on every hosting platform.

**RabbitMQ** is the message broker for async service communication. The Ingestion Service does not wait for the ML Detection Service before acknowledging an event. RabbitMQ provides durable queues, acknowledgement, and routing. Simpler to operate than Kafka at V1 scale.

**Celery** handles background and scheduled tasks — model scoring jobs, weekly model retraining, periodic productivity analysis, and summary report generation. It uses RabbitMQ as its broker.

**Redis** handles caching and the Celery result backend. User behavioral baselines, active WebSocket session registry (so the backend knows which extension connections are live), and frequently accessed configuration all live in Redis.

**scikit-learn** is the ML library. The Isolation Forest model for anomaly detection is implemented here.  Mature, interpretable output, integrates cleanly with pandas for the feature engineering pipeline. [radware](https://www.radware.com/blog/application-protection/browser-anomaly-detection-module-a-technical-overview/)

**OpenAI Python SDK** is the LLM client. Agents call GPT-4o through Azure OpenAI for data residency compliance. The interface is abstracted behind a thin wrapper so you can swap to a local Ollama endpoint for privacy-sensitive customers without touching the agent logic.

**React 18** is the frontend dashboard framework. Component-based, large ecosystem, and the most hireable frontend skill set.

**Tailwind CSS** handles dashboard styling. Utility-first, fast to iterate on, and produces consistent UI without a heavyweight component library.

**Recharts** handles data visualization — time series risk score trends, event frequency charts, domain-category breakdowns, user activity heatmaps.

**JavaScript (ES2022) with Chrome Manifest V3** is the extension language and standard.  Manifest V3 is the current and only supported standard for new extensions. Background logic runs in a Service Worker instead of a persistent background page — an important architectural constraint covered in the Extension Specification section. [codimite](https://codimite.ai/blog/service-workers-in-chrome-extensions-mv3-powering-background-functionality/)

**Docker and Docker Compose** handle containerization. Every backend service runs in its own container. This is the right level of complexity for V1. Kubernetes comes when you have multiple customer deployments to manage.

**Nginx** is the reverse proxy — HTTPS termination, routing to the API Gateway and the React frontend, and static asset serving.

**Pytest** is the testing framework for all backend services.

***

## System Architecture Overview

The system has four layers.

**Layer 1: Data Collection** — The Chrome extension running in the user's browser. It captures events, buffers them locally, and ships them to the backend. It also receives commands from the backend and executes them in the browser.

**Layer 2: Processing Pipeline** — Seven backend services that ingest, normalize, score, reason about, and act on events. They communicate asynchronously through RabbitMQ and synchronously via internal HTTP when necessary.

**Layer 3: Control Layer** — The human approval workflow. AI agents produce decision packages. Those packages enter an approval queue. Humans review and decide. Approved decisions trigger actions.

**Layer 4: Presentation Layer** — The React dashboard. Role-aware. Analysts see events and approvals. Managers see team productivity. Admins see everything and manage configuration.

***

## Service Architecture

Seven backend services, each running in its own Docker container, plus the frontend application, PostgreSQL, RabbitMQ, Redis, and Nginx.

### 1. Ingestion Service
**Owns:** the entry point of all data into the system.

Receives event batches POSTed by the Chrome extension. Validates each event against the defined schema — rejects malformed events and logs the rejection. Normalizes events to a canonical internal schema. Writes raw events to the `events` table in PostgreSQL. Publishes normalized events to the `events.raw` RabbitMQ exchange for downstream consumption. Also maintains a WebSocket endpoint (`/ws/agent/{device_id}`) that each extension instance connects to for receiving commands from the backend.  Authenticates each connection using the device's API key. Maintains a registry of live WebSocket connections in Redis so the Action Execution Service can look up whether a target device has an active connection before attempting to push a command. [videosdk](https://www.videosdk.live/developer-hub/websocket/fastapi-websocket)

**Key API endpoints:**
- `POST /ingest/events` — receives batched events from the extension
- `WebSocket /ws/agent/{device_id}` — bidirectional channel for commands

### 2. ML Detection Service
**Owns:** anomaly scoring.

Runs as a Celery worker. Consumes events from the `events.raw` queue. For each event, loads the user's behavioral baseline from Redis. Extracts the feature vector from the event. Scores the event using the active Isolation Forest model. Computes the feature contribution explanation. Writes the result to the `scored_events` table. Publishes scored events with scores above the significance threshold (configurable, default 40) to the `events.scored` queue. Events below threshold are written to the database but not forwarded — they are not interesting enough to route further.

Also exposes an internal HTTP endpoint (`POST /model/reload`) called by the Model Training Service when a new model is ready.

### 3. Model Training Service
**Owns:** ML model lifecycle.

Runs as a Celery Beat scheduled task, initially weekly. Pulls the past 30 days of events from PostgreSQL. Engineers features from the raw event data. Splits into training and holdout sets. Trains a new Isolation Forest model. Evaluates the new model against the holdout set and compares performance metrics to the currently active model. If the new model is better, serializes it to the model store (a mounted Docker volume for V1, an S3-compatible bucket for production), writes a record to the `models` table, and calls the ML Detection Service's reload endpoint. If the new model is not better, logs the result and discards it.

For the very first run (before real customer data exists), a synthetic data generation script produces realistic browser behavioral patterns — login time distributions, typical session lengths, browsing category distributions, tab-switching rates — to bootstrap the initial model.

### 4. Intelligence Service
**Owns:** AI agent reasoning.

Consumes events from the `events.scored` queue where the risk score exceeds the agent trigger threshold (configurable, default 55). For each qualifying event, it fetches the user's profile and 7-day event history from PostgreSQL and the user's current baseline from Redis. It constructs the prompt for the Security Intelligence Agent. It calls the LLM API. It parses the JSON-structured response. It stores the full reasoning trace in the `reasoning_traces` table. It writes the decision package to `agent_decisions`. It creates a record in `approval_queue` with status `Pending`. It calls the Notification Service to alert the assigned analyst.

Also runs a Celery Beat scheduled task every 4 hours for the Productivity Intelligence Agent. It queries the past two weeks of browsing activity per user — time-on-productive-domains vs time-on-distraction-domains, session continuity, working-hours deviation, meeting-period browsing patterns if calendar data is available. It identifies teams or individuals that breach configured thresholds. It constructs a productivity-focused prompt and calls the LLM. It writes a recommendation to `agent_decisions` as type `Recommendation` (lower urgency than a security alert) and notifies the relevant manager.

The prompt templates are version-controlled in the codebase as `.txt` files, not hardcoded strings. They are the most important artifacts in the Intelligence Service and must be treated as production code.

### 5. Action Execution Service
**Owns:** executing approved actions in the real world.

Polls `approval_queue` every 30 seconds for records with status `Approved`. For each approved action, reads the action type and executes it. Writes the outcome to `action_log`. See the Action Types section below for the V1 action inventory.

### 6. Notification Service
**Owns:** all outbound communications.

Email via SMTP, Slack via Incoming Webhooks, Teams via Incoming Webhooks. Other services call this service's internal API when they need to send a message. The Notification Service owns retry logic — up to three retries with exponential backoff for transient failures. It writes delivery status to a notifications log table.

### 7. Report Service
**Owns:** document generation.

Receives a report request referencing an event ID, agent decision ID, and approval record ID. Queries all of these from PostgreSQL. Renders the data into a structured PDF using Jinja2 templates and WeasyPrint (a Python library that converts HTML/CSS to PDF). Stores the generated PDF in a configured output directory. Returns the download path. The path is surfaced in the dashboard on the relevant event detail page. Also generates weekly summary PDFs triggered by a Celery Beat task every Monday morning.

### 8. API Gateway Service
**Owns:** the single HTTP interface for the React dashboard.

The frontend talks only to this service. It handles OAuth2 / SAML-based authentication (delegating to the customer's identity provider) and JWT session management. It enforces role-based access control on every request — Managers see only data for their organizational unit, Analysts cannot approve Admin-level actions, Admins have full access. It routes requests to the appropriate internal service or queries PostgreSQL directly for read operations.

***

## Browser Extension Specification

The extension is a Chrome extension built to **Manifest V3**. It is installed on monitored users' machines by an IT administrator via Chrome Enterprise Policy (for managed environments) or by sideloading a `.crx` file for smaller setups. It is not listed on the public Chrome Web Store for enterprise deployment.

### Extension Components

The extension has four components, each with a distinct role.

**1. Service Worker (`background.js`)**

The brain of the extension. In Manifest V3, background logic runs in a Service Worker — an event-driven JavaScript program that is spun up when needed and shut down when idle.  This is the most important architectural constraint in the extension. You cannot maintain persistent in-memory state across events. All state that must survive the Service Worker sleeping must be written to `chrome.storage.local`. [developer.chrome](https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers)

The Service Worker is responsible for:
- Listening to tab and navigation events
- Computing session metrics (time-on-page, tab switches, idle periods)
- Buffering events in `chrome.storage.local`
- Flushing the buffer to the Ingestion Service every 30 seconds via `chrome.alarms`
- Flushing high-priority events immediately (authentication anomalies, rapid domain switching)
- Maintaining the WebSocket connection to the Ingestion Service for receiving backend commands
- Executing commands received from the backend — displaying warning overlays, injecting content script messages

Because Service Workers can be terminated by Chrome at any time, the WebSocket connection must be re-established after the Service Worker wakes. Use `chrome.alarms` to keep the Service Worker alive during active monitoring sessions, firing every 20 seconds. [developer.chrome](https://developer.chrome.com/docs/extensions/whats-new)

**2. Content Script (`content.js`)**

Injected into every page the user visits (controlled via `matches` in the manifest). Responsible for:
- Detecting page focus and blur events (is the user actively on this tab or did they switch away?)
- Capturing scroll depth as a proxy for content engagement
- Detecting form submission events on monitored domains
- Receiving messages from the Service Worker to display in-page warning overlays (for approved warning actions)
- Reporting DOM-level events back to the Service Worker via `chrome.runtime.sendMessage`

Content scripts run in an isolated world — they share the page's DOM but not its JavaScript scope. They cannot directly call Chrome extension APIs except `chrome.runtime.sendMessage` and `chrome.storage`.

**3. Popup UI (`popup.html` + `popup.js`)**

A small popup interface (accessible by clicking the extension icon) that shows the monitoring status (active/paused), the device ID, connection status to the backend, and a link to the main CurbAI dashboard. Does not show raw event data. This is the only UI surface in the extension itself.

**4. Options Page (`options.html` + `options.js`)**

Accessible via the extension management page. Allows the IT administrator to input the backend URL and the device registration key during initial setup. After registration, the API key is stored in `chrome.storage.local` (encrypted using the Web Crypto API) and the options page shows only connection status.

### Event Categories the Extension Collects

| Event Category | Chrome API Used | Data Captured |
|---|---|---|
| Navigation | `chrome.tabs.onUpdated`, `chrome.webNavigation` | URL (full), domain, timestamp, tab ID, transition type |
| Tab Management | `chrome.tabs.onCreated`, `onRemoved`, `onActivated` | Tab count, switch frequency, new tab vs navigation |
| Session Timing | `chrome.idle`, content script focus/blur | Active time per domain, idle periods, session start/end |
| Downloads | `chrome.downloads.onCreated` | Filename, source URL, file size, MIME type |
| Page Engagement | Content script scroll + focus events | Scroll depth, focus duration per page |
| Extension Install/Remove | `chrome.management.onInstalled` | Other extensions being installed or removed |
| Anomalous Navigation | Computed in Service Worker | Rapid domain switching rate, off-hours access, new domains |

### Event Buffering and Delivery

Events are serialized to JSON and written to `chrome.storage.local` under a structured key. The buffer holds up to 500 events before the oldest are dropped (under normal 30-second flush intervals, this represents several hours of data). On every flush cycle triggered by `chrome.alarms`, the Service Worker reads all buffered events, POSTs them to the Ingestion Service in a single batch, and clears the sent events from storage on a confirmed 200 response. If the POST fails (network unavailable, server error), the events remain in the buffer and are retried on the next cycle.

High-priority event types — rapid succession of new domain navigations in a short window, download of an executable file, navigation to a flagged domain category — are flushed immediately without waiting for the 30-second cycle.

### Two-Way Command Channel

The Service Worker establishes a WebSocket connection to `wss://your-backend.com/ws/agent/{device_id}` on startup and after waking from idle. Commands received from the backend are JSON objects with a `command_type` field. The V1 command types are:

- `SHOW_WARNING` — Service Worker sends a message to the active tab's content script to display an overlay warning with a configurable message
- `FLAG_SESSION` — Service Worker writes a flag to `chrome.storage.local` that is included in all subsequent event batches, indicating this session is under heightened monitoring
- `SEND_ACKNOWLEDGEMENT` — Prompts the user with a browser notification requiring them to click "I understand" — used after a manager-approved warning delivery
- `PING` — Backend health check; Service Worker responds with `PONG` and current buffer size

***

## Database Schema

Design every table before writing a single service. Schema changes are the most expensive kind of change in a live system.

### `users`
Stores both monitored users and dashboard users.
- `id` (UUID, PK)
- `email` (unique, indexed)
- `display_name`
- `role` (`analyst` | `manager` | `admin` | `monitored_user`)
- `department`
- `manager_id` (FK → users.id, nullable)
- `org_unit`
- `external_identity_ref` (the OAuth2 sub or SAML nameID — no passwords stored for dashboard users)
- `account_status` (`active` | `suspended`)
- `created_at`, `updated_at`

### `devices`
Tracks registered extension instances.
- `id` (UUID, PK)
- `user_id` (FK → users.id)
- `device_fingerprint` (browser user-agent hash + OS + screen resolution hash)
- `api_key_hash` (bcrypt hash of the device API key — the raw key is shown once at registration and never stored)
- `registered_at`
- `last_seen_at`
- `is_active`

### `events`
Every normalized event from every extension.
- `id` (UUID, PK)
- `device_id` (FK → devices.id)
- `user_id` (FK → users.id)
- `event_category` (`navigation` | `tab_management` | `session_timing` | `download` | `page_engagement` | `extension_change`)
- `event_type` (specific sub-type within category)
- `event_timestamp` (the timestamp from the extension, not the server receipt time)
- `server_received_at`
- `payload` (JSONB — the full normalized event data)
- `session_id` (a UUID generated by the extension per browsing session)

Index on `(user_id, event_timestamp)` and `(event_timestamp)`. This table grows fast. Plan for partitioning by month after the first few thousand users.

### `scored_events`
ML output per event.
- `id` (UUID, PK)
- `event_id` (FK → events.id)
- `risk_score` (float, 0–100)
- `severity` (`low` | `medium` | `high` | `critical`)
- `model_version_id` (FK → models.id)
- `feature_vector` (JSONB)
- `feature_contributions` (JSONB — which features drove the score)
- `scored_at`

### `agent_decisions`
Every decision package from the Intelligence Service.
- `id` (UUID, PK)
- `scored_event_id` (FK → scored_events.id, nullable — productivity decisions are not tied to a single event)
- `agent_type` (`security` | `productivity`)
- `severity` (`low` | `medium` | `high` | `critical`)
- `recommended_action` (`SendEmailNotification` | `SendSlackNotification` | `SendTeamsNotification` | `ShowBrowserWarning` | `FlagSession` | `GenerateIncidentReport`)
- `confidence` (float, 0–1)
- `human_explanation` (text — the plain English paragraph shown to the approver)
- `reasoning_trace_id` (FK → reasoning_traces.id)
- `decision_timestamp`

### `reasoning_traces`
Full LLM prompt and response per agent invocation.
- `id` (UUID, PK)
- `agent_type`
- `prompt_text` (text)
- `llm_response_raw` (text)
- `llm_model_used`
- `tokens_used`
- `created_at`

### `approval_queue`
The state machine for human decisions.
- `id` (UUID, PK)
- `agent_decision_id` (FK → agent_decisions.id)
- `queue_type` (`SecurityAlert` | `Recommendation`)
- `status` (`Pending` | `Approved` | `Rejected` | `Escalated` | `Expired`)
- `assigned_to` (FK → users.id — the analyst or manager responsible)
- `created_at`
- `decided_at` (nullable)
- `decided_by` (FK → users.id, nullable)
- `approver_note` (nullable)
- `escalation_history` (JSONB array of escalation records)
- `expires_at`

### `action_log`
Every action executed by the Action Execution Service.
- `id` (UUID, PK)
- `approval_queue_id` (FK → approval_queue.id)
- `action_type`
- `target_description` (human-readable — "user john@company.com", "Slack channel #security")
- `executed_at`
- `outcome` (`Success` | `Failed`)
- `error_detail` (nullable)

### `audit_log`
Append-only. Never updated, never deleted.
- `id` (UUID, PK)
- `event_type` (e.g. `event_received`, `model_scored`, `agent_invoked`, `approval_created`, `human_approved`, `action_executed`, `user_logged_in`, `config_changed`)
- `actor_id` (FK → users.id or device.id, nullable for system events)
- `resource_type` and `resource_id` (what the event is about)
- `detail` (JSONB)
- `created_at`
- `content_hash` (SHA-256 hash of this record's content)
- `previous_hash` (the `content_hash` of the previous audit_log record — creates the tamper-evident chain)

### `models`
- `id` (UUID, PK)
- `model_type` (always `isolation_forest` in V1)
- `trained_at`
- `training_data_start`, `training_data_end`
- `training_sample_count`
- `performance_metrics` (JSONB — contamination rate, anomaly detection rate on holdout set)
- `is_active` (boolean — only one model is active at a time)
- `model_artifact_path`

### `configuration`
- `key` (unique string)
- `value` (JSONB)
- `value_type` (`string` | `integer` | `float` | `boolean` | `json`)
- `description`
- `is_sensitive` (boolean — sensitive values are encrypted at rest)
- `updated_at`
- `updated_by` (FK → users.id)

***

## ML Feature Engineering

The ML model's quality depends entirely on what features you extract from browser events. These are the features your feature extraction pipeline produces from a rolling 15-minute window of events per user.

| Feature | Description |
|---|---|
| `session_active_minutes` | Total minutes with active tab focus in the window |
| `unique_domains_visited` | Count of distinct domains |
| `tab_switch_rate` | Tab switches per minute |
| `new_domain_rate` | First-ever visits to domains in the window as a fraction of total |
| `off_hours_flag` | Binary — is this outside the user's configured working hours |
| `download_count` | Number of download events |
| `executable_download_flag` | Binary — was any downloaded file an executable |
| `session_start_hour` | Hour of day (0–23) of the session start |
| `browsing_category_entropy` | Shannon entropy over domain categories — high entropy means scattered, unfocused browsing |
| `productive_domain_fraction` | Fraction of time on domains classified as productive |
| `distraction_domain_fraction` | Fraction of time on domains classified as distraction |
| `rapid_navigation_bursts` | Count of windows where >5 navigations occur in <60 seconds |
| `extension_change_flag` | Binary — was a new extension installed or removed in this window |
| `domain_category_shift` | How different this window's domain mix is from the user's 7-day average |

The domain category classifier (productive / communication / distraction / sensitive / unknown) is a simple lookup table for known domains seeded from a curated list, augmented by a lightweight TF-IDF classifier trained on domain names for unknown domains.  This is not the primary ML model — it is a feature preprocessing step. [academia](https://www.academia.edu/143724120/Sec2vec_Anomaly_Detection_in_HTTP_Traffic_and_Malicious_URLs)

***

## AI Agent Prompt Design

The prompts for both agents are version-controlled template files. The structure below is what each prompt must contain — the exact wording you will refine in development.

### Security Intelligence Agent Prompt Structure

```
SYSTEM CONTEXT
You are a security analysis AI for CurbAI. You receive a browser activity event that 
has been flagged as anomalous by a machine learning model. Your job is to reason about 
whether this is a genuine security risk, an insider threat indicator, or a false positive, 
and to recommend an action.

EVENT DETAILS
{event_data}

ANOMALY EXPLANATION
The ML model flagged this event with a risk score of {risk_score}/100.
The following features contributed most to this score:
{feature_contributions}

USER CONTEXT
User: {user_display_name}, {user_department}
Manager: {manager_name}
Account status: {account_status}
Recent activity summary (past 7 days): {recent_activity_summary}
Behavioral baseline deviation: {baseline_deviation_description}

ORGANIZATIONAL POLICY
{org_policy_text}

OUTPUT FORMAT
Respond with a JSON object only. No text outside the JSON object.
{
  "severity": "low|medium|high|critical",
  "reasoning": "A paragraph of plain English reasoning that a non-technical manager can understand.",
  "recommended_action": "SendEmailNotification|SendSlackNotification|SendTeamsNotification|ShowBrowserWarning|FlagSession|GenerateIncidentReport",
  "confidence": 0.0 to 1.0,
  "human_explanation": "A single sentence summarizing the situation and recommendation for the approval card."
}
```

### Productivity Intelligence Agent Prompt Structure

The productivity agent operates on aggregate data, not single events. Its prompt includes a summary of the user's or team's browsing pattern over the past two weeks, the configured productivity benchmarks, and a description of any notable pattern deviations. It produces a recommendation (not an alert) with a manager-facing explanation.

***

## Action Types in V1

These are the only actions the Action Execution Service executes in V1. Nothing else.

**`SendEmailNotification`** — Calls the Notification Service with recipient, subject, and body pre-populated from the agent decision. Used for medium and high severity events.

**`SendSlackNotification`** — Calls the Notification Service with the Slack webhook URL and a structured message block containing the event summary, severity indicator, and a link to the approval record in the dashboard.

**`SendTeamsNotification`** — Same as Slack, using the Teams webhook URL and Teams-compatible message card format.

**`ShowBrowserWarning`** — Looks up the target device's WebSocket connection in the Redis registry. If the device is online, sends a `SHOW_WARNING` command through the Ingestion Service's WebSocket channel. The extension renders the warning overlay on the user's active tab. If the device is offline, falls back to email notification.

**`FlagSession`** — Sends a `FLAG_SESSION` command to the extension. All subsequent events from the device are tagged with a heightened monitoring flag, which lowers the ML scoring threshold for that device from 40 to 20 for the next 4 hours.

**`GenerateIncidentReport`** — Calls the Report Service with the relevant IDs. The generated PDF link appears on the event detail page in the dashboard. Also triggers an email to the administrator with the PDF attached.

***

## Phase-by-Phase Build Plan

### Phase 1: Foundation (4–6 weeks)
**Goal: Data flowing from browser to dashboard.**

Build the PostgreSQL schema for `users`, `devices`, `events`, and `audit_log`. Build the Ingestion Service — the FastAPI application that receives event batches, validates, normalizes, and writes to PostgreSQL and RabbitMQ. Also build the WebSocket endpoint in the Ingestion Service and the Redis connection registry.

Build the Chrome extension with a functional Service Worker, content script, popup, and options page. Implement tab navigation events and session timing events. Implement `chrome.alarms`-based 30-second flush cycle. Implement local buffering in `chrome.storage.local`. Implement device registration against the Ingestion Service.

Build the API Gateway Service with OAuth2 authentication (Google OAuth or Azure AD), JWT session management, and the three roles. Build the minimal React dashboard — a live event feed showing incoming events from the API Gateway, a user list, a device management page, and a basic configuration page. Configure Docker Compose with containers for all services.

**Phase 1 Milestone:** Install the extension in Chrome, open a few websites, log in to the dashboard, and watch the navigation events appear in real time. The entire data pipeline works end to end.

### Phase 2: Detection (3–4 weeks)
**Goal: Risk scores appear alongside events.**

Build the ML Detection Service as a Celery worker that consumes from RabbitMQ's `events.raw` queue. Implement the feature extraction pipeline from raw events to the feature vector described in the ML Feature Engineering section. Write the synthetic data generation script — a Python script that produces 30 days of realistic browser activity for 50 simulated users with varying behavioral patterns. Train the initial Isolation Forest model on this synthetic data. Implement the feature contribution explanation using scikit-learn's Isolation Forest `decision_function` and feature importances. Write scored events to `scored_events` and publish above-threshold events to `events.scored`.

Build the Model Training Service as a Celery Beat task.

Extend the dashboard to show risk scores alongside events — color-coded by severity (green for low, yellow for medium, orange for high, red for critical). Add a 7-day risk score trend chart using Recharts. Add the ability to click an event to see its full scoring explanation — which features contributed, what the user's baseline is, and how this event deviates.

**Phase 2 Milestone:** A simulated off-hours login to a new domain scores visibly higher than a normal daytime visit to a familiar site. The explanation panel shows which features drove the score. You can point to this screen in a demo and explain why the score is what it is.

### Phase 3: Intelligence (4–5 weeks)
**Goal: AI-generated decision packages appear in an approval queue.**

Build the Intelligence Service. Implement the Security Intelligence Agent that consumes `events.scored` events above threshold 55. Implement prompt construction with all the context fields described in the Prompt Design section. Implement LLM API calls with error handling for API failures, rate limits, and malformed JSON responses. Implement reasoning trace storage. Implement decision package writing to `agent_decisions`. Implement `approval_queue` record creation. Implement the Notification Service call to alert the assigned analyst.

Build the Productivity Intelligence Agent as a Celery Beat task.

Build the Notification Service with email, Slack, and Teams delivery and retry logic.

Build the Approval Queue UI in the dashboard. This is the most important UI element in the entire system. Each card shows the event summary, the agent's reasoning in plain English, the recommended action with a clear description of what it will do, the confidence percentage, the user's name and department, and a "View Full Details" link. The Approve button is prominent. The Reject button requires a note before it can be submitted. Add the auto-escalation logic — a Celery Beat task running every minute escalates any Critical pending record that has been sitting for more than 15 minutes and notifies the next authority level.

**Phase 3 Milestone:** A simulated high-risk browsing pattern — rapid navigation through unusual domains at 2am — produces an agent reasoning paragraph that appears in the approval queue within a minute. A human reads it, understands it without technical knowledge, and approves or rejects it. The note field works. Escalation fires after 15 minutes of inactivity on a critical record.

### Phase 4: Action (2–3 weeks)
**Goal: Approved decisions do something real.**

Build the Action Execution Service. Implement all five V1 action types. For `ShowBrowserWarning` and `FlagSession`, implement the Redis connection lookup and the WebSocket command dispatch through the Ingestion Service. For `GenerateIncidentReport`, build the Report Service with Jinja2 + WeasyPrint PDF generation.

The incident report PDF must include: an executive summary paragraph, the event timeline (all events from the session with timestamps), the ML model's scoring explanation, the agent's full reasoning, the human decision with the approver's note, the action taken and its outcome, and a recommendations section generated by the agent.

Implement the weekly summary report as a Celery Beat task.

**Phase 4 Milestone:** Run the complete loop end to end. A high-risk browsing pattern arrives, gets scored, triggers the agent, appears in the approval queue, gets approved, the browser warning appears as an overlay on the monitored user's screen, the incident report is generated, and the email notification arrives. This is the complete V1 product loop.

### Phase 5: Polish and Hardening (3–4 weeks)
**Goal: Something you can put in front of a paying customer.**

Build the complete audit log with hash chaining. Add an Audit Trail page in the dashboard where administrators can view the log and verify its integrity by triggering a hash chain recomputation. Any broken link in the chain is highlighted.

Build the full Configuration page — risk score thresholds for ML and agent triggering, auto-escalation timeouts, working hours per timezone for anomaly detection, notification channel setup (SMTP settings, Slack/Teams webhook URLs), domain category customization (adding company-specific productive domains), and integration health status (when did the last model training run, how many devices are active).

Build the User Management page — add dashboard users, assign roles, configure which org units each Manager can see. Role-based access control enforced at the API Gateway — Managers see only their direct and indirect reports, Analysts cannot approve Admin-level actions.

Build the Reports section — list of all generated reports, searchable and filterable, each downloadable as a PDF.

Add rate limiting to the Ingestion Service — a device cannot POST more than 1,000 events per minute. A device exceeding this threshold is flagged and its events are queued, not dropped.

Add input validation and sanitization throughout the API Gateway. Parameterized queries everywhere. This system processes security data — it must itself be secure.

Write the deployment documentation and the IT administrator onboarding guide. These are not optional deliverables.

***

## Security Requirements

**All traffic is encrypted.** HTTPS between the extension and the Ingestion Service, HTTPS between the browser dashboard and the API Gateway, self-signed TLS for internal container-to-container traffic on the Docker network.

**No passwords stored.** Dashboard authentication delegates to the customer's identity provider via OAuth2 or SAML. If a customer has no identity provider, local authentication uses bcrypt with a cost factor of 12 minimum.

**JWT session tokens** have a maximum 8-hour lifetime and are invalidated on logout. The JWT secret is a randomly generated 256-bit value unique to each deployment, injected as an environment variable.

**Device API keys** are 256-bit random values. Only the bcrypt hash is stored. The raw key is shown once at registration and never retrievable after that. Keys are revocable from the dashboard.

**All sensitive configuration** (database passwords, LLM API keys, LDAP credentials, SMTP passwords, webhook URLs) is stored as environment variables injected at container startup. Nothing sensitive goes in code or version control.

**The PostgreSQL database** is not exposed outside the Docker network. Only the API Gateway queries it directly.

**The extension's locally stored API key** is encrypted using the Web Crypto API's `SubtleCrypto.encrypt` with AES-GCM before being written to `chrome.storage.local`.

**SQL injection protection:** parameterized queries exclusively throughout all services. No string concatenation in database queries.

**The audit log is append-only.** No service has `UPDATE` or `DELETE` permission on the `audit_log` table — only `INSERT`. The database user for each service is granted only the minimum permissions it needs.

***

## Testing Strategy

Three levels of tests per service, same as the original spec, adapted for this architecture.

**Unit tests** cover individual functions — event normalization in the Ingestion Service, feature extraction in the ML Detection Service, prompt construction in the Intelligence Service, action routing in the Action Execution Service, WebSocket command dispatch logic. Run on every push.

**Integration tests** cover service-to-dependency interactions — the Ingestion Service writing to PostgreSQL and publishing to RabbitMQ, the ML Detection Service consuming from RabbitMQ, the Action Execution Service sending commands through the WebSocket registry. Use Dockerized test instances of PostgreSQL and RabbitMQ. Run on every pull request before merge.

**Extension tests** use Playwright with the Chrome extension loaded in a test browser. Simulate tab navigation events, verify that the Service Worker fires the correct events, verify buffer flush behavior, verify overlay rendering when a `SHOW_WARNING` command is received.

**End-to-end tests** use a fully deployed Docker Compose environment. They simulate a sequence of browser events, confirm the event appears in the dashboard, confirm scoring, confirm agent decision creation, confirm the approval queue entry, simulate an approval, and confirm action execution. Run before every deployment.

**Coverage target: 70% line coverage.** Applied thoughtfully to critical paths, not spread uniformly to reach an arbitrary number.

***

## Build Team Structure

**Backend Developer** — Ingestion Service, ML Detection Service, Model Training Service, Intelligence Service, Action Execution Service, Notification Service, Report Service, API Gateway, database schema, RabbitMQ integration, Celery tasks. Needs strong Python, comfort with async patterns, and basic ML familiarity.

**AI/ML Developer** — Feature engineering pipeline, Isolation Forest model implementation, synthetic data generation script, prompt engineering for both agents, LLM integration, reasoning trace handling. Also assists the backend developer with the Intelligence Service implementation. Needs Python, scikit-learn, and LLM API experience.

**Frontend + Extension Developer** — The React dashboard (all views, approval workflow UI, charts, real-time event feed) and the Chrome extension (Service Worker, content script, popup, options page, WebSocket command handling). Needs React, Tailwind, Recharts, and JavaScript proficiency including the Chrome Extensions API.

With a fourth person, they own DevOps (Docker Compose, CI/CD pipeline, deployment scripts), writing tests, and the extension's Playwright test suite.

***

## Timeline

| Phase | Duration | Output |
|---|---|---|
| Phase 1: Foundation | 4–6 weeks | Working data pipeline with live event feed in dashboard |
| Phase 2: Detection | 3–4 weeks | ML-scored events with explanations in dashboard |
| Phase 3: Intelligence | 4–5 weeks | AI agent decisions in approval queue with notifications |
| Phase 4: Action | 2–3 weeks | Complete detect-to-act loop including browser overlay |
| Phase 5: Polish | 3–4 weeks | Production-ready deployable system |
| **Total (3 devs)** | **~4–5 months** | **V1 ready for first customer** |
| **Total (4 devs)** | **~3–4 months** | **V1 ready for first customer** |

***

## What You Are Building vs. The Desktop Version

To close the loop on your original question: the browser system is the right call for V1.  You remove roughly 3–4 weeks of work by eliminating the MSI installer, Windows Service management, Windows Event Log parsing, and OS-level permission handling. The backend is identical — all seven services, the database schema, the ML pipeline, the AI agents, and the approval workflow are unchanged. The only replacement is the endpoint agent becoming a Chrome extension, and the `LockUserAccount` action becoming `ShowBrowserWarning` and `FlagSession`. Everything else in the original CurbAI specification transfers directly to this architecture. [rrr](https://rrr.dev/blog/browser-extension-vs-os-agent.html)