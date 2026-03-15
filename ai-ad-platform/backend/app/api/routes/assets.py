from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
import aiofiles
from ...core.database import get_db
from ...models.asset import Asset

router = APIRouter(prefix="/assets", tags=["assets"])

UPLOAD_DIR = "/tmp/ai-ad-assets"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_asset(
    brand_id: int = Form(...),
    asset_type: str = Form("image"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a brand asset (logo, image, font)."""
    # Validate file type
    allowed_types = {
        "image": ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
        "video": ["video/mp4", "video/webm"],
        "font": ["font/ttf", "font/otf", "application/x-font-ttf"],
    }

    if asset_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid asset type")

    # Save file
    file_ext = os.path.splitext(file.filename)[1]
    file_name = f"{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)

    # Save to database
    asset = Asset(
        brand_id=brand_id,
        name=file.filename,
        asset_type=asset_type,
        file_url=f"/assets/files/{file_name}",
        thumbnail_url=f"/assets/files/{file_name}",
        file_size=len(content),
        mime_type=file.content_type,
        tags=[asset_type],
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)

    return {
        "id": asset.id,
        "name": asset.name,
        "asset_type": asset.asset_type,
        "file_url": asset.file_url,
        "file_size": asset.file_size,
    }


@router.get("/")
def list_assets(
    brand_id: Optional[int] = None,
    asset_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Asset)
    if brand_id:
        query = query.filter(Asset.brand_id == brand_id)
    if asset_type:
        query = query.filter(Asset.asset_type == asset_type)
    assets = query.order_by(Asset.created_at.desc()).all()
    return assets


@router.delete("/{asset_id}")
def delete_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    db.delete(asset)
    db.commit()
    return {"message": "Asset deleted"}
