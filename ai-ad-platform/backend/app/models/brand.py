from sqlalchemy import Column, Integer, String, JSON, DateTime, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class Brand(Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    website_url = Column(String, nullable=False)
    brand_name = Column(String, nullable=False)
    industry = Column(String, nullable=False)
    category = Column(String, nullable=False)

    # Brand Intelligence
    audience = Column(Text)
    tone_of_voice = Column(String)
    value_proposition = Column(Text)
    color_palette = Column(JSON, default=list)
    typography = Column(JSON, default=dict)
    emotional_triggers = Column(JSON, default=list)
    logo_url = Column(String)
    products = Column(JSON, default=list)
    testimonials = Column(JSON, default=list)
    pricing_positioning = Column(String)
    raw_analysis = Column(JSON)

    # Metadata
    analysis_status = Column(String, default="pending")  # pending, processing, done, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    creatives = relationship("Creative", back_populates="brand")
    campaigns = relationship("Campaign", back_populates="brand")
    assets = relationship("Asset", back_populates="brand")
