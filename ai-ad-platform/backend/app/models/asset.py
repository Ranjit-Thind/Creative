from sqlalchemy import Column, Integer, String, JSON, DateTime, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=False)
    name = Column(String, nullable=False)
    asset_type = Column(String)  # image, video, font, logo, template
    file_url = Column(String)
    thumbnail_url = Column(String)
    file_size = Column(Integer)
    mime_type = Column(String)
    asset_metadata = Column(JSON, default=dict)
    tags = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    brand = relationship("Brand", back_populates="assets")
