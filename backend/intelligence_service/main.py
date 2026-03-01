"""CurbAI Intelligence Service — AI agent reasoning for security and productivity."""

from contextlib import asynccontextmanager

from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="CurbAI Intelligence Service",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "intelligence"}
