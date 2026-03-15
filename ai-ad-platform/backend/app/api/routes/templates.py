from fastapi import APIRouter, Query
from typing import Optional
from ...services.layout_engine import CreativeLayoutEngine, CATEGORY_LAYOUT_MAP

router = APIRouter(prefix="/templates", tags=["templates"])
layout_engine = CreativeLayoutEngine()


@router.get("/")
def list_templates(category: Optional[str] = None, limit: int = 20):
    """List available creative templates/layouts."""
    if category:
        layouts = layout_engine.get_layouts_for_category(category, limit)
    else:
        all_layouts = layout_engine.get_all_layouts()
        layouts = [
            {**v, "layout_key": k}
            for k, v in list(all_layouts.items())[:limit]
        ]
    return {"templates": layouts, "total": len(layouts)}


@router.get("/categories")
def list_categories():
    """List all supported brand categories."""
    categories = list(CATEGORY_LAYOUT_MAP.keys())
    category_info = {
        "ecommerce": {"label": "E-Commerce", "icon": "🛒"},
        "beauty": {"label": "Beauty & Cosmetics", "icon": "💄"},
        "healthcare": {"label": "Healthcare", "icon": "🏥"},
        "clinic": {"label": "Clinic & Medical", "icon": "⚕️"},
        "saas": {"label": "SaaS & Software", "icon": "💻"},
        "finance": {"label": "Finance & Fintech", "icon": "💰"},
        "education": {"label": "Education", "icon": "📚"},
        "fitness": {"label": "Fitness & Wellness", "icon": "💪"},
        "real_estate": {"label": "Real Estate", "icon": "🏠"},
        "local_services": {"label": "Local Services", "icon": "🔧"},
        "fashion": {"label": "Fashion & Apparel", "icon": "👗"},
        "food_beverage": {"label": "Food & Beverage", "icon": "🍔"},
        "travel": {"label": "Travel & Tourism", "icon": "✈️"},
        "automotive": {"label": "Automotive", "icon": "🚗"},
        "technology": {"label": "Technology", "icon": "⚡"},
    }
    return {
        "categories": [
            {"key": k, **category_info.get(k, {"label": k.title(), "icon": "📦"})}
            for k in categories
        ]
    }


@router.get("/{layout_key}")
def get_template(layout_key: str):
    """Get a specific template/layout."""
    layout = layout_engine.get_layout(layout_key)
    if not layout:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Template not found")
    return {**layout, "layout_key": layout_key}
