from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ...core.database import get_db
from ...models.campaign import Campaign
from ...models.brand import Brand
from ...models.creative import Creative
from ...services.campaign_intelligence import CampaignIntelligenceEngine
from ...services.export_engine import AdExportEngine

router = APIRouter(prefix="/campaigns", tags=["campaigns"])
campaign_intel = CampaignIntelligenceEngine()
export_engine = AdExportEngine()


@router.post("/generate-intelligence")
async def generate_campaign_intelligence(
    brand_id: int,
    objective: str = "conversions",
    platform: str = "meta",
    budget: float = 1000.0,
    db: Session = Depends(get_db)
):
    """Generate AI-powered campaign strategy and intelligence report."""
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    brand_data = brand.raw_analysis or {}
    creatives = db.query(Creative).filter(
        Creative.brand_id == brand_id
    ).order_by(Creative.performance_rank.asc()).limit(20).all()

    creative_list = [
        {
            "headline": c.headline,
            "layout_type": c.layout_type,
            "emotional_trigger": c.emotional_trigger,
            "overall_score": (c.predicted_ctr + c.engagement_score) / 2,
        }
        for c in creatives
    ]

    report = await campaign_intel.generate_campaign_report(
        brand_data=brand_data,
        creatives=creative_list,
        budget=budget,
        objective=objective,
        platform=platform,
    )

    # Save campaign
    campaign = Campaign(
        brand_id=brand_id,
        name=f"{brand.brand_name} - {objective.title()} Campaign",
        objective=objective,
        platform=platform,
        budget=budget,
        creative_ids=[c.id for c in creatives[:10]],
        intelligence_report=report,
        status="draft",
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    return {
        "campaign_id": campaign.id,
        "campaign_name": campaign.name,
        "intelligence_report": report,
    }


@router.get("/")
def list_campaigns(brand_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Campaign)
    if brand_id:
        query = query.filter(Campaign.brand_id == brand_id)
    campaigns = query.order_by(Campaign.created_at.desc()).all()
    return campaigns


@router.post("/{campaign_id}/export")
async def export_campaign(
    campaign_id: int,
    platforms: List[str] = None,
    db: Session = Depends(get_db)
):
    """Export campaign creatives to ad platforms."""
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    brand = db.query(Brand).filter(Brand.id == campaign.brand_id).first()
    brand_data = brand.raw_analysis or {}

    creative_ids = campaign.creative_ids or []
    creatives = db.query(Creative).filter(Creative.id.in_(creative_ids)).all()
    creative_data = [
        {
            "creative_id": c.creative_id,
            "headline": c.headline,
            "supporting_copy": c.supporting_copy,
            "cta": c.cta,
            "aspect_ratio": c.aspect_ratio,
            "copy_variations": c.copy_variations or [],
        }
        for c in creatives
    ]

    if not platforms:
        platforms = [campaign.platform or "meta"]

    export = export_engine.generate_export_manifest(creative_data, brand_data, platforms)
    return export
