from sqlalchemy import Column, Integer, String, JSON, DateTime, Text, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class Creative(Base):
    __tablename__ = "creatives"

    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=False)
    creative_id = Column(String, unique=True, index=True)

    # Creative Content
    layout_type = Column(String, nullable=False)
    visual_concept = Column(Text)
    headline = Column(String, nullable=False)
    supporting_copy = Column(Text)
    cta = Column(String)
    emotional_trigger = Column(String)
    creative_format = Column(String)

    # Dimensions / Format
    aspect_ratio = Column(String, default="1:1")  # 1:1, 4:5, 9:16, 16:9
    platform = Column(String, default="meta")  # meta, google, tiktok

    # Copy Variations
    copy_variations = Column(JSON, default=list)

    # Performance Prediction
    predicted_ctr = Column(Float, default=0.0)
    engagement_score = Column(Float, default=0.0)
    scroll_stop_score = Column(Float, default=0.0)
    emotional_impact_score = Column(Float, default=0.0)
    performance_rank = Column(Integer, default=0)

    # Design Data
    design_data = Column(JSON)  # Canva-style design JSON
    preview_url = Column(String)
    export_urls = Column(JSON, default=dict)

    # Status
    status = Column(String, default="draft")  # draft, generated, exported
    is_favorite = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    brand = relationship("Brand", back_populates="creatives")
    variations = relationship("CreativeVariation", back_populates="creative")


class CreativeVariation(Base):
    __tablename__ = "creative_variations"

    id = Column(Integer, primary_key=True, index=True)
    creative_id = Column(Integer, ForeignKey("creatives.id"), nullable=False)
    variation_type = Column(String)  # headline, copy, cta
    content = Column(Text)
    performance_score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    creative = relationship("Creative", back_populates="variations")
