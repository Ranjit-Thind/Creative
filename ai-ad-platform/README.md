# AdGenius — AI Ad Creative Platform

Production-ready AI advertising platform that automatically generates high-converting ad creatives, ad copy, and marketing assets by analyzing a brand website. Includes Facebook Ad Library integration for competitor research.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Modules](#modules)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Quick Start (Local)](#quick-start-local)
- [Docker Compose](#docker-compose)
- [Deployment](#deployment)

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **TypeScript** | 5.x | Primary language |
| **Next.js** | 16.1.6 | React framework (App Router) |
| **React** | 19.2.3 | UI library |
| **TailwindCSS** | 4.x | Utility-first styling |
| **Radix UI** | Latest | Accessible component primitives |
| **Framer Motion** | 12.x | Animations |
| **Axios** | 1.x | HTTP client |
| **html2canvas / jsPDF** | Latest | Export to image/PDF |
| **Lucide React** | 0.577 | Icon library |
| **Node.js** | 20 LTS | Runtime |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Python** | 3.11.9 | Primary language |
| **FastAPI** | 0.135.1 | Async REST API framework |
| **Uvicorn** | 0.41.0 | ASGI server |
| **Pydantic** | 2.12.5 | Data validation & settings |
| **SQLAlchemy** | 2.0.48 | ORM |
| **Alembic** | 1.18.4 | Database migrations |
| **httpx** | 0.28.1 | Async HTTP client |
| **BeautifulSoup4** | 4.14.3 | HTML parsing / web crawling |
| **Pillow** | 12.1.1 | Image processing |
| **Celery** | 5.6.2 | Background task queue |
| **Redis** | 7.x | Cache & task broker |
| **PostgreSQL** | 16 | Primary database |

### AI & Integrations

| Service | Purpose |
|--------|---------|
| **Claude Opus 4.6** (Anthropic) | Brand analysis, creative generation, copy writing |
| **Facebook Ad Library API** | Competitor ad research (Graph API v19.0) |

### Infrastructure

| Technology | Purpose |
|-----------|---------|
| **Docker / Docker Compose** | Local full-stack orchestration |
| **Railway** | Backend cloud deployment |
| **Vercel** | Frontend cloud deployment |

---

## Architecture

```
ai-ad-platform/
├── frontend/                    # Next.js 16 (TypeScript)
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   └── components/          # UI components
│   ├── Dockerfile
│   └── next.config.ts
│
├── backend/                     # Python 3.11 FastAPI
│   ├── main.py                  # App entry point
│   ├── app/
│   │   ├── api/routes/          # REST route handlers
│   │   ├── services/            # Business logic & AI engines
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic schemas
│   │   └── core/                # Config, database setup
│   ├── alembic/                 # DB migration scripts
│   ├── requirements.txt
│   ├── Dockerfile
│   └── railway.toml             # Railway deployment config
│
└── infrastructure/
    └── docker-compose.yml       # Full-stack local orchestration
```

---

## Modules

| Module | File | Description |
|--------|------|-------------|
| Brand Intelligence Engine | `services/brand_intelligence.py` | Crawls brand website + Claude AI analysis |
| Category Detection | `services/brand_intelligence.py` | Auto-classifies brands into 15 categories |
| Creative Layout Engine | `services/layout_engine.py` | 12 proven ad layout templates |
| AI Creative Generator | `services/creative_generator.py` | Generates 25–50 creatives per batch |
| AI Copy Generator | `services/creative_generator.py` | 5 copy variations per creative |
| Performance Predictor | `services/performance_predictor.py` | CTR, engagement, scroll-stop scoring |
| Ad Export Engine | `services/export_engine.py` | Meta, Google, TikTok export formats |
| Campaign Intelligence | `services/campaign_intelligence.py` | AI media planning & strategy reports |
| Facebook Ad Library | `services/facebook_ad_library.py` | Competitor ad research via Meta Graph API |

---

## API Reference

Base path: `/api/v1`
Interactive docs: `http://localhost:8000/api/docs`

### Brand Intelligence

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/brands/analyze` | Crawl & analyze a brand website with Claude AI |
| `GET` | `/brands/` | List all brands |
| `GET` | `/brands/{id}` | Full brand profile |
| `DELETE` | `/brands/{id}` | Delete a brand |

### Creative Generation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/creatives/generate` | Generate 25–50 ad creatives for a brand |
| `GET` | `/creatives/` | List all creatives |
| `PATCH` | `/creatives/{id}` | Update a creative |
| `POST` | `/creatives/{id}/export` | Export creative to platform format |

### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/templates/` | List all layout templates |
| `GET` | `/templates/categories` | List supported brand categories |

### Campaign Intelligence

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/campaigns/generate-intelligence` | Generate AI campaign report |
| `GET` | `/campaigns/` | List all campaigns |
| `POST` | `/campaigns/{id}/export` | Export campaign data |

### Assets

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/assets/upload` | Upload a brand asset (image, logo) |
| `GET` | `/assets/` | List uploaded assets |
| `DELETE` | `/assets/{id}` | Delete an asset |

### Facebook Ad Library

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/facebook-ads/search` | Search ads by keyword |
| `POST` | `/facebook-ads/by-page` | All ads for a specific Facebook Page ID |
| `GET` | `/facebook-ads/ad/{ad_id}` | Fetch a single ad by archive ID |

#### Example: Search ads by keyword

```bash
curl -X POST http://localhost:8000/api/v1/facebook-ads/search \
  -H "Content-Type: application/json" \
  -d '{
    "search_terms": "skincare",
    "ad_reached_countries": ["US"],
    "ad_type": "ALL",
    "ad_active_status": "ACTIVE",
    "limit": 25
  }'
```

#### Example: Fetch competitor ads by Page ID

```bash
curl -X POST http://localhost:8000/api/v1/facebook-ads/by-page \
  -H "Content-Type: application/json" \
  -d '{
    "page_id": "123456789",
    "ad_reached_countries": ["US", "GB"],
    "ad_active_status": "ALL",
    "limit": 50
  }'
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude AI |
| `FACEBOOK_ACCESS_TOKEN` | Yes* | Meta access token with `ads_read` permission |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `SECRET_KEY` | Yes | JWT signing secret |
| `APP_ENV` | No | `development` or `production` (default: `development`) |
| `APP_HOST` | No | Bind host (default: `0.0.0.0`) |
| `APP_PORT` | No | Bind port (default: `8000`) |
| `CORS_ORIGINS` | No | JSON array of allowed origins |
| `STORAGE_BUCKET` | No | S3 bucket name for asset storage |
| `STORAGE_REGION` | No | S3 region |

*Required only for Facebook Ad Library endpoints.

**Get your Facebook access token:**
[developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer/) → select your app → add `ads_read` permission → Generate Token.

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL, e.g. `http://localhost:8000/api/v1` |

---

## Quick Start (Local)

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 16
- Redis 7

### 1. Backend

```bash
cd backend
cp .env.example .env
# Fill in ANTHROPIC_API_KEY (and optionally FACEBOOK_ACCESS_TOKEN) in .env

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start API server
uvicorn main:app --reload
# API running at http://localhost:8000
# Docs at http://localhost:8000/api/docs
```

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

npm install
npm run dev
# App running at http://localhost:3000
```

---

## Docker Compose

Runs the full stack (PostgreSQL + Redis + Backend + Celery Worker + Frontend) in one command.

```bash
cd infrastructure
cp ../backend/.env.example .env
# Edit .env and add ANTHROPIC_API_KEY

docker-compose up -d
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/api/docs |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

```bash
# Stop everything
docker-compose down

# Stop and delete volumes (resets database)
docker-compose down -v
```

---

## Deployment

See [INSTALL.md](./INSTALL.md) for full step-by-step instructions to deploy:

- **Frontend** → Vercel
- **Backend** → Railway
- **Database** → Neon (Vercel Postgres) or Supabase
- **Redis** → Upstash Redis

---

## Generation Output Example

```json
{
  "brand_analysis": {
    "brand_name": "GlowSkin",
    "industry": "Beauty",
    "category": "beauty",
    "audience": "Women 25-45 interested in natural skincare",
    "value_proposition": "Science-backed natural skincare that delivers visible results in 14 days",
    "color_palette": ["#F9A8D4", "#FDE68A", "#A7F3D0"],
    "emotional_triggers": ["hope", "confidence", "trust"]
  },
  "creatives": [
    {
      "creative_id": "cr_abc123",
      "layout_type": "Before After",
      "headline": "Transform Your Skin in 14 Days",
      "supporting_copy": "Natural results, trusted by 50,000+ women",
      "cta": "Shop Now",
      "emotional_trigger": "hope",
      "predicted_ctr": 3.2,
      "engagement_score": 8.1,
      "scroll_stop_score": 7.9,
      "performance_rank": 1
    }
  ],
  "total_generated": 30
}
```
