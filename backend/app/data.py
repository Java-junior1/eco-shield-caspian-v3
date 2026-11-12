"""Демо-данные и симулятор потока событий.

В боевой версии этот модуль заменяется репозиториями поверх PostgreSQL/PostGIS,
а события приходят из ML-пайплайнов (YAMNet / YOLOv8 / LSTM). Контракт API
(см. schemas.py) при этом не меняется.
"""
from __future__ import annotations

import math
import random
import uuid
from datetime import datetime, timedelta, timezone

from .schemas import (
    Alert,
    AlertKind,
    EcoStatus,
    Forecast,
    ForecastPoint,
    Sensor,
    Severity,
    Source,
    StatusPoint,
    Zone,
)

# Координаты приблизительные, для демонстрации.
ZONES: list[Zone] = [
    Zone(
        id="volga-delta",
        name="Дельта Волги (Астраханский заповедник)",
        region="Астраханская область, РФ",
        polygon=[(46.35, 47.95), (46.30, 48.65), (45.80, 48.85), (45.60, 48.25), (45.85, 47.90)],
    ),
    Zone(
        id="dagestan",
        name="Дагестанский заповедник",
        region="Республика Дагестан, РФ",
        polygon=[(43.10, 47.55), (43.05, 47.80), (42.80, 47.85), (42.78, 47.60)],
    ),
    Zone(
        id="mangystau",
        name="Мангистауская прибрежная зона",
        region="Мангистауская область, КЗ",
        polygon=[(44.75, 50.55), (44.70, 51.05), (44.35, 51.10), (44.30, 50.60)],
    ),
    Zone(
        id="gilan",
        name="Прибрежная зона Гилян",
        region="Остан Гилян, ИР",
        polygon=[(37.45, 49.60), (37.40, 50.05), (37.15, 50.10), (37.12, 49.65)],
    ),
]

SENSORS: list[Sensor] = [
    Sensor(id="iot-001", kind="salinity", label="Солёность, дельта Волги", value=7.8, unit="‰", lat=45.95, lon=48.40),
    Sensor(id="iot-002", kind="level", label="Уровень моря, Махачкала", value=-28.4, unit="м (Балт.)", lat=42.98, lon=47.52),
    Sensor(id="iot-003", kind="temperature", label="Температура воды, Мангистау", value=14.2, unit="°C", lat=44.50, lon=50.80),
    Sensor(id="iot-004", kind="salinity", label="Солёность, Гилян", value=11.2, unit="‰", lat=37.28, lon=49.85),
]

_TEMPLATES: list[dict] = [
    dict(
        kind=AlertKind.illegal_net, severity=Severity.critical, source=Source.satellite,
        title="Незаконные сети в охранной зоне",
        description="YOLOv8 обнаружил линию плавучих объектов, характерную для ставных сетей.",
        zone="volga-delta",
    ),
    dict(
        kind=AlertKind.poacher_boat, severity=Severity.warning, source=Source.acoustic,
        title="Браконьерская лодка обнаружена",
        description="YAMNet классифицировал звук подвесного мотора, уверенность выше порога.",
        zone="dagestan",
    ),
    dict(
        kind=AlertKind.gunshot, severity=Severity.critical, source=Source.acoustic,
        title="Зафиксирован выстрел",
        description="Акустический буй зарегистрировал импульсный сигнал класса gunshot.",
        zone="mangystau",
    ),
    dict(
        kind=AlertKind.discharge, severity=Severity.warning, source=Source.satellite,
        title="Подозрение на сброс",
        description="Спектральный индекс показал аномальный слик на поверхности воды.",
        zone="gilan",
    ),
    dict(
        kind=AlertKind.anomaly, severity=Severity.info, source=Source.iot,
        title="Аномалия активности вблизи дельты Волги",
        description="Подозрительная активность по совокупности датчиков.",
        zone="volga-delta",
    ),
    dict(
        kind=AlertKind.salinity, severity=Severity.info, source=Source.iot,
        title="Скачок солёности",
        description="Датчик показал отклонение солёности от скользящего среднего.",
        zone="mangystau",
    ),
]

_ZONES_BY_ID = {z.id: z for z in ZONES}


def _point_in_zone(zone: Zone, rng: random.Random) -> tuple[float, float]:
    lats = [p[0] for p in zone.polygon]
    lons = [p[1] for p in zone.polygon]
    clat, clon = sum(lats) / len(lats), sum(lons) / len(lons)
    # Небольшой разброс вокруг центроида: достаточно для демо.
    return (
        round(clat + rng.uniform(-0.08, 0.08), 5),
        round(clon + rng.uniform(-0.08, 0.08), 5),
    )


def make_alert(rng: random.Random | None = None, minutes_ago: int = 0, template_idx: int | None = None) -> Alert:
    rng = rng or random.Random()
    tpl = _TEMPLATES[template_idx] if template_idx is not None else rng.choice(_TEMPLATES)
    zone = _ZONES_BY_ID[tpl["zone"]]
    lat, lon = _point_in_zone(zone, rng)
    return Alert(
        id=uuid.uuid4().hex[:12],
        kind=tpl["kind"],
        severity=tpl["severity"],
        source=tpl["source"],
        title=tpl["title"],
        description=tpl["description"],
        lat=lat,
        lon=lon,
        zone_id=zone.id,
        confidence=round(rng.uniform(0.72, 0.98), 2),
        created_at=datetime.now(timezone.utc) - timedelta(minutes=minutes_ago),
    )


def seed_alerts() -> list[Alert]:
    rng = random.Random(42)  # детерминированный сид -> стабильная демонстрация
    return [make_alert(rng, minutes_ago=i * 17 + 3, template_idx=i % len(_TEMPLATES)) for i in range(6)]


def build_status(active_alerts: int) -> EcoStatus:
    now = datetime.now(timezone.utc)
    series = []
    for i in range(12):
        t = now - timedelta(hours=(11 - i) * 2)
        score = 88 + 3 * math.sin(i / 2.2) + i * 0.35
        series.append(StatusPoint(t=t.strftime("%H:%M"), score=round(score, 1)))
    score = 92
    return EcoStatus(
        score=score,
        label="В норме" if score >= 80 else "Требует внимания",
        trend_pct=2.0,
        series=series,
        sensors=SENSORS,
        active_alerts=active_alerts,
        updated_at=now,
    )


def build_forecast(horizon: int = 7) -> Forecast:
    """Демо-прогноз: сглаженная синусоида с шумом.

    Заглушка под LSTM/TFT: в продакшене сюда подключается модель, обученная
    на гидрологических рядах (уровень, солёность, температура).
    """
    today = datetime.now(timezone.utc).date()
    rng = random.Random(today.toordinal())  # стабильно в течение суток
    days_ru = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
    points: list[ForecastPoint] = []
    for i in range(horizon):
        d = today + timedelta(days=i)
        spawning = 45 + i * 6 + rng.uniform(-4, 4)
        migration = 38 + 14 * math.sin(i / 1.8) + i * 3 + rng.uniform(-4, 4)
        points.append(
            ForecastPoint(
                day=days_ru[d.weekday()],
                spawning=round(max(0, min(100, spawning)), 1),
                seal_migration=round(max(0, min(100, migration)), 1),
            )
        )
    return Forecast(
        horizon_days=horizon,
        model="demo-baseline (заглушка под LSTM / TFT)",
        points=points,
        generated_at=datetime.now(timezone.utc),
    )
