"""ML models table — tracks trained model versions."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Boolean, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class MLModel(Base):
    __tablename__ = "ml_models"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    model_type: Mapped[str] = mapped_column(String(50), nullable=False, default="isolation_forest")
    trained_at: Mapped[datetime] = mapped_column(default=lambda: datetime.utcnow())
    training_data_start: Mapped[datetime | None] = mapped_column()
    training_data_end: Mapped[datetime | None] = mapped_column()
    training_sample_count: Mapped[int | None] = mapped_column(Integer)
    performance_metrics: Mapped[dict] = mapped_column(JSONB, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    model_artifact_path: Mapped[str | None] = mapped_column(String(500))
