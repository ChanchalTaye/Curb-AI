# Project Plan: AI Agent Extension (CurbAI V1)

## Overview
Build the V1 core of CurbAI Browser Edition, focusing first on the Backend Foundation (Ingestion Service, API Gateway, Shared components) and the foundational Chrome Extension structure in a Monorepo. The AI Intelligence Service will use Groq API with LLaMA 3.3 70B as the underlying LLM provider.

## Project Type
FULL STACK (BACKEND + BROWSER EXTENSION)

## Success Criteria
- Monorepo structure is fully initialized as per specification.
- Shared backend components (DB models, Redis, RabbitMQ connections) are established.
- Ingestion Service can accept POST requests and maintain a WebSocket connection.
- A basic Chrome Extension (Service Worker) can connect to the Ingestion Service via WebSocket.
- Groq API is integrated at the environment level.

## Tech Stack
- **Backend:** Python 3.11, FastAPI, PostgreSQL 15, Redis, RabbitMQ
- **Extension:** JavaScript (ES2022), Chrome Manifest V3
- **AI/LLM:** Groq API (Llama 3.3 70B) via LangChain/LangGraph
- **Infra:** Docker Compose (local dev), Nginx

## File Structure
A single monorepo (`curb-v1`), encompassing:
- `backend/` (Microservices for ingestion, ML, agents, API gateway)
- `shared/` (Core DB schemas, Redis clients - injected into containers)
- `extension/` (Manifest V3, Service worker, Content scripts)
- `dashboard/` (React SPA)
- `ml/` (Data science & model training)
- `infra/` (Docker-compose definitions)

## Task Breakdown

### TASK 1: Initialize Monorepo and Shared Infrastructure
- **Agent:** `database-architect` (with `devops-engineer`)
- **Skills:** `database-design`, `bash-linux`, `clean-code`
- **Priority:** P0
- **Dependencies:** None
- **INPUT → OUTPUT → VERIFY:**
  - *Input:* Monorepo schema.
  - *Output:* Folder structure created, `shared/` python package implemented with SQLAlchemy models, Redis client, RabbitMQ client. Docker Compose initialized.
  - *Verify:* `python -c "import shared.database"` executes without errors.

### TASK 2: Build Ingestion Service (Backend Foundation)
- **Agent:** `backend-specialist`
- **Skills:** `api-patterns`, `clean-code`, `python-patterns`
- **Priority:** P1
- **Dependencies:** Task 1
- **INPUT → OUTPUT → VERIFY:**
  - *Input:* Shared models, FastAPI framework.
  - *Output:* `backend/ingestion_service` running with POST `/ingest/events` and WebSocket `/ws/agent/{device_id}` endpoints.
  - *Verify:* Can connect to WS endpoint using test client.

### TASK 3: Setup Extension Foundation
- **Agent:** `frontend-specialist` (or native JS developer logic)
- **Skills:** `frontend-design`, `clean-code`
- **Priority:** P1
- **Dependencies:** Task 2
- **INPUT → OUTPUT → VERIFY:**
  - *Input:* Ingestion Service WS endpoint definition.
  - *Output:* `extension/` directory with `manifest.json`, `background.js` (Service Worker) that connects to backend WebSocket.
  - *Verify:* Extension loads in Chrome without errors, connects to backend WS, responds to PING/PONG.

### TASK 4: Initialize Intelligence Service Skeleton (Groq integration)
- **Agent:** `backend-specialist`
- **Skills:** `python-patterns`, `clean-code`
- **Priority:** P2
- **Dependencies:** Task 1
- **INPUT → OUTPUT → VERIFY:**
  - *Input:* User's choice of Groq API & Llama 3.3 70B.
  - *Output:* `backend/intelligence_service` skeleton with `llm_client.py` abstracting the Groq API call, using `.env` keys.
  - *Verify:* Unit test calling Groq client mock returns expected response format.

## Phase X: Verification
- [ ] Lint: Check Python backend (e.g. `flake8` or `ruff`) and extension (`eslint`).
- [ ] Security: Run `security_scan.py` to ensure no exposed Groq keys or hardcoded secrets.
- [ ] Build: Docker Compose builds successfully for internal network components.
- [ ] Integration: Extension connects to backend end-to-end.
