"""Security Intelligence Agent — LangGraph state graph for security event reasoning.

Workflow: Event → Fetch Context → Construct Prompt → Call LLM → Validate → Store Decision → Create Approval → Wait for Human
"""

import json
import uuid
import os
from pathlib import Path
from typing import TypedDict, Annotated

from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage

from ..llm_client import get_llm_client


_PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "security_agent.txt"
_PROMPT_TEMPLATE = _PROMPT_PATH.read_text(encoding="utf-8")


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
    approval_status: str | None


def fetch_context_node(state: SecurityAgentState) -> dict:
    """Placeholder — in production this queries PostgreSQL and Redis."""
    return {
        "user_context": state.get("user_context", {}),
        "behavioral_baseline": state.get("behavioral_baseline", {}),
    }


def construct_prompt_node(state: SecurityAgentState) -> dict:
    """Build the LLM prompt from the versioned template."""
    user_ctx = state.get("user_context", {})
    prompt = _PROMPT_TEMPLATE.format(
        event_data=json.dumps(state.get("event_data", {}), indent=2),
        risk_score=state.get("risk_score", 0),
        feature_contributions=json.dumps(state.get("feature_contributions", {}), indent=2),
        user_display_name=user_ctx.get("user_display_name", "Unknown"),
        user_department=user_ctx.get("user_department", "Unknown"),
        account_status=user_ctx.get("account_status", "active"),
        recent_activity_summary=json.dumps(user_ctx.get("recent_event_categories", {})),
        baseline_deviation_description=json.dumps(state.get("behavioral_baseline", {})),
    )
    return {"messages": [{"role": "system", "content": prompt}]}


def call_llm_node(state: SecurityAgentState) -> dict:
    """Invoke the LLM (Groq / OpenAI / Ollama) and parse the JSON response."""
    llm = get_llm_client()
    response = llm.invoke(state["messages"])
    raw_text = response.content if hasattr(response, "content") else str(response)

    try:
        decision = json.loads(raw_text)
    except json.JSONDecodeError:
        decision = {
            "severity": "medium",
            "reasoning": raw_text,
            "recommended_action": "SendEmailNotification",
            "confidence": 0.5,
            "human_explanation": "Agent response could not be parsed as JSON.",
        }

    return {
        "reasoning_trace": raw_text,
        "agent_decision": decision,
    }


def store_decision_node(state: SecurityAgentState) -> dict:
    """Placeholder — in production writes to agent_decisions and approval_queue tables."""
    return {"approval_status": "Pending"}


def human_approval_node(state: SecurityAgentState) -> dict:
    """Interrupt point — LangGraph pauses execution here for human review."""
    return state


def build_security_agent_graph():
    """Construct and compile the Security Intelligence Agent workflow."""
    workflow = StateGraph(SecurityAgentState)

    workflow.add_node("fetch_context", fetch_context_node)
    workflow.add_node("construct_prompt", construct_prompt_node)
    workflow.add_node("call_llm", call_llm_node)
    workflow.add_node("store_decision", store_decision_node)
    workflow.add_node("wait_for_approval", human_approval_node)

    workflow.set_entry_point("fetch_context")
    workflow.add_edge("fetch_context", "construct_prompt")
    workflow.add_edge("construct_prompt", "call_llm")
    workflow.add_edge("call_llm", "store_decision")
    workflow.add_edge("store_decision", "wait_for_approval")
    workflow.add_edge("wait_for_approval", END)

    return workflow.compile(interrupt_before=["wait_for_approval"])
