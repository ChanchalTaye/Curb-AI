# Product Requirements Document: AI Agent Integration in CurbAI Browser Extension

***

## Document Purpose

This PRD defines how the AI agent system integrates with the Chrome extension, how the two components communicate, what open-source resources to use, and the step-by-step implementation path using entirely free and open-source tools.

***

## Architecture Overview: Agent-Extension Integration

The AI agent does **not run inside the browser extension**. The extension is pure JavaScript and runs in a sandboxed environment with limited compute resources. The AI agents (Security Intelligence Agent and Productivity Intelligence Agent) run in the **Intelligence Service** on your backend — a Python FastAPI service with access to PostgreSQL, Redis, and the LLM API.

The extension's role in the agent system is twofold:
1. **Data provider** — The extension collects browser events and ships them to the backend, where the ML Detection Service scores them and the Intelligence Service reasons about high-risk patterns.
2. **Action executor** — When a human approves an agent's recommended action, the Action Execution Service sends a command back to the extension via WebSocket, and the extension executes it (warning overlay, session flag, acknowledgement prompt).

The integration point is a **persistent WebSocket connection** between the extension's Service Worker and the backend's Ingestion Service. [developer.chrome](https://developer.chrome.com/docs/extensions/how-to/web-platform/websockets)

***

## Component Breakdown

### Backend: Intelligence Service (Python + FastAPI)

**Technology stack:**
- **LangGraph** (open-source agent orchestration framework by LangChain) [langchain](https://www.langchain.com/langgraph)
- **Ollama** (local LLM runtime for privacy-sensitive deployments) or **OpenAI API** (for cloud-based deployments) [linkedin](https://www.linkedin.com/posts/shubhamsingh1208_ai-ollama-fastapi-activity-7383905274949980160-QZMm)
- **LangChain Python SDK** (for prompt management, memory, and tool integration) [langchain](https://www.langchain.com/langchain)
- **FastAPI** (async API framework for agent invocation endpoints)
- **Redis** (agent state persistence and conversation memory) [redis](https://redis.io/blog/langgraph-redis-build-smarter-ai-agents-with-memory-persistence/)

**What it owns:**
- Security Intelligence Agent logic
- Productivity Intelligence Agent logic
- Prompt template management
- LLM API calls and response parsing
- Reasoning trace storage
- Decision package generation
- Agent memory and state persistence across invocations

### Extension: Service Worker (JavaScript + Chrome APIs)

**Technology stack:**
- **Native WebSocket API** (no external dependencies needed) [developer.chrome](https://developer.chrome.com/docs/extensions/how-to/web-platform/websockets)
- **Chrome Extension Manifest V3**
- **chrome.runtime.sendMessage** for internal communication between Service Worker and content scripts [stackoverflow](https://stackoverflow.com/questions/8779667/one-websocket-connection-for-all-content-scripts-in-a-chrome-extension)

**What it owns:**
- WebSocket connection lifecycle management
- Receiving commands from the backend
- Routing commands to content scripts
- Executing browser-side actions (overlay display, notification prompts)
- Connection heartbeat and reconnection logic

***

## Open-Source Technology Stack (Complete)

Every component below is free, open-source, and production-ready.

| Component | Technology | Purpose | License |
|---|---|---|---|
| **Agent Framework** | LangGraph 0.2+ | Agent orchestration, state management, node-based workflows | MIT |
| **LLM Abstraction** | LangChain Python | Prompt templates, memory, LLM provider abstraction | MIT |
| **Local LLM Runtime** | Ollama | Run Llama 3.3, Qwen 2.5, Mistral locally for privacy-focused deployments  [github](https://github.com/nanobrowser/nanobrowser/) | MIT |
| **Cloud LLM Alternative** | OpenAI API | GPT-4o for cloud deployments via Azure OpenAI | Proprietary API |
| **Agent Memory Store** | Redis + LangGraph Checkpointer | Persistent agent state, conversation memory  [redis](https://redis.io/blog/langgraph-redis-build-smarter-ai-agents-with-memory-persistence/) | BSD 3-Clause |
| **Backend Framework** | FastAPI | Async API endpoints for agent invocation | MIT |
| **WebSocket Library** | Python `websockets` | WebSocket server in Ingestion Service | BSD 3-Clause |
| **Extension Communication** | Native WebSocket API | Browser-side WebSocket client  [developer.chrome](https://developer.chrome.com/docs/extensions/how-to/web-platform/websockets) | Web Standard |

***

## Agent Architecture Using LangGraph

LangGraph is the right choice for CurbAI because it provides **human-in-the-loop workflows**, **persistent state management**, and **node-based agent logic** — all of which you need. [aankitroy](https://aankitroy.com/blog/langgraph-state-management-memory-guide)

### Security Intelligence Agent Graph

The Security Intelligence Agent is modeled as a **state graph** with the following nodes:

```
┌──────────────────┐
│  Event Received  │
│  (Entry Point)   │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  Fetch Context   │ ← Query PostgreSQL for user history
│                  │   Query Redis for behavioral baseline
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  Construct       │ ← Build prompt with event + context
│  Prompt          │   Use versioned template from file
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  Call LLM        │ ← Invoke Ollama or OpenAI API
│                  │   Parse JSON response
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  Validate        │ ← Check response schema
│  Response        │   Retry if malformed
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  Store Decision  │ ← Write to agent_decisions table
│  Package         │   Write reasoning trace
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  Create Approval │ ← Insert into approval_queue
│  Queue Entry     │   Notify assigned analyst
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  Wait for Human  │ ← LangGraph "interrupt" node
│  Decision        │   Execution pauses here
└────────┬─────────┘
         │
         v
    (approved)
         │
         v
┌──────────────────┐
│  Route to Action │ ← Hand off to Action Execution Service
│  Executor        │
└──────────────────┘
```

**Key LangGraph features used:**
- **StateGraph** — defines the workflow
- **interrupt_before** — pauses execution at the "Wait for Human Decision" node [langchain](https://www.langchain.com/langgraph)
- **Checkpointer** — persists the agent state to Redis so the workflow can resume after human approval [aankitroy](https://aankitroy.com/blog/langgraph-state-management-memory-guide)

### Productivity Intelligence Agent Graph

Simpler than the security agent. Triggered on a schedule, not by individual events.

```
┌──────────────────┐
│  Scheduled       │
│  Trigger         │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  Aggregate User  │ ← Query 2 weeks of events per user
│  Metrics         │   Compute productivity features
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  Classify        │ ← Rule-based: healthy/overloaded/
│  Productivity    │   disengaged/distracted
│  State           │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  Construct       │ ← Build productivity prompt
│  Prompt          │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  Call LLM        │ ← Generate recommendation
│                  │
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  Store           │ ← Write recommendation to
│  Recommendation  │   agent_decisions (type: Recommendation)
└────────┬─────────┘
         │
         v
┌──────────────────┐
│  Notify Manager  │ ← Call Notification Service
│                  │
└──────────────────┘
```

***

## LLM Integration: Ollama vs OpenAI

You support **two LLM backends** via a thin abstraction layer. The customer chooses based on privacy requirements and budget.

### Option 1: Ollama (Local, Private, Free)

**Why use Ollama:**
- Zero API costs [linkedin](https://www.linkedin.com/posts/shubhamsingh1208_ai-ollama-fastapi-activity-7383905274949980160-QZMm)
- Complete data privacy — nothing leaves the customers infrastructure
- Ideal for government, healthcare, or highly regulated industries
- Runs on CPU or GPU

**Setup:**
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull a model
ollama pull qwen2.5:14b  # Recommended for reasoning tasks
ollama pull llama3.3:8b  # Faster, lighter alternative
```

**Integration in Intelligence Service:**
```python
from langchain_community.llms import Ollama

# In your Intelligence Service config
llm = Ollama(
    model="qwen2.5:14b",
    base_url="http://localhost:11434",  # Ollama default endpoint
    temperature=0.1,  # Low temp for consistent security reasoning
    num_ctx=8192  # Context window
)
```

**Recommended models for CurbAI:** [github](https://github.com/nanobrowser/nanobrowser/)
- **Qwen 2.5 14B** — Best reasoning quality for security analysis
- **Llama 3.3 8B** — Faster, lower memory, good for productivity agent
- **Mistral Small 24B** — High quality but requires more VRAM

### Option 2: OpenAI API (Cloud, Paid, Higher Quality)

**Why use OpenAI:**
- GPT-4o has superior reasoning quality compared to most local models
- Azure OpenAI provides data residency compliance for enterprise
- No infrastructure overhead

**Integration in Intelligence Service:**
```python
from langchain_openai import ChatOpenAI

# In your Intelligence Service config
llm = ChatOpenAI(
    model="gpt-4o",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.1,
    max_tokens=1500
)
```

**Abstraction layer pattern:**
```python
# config.py
def get_llm_client(provider: str):
    if provider == "ollama":
        return Ollama(model=os.getenv("OLLAMA_MODEL", "qwen2.5:14b"))
    elif provider == "openai":
        return ChatOpenAI(model="gpt-4o", api_key=os.getenv("OPENAI_API_KEY"))
    else:
        raise ValueError(f"Unknown LLM provider: {provider}")

# intelligence_service.py
llm = get_llm_client(os.getenv("LLM_PROVIDER", "ollama"))
```

This way, the customer sets `LLM_PROVIDER=ollama` or `LLM_PROVIDER=openai` in their environment, and the rest of the code is identical.

***

## WebSocket Communication: Extension ↔ Backend

### Backend: Ingestion Service WebSocket Endpoint

**Implementation using FastAPI:**
```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import redis
import json

app = FastAPI()
redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)

@app.websocket("/ws/agent/{device_id}")
async def agent_websocket(websocket: WebSocket, device_id: str):
    await websocket.accept()
    
    # Register connection in Redis
    redis_client.set(f"ws:device:{device_id}", "connected", ex=3600)
    
    try:
        while True:
            # Keep connection alive, receive pings from extension
            message = await websocket.receive_text()
            data = json.loads(message)
            
            if data.get("type") == "PING":
                await websocket.send_text(json.dumps({"type": "PONG"}))
            
            # Check for commands to send to this device
            command_key = f"command:device:{device_id}"
            command = redis_client.get(command_key)
            if command:
                await websocket.send_text(command)
                redis_client.delete(command_key)  # Command sent, remove from queue
                
    except WebSocketDisconnect:
        redis_client.delete(f"ws:device:{device_id}")
```

**How Action Execution Service sends commands:**
```python
import redis
import json

redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)

def send_command_to_device(device_id: str, command: dict):
    """Push a command to the device's command queue"""
    command_key = f"command:device:{device_id}"
    redis_client.set(command_key, json.dumps(command), ex=300)  # 5 min TTL
    
    # Check if device is connected
    if redis_client.exists(f"ws:device:{device_id}"):
        return {"status": "sent"}
    else:
        return {"status": "device_offline"}
```

### Extension: Service Worker WebSocket Client

**Implementation in background.js (Service Worker):** [dev](https://dev.to/orieasy1/how-to-set-up-websocket-communication-between-a-chrome-extension-and-a-nodejs-server-1ad2)
```javascript
let websocket = null;
let deviceId = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 5000;

// Initialize on extension startup
chrome.runtime.onStartup.addListener(() => {
  initializeWebSocket();
});

chrome.runtime.onInstalled.addListener(() => {
  initializeWebSocket();
});

async function initializeWebSocket() {
  const config = await chrome.storage.local.get(['deviceId', 'backendUrl']);
  deviceId = config.deviceId;
  const backendUrl = config.backendUrl || 'wss://your-backend.com';
  
  connectWebSocket(`${backendUrl}/ws/agent/${deviceId}`);
}

function connectWebSocket(url) {
  websocket = new WebSocket(url);
  
  websocket.onopen = () => {
    console.log('WebSocket connected');
    reconnectAttempts = 0;
    startHeartbeat();
  };
  
  websocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleCommand(data);
  };
  
  websocket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  websocket.onclose = () => {
    console.log('WebSocket closed, attempting reconnect...');
    attemptReconnect(url);
  };
}

function attemptReconnect(url) {
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    reconnectAttempts++;
    setTimeout(() => connectWebSocket(url), RECONNECT_DELAY);
  }
}

// Keep connection alive with periodic pings
function startHeartbeat() {
  chrome.alarms.create('websocket-heartbeat', { periodInMinutes: 0.5 });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'websocket-heartbeat' && websocket?.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify({ type: 'PING' }));
  }
});

// Handle commands from backend
function handleCommand(command) {
  switch (command.type) {
    case 'SHOW_WARNING':
      showWarningOverlay(command.message);
      break;
    case 'FLAG_SESSION':
      flagSession(command.duration);
      break;
    case 'SEND_ACKNOWLEDGEMENT':
      sendAcknowledgementPrompt(command.message);
      break;
    case 'PONG':
      // Heartbeat response, connection is healthy
      break;
  }
}

async function showWarningOverlay(message) {
  // Get active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Send message to content script
  chrome.tabs.sendMessage(tab.id, {
    type: 'SHOW_WARNING',
    message: message
  });
}

async function flagSession(durationMinutes) {
  // Store flag in local storage with expiry
  const expiryTime = Date.now() + (durationMinutes * 60 * 1000);
  await chrome.storage.local.set({ 
    sessionFlagged: true,
    flagExpiry: expiryTime 
  });
}

function sendAcknowledgementPrompt(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon128.png',
    title: 'CurbAI
   Security Alert',
    message: message,
    requireInteraction: true,
    buttons: [{ title: 'I Understand' }]
  });
}
```

**Content script (content.js) — receives commands from Service Worker:**
```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SHOW_WARNING') {
    displayWarningOverlay(request.message);
  }
});

function displayWarningOverlay(message) {
  // Create overlay div
  const overlay = document.createElement('div');
  overlay.id = 'CurbAI
-warning-overlay';
  overlay.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        background: white;
        padding: 32px;
        border-radius: 8px;
        max-width: 500px;
        text-align: center;
      ">
        <h2>Security Alert</h2>
        <p>${message}</p>
        <button id="dismiss-warning" style="
          margin-top: 16px;
          padding: 8px 24px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">I Understand</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  document.getElementById('dismiss-warning').addEventListener('click', () => {
    overlay.remove();
  });
}
```

***

## Agent Implementation: Security Intelligence Agent

### Step 1: Define State Schema (LangGraph)

```python
from typing import TypedDict, Annotated
from langchain_core.messages import BaseMessage
from langgraph.graph import StateGraph

