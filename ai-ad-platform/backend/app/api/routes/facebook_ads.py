from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from ...schemas.facebook_ads import (
    AdSearchRequest,
    AdByPageRequest,
    AdSearchResponse,
)
from ...services.facebook_ad_library import FacebookAdLibraryService

router = APIRouter(prefix="/facebook-ads", tags=["facebook-ads"])
fb_service = FacebookAdLibraryService()


@router.post("/search", response_model=AdSearchResponse)
async def search_ads(request: AdSearchRequest):
    """
    Search the Facebook Ad Library by keyword.

    Requires FACEBOOK_ACCESS_TOKEN env variable with the `ads_read` permission.
    """
    try:
        result = await fb_service.search_ads(
            search_terms=request.search_terms,
            ad_reached_countries=request.ad_reached_countries,
            ad_type=request.ad_type,
            fields=request.fields,
            limit=request.limit,
            after_cursor=request.after_cursor,
            search_page_ids=request.search_page_ids,
            ad_active_status=request.ad_active_status,
            media_type=request.media_type,
            languages=request.languages,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/by-page", response_model=AdSearchResponse)
async def ads_by_page(request: AdByPageRequest):
    """
    Fetch all ads currently (or historically) run by a specific Facebook Page.

    Useful for competitor research — provide a competitor's Facebook Page ID.
    """
    try:
        result = await fb_service.search_ads_by_page(
            page_id=request.page_id,
            ad_reached_countries=request.ad_reached_countries,
            ad_type=request.ad_type,
            limit=request.limit,
            after_cursor=request.after_cursor,
            ad_active_status=request.ad_active_status,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/ad/{ad_id}")
async def get_ad(
    ad_id: str,
    fields: Optional[str] = Query(
        default=None,
        description="Comma-separated list of fields to return",
    ),
):
    """
    Fetch a single ad from the Facebook Ad Library by its archive ID.
    """
    try:
        field_list = fields.split(",") if fields else None
        result = await fb_service.get_ad_by_id(ad_id=ad_id, fields=field_list)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
