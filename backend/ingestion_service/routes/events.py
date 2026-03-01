"""POST /ingest/events — receives batched events from the Chrome extension.
   GET  /ingest/events/recent — returns recent events for the dashboard.
"""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from shared.database import get_session
from shared.models.events import Event
from shared.models.devices import Device
from shared.rabbitmq_client import publish
from shared.audit_writer import write_audit
from ..models import EventBatch
from ..normalizer import normalize_event

router = APIRouter()


@router.get("/events/recent")
async def get_recent_events(
    limit: int = Query(default=20, ge=1, le=200),
    session: AsyncSession = Depends(get_session),
):
    """Return the most recent events for the dashboard UI."""
    result = await session.execute(
        select(Event).order_by(desc(Event.server_received_at)).limit(limit)
    )
    events = result.scalars().all()
    return {
        "events": [
            {
                "id": e.id,
                "event_category": e.event_category,
                "event_type": e.event_type,
                "event_timestamp": e.event_timestamp.isoformat() if e.event_timestamp else None,
                "server_received_at": e.server_received_at.isoformat() if e.server_received_at else None,
                "payload": e.payload,
                "session_id": e.session_id,
            }
            for e in events
        ],
        "total": len(events),
    }


@router.post("/events", status_code=status.HTTP_202_ACCEPTED)
async def ingest_events(batch: EventBatch, session: AsyncSession = Depends(get_session)):
    """Receive an event batch from the extension, validate, store, and publish."""

    # Ensure device and user exist (auto-create for V1 hackathon convenience)
    device = await session.get(Device, batch.device_id)
    if not device:
        from shared.models.users import User
        from shared.constants import UserRole
        
        user_id = str(uuid.uuid4())
        new_user = User(
            id=user_id,
            email=f"auto-user-{str(uuid.uuid4())[:8]}@example.com",
            display_name="Auto Registered User",
            role=UserRole.MONITORED_USER,
            department="Engineering"
        )
        session.add(new_user)
        await session.flush()
        
        device = Device(
            id=batch.device_id,
            user_id=user_id,
            api_key_hash="auto-generated-v1",
            is_active=True
        )
        session.add(device)
        await session.commit()
    elif not device.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive device")

    stored_ids = []
    for raw_event in batch.events:
        normalized = normalize_event(raw_event.model_dump(), batch.device_id, device.user_id)
        event_id = str(uuid.uuid4())

        db_event = Event(
            id=event_id,
            device_id=batch.device_id,
            user_id=device.user_id,
            event_category=normalized["event_category"],
            event_type=normalized["event_type"],
            event_timestamp=raw_event.event_timestamp.replace(tzinfo=None),
            server_received_at=datetime.utcnow(),
            payload=normalized["payload"],
            session_id=normalized["session_id"],
        )
        session.add(db_event)
        stored_ids.append(event_id)

        # Publish to RabbitMQ for downstream ML processing
        await publish("events.raw", "event.new", {**normalized, "event_id": event_id})

    await session.commit()

    # Audit entry
    await write_audit(
        session,
        event_type="events_received",
        actor_id=batch.device_id,
        resource_type="event_batch",
        detail={"count": len(stored_ids), "event_ids": stored_ids[:5]},
    )
    await session.commit()

    return {"accepted": len(stored_ids)}