class SecurityAgentState(TypedDict):
    event_id: str
    user_id: str
    risk_score: float
    event_data: dict
    feature_contributions: dict
    user_context: dict
    behavioral_baseline: dict
    messages: Annotated[list[BaseMessage], "conversation history"]
    agent_decision: dict | None
    reasoning_trace: str | None
    approval_status: str | None  # Pending, Approved, Rejected
```

### Step 2: Define Agent Nodes

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_community.llms import Ollama

# Load LLM
llm = Ollama(model="qwen2.5:14b")  # or ChatOpenAI(model="gpt-4o")

# Prompt template (stored in prompts/security_agent.txt)
with open("prompts/security_agent.txt", "r") as f:
    prompt_template = f.read()

def fetch_context_node(state: SecurityAgentState):
    """Fetch user context from PostgreSQL and Redis"""
    # Query user history, baseline, etc.
    user_context = fetch_user_context(state["user_id"])
    baseline = redis_client.hgetall(f"baseline:{state['user_id']}")
    
    return {
        "user_context": user_context,
        "behavioral_baseline": baseline
    }

def construct_prompt_node(state: SecurityAgentState):
    """Build the LLM prompt"""
    prompt = prompt_template.format(
        event_data=state["event_data"],
        risk_score=state["risk_score"],
        feature_contributions=state["feature_contributions"],
        user_context=state["user_context"],
        baseline_deviation=compute_deviation(state)
    )
    
    return {"messages": [{"role": "system", "content": prompt}]}

def call_llm_node(state: SecurityAgentState):
    """Invoke LLM"""
    response = llm.invoke(state["messages"])
    reasoning_trace = response.content
    
    # Parse JSON response
    decision = json.loads(reasoning_trace)
    
    return {
        "reasoning_trace": reasoning_trace,
        "agent_decision": decision
    }

def store_decision_node(state: SecurityAgentState):
    """Write decision to database"""
    decision_id = write_agent_decision(
        event_id=state["event_id"],
        decision=state["agent_decision"],
        reasoning_trace=state["reasoning_trace"]
    )
    
    # Create approval queue entry
    create_approval_queue_entry(decision_id)
    
    return {"approval_status": "Pending"}

def human_approval_node(state: SecurityAgentState):
    """Wait for human decision (interrupt point)"""
    # This node does nothing — LangGraph pauses here
    return state
```

