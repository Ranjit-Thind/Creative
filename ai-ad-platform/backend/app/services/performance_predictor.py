"""
MODULE 6 — Creative Performance Prediction Engine
Predicts CTR, engagement, scroll-stop score, and emotional impact.
Ranks creatives from best to worst performer.
"""
import json
import re
from typing import List, Dict
import anthropic
from ..core.config import settings


PERFORMANCE_PREDICTION_PROMPT = """
You are a performance marketing AI trained on millions of ad campaigns.
Analyze these ad creatives and predict their performance metrics.

Brand: {brand_name}
Target Audience: {audience}
Platform: {platform}

Creatives to analyze:
{creatives_json}

For each creative, predict these metrics based on:
- Headline power (specificity, emotional pull, curiosity gap)
- Visual concept strength (scroll-stopping potential)
- CTA effectiveness (clarity, urgency, benefit)
- Emotional trigger alignment with audience
- Layout type historical performance for this category
- Copy clarity and benefit communication

Return a JSON array with performance scores for each creative:
[
  {{
    "creative_id": "same creative_id",
    "predicted_ctr": 0.0-10.0 (percentage, typical range 1-5%),
    "engagement_score": 0.0-10.0,
    "scroll_stop_score": 0.0-10.0,
    "emotional_impact_score": 0.0-10.0,
    "overall_score": 0.0-10.0,
    "performance_rank": 1-N,
    "winning_elements": ["what makes this creative strong"],
    "improvement_suggestions": ["what could be improved"]
  }}
]

Sort by overall_score descending. Be analytical and differentiated — don't give all creatives the same scores.
Return ONLY valid JSON array.
"""


# Scoring weights for heuristic fallback
LAYOUT_BASE_SCORES = {
    "before_after": 7.8,
    "testimonial_proof": 7.5,
    "limited_offer": 7.2,
    "problem_solution": 7.0,
    "social_proof_count": 6.8,
    "product_hero": 6.5,
    "comparison": 6.5,
    "statistic_proof": 6.3,
    "lifestyle_benefit": 6.2,
    "expert_authority": 6.0,
    "step_by_step": 5.8,
    "product_grid": 5.5,
}

EMOTIONAL_TRIGGER_SCORES = {
    "urgency": 8.5,
    "fear": 8.0,
    "hope": 7.8,
    "trust": 7.5,
    "desire": 7.3,
    "curiosity": 7.0,
    "pride": 6.8,
    "relief": 6.5,
    "aspiration": 6.3,
    "belonging": 6.0,
    "authority": 5.8,
    "credibility": 5.5,
    "simplicity": 5.2,
    "variety": 5.0,
    "superiority": 6.0,
}


class PerformancePredictor:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def predict_batch(
        self,
        creatives: List[Dict],
        brand_data: dict,
        use_ai: bool = True
    ) -> List[Dict]:
        """Predict performance for a batch of creatives and rank them."""

        if use_ai and len(creatives) <= 30:
            try:
                return await self._ai_predict(creatives, brand_data)
            except Exception:
                pass

        # Fallback to heuristic scoring
        return self._heuristic_predict(creatives)

    async def _ai_predict(self, creatives: List[Dict], brand_data: dict) -> List[Dict]:
        """Use AI to predict creative performance."""
        # Summarize creatives for the prompt
        simplified = [
            {
                "creative_id": c.get("creative_id"),
                "layout_type": c.get("layout_type"),
                "layout_key": c.get("layout_key"),
                "headline": c.get("headline"),
                "supporting_copy": c.get("supporting_copy"),
                "cta": c.get("cta"),
                "emotional_trigger": c.get("emotional_trigger"),
                "visual_concept": c.get("visual_concept", "")[:100],
            }
            for c in creatives
        ]

        prompt = PERFORMANCE_PREDICTION_PROMPT.format(
            brand_name=brand_data.get("brand_name", "Brand"),
            audience=brand_data.get("audience", ""),
            platform=brand_data.get("platform", "meta"),
            creatives_json=json.dumps(simplified, indent=2),
        )

        message = self.client.messages.create(
            model="claude-opus-4-6",
            max_tokens=6000,
            messages=[{"role": "user", "content": prompt}]
        )

        raw = message.content[0].text.strip()
        try:
            if "```" in raw:
                raw = re.sub(r"```(?:json)?\n?", "", raw).strip()
            predictions = json.loads(raw)
        except Exception:
            return self._heuristic_predict(creatives)

        # Merge predictions back into creatives
        pred_map = {p["creative_id"]: p for p in predictions}
        result = []
        for creative in creatives:
            cid = creative.get("creative_id")
            pred = pred_map.get(cid, {})
            result.append({
                **creative,
                "predicted_ctr": pred.get("predicted_ctr", 2.5),
                "engagement_score": pred.get("engagement_score", 5.0),
                "scroll_stop_score": pred.get("scroll_stop_score", 5.0),
                "emotional_impact_score": pred.get("emotional_impact_score", 5.0),
                "overall_score": pred.get("overall_score", 5.0),
                "performance_rank": pred.get("performance_rank", 0),
                "winning_elements": pred.get("winning_elements", []),
                "improvement_suggestions": pred.get("improvement_suggestions", []),
            })

        return sorted(result, key=lambda x: x.get("overall_score", 0), reverse=True)

    def _heuristic_predict(self, creatives: List[Dict]) -> List[Dict]:
        """Fallback heuristic scoring when AI is unavailable."""
        scored = []
        for creative in creatives:
            layout_key = creative.get("layout_key", "product_hero")
            emotional_trigger = creative.get("emotional_trigger", "desire").lower()
            headline = creative.get("headline", "")

            # Base score from layout
            base = LAYOUT_BASE_SCORES.get(layout_key, 5.5)

            # Emotional trigger bonus
            emotion_bonus = (EMOTIONAL_TRIGGER_SCORES.get(emotional_trigger, 5.0) - 5.0) * 0.3

            # Headline word count (6 words = max points)
            word_count = len(headline.split())
            headline_bonus = max(0, (6 - abs(word_count - 5)) * 0.2)

            overall = round(min(10.0, base + emotion_bonus + headline_bonus), 2)
            predicted_ctr = round(overall * 0.35 + 1.0, 2)

            scored.append({
                **creative,
                "predicted_ctr": predicted_ctr,
                "engagement_score": round(overall * 0.95 + 0.5, 2),
                "scroll_stop_score": round(overall * 1.05 - 0.5, 2),
                "emotional_impact_score": round(EMOTIONAL_TRIGGER_SCORES.get(emotional_trigger, 5.0), 2),
                "overall_score": overall,
                "winning_elements": [],
                "improvement_suggestions": [],
            })

        # Sort and rank
        scored.sort(key=lambda x: x["overall_score"], reverse=True)
        for i, item in enumerate(scored):
            item["performance_rank"] = i + 1

        return scored
