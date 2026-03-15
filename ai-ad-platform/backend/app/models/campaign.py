from sqlalchemy import Column, Integer, String, JSON, DateTime, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=False)
    name = Column(String, nullable=False)
    objective = Column(String)  # awareness, traffic, conversions, leads
    platform = Column(String)   # meta, google, tiktok, all
    target_audience = Column(JSON)
    budget = Column(Float)
    creative_ids = Column(JSON, default=list)
    status = Column(String, default="draft")
    intelligence_report = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    brand = relationship("Brand", back_populates="campaigns")
