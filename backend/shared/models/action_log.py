"""Action log table — every action executed by the Action Execution Service."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class ActionLogEntry(Base):
    __tablename__ = "action_log"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    approval_queue_id: Mapped[str] = mapped_column(String(36), ForeignKey("approval_queue.id"), nullable=False)
    action_type: Mapped[str] = mapped_column(String(50), nullable=False)
    target_description: Mapped[str] = mapped_column(String(500), nullable=False)
    executed_at: Mapped[datetime] = mapped_column(default=lambda: datetime.utcnow())
    outcome: Mapped[str] = mapped_column(String(20), nullable=False)
    error_detail: Mapped[str | None] = mapped_column(Text)
