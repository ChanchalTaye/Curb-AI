"""POST /ingest/events — receives batched events from the Chrome extension."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from shared.database import get_session
from shared.models.events import Event
from shared.models.devices import Device
from shared.rabbitmq_client import publish
from shared.audit_writer import write_audit
from ..models import EventBatch
from ..normalizer import normalize_event

router = APIRouter()


@router.post("/events", status_code=status.HTTP_202_ACCEPTED)
async def ingest_events(batch: EventBatch, session: AsyncSession = Depends(get_session)):
    """Receive an event batch from the extension, validate, store, and publish."""

    # Verify device exists and is active
    device = await session.get(Device, batch.device_id)
    if not device or not device.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unregistered or inactive device")

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
            event_timestamp=raw_event.event_timestamp,
            server_received_at=datetime.now(timezone.utc),
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
