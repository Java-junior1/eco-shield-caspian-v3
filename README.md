# Эко-Щит Каспия — лендинг + демо-API

Лендинг по макету с живой картой ООПТ, алертами в реальном времени (SSE), экологическим статусом и прогнозом.

```
frontend/   Next.js 14 (App Router) · TypeScript · Tailwind · react-leaflet · Recharts
backend/    FastAPI · Pydantic v2 · SSE (демо-данные и симулятор событий)
```

## Запуск

**Docker (одной командой):**
```bash
docker compose up --build
# сайт: http://localhost:3000   Swagger: http://localhost:8000/docs
```

**Локально:**
```bash
# backend
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload            # :8000

# frontend (в другом терминале)
cd frontend && cp .env.example .env.local
npm install && npm run dev               # :3000
```

Если бэкенд не запущен, сайт показывает встроенные демо-данные (`frontend/lib/fallback.ts`) —
удобно для превью на Vercel. Индикатор в дашборде переключается «Онлайн / Демо-данные».

## API

| Метод | Путь | Назначение |
|---|---|---|
| GET | `/api/alerts?limit=` | последние алерты |
| GET | `/api/status` | экологический статус, тренд, датчики |
| GET | `/api/forecast?horizon=` | прогноз нереста и миграции тюленя |
| GET | `/api/zones` | полигоны ООПТ для карты |
| GET | `/api/stream` | SSE: новые алерты (`event: alert`) |
| POST | `/api/demo-request` | заявка на демо из модального окна |

## Что сделано, а что заглушка

- Дашборд-превью, карта, алерты, графики, заявка на демо и SSE — рабочие.
- **Данные демонстрационные**: алерты генерирует симулятор (`backend/app/data.py`),
  прогноз — сглаженная кривая, а не обученная LSTM/TFT; полигоны ООПТ приблизительные.
  Контракт API (`schemas.py`) рассчитан на то, чтобы подставить реальные ML-пайплайны
  (YAMNet, YOLOv8, LSTM) без изменений на фронте.
- Заявки хранятся в памяти процесса. Для продакшена — PostgreSQL/PostGIS (SQLAlchemy async),
  Redis Pub/Sub вместо in-memory `AlertHub`, если воркеров больше одного.
- Бот aiogram 3 и KMM-клиент из стека кейса в этот репозиторий не входят.

## Что нужно доработать вручную

1. **Фото тюленя** для секции «Почему это важно» положите в `frontend/public/images/seal.jpg`
   (макет сгенерирован, исходной картинки у нас нет; без файла остаётся градиентный фон).
2. Ссылки соцсетей в `components/Footer.tsx` — сейчас корневые адреса.
3. Подложка карты — спутниковые тайлы Esri (без токена, удобно для хакатона).
   Для публичного продакшена проверьте условия использования или смените `ESRI_IMAGERY`
   в `components/map/MapView.tsx` на свой источник.
4. Для Vercel задайте `NEXT_PUBLIC_API_URL` на публичный адрес бэкенда и добавьте домен
   сайта в `CORS_ORIGINS` бэкенда.

## Отступление от стека кейса

shadcn/ui не подключал: для лендинга хватило нескольких собственных классов Tailwind
(`globals.css`, `.btn`, `.glass`), меньше зависимостей. Компоненты shadcn легко добавить позже.
