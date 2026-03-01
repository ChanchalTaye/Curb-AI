"""Context fetcher — pulls user history from PostgreSQL and baseline from Redis."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.models.events import Event
from shared.models.users import User
from shared.redis_client import redis_client


async def fetch_user_context(session: AsyncSession, user_id: str) -> dict:
    """Fetch user profile and recent event history for agent prompt construction."""
    user = await session.get(User, user_id)
    if not user:
        return {"error": "User not found"}

    # Last 7 days of events (capped at 200 for prompt size)
    result = await session.execute(
        select(Event)
        .where(Event.user_id == user_id)
        .order_by(Event.event_timestamp.desc())
        .limit(200)
    )
    recent_events = result.scalars().all()

    return {
        "user_display_name": user.display_name,
        "user_department": user.department,
        "user_role": user.role,
        "account_status": user.account_status,
        "manager_id": user.manager_id,
        "recent_event_count": len(recent_events),
        "recent_event_categories": _summarize_categories(recent_events),
    }


async def fetch_behavioral_baseline(user_id: str) -> dict:
    """Read the user's behavioral baseline from Redis."""
    baseline = await redis_client.hgetall(f"baseline:{user_id}")
    return baseline or {"status": "no_baseline_available"}


def _summarize_categories(events) -> dict:
    """Count events by category for the prompt context."""
    summary: dict[str, int] = {}
    for e in events:
        summary[e.event_category] = summary.get(e.event_category, 0) + 1
    return summary
