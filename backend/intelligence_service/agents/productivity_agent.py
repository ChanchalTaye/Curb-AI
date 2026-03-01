"""Productivity Intelligence Agent — LangGraph state graph for aggregate productivity analysis.

Triggered on a schedule (every 4 hours), not by individual events.
Simpler workflow than the Security Agent — no human approval interrupt.
"""

import json
import os
from pathlib import Path
from typing import TypedDict, Annotated

from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage

from ..llm_client import get_llm_client


_PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "productivity_agent.txt"
_PROMPT_TEMPLATE = _PROMPT_PATH.read_text(encoding="utf-8")


class ProductivityAgentState(TypedDict):
    user_id: str
    productivity_metrics: dict
    deviation_description: str
    messages: Annotated[list[BaseMessage], "conversation history"]
    recommendation: dict | None
    reasoning_trace: str | None


def aggregate_metrics_node(state: ProductivityAgentState) -> dict:
    """Placeholder — in production queries 2 weeks of events per user."""
    return {"productivity_metrics": state.get("productivity_metrics", {})}


def classify_productivity_node(state: ProductivityAgentState) -> dict:
    """Rule-based classification before LLM call."""
    metrics = state.get("productivity_metrics", {})
    productive_frac = metrics.get("productive_domain_fraction", 0.5)

    if productive_frac >= 0.7:
        classification = "healthy"
    elif productive_frac >= 0.5:
        classification = "distracted"
    elif productive_frac >= 0.3:
        classification = "disengaged"
    else:
        classification = "overloaded"

    return {"deviation_description": f"Classification: {classification}, productive_fraction={productive_frac}"}


def construct_prompt_node(state: ProductivityAgentState) -> dict:
    """Build the productivity prompt from the versioned template."""
    prompt = _PROMPT_TEMPLATE.format(
        productivity_metrics=json.dumps(state.get("productivity_metrics", {}), indent=2),
        productive_benchmark="0.65",
        distraction_benchmark="0.15",
        continuity_benchmark="0.70",
        deviation_description=state.get("deviation_description", "No deviation data"),
    )
    return {"messages": [{"role": "system", "content": prompt}]}


def call_llm_node(state: ProductivityAgentState) -> dict:
    """Invoke the LLM for productivity recommendation."""
    llm = get_llm_client()
    response = llm.invoke(state["messages"])
    raw_text = response.content if hasattr(response, "content") else str(response)

    try:
        recommendation = json.loads(raw_text)
    except json.JSONDecodeError:
        recommendation = {
            "productivity_state": "unknown",
            "reasoning": raw_text,
            "recommended_action": "SendEmailNotification",
            "confidence": 0.5,
            "human_explanation": "Agent response could not be parsed.",
        }

    return {"reasoning_trace": raw_text, "recommendation": recommendation}


def store_recommendation_node(state: ProductivityAgentState) -> dict:
    """Placeholder — in production writes to agent_decisions as type Recommendation."""
    return state


def build_productivity_agent_graph():
    """Construct and compile the Productivity Intelligence Agent workflow."""
    workflow = StateGraph(ProductivityAgentState)

    workflow.add_node("aggregate_metrics", aggregate_metrics_node)
    workflow.add_node("classify_productivity", classify_productivity_node)
    workflow.add_node("construct_prompt", construct_prompt_node)
    workflow.add_node("call_llm", call_llm_node)
    workflow.add_node("store_recommendation", store_recommendation_node)

    workflow.set_entry_point("aggregate_metrics")
    workflow.add_edge("aggregate_metrics", "classify_productivity")
    workflow.add_edge("classify_productivity", "construct_prompt")
    workflow.add_edge("construct_prompt", "call_llm")
    workflow.add_edge("call_llm", "store_recommendation")
    workflow.add_edge("store_recommendation", END)

    return workflow.compile()
