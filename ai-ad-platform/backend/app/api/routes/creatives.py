from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ...core.database import get_db
from ...models.brand import Brand
from ...models.creative import Creative, CreativeVariation
from ...schemas.creative import (
    GenerateCreativesRequest, CreativeResponse,
    UpdateCreativeRequest, GenerationResponse
)
from ...services.creative_generator import AICreativeGenerator
from ...services.performance_predictor import PerformancePredictor
from ...services.layout_engine import CreativeLayoutEngine
from ...services.campaign_intelligence import CampaignIntelligenceEngine
from ...services.export_engine import AdExportEngine

router = APIRouter(prefix="/creatives", tags=["creatives"])

creative_gen = AICreativeGenerator()
predictor = PerformancePredictor()
layout_engine = CreativeLayoutEngine()
campaign_intel = CampaignIntelligenceEngine()
export_engine = AdExportEngine()


@router.post("/generate", response_model=GenerationResponse)
async def generate_creatives(
    request: GenerateCreativesRequest,
    db: Session = Depends(get_db)
):
    """Generate 25-50 AI-powered ad creatives for a brand."""
    # Get brand data
    brand = db.query(Brand).filter(Brand.id == request.brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    brand_data = brand.raw_analysis or {}
    if not brand_data:
        brand_data = {
            "brand_name": brand.brand_name,
            "industry": brand.industry,
            "category": brand.category,
            "audience": brand.audience or "",
            "tone_of_voice": brand.tone_of_voice or "professional",
            "value_proposition": brand.value_proposition or "",
            "color_palette": brand.color_palette or [],
            "emotional_triggers": brand.emotional_triggers or [],
        }

    try:
        # Generate creatives
        count = min(request.count, 50)
        raw_creatives = await creative_gen.generate_creatives(
            brand_data=brand_data,
            count=count,
            platforms=request.platforms,
        )

        # Predict performance
        ranked_creatives = await predictor.predict_batch(raw_creatives, brand_data)

        # Optionally generate copy variations for top 10
        if request.generate_copy:
            for creative in ranked_creatives[:10]:
                variations = await creative_gen.generate_copy_variations(
                    creative, brand_data
                )
                creative["copy_variations"] = variations

        # Save to database
        saved_creatives = []
        for creative in ranked_creatives:
            db_creative = Creative(
                brand_id=brand.id,
                creative_id=creative.get("creative_id"),
                layout_type=creative.get("layout_type", ""),
                visual_concept=creative.get("visual_concept", ""),
                headline=creative.get("headline", ""),
                supporting_copy=creative.get("supporting_copy", ""),
                cta=creative.get("cta", ""),
                emotional_trigger=creative.get("emotional_trigger", ""),
                creative_format=creative.get("creative_format", ""),
                aspect_ratio=creative.get("aspect_ratio", "1:1"),
                platform=creative.get("platform", "meta"),
                copy_variations=creative.get("copy_variations", []),
                predicted_ctr=creative.get("predicted_ctr", 0),
                engagement_score=creative.get("engagement_score", 0),
                scroll_stop_score=creative.get("scroll_stop_score", 0),
                emotional_impact_score=creative.get("emotional_impact_score", 0),
                performance_rank=creative.get("performance_rank", 0),
                design_data=creative.get("design_data"),
                status="generated",
            )
            db.add(db_creative)
            db.flush()
            creative["id"] = db_creative.id
            saved_creatives.append(creative)

        db.commit()

        # Get layouts for this category
        layouts = layout_engine.get_layouts_for_category(brand.category, 12)

        # Generate campaign intelligence
        campaign_report = None
        try:
            campaign_report = await campaign_intel.generate_campaign_report(
                brand_data=brand_data,
                creatives=ranked_creatives[:10],
            )
        except Exception:
            pass

        return GenerationResponse(
            brand_analysis={
                "brand_name": brand.brand_name,
                "industry": brand.industry,
                "category": brand.category,
                "audience": brand.audience,
                "value_proposition": brand.value_proposition,
                "color_palette": brand.color_palette,
                "emotional_triggers": brand.emotional_triggers,
            },
            category=brand.category,
            layouts=layouts,
            creatives=saved_creatives,
            total_generated=len(saved_creatives),
            campaign_intelligence=campaign_report,
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Creative generation failed: {str(e)}")


@router.get("/", response_model=List[CreativeResponse])
def list_creatives(
    brand_id: Optional[int] = None,
    platform: Optional[str] = None,
    layout_type: Optional[str] = None,
    sort_by: str = "performance_rank",
    limit: int = Query(50, le=100),
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """List creatives with filtering and sorting."""
    query = db.query(Creative)

    if brand_id:
        query = query.filter(Creative.brand_id == brand_id)
    if platform:
        query = query.filter(Creative.platform == platform)
    if layout_type:
        query = query.filter(Creative.layout_type == layout_type)

    if sort_by == "performance_rank":
        query = query.order_by(Creative.performance_rank.asc())
    elif sort_by == "created_at":
        query = query.order_by(Creative.created_at.desc())
    elif sort_by == "ctr":
        query = query.order_by(Creative.predicted_ctr.desc())

    creatives = query.offset(offset).limit(limit).all()
    return creatives


@router.get("/{creative_id}", response_model=CreativeResponse)
def get_creative(creative_id: str, db: Session = Depends(get_db)):
    creative = db.query(Creative).filter(Creative.creative_id == creative_id).first()
    if not creative:
        raise HTTPException(status_code=404, detail="Creative not found")
    return creative


@router.patch("/{creative_id}", response_model=CreativeResponse)
def update_creative(
    creative_id: str,
    request: UpdateCreativeRequest,
    db: Session = Depends(get_db)
):
    """Update a creative (from editor)."""
    creative = db.query(Creative).filter(Creative.creative_id == creative_id).first()
    if not creative:
        raise HTTPException(status_code=404, detail="Creative not found")

    if request.headline is not None:
        creative.headline = request.headline
    if request.supporting_copy is not None:
        creative.supporting_copy = request.supporting_copy
    if request.cta is not None:
        creative.cta = request.cta
    if request.design_data is not None:
        creative.design_data = request.design_data
    if request.is_favorite is not None:
        creative.is_favorite = request.is_favorite

    db.commit()
    db.refresh(creative)
    return creative


@router.post("/{creative_id}/export")
async def export_creative(
    creative_id: str,
    platforms: List[str] = Query(["meta"]),
    db: Session = Depends(get_db)
):
    """Generate export data for a creative."""
    creative = db.query(Creative).filter(Creative.creative_id == creative_id).first()
    if not creative:
        raise HTTPException(status_code=404, detail="Creative not found")

    brand = db.query(Brand).filter(Brand.id == creative.brand_id).first()
    brand_data = brand.raw_analysis or {"brand_name": brand.brand_name, "website_url": brand.website_url}

    creative_data = {
        "creative_id": creative.creative_id,
        "headline": creative.headline,
        "supporting_copy": creative.supporting_copy,
        "cta": creative.cta,
        "aspect_ratio": creative.aspect_ratio,
        "preview_url": creative.preview_url,
        "copy_variations": creative.copy_variations or [],
    }

    export_data = export_engine.generate_export_manifest(
        [creative_data], brand_data, platforms
    )

    creative.status = "exported"
    creative.export_urls = export_data
    db.commit()

    return export_data


@router.delete("/{creative_id}")
def delete_creative(creative_id: str, db: Session = Depends(get_db)):
    creative = db.query(Creative).filter(Creative.creative_id == creative_id).first()
    if not creative:
        raise HTTPException(status_code=404, detail="Creative not found")
    db.delete(creative)
    db.commit()
    return {"message": "Creative deleted"}
