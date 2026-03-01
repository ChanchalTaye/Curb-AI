"""Approval queue table — state machine for human decisions."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class ApprovalQueueEntry(Base):
    __tablename__ = "approval_queue"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_decision_id: Mapped[str] = mapped_column(String(36), ForeignKey("agent_decisions.id"), nullable=False)
    queue_type: Mapped[str] = mapped_column(String(30), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Pending")
    assigned_to: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.utcnow())
    decided_at: Mapped[datetime | None] = mapped_column()
    decided_by: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"))
    approver_note: Mapped[str | None] = mapped_column(Text)
    escalation_history: Mapped[dict] = mapped_column(JSONB, default=list)
    expires_at: Mapped[datetime | None] = mapped_column()
