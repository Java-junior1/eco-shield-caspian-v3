from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class Severity(str, Enum):
    critical = "critical"
    warning = "warning"
    info = "info"


class Source(str, Enum):
    satellite = "satellite"
    acoustic = "acoustic"
    iot = "iot"


class AlertKind(str, Enum):
    illegal_net = "illegal_net"
    poacher_boat = "poacher_boat"
    gunshot = "gunshot"
    discharge = "discharge"
    anomaly = "anomaly"
    salinity = "salinity"


class Alert(BaseModel):
    id: str
    kind: AlertKind
    severity: Severity
    source: Source
    title: str
    description: str
    lat: float
    lon: float
    zone_id: str
    confidence: float = Field(ge=0, le=1)
    created_at: datetime


class Zone(BaseModel):
    id: str
    name: str
    region: str
    # [lat, lon] ring, ready for Leaflet <Polygon positions=...>
    polygon: list[tuple[float, float]]


class Sensor(BaseModel):
    id: str
    kind: str  # salinity | level | temperature
    label: str
    value: float
    unit: str
    lat: float
    lon: float


class StatusPoint(BaseModel):
    t: str
    score: float


class EcoStatus(BaseModel):
    score: int = Field(ge=0, le=100)
    label: str
    trend_pct: float
    series: list[StatusPoint]
    sensors: list[Sensor]
    active_alerts: int
    updated_at: datetime


class ForecastPoint(BaseModel):
    day: str
    spawning: float = Field(ge=0, le=100, description="Индекс нереста, 0..100")
    seal_migration: float = Field(ge=0, le=100, description="Индекс миграции тюленя, 0..100")


class Forecast(BaseModel):
    horizon_days: int
    model: str
    points: list[ForecastPoint]
    generated_at: datetime


class DemoRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", max_length=120)
    organization: str = Field(default="", max_length=120)
    message: str = Field(default="", max_length=1000)


class DemoRequestAck(BaseModel):
    ok: bool = True
    id: str
