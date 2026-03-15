from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.api.routes import brands, creatives, templates, campaigns, assets

app = FastAPI(
    title="AI Ad Creative Platform",
    description="Production-ready AI advertising platform for generating high-converting ad creatives",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(brands.router, prefix=settings.API_V1_STR)
app.include_router(creatives.router, prefix=settings.API_V1_STR)
app.include_router(templates.router, prefix=settings.API_V1_STR)
app.include_router(campaigns.router, prefix=settings.API_V1_STR)
app.include_router(assets.router, prefix=settings.API_V1_STR)

# Static files for uploaded assets
assets_dir = "/tmp/ai-ad-assets"
os.makedirs(assets_dir, exist_ok=True)
app.mount("/assets/files", StaticFiles(directory=assets_dir), name="assets")


@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0", "service": "AI Ad Creative Platform"}


@app.get("/")
def root():
    return {
        "service": "AI Ad Creative Platform API",
        "version": "1.0.0",
        "docs": "/api/docs",
        "modules": [
            "Brand Intelligence Engine",
            "Category Detection",
            "Creative Layout Engine",
            "AI Creative Generator",
            "AI Copy Generator",
            "Creative Performance Prediction",
            "Ad Export Engine",
            "Campaign Intelligence Engine",
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=settings.APP_ENV == "development",
    )
