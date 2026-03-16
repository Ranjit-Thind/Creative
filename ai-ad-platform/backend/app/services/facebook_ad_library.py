"""
Facebook Ad Library Service
Fetches competitor and industry ads from the Facebook Ad Library API.
Docs: https://www.facebook.com/ads/library/api/
"""
import httpx
from typing import Optional
from ..core.config import settings

FACEBOOK_GRAPH_API_BASE = "https://graph.facebook.com/v19.0"
AD_LIBRARY_ENDPOINT = f"{FACEBOOK_GRAPH_API_BASE}/ads_archive"

# Default fields returned for each ad
DEFAULT_AD_FIELDS = [
    "id",
    "ad_creation_time",
    "ad_creative_bodies",
    "ad_creative_link_captions",
    "ad_creative_link_descriptions",
    "ad_creative_link_titles",
    "ad_delivery_start_time",
    "ad_delivery_stop_time",
    "ad_snapshot_url",
    "currency",
    "delivery_by_region",
    "demographic_distribution",
    "estimated_audience_size",
    "impressions",
    "page_id",
    "page_name",
    "publisher_platforms",
    "spend",
    "languages",
    "bylines",
]


class FacebookAdLibraryService:
    def __init__(self):
        self.access_token = settings.FACEBOOK_ACCESS_TOKEN
        self.timeout = 30.0

    def _build_params(
        self,
        search_terms: str,
        ad_reached_countries: list[str],
        ad_type: str,
        fields: list[str],
        limit: int,
        after_cursor: Optional[str],
        search_page_ids: Optional[list[str]],
        ad_active_status: str,
        media_type: Optional[str],
        languages: Optional[list[str]],
    ) -> dict:
        params = {
            "access_token": self.access_token,
            "search_terms": search_terms,
            "ad_reached_countries": ",".join(ad_reached_countries),
            "ad_type": ad_type,
            "fields": ",".join(fields),
            "limit": limit,
            "ad_active_status": ad_active_status,
        }
        if after_cursor:
            params["after"] = after_cursor
        if search_page_ids:
            params["search_page_ids"] = ",".join(search_page_ids)
        if media_type:
            params["media_type"] = media_type
        if languages:
            params["languages"] = ",".join(languages)
        return params

    async def search_ads(
        self,
        search_terms: str,
        ad_reached_countries: list[str] = None,
        ad_type: str = "ALL",
        fields: list[str] = None,
        limit: int = 25,
        after_cursor: Optional[str] = None,
        search_page_ids: Optional[list[str]] = None,
        ad_active_status: str = "ACTIVE",
        media_type: Optional[str] = None,
        languages: Optional[list[str]] = None,
    ) -> dict:
        """
        Search the Facebook Ad Library for ads.

        Args:
            search_terms: Keywords to search for in ad content.
            ad_reached_countries: ISO 3166-1 alpha-2 country codes (e.g. ["US", "GB"]).
            ad_type: "ALL", "POLITICAL_AND_ISSUE_ADS", or "HOUSING_ADS".
            fields: List of fields to return per ad (defaults to DEFAULT_AD_FIELDS).
            limit: Number of results per page (max 100).
            after_cursor: Pagination cursor from a previous response's paging.cursors.after.
            search_page_ids: Restrict results to specific Facebook Page IDs.
            ad_active_status: "ACTIVE", "INACTIVE", or "ALL".
            media_type: Filter by media type: "IMAGE", "VIDEO", "MEME", "NONE", "ALL".
            languages: ISO 639-1 language codes to filter by (e.g. ["en", "fr"]).

        Returns:
            dict with keys:
              - ads: list of ad objects
              - paging: pagination metadata (cursors, next URL)
              - total_count: approximate total number of matching ads
        """
        if not self.access_token:
            raise ValueError(
                "FACEBOOK_ACCESS_TOKEN is not configured. "
                "Obtain a token at https://developers.facebook.com/tools/explorer/ "
                "with ads_read permission."
            )

        resolved_countries = ad_reached_countries or ["US"]
        resolved_fields = fields or DEFAULT_AD_FIELDS

        params = self._build_params(
            search_terms=search_terms,
            ad_reached_countries=resolved_countries,
            ad_type=ad_type,
            fields=resolved_fields,
            limit=min(limit, 100),
            after_cursor=after_cursor,
            search_page_ids=search_page_ids,
            ad_active_status=ad_active_status,
            media_type=media_type,
            languages=languages,
        )

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(AD_LIBRARY_ENDPOINT, params=params)

        if response.status_code != 200:
            error_body = response.json() if response.content else {}
            error_msg = error_body.get("error", {}).get("message", response.text)
            raise RuntimeError(f"Facebook Ad Library API error ({response.status_code}): {error_msg}")

        data = response.json()
        ads = data.get("data", [])
        paging = data.get("paging", {})

        return {
            "ads": ads,
            "paging": {
                "cursors": paging.get("cursors", {}),
                "next": paging.get("next"),
                "has_next_page": bool(paging.get("next")),
            },
            "total_count": len(ads),
            "search_terms": search_terms,
            "ad_reached_countries": resolved_countries,
            "ad_active_status": ad_active_status,
        }

    async def get_ad_by_id(self, ad_id: str, fields: list[str] = None) -> dict:
        """
        Fetch a single ad by its archive ID.

        Args:
            ad_id: The Facebook ad archive ID.
            fields: List of fields to return (defaults to DEFAULT_AD_FIELDS).

        Returns:
            dict containing the ad's data.
        """
        if not self.access_token:
            raise ValueError("FACEBOOK_ACCESS_TOKEN is not configured.")

        resolved_fields = fields or DEFAULT_AD_FIELDS
        params = {
            "access_token": self.access_token,
            "fields": ",".join(resolved_fields),
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{FACEBOOK_GRAPH_API_BASE}/{ad_id}",
                params=params,
            )

        if response.status_code != 200:
            error_body = response.json() if response.content else {}
            error_msg = error_body.get("error", {}).get("message", response.text)
            raise RuntimeError(f"Facebook Graph API error ({response.status_code}): {error_msg}")

        return response.json()

    async def search_ads_by_page(
        self,
        page_id: str,
        ad_reached_countries: list[str] = None,
        ad_type: str = "ALL",
        limit: int = 25,
        after_cursor: Optional[str] = None,
        ad_active_status: str = "ALL",
    ) -> dict:
        """
        Fetch all ads run by a specific Facebook Page.

        Args:
            page_id: The Facebook Page ID to look up.
            ad_reached_countries: Country filter.
            ad_type: Ad type filter.
            limit: Results per page.
            after_cursor: Pagination cursor.
            ad_active_status: "ACTIVE", "INACTIVE", or "ALL".

        Returns:
            Same structure as search_ads().
        """
        return await self.search_ads(
            search_terms="",
            ad_reached_countries=ad_reached_countries or ["US"],
            ad_type=ad_type,
            limit=limit,
            after_cursor=after_cursor,
            search_page_ids=[page_id],
            ad_active_status=ad_active_status,
        )
