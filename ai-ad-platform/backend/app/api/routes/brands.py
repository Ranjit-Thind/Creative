from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from ...core.database import get_db
from ...models.brand import Brand
from ...schemas.brand import BrandAnalyzeRequest, BrandAnalyzeResponse, BrandResponse
from ...services.brand_intelligence import BrandIntelligenceEngine

router = APIRouter(prefix="/brands", tags=["brands"])
brand_engine = BrandIntelligenceEngine()


@router.post("/analyze", response_model=dict)
async def analyze_brand(request: BrandAnalyzeRequest, db: Session = Depends(get_db)):
    """Analyze a brand website and extract brand intelligence."""
    try:
        brand_data = await brand_engine.analyze_brand(request.website_url)

        # Save to database
        brand = Brand(
            user_id=request.user_id,
            website_url=request.website_url,
            brand_name=brand_data.get("brand_name", "Unknown Brand"),
            industry=brand_data.get("industry", "General"),
            category=brand_data.get("category", "ecommerce"),
            audience=brand_data.get("audience"),
            tone_of_voice=brand_data.get("tone_of_voice"),
            value_proposition=brand_data.get("value_proposition"),
            color_palette=brand_data.get("color_palette", []),
            typography=brand_data.get("typography", {}),
            emotional_triggers=brand_data.get("emotional_triggers", []),
            logo_url=brand_data.get("logo_url"),
            products=brand_data.get("products", []),
            testimonials=brand_data.get("testimonials", []),
            pricing_positioning=brand_data.get("pricing_positioning"),
            raw_analysis=brand_data,
            analysis_status="done",
        )
        db.add(brand)
        db.commit()
        db.refresh(brand)

        return {
            "id": brand.id,
            **brand_data,
            "analysis_status": "done",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Brand analysis failed: {str(e)}")


@router.get("/", response_model=List[BrandResponse])
def list_brands(user_id: str = "default", db: Session = Depends(get_db)):
    """List all brands for a user."""
    brands = db.query(Brand).filter(Brand.user_id == user_id).all()
    return brands


@router.get("/{brand_id}", response_model=dict)
def get_brand(brand_id: int, db: Session = Depends(get_db)):
    """Get a specific brand's full profile."""
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    data = brand.raw_analysis or {}
    return {
        "id": brand.id,
        "brand_name": brand.brand_name,
        "industry": brand.industry,
        "category": brand.category,
        "audience": brand.audience,
        "tone_of_voice": brand.tone_of_voice,
        "value_proposition": brand.value_proposition,
        "color_palette": brand.color_palette,
        "typography": brand.typography,
        "emotional_triggers": brand.emotional_triggers,
        "logo_url": brand.logo_url,
        "products": brand.products,
        "testimonials": brand.testimonials,
        "pricing_positioning": brand.pricing_positioning,
        "website_url": brand.website_url,
        "analysis_status": brand.analysis_status,
        "key_differentiators": data.get("key_differentiators", []),
        "marketing_angles": data.get("marketing_angles", []),
        "ad_hooks": data.get("ad_hooks", []),
    }


@router.delete("/{brand_id}")
def delete_brand(brand_id: int, db: Session = Depends(get_db)):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    db.delete(brand)
    db.commit()
    return {"message": "Brand deleted"}
