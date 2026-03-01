"""Event normalization — raw extension payload → canonical internal schema."""

from datetime import datetime, timezone


def normalize_event(raw: dict, device_id: str, user_id: str) -> dict:
    """Transform a raw extension event into the canonical format for storage."""
    return {
        "device_id": device_id,
        "user_id": user_id,
        "event_category": raw["event_category"],
        "event_type": raw["event_type"],
        "event_timestamp": raw["event_timestamp"],
        "server_received_at": datetime.now(timezone.utc).isoformat(),
        "payload": raw.get("payload", {}),
        "session_id": raw.get("session_id"),
    }
