"""
MODULE 4 & 5 — AI Creative Generator + AI Copy Generator
Generates 25–50 high-converting ad creatives with copy variations.
"""
import json
import re
import uuid
from typing import List, Dict, Optional
import anthropic
from ..core.config import settings
from .layout_engine import CreativeLayoutEngine

layout_engine = CreativeLayoutEngine()

CREATIVE_GENERATION_PROMPT = """
You are a world-class performance marketing creative director at a top agency.
Your job is to generate {count} high-converting ad creatives for the following brand.

BRAND INTELLIGENCE:
Brand Name: {brand_name}
Industry: {industry}
Category: {category}
Target Audience: {audience}
Value Proposition: {value_proposition}
Tone of Voice: {tone_of_voice}
Emotional Triggers: {emotional_triggers}
Key Differentiators: {differentiators}
Marketing Angles: {marketing_angles}
Ad Hooks: {ad_hooks}

AVAILABLE LAYOUTS: {layouts}

PERFORMANCE MARKETING RULES:
- Headlines MUST be max 6 words — punchy, benefit-driven
- Supporting copy MUST be max 12 words — clear, outcome-focused
- Each creative must use a DIFFERENT emotional trigger
- Use proven direct response psychology: urgency, social proof, transformation, curiosity, fear of missing out
- CTAs must be action-oriented and specific
- Avoid generic phrases like "Learn More" unless combined with benefit
- 30% of creatives should focus on transformation/results
- 25% should use social proof
- 20% should create urgency
- 15% should use curiosity
- 10% should be authority-based

Generate exactly {count} creatives. Return ONLY a valid JSON array.
Each creative must follow this exact structure:
{{
  "creative_id": "unique_id_number",
  "layout_type": "layout name from the available layouts",
  "layout_key": "layout_key from available layouts",
  "visual_concept": "detailed description of the visual (2-3 sentences)",
  "headline": "MAX 6 WORDS — powerful benefit headline",
  "supporting_copy": "MAX 12 WORDS — outcome-focused supporting text",
  "cta": "Action-oriented CTA button text",
  "emotional_trigger": "primary emotion targeted",
  "creative_format": "format_slug",
  "platform": "meta",
  "aspect_ratio": "1:1",
  "marketing_psychology": "which psychological principle this uses",
  "target_audience_segment": "specific audience segment this targets"
}}

Vary the layouts — don't use same layout more than 4 times.
Return ONLY the JSON array, no markdown, no explanation.
"""

COPY_VARIATIONS_PROMPT = """
You are an expert direct response copywriter.
Generate 5 high-converting copy variations for this ad creative.

Brand: {brand_name}
Headline: {headline}
Visual Concept: {visual_concept}
Emotional Trigger: {emotional_trigger}
Target Audience: {audience}
Value Proposition: {value_proposition}

Return a JSON object with EXACTLY this structure:
{{
  "variations": [
    {{
      "variation_id": 1,
      "primary_text": "Full ad copy for feed placement (50-125 words). Conversational, story-driven.",
      "short_headline": "5-word punchy headline",
      "long_headline": "10-word descriptive headline",
      "description": "20-word description for display placement",
      "cta": "CTA button text",
      "hook": "First sentence designed to stop the scroll",
      "performance_score": 0.0-1.0
    }}
  ]
}}

Variation styles: 1=Benefit-led, 2=Story/Testimonial, 3=Question hook, 4=Urgency/Scarcity, 5=Social proof
Return ONLY valid JSON.
"""


