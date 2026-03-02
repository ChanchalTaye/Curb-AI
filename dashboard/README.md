# CurbAI: Enterprise AI Security & Productivity Platform

CurbAI is an enterprise-grade operating system designed to unify cybersecurity monitoring, productivity intelligence, and autonomous AI agents. Built with a modern, scalable architecture, it captures high-fidelity browser and system events, processes them through an intelligent backend, and visualizes insights in a stunning 3D Next.js dashboard.

[![CurbAI Dashboard](/dashboard/public/curbai-logo.png)](https://github.com/ChanchalTaye/Curb-AI)

## 🌟 Key Features

### 1. High-Fidelity Data Ingestion (Chrome Extension)
A custom Manifest V3 Chrome Extension that stealthily monitors and records deep user activity:
- **Navigation tracking:** Page loads, domain tracking, URL transitions.
- **Engagement tracking:** Scroll depth, active time, tab switching.
- **Security monitoring:** Executable downloads, sensitive site access.
- **Reliable Networking:** Robust offline buffering, self-healing alarm synchronization, and auto-registration to the Next.js/Python backend.

### 2. Scalable Ingestion Service (Python + FastAPI)
A high-throughput event receiver designed for massive concurrent loads:
- **FastAPI Backend:** Handles incoming data streams asynchronously.
- **PostgreSQL Database:** Persistent storage of normalized events with optimized schemas.
- **RabbitMQ Message Broker:** Decouples ingestion from heavy Machine Learning analysis.

### 3. Intelligence Service (AI & LLMs)
An autonomous agent system powered by Groq and LLaMA:
- **Productivity Scoring:** Analyzes behavior vectors to determine workflow efficiency.
- **Threat Detection:** Maps browsing patterns to potential insider threats or compromised sessions.
- **Websockets:** Streams real-time AI reasoning traces directly to the dashboard.

### 4. 3D Insight Dashboard (Next.js 14)
A premium, glass-morphism dashboard visually optimized for enterprise security operation centers (SOC):
- **Live Event Feed:** Real-time stream of all activity across the organization via `http://localhost:3000/events`.
- **Interactive Data:** Beautiful framer-motion animations, Three.js backgrounds, and dynamic configuration tools.

---

## 🏗️ Architecture Stack

1. **Frontend/Dashboard:** Next.js 14, React, Tailwind CSS, Framer Motion, Three.js.
2. **Backend Services:** Python 3.11, FastAPI, SQLAlchemy, Asyncpg.
3. **Message Broker:** RabbitMQ.
4. **Database & Cache:** PostgreSQL, Redis.
5. **AI Core:** LangChain, Groq API (LLaMA 3).
6. **Client:** Custom Chrome Extension (HTML/JS/CSS).

---

## 🚀 Getting Started

### 1. Start the Infrastructure (Docker)
The entire backend suite runs autonomously via Docker Compose:
```bash
# Start PostgreSQL, Redis, RabbitMQ, and the Ingestion Service
docker compose -f infra/docker-compose.yml up -d
```
*The Ingestion API will be available at `http://localhost:8001`.*

### 2. Start the Dashboard (Next.js)
```bash
cd dashboard
npm install
npm run dev
```
*The Dashboard will be live at `http://localhost:3000`.*

### 3. Install the Chrome Extension
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (toggle in the top right).
3. Click **Load unpacked**.
4. Select the `extension/` folder in this repository.
5. Click **Options** on the extension to verify it is connected to `http://localhost:8001`.

---

## 📂 Repository Structure

```text
├── backend/
│   ├── ingestion_service/   # FastAPI server receiving Chrome telemetry
│   ├── intelligence_service/# AI agent utilizing Groq for event analysis
│   └── shared/              # SQLAlchemy models and RabbitMQ clients
├── dashboard/               # Next.js 14 3D UI (Public Landing + Live Events)
├── extension/               # Manifest V3 Chrome Extension source code
├── infra/                   # Docker Compose, Init scripts, Prometheus configs
├── ml/                      # Machine Learning Jupyter Notebooks and Datasets
└── scripts/                 # System simulation and testing helpers
```

---

## 🤝 Contributing
Built during the AMD Slingshot Hackathon.
For dashboard UI improvements, please check the dedicated UI submodule: [ChanchalTaye/Curb-AI](https://github.com/ChanchalTaye/Curb-AI).
