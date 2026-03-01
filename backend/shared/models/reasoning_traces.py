"""Reasoning traces table — full LLM prompt and response per agent invocation."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class ReasoningTrace(Base):
    __tablename__ = "reasoning_traces"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_type: Mapped[str] = mapped_column(String(20), nullable=False)
    prompt_text: Mapped[str] = mapped_column(Text, nullable=False)
    llm_response_raw: Mapped[str] = mapped_column(Text, nullable=False)
    llm_model_used: Mapped[str] = mapped_column(String(100), nullable=False)
    tokens_used: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
