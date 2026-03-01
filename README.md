# CurbAI Browser Edition — V1

> Browser-based behavioral intelligence platform. Monitors user browser activity through a Chrome extension, scores it via ML, routes high-risk patterns to an AI agent, and presents decisions to humans for approval.

## Architecture

| Layer | Component | Technology |
|-------|-----------|------------|
| **Data Collection** | Chrome Extension (Manifest V3) | JavaScript, Service Worker |
| **Processing Pipeline** | 7 Backend Microservices | Python 3.11, FastAPI |
| **Intelligence** | AI Agents (Security + Productivity) | LangGraph, Groq API (Llama 3.3 70B) |
| **Presentation** | Web Dashboard | React 18, Tailwind CSS |
| **Infrastructure** | Containers | Docker Compose, PostgreSQL, Redis, RabbitMQ |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/ArjunBora/curb-v1.git
cd curb-v1

# 2. Configure environment
cp .env.example .env
# Edit .env — add your GROQ_API_KEY from console.groq.com

# 3. Start all services
make dev

# 4. Load the Chrome extension
# Chrome → chrome://extensions → Developer Mode → Load Unpacked → select extension/
```

## Repository Structure

```
curb-v1/
├── backend/              # Python microservices
│   ├── ingestion_service/    # Event intake + WebSocket
│   ├── intelligence_service/ # AI agents (LangGraph)
│   ├── ml_detection_service/ # Isolation Forest scoring
│   └── shared/               # DB models, Redis, RabbitMQ clients
├── extension/            # Chrome Manifest V3 extension
├── dashboard/            # React web dashboard
├── ml/                   # ML notebooks + model artifacts
├── infra/                # Docker Compose + Nginx
├── scripts/              # Setup and utility scripts
└── tests/                # Unit, integration, E2E tests
```

## License

Proprietary — AMD Slingshot Hackathon 2026
