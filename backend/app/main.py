from __future__ import annotations

import asyncio
import json
import logging
import os
import random
import uuid
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from . import data
from .schemas import Alert, DemoRequest, DemoRequestAck, EcoStatus, Forecast, Zone

log = logging.getLogger("eco-shield")

CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]
SIMULATOR_INTERVAL = float(os.getenv("SIMULATOR_INTERVAL", "25"))  # секунды; 0 = выключен
MAX_ALERTS = 50


class AlertHub:
    """Хранилище алертов + pub/sub для SSE.

    Для нескольких воркеров заменяется на Redis Pub/Sub (см. README).
    """

    def __init__(self) -> None:
        self.alerts: list[Alert] = data.seed_alerts()
        self._subscribers: set[asyncio.Queue[Alert]] = set()

    def publish(self, alert: Alert) -> None:
        self.alerts.insert(0, alert)
        del self.alerts[MAX_ALERTS:]
        for q in list(self._subscribers):
            try:
                q.put_nowait(alert)
            except asyncio.QueueFull:
                # медленный клиент: пропускаем событие, он получит его при следующем GET /alerts
                pass

    def subscribe(self) -> asyncio.Queue[Alert]:
        q: asyncio.Queue[Alert] = asyncio.Queue(maxsize=32)
        self._subscribers.add(q)
        return q

    def unsubscribe(self, q: asyncio.Queue[Alert]) -> None:
        self._subscribers.discard(q)


async def _simulator(hub: AlertHub) -> None:
    rng = random.Random()
    while True:
        await asyncio.sleep(SIMULATOR_INTERVAL + rng.uniform(-5, 5))
        hub.publish(data.make_alert(rng))


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    hub = AlertHub()
    app.state.hub = hub
    app.state.demo_requests = []
    task = asyncio.create_task(_simulator(hub)) if SIMULATOR_INTERVAL > 0 else None
    try:
        yield
    finally:
        if task:
            task.cancel()


app = FastAPI(
    title="Эко-Щит Каспия API",
    version="0.1.0",
    description="Демо-API: алерты, экологический статус, прогноз и поток событий (SSE).",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/api/health", tags=["system"])
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/zones", response_model=list[Zone], tags=["map"])
async def zones() -> list[Zone]:
    return data.ZONES


@app.get("/api/alerts", response_model=list[Alert], tags=["alerts"])
async def alerts(request: Request, limit: int = Query(20, ge=1, le=MAX_ALERTS)) -> list[Alert]:
    return request.app.state.hub.alerts[:limit]


@app.get("/api/status", response_model=EcoStatus, tags=["status"])
async def status(request: Request) -> EcoStatus:
    hub: AlertHub = request.app.state.hub
    critical = sum(1 for a in hub.alerts if a.severity.value == "critical")
    return data.build_status(active_alerts=critical)


@app.get("/api/forecast", response_model=Forecast, tags=["forecast"])
async def forecast(horizon: int = Query(7, ge=3, le=14)) -> Forecast:
    return data.build_forecast(horizon)


@app.get("/api/stream", tags=["alerts"])
async def stream(request: Request) -> StreamingResponse:
    """Server-Sent Events: новые алерты в реальном времени."""
    hub: AlertHub = request.app.state.hub
    queue = hub.subscribe()

    async def gen() -> AsyncIterator[str]:
        try:
            yield "retry: 5000\n\n"
            while True:
                if await request.is_disconnected():
                    break
                try:
                    alert = await asyncio.wait_for(queue.get(), timeout=15)
                    yield f"event: alert\ndata: {alert.model_dump_json()}\n\n"
                except asyncio.TimeoutError:
                    yield ": keep-alive\n\n"
        finally:
            hub.unsubscribe(queue)

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/api/demo-request", response_model=DemoRequestAck, status_code=201, tags=["leads"])
async def demo_request(payload: DemoRequest, request: Request) -> DemoRequestAck:
    rid = uuid.uuid4().hex[:10]
    request.app.state.demo_requests.append({"id": rid, **payload.model_dump()})
    log.info("demo request %s from %s", rid, payload.email)
    # TODO: сохранить в PostgreSQL / отправить уведомление в Telegram-бот
    return DemoRequestAck(id=rid)
