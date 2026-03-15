"""
MODULE 3 — Creative Layout Engine
Generates Canva-style creative templates based on industry and brand.
"""
from typing import List, Dict

LAYOUT_LIBRARY = {
    "before_after": {
        "layout_name": "Before / After Transformation",
        "visual_structure": "Split screen: left = problem state, right = solution state",
        "design_guidelines": "High contrast split. Left side muted/desaturated. Right side vibrant. Arrow or divider in center.",
        "best_for": ["healthcare", "beauty", "fitness", "clinic"],
        "emotional_trigger": "hope",
        "copy_template": {"headline": "From [Problem] to [Result]", "cta": "See How"},
    },
    "product_hero": {
        "layout_name": "Product Hero Spotlight",
        "visual_structure": "Large product image centered. Brand colors as background. Benefit text overlay.",
        "design_guidelines": "Product takes 60% of frame. Clean background. Bold typography.",
        "best_for": ["ecommerce", "beauty", "food_beverage", "technology"],
        "emotional_trigger": "desire",
        "copy_template": {"headline": "[Product] — [Key Benefit]", "cta": "Shop Now"},
    },
    "testimonial_proof": {
        "layout_name": "Testimonial Social Proof",
        "visual_structure": "Customer photo + star rating + quote. Brand logo in corner.",
        "design_guidelines": "Authentic customer image. 5 stars prominent. Quote in quotation marks. Trust-building colors.",
        "best_for": ["ecommerce", "saas", "healthcare", "education", "clinic"],
        "emotional_trigger": "trust",
        "copy_template": {"headline": '"[Customer Quote]"', "cta": "Join [X]+ Customers"},
    },
    "expert_authority": {
        "layout_name": "Expert Authority",
        "visual_structure": "Professional photo of expert/founder. Credentials badge. Quote overlay.",
        "design_guidelines": "Professional dark background. Gold or brand accent. Certificate/badge graphic.",
        "best_for": ["healthcare", "clinic", "finance", "education", "saas"],
        "emotional_trigger": "authority",
        "copy_template": {"headline": "Trusted by [Credential]", "cta": "Learn More"},
    },
    "problem_solution": {
        "layout_name": "Problem → Solution",
        "visual_structure": "Two-panel: pain point icon/image → solution with product",
        "design_guidelines": "Red/orange for problem, green/blue for solution. Arrow connecting both.",
        "best_for": ["saas", "fitness", "healthcare", "local_services"],
        "emotional_trigger": "relief",
        "copy_template": {"headline": "Stop [Problem]. Start [Solution].", "cta": "Get Started"},
    },
    "product_grid": {
        "layout_name": "Product Grid",
        "visual_structure": "2x2 or 3x3 product grid. Prices below. Brand colors border.",
        "design_guidelines": "Consistent product photography. Clean grid lines. Price tags.",
        "best_for": ["ecommerce", "fashion", "beauty", "food_beverage"],
        "emotional_trigger": "variety",
        "copy_template": {"headline": "Shop Our Best Sellers", "cta": "View All"},
    },
    "limited_offer": {
        "layout_name": "Limited Time Offer",
        "visual_structure": "Bold discount badge. Countdown visual. Urgency colors (red/orange).",
        "design_guidelines": "High urgency red/orange palette. Large discount percentage. Timer visual.",
        "best_for": ["ecommerce", "fashion", "travel", "local_services"],
        "emotional_trigger": "urgency",
        "copy_template": {"headline": "[X]% OFF — Ends Soon", "cta": "Claim Deal"},
    },
    "comparison": {
        "layout_name": "Comparison Visual",
        "visual_structure": "Side-by-side: competitor vs brand. Check/X marks. Winner highlighted.",
        "design_guidelines": "Competitor side faded/grey. Brand side bright. Green checkmarks for brand.",
        "best_for": ["saas", "technology", "healthcare", "finance"],
        "emotional_trigger": "superiority",
        "copy_template": {"headline": "Why [Brand] Wins", "cta": "Compare Now"},
    },
    "lifestyle_benefit": {
        "layout_name": "Lifestyle Benefit",
        "visual_structure": "Aspirational lifestyle photo. Benefit overlay. Soft brand colors.",
        "design_guidelines": "High-quality lifestyle photography. Warm tones. Aspirational feel.",
        "best_for": ["fitness", "beauty", "travel", "fashion", "food_beverage"],
        "emotional_trigger": "aspiration",
        "copy_template": {"headline": "Live [Dream Outcome]", "cta": "Start Today"},
    },
    "statistic_proof": {
        "layout_name": "Statistic Proof",
        "visual_structure": "Bold large statistic centered. Supporting data below. Graph/chart visual.",
        "design_guidelines": "Large bold number (72px+). Minimal design. Data-forward look.",
        "best_for": ["saas", "healthcare", "finance", "education"],
        "emotional_trigger": "credibility",
        "copy_template": {"headline": "[X]% [Positive Result]", "cta": "See Data"},
    },
    "step_by_step": {
        "layout_name": "Step-by-Step Process",
        "visual_structure": "3-step numbered visual. Icons for each step. Arrow flow.",
        "design_guidelines": "Clean numbered circles. Brand color progression. Simple icons.",
        "best_for": ["saas", "education", "local_services", "fitness"],
        "emotional_trigger": "simplicity",
        "copy_template": {"headline": "[Result] in 3 Simple Steps", "cta": "Start Free"},
    },
    "social_proof_count": {
        "layout_name": "Social Proof Count",
        "visual_structure": "Large customer count + logos of known brands/press. Trust badges.",
        "design_guidelines": "Logo grid. Large number with plus sign. Press logos in grey.",
        "best_for": ["saas", "ecommerce", "finance", "education"],
        "emotional_trigger": "belonging",
        "copy_template": {"headline": "Join [X,000]+ Happy Customers", "cta": "Join Free"},
    },
}

