"""Scored events table — ML output per event."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Float, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class ScoredEvent(Base):
    __tablename__ = "scored_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id: Mapped[str] = mapped_column(String(36), ForeignKey("events.id"), nullable=False)
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)
    model_version_id: Mapped[str] = mapped_column(String(36), ForeignKey("ml_models.id"), nullable=False)
    feature_vector: Mapped[dict] = mapped_column(JSONB, default=dict)
    feature_contributions: Mapped[dict] = mapped_column(JSONB, default=dict)
    scored_at: Mapped[datetime] = mapped_column(default=lambda: datetime.utcnow())