class AICreativeGenerator:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def generate_creatives(
        self,
        brand_data: dict,
        count: int = 30,
        platforms: List[str] = None
    ) -> List[Dict]:
        """Generate batch of ad creatives using AI."""
        if platforms is None:
            platforms = ["meta"]

        # Get layouts for this category
        category = brand_data.get("category", "ecommerce")
        layouts = layout_engine.get_layouts_for_category(category, 12)
        layout_names = [f"{l['layout_key']}: {l['layout_name']}" for l in layouts]

        prompt = CREATIVE_GENERATION_PROMPT.format(
            count=count,
            brand_name=brand_data.get("brand_name", "Brand"),
            industry=brand_data.get("industry", ""),
            category=category,
            audience=brand_data.get("audience", ""),
            value_proposition=brand_data.get("value_proposition", ""),
            tone_of_voice=brand_data.get("tone_of_voice", "professional"),
            emotional_triggers=", ".join(brand_data.get("emotional_triggers", [])),
            differentiators=", ".join(brand_data.get("key_differentiators", [])),
            marketing_angles=", ".join(brand_data.get("marketing_angles", [])),
            ad_hooks=", ".join(brand_data.get("ad_hooks", [])),
            layouts="\n".join(layout_names),
        )

        message = self.client.messages.create(
            model="claude-opus-4-6",
            max_tokens=8192,
            messages=[{"role": "user", "content": prompt}]
        )

        raw = message.content[0].text.strip()

        # Parse JSON
        try:
            if "```" in raw:
                raw = re.sub(r"```(?:json)?\n?", "", raw).strip()
            creatives = json.loads(raw)
        except json.JSONDecodeError:
            json_match = re.search(r"\[.*\]", raw, re.DOTALL)
            if json_match:
                creatives = json.loads(json_match.group())
            else:
                creatives = []

        # Enrich with UUIDs and design data
        enriched = []
        for i, creative in enumerate(creatives):
            creative_id = f"cr_{uuid.uuid4().hex[:8]}"
            layout_key = creative.get("layout_key", "product_hero")
            layout_info = layout_engine.get_layout(layout_key)

            enriched_creative = {
                **creative,
                "creative_id": creative_id,
                "design_data": self._generate_design_data(
                    creative, brand_data, layout_info
                ),
            }
            enriched.append(enriched_creative)

        return enriched

    def _generate_design_data(self, creative: dict, brand_data: dict, layout: dict) -> dict:
        """Generate Canva-style design JSON for a creative."""
        colors = brand_data.get("color_palette", ["#2563EB", "#FFFFFF", "#1E1B4B"])
        primary_color = colors[0] if colors else "#2563EB"
        secondary_color = colors[1] if len(colors) > 1 else "#FFFFFF"
        accent_color = colors[2] if len(colors) > 2 else "#7C3AED"

        return {
            "canvas": {
                "width": 1080,
                "height": 1080,
                "background": primary_color,
            },
            "elements": [
                {
                    "id": "bg",
                    "type": "rectangle",
                    "x": 0, "y": 0,
                    "width": 1080, "height": 1080,
                    "fill": primary_color,
                    "layer": 0,
                },
                {
                    "id": "headline",
                    "type": "text",
                    "x": 54, "y": 400,
                    "width": 972, "height": 200,
                    "text": creative.get("headline", ""),
                    "fontSize": 72,
                    "fontWeight": "bold",
                    "color": secondary_color,
                    "textAlign": "center",
                    "layer": 2,
                },
                {
                    "id": "supporting_copy",
                    "type": "text",
                    "x": 54, "y": 600,
                    "width": 972, "height": 100,
                    "text": creative.get("supporting_copy", ""),
                    "fontSize": 36,
                    "fontWeight": "normal",
                    "color": secondary_color,
                    "textAlign": "center",
                    "layer": 2,
                },
                {
                    "id": "cta_button",
                    "type": "button",
                    "x": 340, "y": 750,
                    "width": 400, "height": 70,
                    "text": creative.get("cta", "Learn More"),
                    "backgroundColor": accent_color,
                    "textColor": "#FFFFFF",
                    "borderRadius": 35,
                    "fontSize": 28,
                    "fontWeight": "bold",
                    "layer": 3,
                },
                {
                    "id": "image_placeholder",
                    "type": "image",
                    "x": 0, "y": 0,
                    "width": 1080, "height": 350,
                    "placeholder": creative.get("visual_concept", ""),
                    "objectFit": "cover",
                    "layer": 1,
                },
            ],
            "theme": {
                "primaryColor": primary_color,
                "secondaryColor": secondary_color,
                "accentColor": accent_color,
                "fontFamily": brand_data.get("typography", {}).get("primary_font", "Inter"),
            },
            "format": creative.get("aspect_ratio", "1:1"),
            "layout_key": creative.get("layout_key", "product_hero"),
        }

    async def generate_copy_variations(
        self,
        creative: dict,
        brand_data: dict
    ) -> List[Dict]:
        """Generate 5 copy variations for a single creative."""
        prompt = COPY_VARIATIONS_PROMPT.format(
            brand_name=brand_data.get("brand_name", "Brand"),
            headline=creative.get("headline", ""),
            visual_concept=creative.get("visual_concept", ""),
            emotional_trigger=creative.get("emotional_trigger", ""),
            audience=brand_data.get("audience", ""),
            value_proposition=brand_data.get("value_proposition", ""),
        )

        message = self.client.messages.create(
            model="claude-opus-4-6",
            max_tokens=3000,
            messages=[{"role": "user", "content": prompt}]
        )

        raw = message.content[0].text.strip()
        try:
            if "```" in raw:
                raw = re.sub(r"```(?:json)?\n?", "", raw).strip()
            result = json.loads(raw)
            return result.get("variations", [])
        except Exception:
            return []
