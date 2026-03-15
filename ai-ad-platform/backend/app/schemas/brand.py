from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime


class BrandAnalyzeRequest(BaseModel):
    website_url: str
    user_id: str = "default"


class BrandAnalyzeResponse(BaseModel):
    brand_name: str
    industry: str
    category: str
    audience: str
    tone_of_voice: str
    value_proposition: str
    color_palette: List[str]
    typography: Dict[str, Any]
    emotional_triggers: List[str]
    products: List[str]
    testimonials: List[str]
    pricing_positioning: str
    key_differentiators: List[str]
    marketing_angles: List[str]
    ad_hooks: List[str]
    logo_url: Optional[str]
    website_url: str
    analysis_status: str


class BrandResponse(BaseModel):
    id: int
    brand_name: str
    industry: str
    category: str
    audience: Optional[str]
    tone_of_voice: Optional[str]
    value_proposition: Optional[str]
    color_palette: Optional[List[str]]
    emotional_triggers: Optional[List[str]]
    logo_url: Optional[str]
    website_url: str
    analysis_status: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True
