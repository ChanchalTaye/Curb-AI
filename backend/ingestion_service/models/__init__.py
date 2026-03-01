"""Pydantic schemas for event ingestion validation."""

from datetime import datetime
from pydantic import BaseModel, Field


class BrowserEvent(BaseModel):
    """A single event from the Chrome extension."""
    event_category: str = Field(..., pattern="^(navigation|tab_management|session_timing|download|page_engagement|extension_change)$")
    event_type: str = Field(..., max_length=50)
    event_timestamp: datetime
    payload: dict = Field(default_factory=dict)
    session_id: str | None = None


class EventBatch(BaseModel):
    """A batch of events POSTed by the extension on each flush cycle."""
    device_id: str = Field(..., min_length=1, max_length=36)
    events: list[BrowserEvent] = Field(..., min_length=1, max_length=500)
