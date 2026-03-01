"""CurbAI Ingestion Service — entry point for all browser event data."""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from shared.rabbitmq_client import close as close_rabbitmq


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await close_rabbitmq()


app = FastAPI(
    title="CurbAI Ingestion Service",
    version="0.1.0",
    lifespan=lifespan,
)

from .routes.events import router as events_router
from .routes.websocket import router as ws_router

app.include_router(events_router, prefix="/ingest", tags=["ingestion"])
app.include_router(ws_router, tags=["websocket"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ingestion"}