CATEGORY_LAYOUT_MAP = {
    "ecommerce": ["product_hero", "product_grid", "limited_offer", "testimonial_proof", "lifestyle_benefit", "social_proof_count"],
    "beauty": ["before_after", "product_hero", "lifestyle_benefit", "testimonial_proof", "product_grid", "limited_offer"],
    "healthcare": ["before_after", "expert_authority", "testimonial_proof", "statistic_proof", "step_by_step", "social_proof_count"],
    "clinic": ["before_after", "expert_authority", "testimonial_proof", "statistic_proof", "problem_solution", "step_by_step"],
    "saas": ["problem_solution", "comparison", "statistic_proof", "step_by_step", "social_proof_count", "testimonial_proof"],
    "finance": ["statistic_proof", "comparison", "expert_authority", "social_proof_count", "testimonial_proof", "problem_solution"],
    "education": ["step_by_step", "testimonial_proof", "statistic_proof", "social_proof_count", "lifestyle_benefit", "before_after"],
    "fitness": ["before_after", "lifestyle_benefit", "testimonial_proof", "step_by_step", "statistic_proof", "limited_offer"],
    "real_estate": ["lifestyle_benefit", "testimonial_proof", "expert_authority", "statistic_proof", "product_hero", "social_proof_count"],
    "local_services": ["testimonial_proof", "expert_authority", "step_by_step", "problem_solution", "social_proof_count", "limited_offer"],
    "fashion": ["product_hero", "lifestyle_benefit", "product_grid", "limited_offer", "social_proof_count", "testimonial_proof"],
    "food_beverage": ["product_hero", "lifestyle_benefit", "product_grid", "testimonial_proof", "limited_offer", "social_proof_count"],
    "travel": ["lifestyle_benefit", "limited_offer", "testimonial_proof", "product_hero", "social_proof_count", "statistic_proof"],
    "automotive": ["before_after", "comparison", "lifestyle_benefit", "statistic_proof", "expert_authority", "testimonial_proof"],
    "technology": ["comparison", "statistic_proof", "step_by_step", "problem_solution", "social_proof_count", "expert_authority"],
}


class CreativeLayoutEngine:
    def get_layouts_for_category(self, category: str, count: int = 8) -> List[Dict]:
        """Returns best layout templates for a given category."""
        layout_keys = CATEGORY_LAYOUT_MAP.get(category, list(LAYOUT_LIBRARY.keys()))

        layouts = []
        for key in layout_keys[:count]:
            if key in LAYOUT_LIBRARY:
                layout = {**LAYOUT_LIBRARY[key], "layout_key": key}
                layouts.append(layout)

        # Fill with remaining layouts if needed
        if len(layouts) < count:
            for key, layout in LAYOUT_LIBRARY.items():
                if key not in layout_keys and len(layouts) < count:
                    layouts.append({**layout, "layout_key": key})

        return layouts[:count]

    def get_all_layouts(self) -> Dict:
        return LAYOUT_LIBRARY

    def get_layout(self, layout_key: str) -> Dict:
        return LAYOUT_LIBRARY.get(layout_key, {})
