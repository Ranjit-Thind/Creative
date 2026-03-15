"""
MODULE 8 — Ad Export Engine
Handles exporting creatives to various ad platforms and file formats.
"""
import json
from typing import List, Dict, Optional


class AdExportEngine:
    """Generates platform-specific export data for ad creatives."""

    def export_for_meta(self, creatives: List[Dict], brand_data: dict) -> Dict:
        """Generate Meta Ads Manager import structure."""
        ad_sets = []
        for creative in creatives[:20]:  # Meta limit
            ad_set = {
                "name": f"{creative.get('headline', 'Ad')} - {creative.get('layout_type', '')}",
                "status": "PAUSED",
                "creative": {
                    "title": creative.get("headline", ""),
                    "body": creative.get("supporting_copy", ""),
                    "call_to_action": {
                        "type": self._map_cta_meta(creative.get("cta", "Learn More")),
                    },
                    "image_url": creative.get("preview_url", ""),
                },
                "targeting": {
                    "age_min": 18,
                    "age_max": 65,
                    "genders": [0],
                },
                "optimization_goal": "LINK_CLICKS",
                "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
            }
            ad_sets.append(ad_set)

        return {
            "platform": "meta",
            "campaign_name": f"{brand_data.get('brand_name', 'Campaign')} - AI Generated",
            "objective": "CONVERSIONS",
            "ad_sets": ad_sets,
            "export_format": "meta_ads_manager_json",
        }

    def export_for_google(self, creatives: List[Dict], brand_data: dict) -> Dict:
        """Generate Google Ads responsive display ad structure."""
        ads = []
        for creative in creatives[:15]:
            variations = creative.get("copy_variations", [])
            headlines = [creative.get("headline", "")]
            descriptions = [creative.get("supporting_copy", "")]

            if variations:
                for v in variations[:4]:
                    if v.get("short_headline"):
                        headlines.append(v["short_headline"])
                    if v.get("description"):
                        descriptions.append(v["description"])

            ads.append({
                "ad_name": creative.get("headline", "Ad"),
                "headlines": headlines[:15],
                "descriptions": descriptions[:4],
                "final_url": brand_data.get("website_url", ""),
                "marketing_image": creative.get("preview_url", ""),
                "square_marketing_image": creative.get("preview_url", ""),
                "call_to_action_text": creative.get("cta", "Learn More"),
                "business_name": brand_data.get("brand_name", ""),
            })

        return {
            "platform": "google",
            "campaign_name": f"{brand_data.get('brand_name', 'Campaign')} - Responsive Display",
            "campaign_type": "DISPLAY",
            "ads": ads,
            "export_format": "google_ads_json",
        }

    def export_for_tiktok(self, creatives: List[Dict], brand_data: dict) -> Dict:
        """Generate TikTok Ads Manager structure (optimized for video/story format)."""
        ads = []
        # Filter for 9:16 creatives or all
        story_creatives = [c for c in creatives if c.get("aspect_ratio") == "9:16"]
        if not story_creatives:
            story_creatives = creatives[:10]

        for creative in story_creatives[:10]:
            ads.append({
                "ad_name": creative.get("headline", "Ad"),
                "ad_text": creative.get("supporting_copy", ""),
                "call_to_action": creative.get("cta", "Learn More"),
                "identity": brand_data.get("brand_name", ""),
                "image_url": creative.get("preview_url", ""),
                "display_name": brand_data.get("brand_name", ""),
                "landing_page_url": brand_data.get("website_url", ""),
            })

        return {
            "platform": "tiktok",
            "campaign_name": f"{brand_data.get('brand_name', 'Campaign')} - TikTok Ads",
            "objective": "TRAFFIC",
            "ads": ads,
            "export_format": "tiktok_ads_json",
        }

    def generate_export_manifest(
        self,
        creatives: List[Dict],
        brand_data: dict,
        platforms: List[str] = None
    ) -> Dict:
        """Generate complete export manifest for all platforms."""
        if platforms is None:
            platforms = ["meta", "google", "tiktok"]

        exports = {}
        if "meta" in platforms:
            exports["meta"] = self.export_for_meta(creatives, brand_data)
        if "google" in platforms:
            exports["google"] = self.export_for_google(creatives, brand_data)
        if "tiktok" in platforms:
            exports["tiktok"] = self.export_for_tiktok(creatives, brand_data)

        return {
            "brand": brand_data.get("brand_name", ""),
            "total_creatives": len(creatives),
            "exports": exports,
            "formats_available": ["PNG", "JPG", "JSON"],
        }

    def _map_cta_meta(self, cta_text: str) -> str:
        """Map CTA text to Meta Ads CTA type."""
        mapping = {
            "shop now": "SHOP_NOW",
            "learn more": "LEARN_MORE",
            "sign up": "SIGN_UP",
            "get started": "GET_STARTED",
            "book now": "BOOK_TRAVEL",
            "contact us": "CONTACT_US",
            "download": "DOWNLOAD",
            "get quote": "GET_QUOTE",
            "subscribe": "SUBSCRIBE",
            "watch more": "WATCH_MORE",
        }
        lower = cta_text.lower()
        for key, value in mapping.items():
            if key in lower:
                return value
        return "LEARN_MORE"
