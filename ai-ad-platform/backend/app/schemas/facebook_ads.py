from pydantic import BaseModel, Field
from typing import Optional


class AdSearchRequest(BaseModel):
    search_terms: str = Field(..., description="Keywords to search for in ad content")
    ad_reached_countries: list[str] = Field(
        default=["US"],
        description="ISO 3166-1 alpha-2 country codes, e.g. ['US', 'GB']",
    )
    ad_type: str = Field(
        default="ALL",
        description="'ALL', 'POLITICAL_AND_ISSUE_ADS', or 'HOUSING_ADS'",
    )
    fields: Optional[list[str]] = Field(
        default=None,
        description="Ad fields to return. Defaults to a standard set.",
    )
    limit: int = Field(default=25, ge=1, le=100, description="Results per page (max 100)")
    after_cursor: Optional[str] = Field(default=None, description="Pagination cursor")
    search_page_ids: Optional[list[str]] = Field(
        default=None, description="Restrict results to specific Facebook Page IDs"
    )
    ad_active_status: str = Field(
        default="ACTIVE",
        description="'ACTIVE', 'INACTIVE', or 'ALL'",
    )
    media_type: Optional[str] = Field(
        default=None,
        description="'IMAGE', 'VIDEO', 'MEME', 'NONE', or 'ALL'",
    )
    languages: Optional[list[str]] = Field(
        default=None,
        description="ISO 639-1 language codes, e.g. ['en', 'fr']",
    )


class AdByPageRequest(BaseModel):
    page_id: str = Field(..., description="Facebook Page ID to fetch ads for")
    ad_reached_countries: list[str] = Field(default=["US"])
    ad_type: str = Field(default="ALL")
    limit: int = Field(default=25, ge=1, le=100)
    after_cursor: Optional[str] = Field(default=None)
    ad_active_status: str = Field(default="ALL")


class PagingCursors(BaseModel):
    before: Optional[str] = None
    after: Optional[str] = None


class Paging(BaseModel):
    cursors: PagingCursors = Field(default_factory=PagingCursors)
    next: Optional[str] = None
    has_next_page: bool = False


class AdSearchResponse(BaseModel):
    ads: list[dict]
    paging: Paging
    total_count: int
    search_terms: str
    ad_reached_countries: list[str]
    ad_active_status: str
