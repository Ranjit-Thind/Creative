# AdGenius — AI Ad Creative Platform

Production-ready AI advertising platform similar to AdCreative.ai. Automatically generates high-converting ad creatives, ad copy, and marketing assets using AI after analyzing a brand website.

## Architecture

```
ai-ad-platform/
├── frontend/          # Next.js + TailwindCSS + ShadCN UI
├── backend/           # Python FastAPI + Claude AI
├── infrastructure/    # Docker Compose
└── README.md
```

## Modules

| Module | Description |
|--------|-------------|
| Brand Intelligence Engine | Web crawler + Claude AI brand analysis |
| Category Detection | Auto-classifies brands into 15 categories |
| Creative Layout Engine | 12 proven ad layout templates |
| AI Creative Generator | Generates 25–50 creatives per batch |
| AI Copy Generator | 5 copy variations per creative |
| Performance Predictor | CTR, engagement, scroll-stop scoring |
| Canva-style Editor | In-browser drag-and-drop editor |
| Ad Export Engine | Meta, Google, TikTok export formats |
| Campaign Intelligence | AI-powered media planning & strategy |

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL 16
- Redis 7
- Anthropic API key

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run database migrations (with PostgreSQL running)
alembic upgrade head

# Start the API server
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

### 3. Docker Compose (Full Stack)
```bash
cd infrastructure
cp ../.env.example .env
# Add ANTHROPIC_API_KEY to .env
docker-compose up -d
```

Access:
- Frontend: http://localhost:3000
- API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs

## API Endpoints

### Brand Intelligence
```
POST /api/v1/brands/analyze    # Analyze brand website
GET  /api/v1/brands/           # List brands
GET  /api/v1/brands/{id}       # Brand profile
```

### Creative Generation
```
POST /api/v1/creatives/generate    # Generate 25-50 creatives
GET  /api/v1/creatives/            # List creatives
PATCH /api/v1/creatives/{id}       # Update creative
POST /api/v1/creatives/{id}/export # Export to platforms
```

### Templates
```
GET /api/v1/templates/           # List layout templates
GET /api/v1/templates/categories # Brand categories
```

### Campaign Intelligence
```
POST /api/v1/campaigns/generate-intelligence  # AI campaign report
GET  /api/v1/campaigns/                        # List campaigns
POST /api/v1/campaigns/{id}/export             # Export campaign
```

### Assets
```
POST /api/v1/assets/upload    # Upload brand asset
GET  /api/v1/assets/          # List assets
DELETE /api/v1/assets/{id}    # Delete asset
```

## Generation Output Structure

```json
{
  "brand_analysis": {
    "brand_name": "...",
    "industry": "...",
    "category": "...",
    "audience": "...",
    "value_proposition": "...",
    "color_palette": ["#hex"],
    "emotional_triggers": []
  },
  "category": "ecommerce",
  "layouts": [],
  "creatives": [
    {
      "creative_id": "cr_abc123",
      "layout_type": "Before After",
      "visual_concept": "...",
      "headline": "Transform Your Skin",
      "supporting_copy": "Natural results, trusted by 50k+",
      "cta": "Shop Now",
      "emotional_trigger": "hope",
      "predicted_ctr": 3.2,
      "engagement_score": 8.1,
      "scroll_stop_score": 7.9,
      "performance_rank": 1
    }
  ],
  "total_generated": 30,
  "campaign_intelligence": {}
}
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TailwindCSS, ShadCN UI |
| Backend | Python FastAPI, Pydantic |
| AI | Claude Opus 4.6 (Anthropic) |
| Database | PostgreSQL 16 + SQLAlchemy |
| Cache/Queue | Redis + Celery |
| Storage | Local / S3-compatible |
| Infrastructure | Docker Compose |
