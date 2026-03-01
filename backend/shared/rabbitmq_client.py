"""RabbitMQ async connection and publish helpers using aio-pika."""

import os
import json
import aio_pika

RABBITMQ_URL = os.getenv(
    "RABBITMQ_URL",
    "amqp://curbai:change_me_in_production@localhost:5672/",
)

_connection: aio_pika.abc.AbstractRobustConnection | None = None
_channel: aio_pika.abc.AbstractChannel | None = None


async def get_channel() -> aio_pika.abc.AbstractChannel:
    """Return a reusable channel, creating the connection on first call."""
    global _connection, _channel
    if _connection is None or _connection.is_closed:
        _connection = await aio_pika.connect_robust(RABBITMQ_URL)
    if _channel is None or _channel.is_closed:
        _channel = await _connection.channel()
    return _channel


async def publish(exchange_name: str, routing_key: str, body: dict) -> None:
    """Publish a JSON message to the given exchange."""
    channel = await get_channel()
    exchange = await channel.declare_exchange(exchange_name, aio_pika.ExchangeType.TOPIC, durable=True)
    message = aio_pika.Message(
        body=json.dumps(body, default=str).encode(),
        content_type="application/json",
        delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
    )
    await exchange.publish(message, routing_key=routing_key)


async def close() -> None:
    """Gracefully shut down."""
    global _connection, _channel
    if _channel and not _channel.is_closed:
        await _channel.close()
    if _connection and not _connection.is_closed:
        await _connection.close()
    _connection = None
    _channel = None