### Step 3: Build the Graph

```python
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

# Initialize graph with checkpointer for persistence
checkpointer = MemorySaver()  # Use RedisCheckpointer in production
workflow = StateGraph(SecurityAgentState)

# Add nodes
workflow.add_node("fetch_context", fetch_context_node)
workflow.add_node("construct_prompt", construct_prompt_node)
workflow.add_node("call_llm", call_llm_node)
workflow.add_node("store_decision", store_decision_node)
workflow.add_node("wait_for_approval", human_approval_node)

# Define edges
workflow.set_entry_point("fetch_context")
workflow.add_edge("fetch_context", "construct_prompt")
workflow.add_edge("construct_prompt", "call_llm")
workflow.add_edge("call_llm", "store_decision")
workflow.add_edge("store_decision", "wait_for_approval")

# Interrupt before human approval
workflow.add_edge("wait_for_approval", END)

# Compile
app = workflow.compile(checkpointer=checkpointer, interrupt_before=["wait_for_approval"])
```

### Step 4: Invoke the Agent

```python
# When a high-risk event arrives
def handle_high_risk_event(event_id: str, risk_score: float, event_data: dict):
    thread_id = f"event-{event_id}"
    
    # Invoke agent
    result = app.invoke({
        "event_id": event_id,
        "user_id": event_data["user_id"],
        "risk_score": risk_score,
        "event_data": event_data,
        "feature_contributions": event_data["feature_contributions"],
        "messages": []
    }, config={"configurable": {"thread_id": thread_id}})
    
    # Agent paused at wait_for_approval node
    # Dashboard shows approval queue entry
```

