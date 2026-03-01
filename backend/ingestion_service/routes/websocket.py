"""WebSocket /ws/agent/{device_id} — bidirectional channel for extension commands."""

import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from shared.redis_client import redis_client

router = APIRouter()
logger = logging.getLogger("ingestion.websocket")


@router.websocket("/ws/agent/{device_id}")
async def agent_websocket(websocket: WebSocket, device_id: str):
    """Bidirectional WebSocket for extension ↔ backend communication."""
    await websocket.accept()

    # Register this connection in Redis so Action Execution Service knows the device is online
    await redis_client.set(f"ws:device:{device_id}", "connected", ex=3600)
    logger.info("Device %s connected via WebSocket", device_id)

    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            msg_type = data.get("type", "")

            if msg_type == "PING":
                # Heartbeat response
                await websocket.send_text(json.dumps({"type": "PONG"}))
                # Refresh TTL on connection registry
                await redis_client.set(f"ws:device:{device_id}", "connected", ex=3600)

            elif msg_type == "EVENT_ACK":
                # Extension confirms it received and executed a command
                logger.info("Device %s acknowledged command: %s", device_id, data.get("command_id"))

            # Check if the Action Execution Service has queued any commands for this device
            command_key = f"command:device:{device_id}"
            command_raw = await redis_client.get(command_key)
            if command_raw:
                await websocket.send_text(command_raw)
                await redis_client.delete(command_key)
                logger.info("Dispatched command to device %s", device_id)

    except WebSocketDisconnect:
        await redis_client.delete(f"ws:device:{device_id}")
        logger.info("Device %s disconnected", device_id)
    except Exception as exc:
        await redis_client.delete(f"ws:device:{device_id}")
        logger.error("WebSocket error for device %s: %s", device_id, exc)
