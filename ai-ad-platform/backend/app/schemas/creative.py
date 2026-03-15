from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class GenerateCreativesRequest(BaseModel):
    brand_id: int
    count: int = 30
    platforms: List[str] = ["meta"]
    generate_copy: bool = True


class CreativeResponse(BaseModel):
    id: Optional[int]
    creative_id: str
    layout_type: str
    visual_concept: Optional[str]
    headline: str
    supporting_copy: Optional[str]
    cta: Optional[str]
    emotional_trigger: Optional[str]
    creative_format: Optional[str]
    aspect_ratio: str = "1:1"
    platform: str = "meta"
    copy_variations: Optional[List[Dict]]
    predicted_ctr: float = 0.0
    engagement_score: float = 0.0
    scroll_stop_score: float = 0.0
    emotional_impact_score: float = 0.0
    overall_score: Optional[float] = 0.0
    performance_rank: int = 0
    winning_elements: Optional[List[str]] = []
    improvement_suggestions: Optional[List[str]] = []
    design_data: Optional[Dict[str, Any]]
    preview_url: Optional[str]
    status: str = "draft"
    is_favorite: bool = False
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class UpdateCreativeRequest(BaseModel):
    headline: Optional[str]
    supporting_copy: Optional[str]
    cta: Optional[str]
    design_data: Optional[Dict[str, Any]]
    is_favorite: Optional[bool]


class GenerationResponse(BaseModel):
    brand_analysis: Dict[str, Any]
    category: str
    layouts: List[Dict]
    creatives: List[Dict]
    total_generated: int
    campaign_intelligence: Optional[Dict] = None
