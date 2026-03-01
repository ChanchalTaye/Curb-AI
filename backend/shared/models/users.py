"""Users table — monitored users and dashboard users."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base
from ..constants import UserRole, AccountStatus


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default=UserRole.MONITORED_USER)
    department: Mapped[str | None] = mapped_column(String(100))
    manager_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"))
    org_unit: Mapped[str | None] = mapped_column(String(100))
    external_identity_ref: Mapped[str | None] = mapped_column(String(500))
    account_status: Mapped[str] = mapped_column(String(20), nullable=False, default=AccountStatus.ACTIVE)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.utcnow())
    updated_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.utcnow(),
        onupdate=lambda: datetime.utcnow(),
    )
