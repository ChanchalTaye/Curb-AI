"""Agent decisions table — every decision package from the Intelligence Service."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Float, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class AgentDecision(Base):
    __tablename__ = "agent_decisions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scored_event_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("scored_events.id"))
    agent_type: Mapped[str] = mapped_column(String(20), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)
    recommended_action: Mapped[str] = mapped_column(String(50), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    human_explanation: Mapped[str] = mapped_column(Text, nullable=False)
    reasoning_trace_id: Mapped[str] = mapped_column(String(36), ForeignKey("reasoning_traces.id"), nullable=False)
    decision_timestamp: Mapped[datetime] = mapped_column(default=lambda: datetime.utcnow())
