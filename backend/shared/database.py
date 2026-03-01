"""SQLAlchemy async engine and session factory for PostgreSQL."""

import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://curbai:change_me_in_production@localhost:5432/curbai_v1",
)

engine = create_async_engine(DATABASE_URL, echo=False, pool_size=20, max_overflow=10)

async_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


async def get_session() -> AsyncSession:
    """Dependency-injectable session generator for FastAPI."""
    async with async_session_factory() as session:
        yield session