### Step 5: Resume After Human Approval

```python
# When human approves in dashboard
def resume_after_approval(event_id: str, approved: bool, approver_note: str):
    thread_id = f"event-{event_id}"
    
    # Update state with approval decision
    app.update_state(
        config={"configurable": {"thread_id": thread_id}},
        values={"approval_status": "Approved" if approved else "Rejected"}
    )
    
    # If approved, Action Execution Service takes over
    if approved:
        execute_action(event_id)
```

***

## Agent Memory and State Persistence

Use **LangGraph Redis Checkpointer** for production. [redis](https://redis.io/blog/langgraph-redis-build-smarter-ai-agents-with-memory-persistence/)

```python
from langgraph.checkpoint.redis import RedisSaver

# Replace MemorySaver with RedisSaver
checkpointer = RedisSaver.from_conn_string("redis://redis:6379")

app = workflow.compile(
    checkpointer=checkpointer,
    interrupt_before=["wait_for_approval"]
)
```

**Why this matters:**
- Agent state survives service restarts
- Human approval can happen hours after the agent pauses
- Full conversation history is preserved for audit trail

***

## Implementation Sequence

### Phase 1: Backend Agent Infrastructure (Week 1-2)

1. Install dependencies:
```bash
pip install langgraph langchain langchain-community langchain-openai ollama redis
```

2. Set up Ollama:
```bash
ollama pull qwen2.5:14b
```

3. Build Security Intelligence Agent graph (state schema, nodes, edges)

4. Create prompt template file (`prompts/security_agent.txt`)

5. Implement LLM abstraction layer (Ollama + OpenAI support)

6. Test agent invocation with mock event data

### Phase 2: WebSocket Infrastructure (Week 2-3)

1. Add WebSocket endpoint to Ingestion Service (`/ws/agent/{device_id}`)

2. Implement Redis connection registry

3. Build Service Worker WebSocket client in extension

4. Test bidirectional communication with ping/pong

5. Implement reconnection logic

### Phase 3: Command Execution (Week 3-4)

1. Implement `SHOW_WARNING` command handler in content script

2. Implement `FLAG_SESSION` command handler in Service Worker

3. Implement `SEND_ACKNOWLEDGEMENT` notification in extension

4. Build Action Execution Service command dispatch logic

5. End-to-end test: high-risk event → agent decision → approval → warning overlay appears

### Phase 4: Productivity Agent (Week 4-5)

1. Build Productivity Intelligence Agent graph (simpler, no interrupt node)

2. Implement scheduled Celery task (every 4 hours)

3. Implement productivity metrics aggregation

4. Test recommendation flow

***

## Cost and Resource Requirements

| Deployment Type | LLM Cost | Infrastructure | Total Monthly (100 users) |
|---|---|---|---|
| **Ollama (local)** | $0 | GPU server or CPU with 16GB RAM | $50-200 (hosting only) |
| **OpenAI API** | $0.01 per 1K tokens × ~2K tokens per decision × ~50 decisions/day | Standard server | ~$30 API + $50 hosting = $80 |

Ollama is cheaper if you already have compute resources. OpenAI is simpler if you want zero infrastructure management.

***

## Open-Source Resources Summary

**Essential repositories:**
- LangGraph: https://github.com/langchain-ai/langgraph
- LangChain Python: https://github.com/langchain-ai/langchain
- Ollama: https://github.com/ollama/ollama
- FastAPI WebSocket example: https://fastapi.tiangolo.com/advanced/websockets/
- Chrome Extension WebSocket example: [developer.chrome](https://developer.chrome.com/docs/extensions/how-to/web-platform/websockets)
- Nanobrowser (reference architecture): [github](https://github.com/nanobrowser/nanobrowser/)

**Documentation:**
- LangGraph state management guide: [aankitroy](https://aankitroy.com/blog/langgraph-state-management-memory-guide)
- FastAPI WebSocket guide: [videosdk](https://www.videosdk.live/developer-hub/websocket/fastapi-websocket)
- Chrome Extension Service Worker guide: [codimite](https://codimite.ai/blog/service-workers-in-chrome-extensions-mv3-powering-background-functionality/)
- Ollama API documentation: https://github.com/ollama/ollama/blob/main/docs/api.md

This architecture gives you a production-ready, fully open-source AI agent system integrated with your browser extension, with no vendor lock-in and full control over your data.