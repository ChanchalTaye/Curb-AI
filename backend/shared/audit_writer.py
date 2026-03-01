"""Shared audit log writer — append-only, hash-chained records."""

import hashlib
import json
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .models.audit_log import AuditLog


async def write_audit(
    session: AsyncSession,
    *,
    event_type: str,
    actor_id: str | None = None,
    resource_type: str | None = None,
    resource_id: str | None = None,
    detail: dict | None = None,
) -> AuditLog:
    """Insert a new tamper-evident audit log entry."""
    # Fetch the hash of the most recent record
    result = await session.execute(
        select(AuditLog.content_hash).order_by(AuditLog.created_at.desc()).limit(1)
    )
    previous_hash = result.scalar_one_or_none() or "GENESIS"

    record_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    detail_json = json.dumps(detail or {}, sort_keys=True)

    content_string = f"{record_id}|{event_type}|{actor_id}|{resource_type}|{resource_id}|{detail_json}|{now.isoformat()}"
    content_hash = hashlib.sha256(content_string.encode()).hexdigest()

    entry = AuditLog(
        id=record_id,
        event_type=event_type,
        actor_id=actor_id,
        resource_type=resource_type,
        resource_id=resource_id,
        detail=detail or {},
        created_at=now,
        content_hash=content_hash,
        previous_hash=previous_hash,
    )
    session.add(entry)
    await session.flush()
    return entry
