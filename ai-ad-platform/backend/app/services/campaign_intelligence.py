"""
MODULE 9 — Campaign Intelligence Engine
Generates campaign strategy, audience targeting, and media planning.
"""
import json
import re
from typing import Dict, List
import anthropic
from ..core.config import settings


CAMPAIGN_INTELLIGENCE_PROMPT = """
You are a senior performance marketing strategist with expertise in Meta, Google, and TikTok advertising.

Analyze this brand and generate a comprehensive campaign intelligence report.

Brand: {brand_name}
Category: {category}
Audience: {audience}
Value Proposition: {value_proposition}
Emotional Triggers: {emotional_triggers}
Top Creatives: {top_creatives}
Budget: ${budget}
Objective: {objective}
Platform: {platform}

Generate a complete campaign intelligence report as JSON:
{{
  "campaign_strategy": {{
    "primary_objective": "string",
    "campaign_structure": "string - recommended campaign structure",
    "funnel_stages": ["awareness", "consideration", "conversion"],
    "recommended_budget_split": {{
      "awareness": "percentage",
      "consideration": "percentage",
      "conversion": "percentage"
    }}
  }},
  "audience_targeting": {{
    "primary_audience": {{
      "description": "string",
      "age_range": "string",
      "interests": ["array of interest targeting"],
      "behaviors": ["array of behaviors"],
      "lookalike_seed": "string - who to use as lookalike seed"
    }},
    "secondary_audience": {{
      "description": "string",
      "retargeting_type": "string"
    }},
    "excluded_audiences": ["audiences to exclude"]
  }},
  "creative_strategy": {{
    "testing_framework": "A/B or multivariate",
    "creative_rotation": "recommended rotation strategy",
    "top_performing_formats": ["ranked list of format recommendations"],
    "refresh_schedule": "how often to refresh creatives"
  }},
  "media_plan": {{
    "platforms": ["recommended platforms in priority order"],
    "placement_recommendations": ["specific placement recommendations"],
    "bidding_strategy": "recommended bidding approach",
    "daily_budget_recommendation": number,
    "expected_results": {{
      "ctr_range": "X%-Y%",
      "cpc_range": "$X-$Y",
      "roas_target": "X:1"
    }}
  }},
  "ad_schedule": {{
    "best_days": ["days of week"],
    "best_hours": "time range",
    "seasonal_notes": "string"
  }},
  "kpis": [
    {{
      "metric": "string",
      "target": "string",
      "tracking_method": "string"
    }}
  ]
}}

Return ONLY valid JSON.
"""


class CampaignIntelligenceEngine:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def generate_campaign_report(
        self,
        brand_data: dict,
        creatives: List[Dict],
        budget: float = 1000.0,
        objective: str = "conversions",
        platform: str = "meta"
    ) -> Dict:
        """Generate AI-powered campaign intelligence report."""
        # Get top 5 performing creatives
        top_creatives = sorted(
            creatives, key=lambda x: x.get("overall_score", 0), reverse=True
        )[:5]

        top_creative_summary = [
            {
                "headline": c.get("headline"),
                "layout": c.get("layout_type"),
                "emotional_trigger": c.get("emotional_trigger"),
                "score": c.get("overall_score", 0),
            }
            for c in top_creatives
        ]

        prompt = CAMPAIGN_INTELLIGENCE_PROMPT.format(
            brand_name=brand_data.get("brand_name", "Brand"),
            category=brand_data.get("category", "ecommerce"),
            audience=brand_data.get("audience", ""),
            value_proposition=brand_data.get("value_proposition", ""),
            emotional_triggers=", ".join(brand_data.get("emotional_triggers", [])),
            top_creatives=json.dumps(top_creative_summary),
            budget=budget,
            objective=objective,
            platform=platform,
        )

        message = self.client.messages.create(
            model="claude-opus-4-6",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}]
        )

        raw = message.content[0].text.strip()
        try:
            if "```" in raw:
                raw = re.sub(r"```(?:json)?\n?", "", raw).strip()
            return json.loads(raw)
        except Exception:
            return self._fallback_report(brand_data, budget, objective, platform)

    def _fallback_report(
        self, brand_data: dict, budget: float, objective: str, platform: str
    ) -> Dict:
        """Fallback campaign report if AI fails."""
        return {
            "campaign_strategy": {
                "primary_objective": objective,
                "campaign_structure": "Standard campaign with ad set targeting",
                "funnel_stages": ["awareness", "consideration", "conversion"],
                "recommended_budget_split": {
                    "awareness": "20%",
                    "consideration": "30%",
                    "conversion": "50%"
                }
            },
            "audience_targeting": {
                "primary_audience": {
                    "description": brand_data.get("audience", "General audience"),
                    "age_range": "25-54",
                    "interests": [],
                    "behaviors": [],
                },
            },
            "media_plan": {
                "platforms": [platform],
                "bidding_strategy": "Lowest cost",
                "daily_budget_recommendation": budget / 30,
                "expected_results": {
                    "ctr_range": "1%-3%",
                    "cpc_range": "$0.50-$2.00",
                    "roas_target": "3:1"
                }
            },
            "kpis": [
                {"metric": "CTR", "target": "2%+", "tracking_method": "Platform analytics"},
                {"metric": "ROAS", "target": "3:1", "tracking_method": "Conversion tracking"},
            ]
        }
