"""
MODULE 1 & 2 — Brand Intelligence Engine + Category Detection
Crawls a brand website and uses Claude AI to extract brand DNA.
"""
import httpx
import re
import json
from typing import Optional
from bs4 import BeautifulSoup
import anthropic
from ..core.config import settings


CATEGORY_PROMPT = """
Analyze this brand and classify it into ONE category from the following list:
ecommerce, beauty, healthcare, clinic, saas, finance, education, fitness, real_estate, local_services, fashion, food_beverage, travel, automotive, technology

Return ONLY the category slug (lowercase, underscore). No explanation.
"""

BRAND_ANALYSIS_PROMPT = """
You are a world-class brand strategist and performance marketer.
Analyze the following website content and extract complete brand intelligence.

Website URL: {url}
Website Content:
{content}

Return a detailed JSON object with EXACTLY this structure:
{{
  "brand_name": "string - the brand name",
  "industry": "string - the industry sector",
  "category": "string - one of: ecommerce, beauty, healthcare, clinic, saas, finance, education, fitness, real_estate, local_services, fashion, food_beverage, travel, automotive, technology",
  "audience": "string - detailed target audience description",
  "tone_of_voice": "string - brand tone (e.g. professional, playful, authoritative, warm, bold)",
  "value_proposition": "string - core value proposition in 1-2 sentences",
  "color_palette": ["array of hex color codes identified from the site, max 6"],
  "typography": {{"primary_font": "string", "style": "string - serif/sans-serif/display"}},
  "emotional_triggers": ["array of 3-6 emotional triggers the brand uses"],
  "products": ["array of main products/services offered"],
  "testimonials": ["array of any testimonials or social proof found"],
  "pricing_positioning": "string - budget/mid-range/premium/luxury",
  "key_differentiators": ["array of what makes this brand unique"],
  "marketing_angles": ["array of 5-8 proven marketing angles for this brand"],
  "ad_hooks": ["array of 5 powerful ad hooks for this brand"]
}}

Be specific and accurate based on the actual website content.
Return ONLY valid JSON, no markdown, no explanation.
"""


class BrandIntelligenceEngine:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def crawl_website(self, url: str) -> dict:
        """Crawl a website and extract text content, colors, and metadata."""
        if not url.startswith(("http://", "https://")):
            url = "https://" + url

        headers = {
            "User-Agent": "Mozilla/5.0 (compatible; AIAdBot/1.0; brand analysis)"
        }

        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            response = await client.get(url, headers=headers)
            html = response.text

        soup = BeautifulSoup(html, "html.parser")

        # Remove scripts and styles
        for tag in soup(["script", "style", "nav", "footer"]):
            tag.decompose()

        # Extract text content
        text = soup.get_text(separator=" ", strip=True)
        text = re.sub(r"\s+", " ", text)[:8000]  # Limit to 8k chars

        # Extract meta info
        title = soup.find("title")
        description = soup.find("meta", attrs={"name": "description"})
        og_image = soup.find("meta", attrs={"property": "og:image"})

        # Extract colors from inline styles and stylesheets
        colors = self._extract_colors(html)

        # Extract headings for brand messaging
        headings = []
        for tag in soup.find_all(["h1", "h2", "h3"])[:10]:
            h = tag.get_text(strip=True)
            if h:
                headings.append(h)

        return {
            "url": url,
            "title": title.get_text(strip=True) if title else "",
            "description": description.get("content", "") if description else "",
            "og_image": og_image.get("content", "") if og_image else "",
            "text_content": text,
            "headings": headings,
            "colors": colors,
        }

    def _extract_colors(self, html: str) -> list:
        """Extract hex color codes from HTML/CSS."""
        hex_pattern = r"#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b"
        colors = list(set(re.findall(hex_pattern, html)))
        # Normalize to 6 digits
        normalized = []
        for c in colors[:20]:
            if len(c) == 3:
                c = "".join([x * 2 for x in c])
            normalized.append(f"#{c.upper()}")
        # Filter out pure black/white
        filtered = [c for c in normalized if c not in ("#000000", "#FFFFFF", "#FEFEFE", "#FFFFFE")]
        return filtered[:6]

    async def analyze_brand(self, url: str) -> dict:
        """Full brand intelligence analysis pipeline."""
        # Step 1: Crawl
        crawl_data = await self.crawl_website(url)

        # Step 2: Build context for AI
        context = f"""
Title: {crawl_data['title']}
Meta Description: {crawl_data['description']}
Key Headlines: {' | '.join(crawl_data['headings'])}
Page Content: {crawl_data['text_content'][:5000]}
Colors Found: {', '.join(crawl_data['colors'])}
"""

        # Step 3: AI Analysis
        prompt = BRAND_ANALYSIS_PROMPT.format(url=url, content=context)

        message = self.client.messages.create(
            model="claude-opus-4-6",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}]
        )

        raw_response = message.content[0].text.strip()

        # Parse JSON response
        try:
            # Remove potential markdown code blocks
            if "```" in raw_response:
                raw_response = re.sub(r"```(?:json)?\n?", "", raw_response).strip()
            brand_data = json.loads(raw_response)
        except json.JSONDecodeError:
            # Fallback: extract JSON from response
            json_match = re.search(r"\{.*\}", raw_response, re.DOTALL)
            if json_match:
                brand_data = json.loads(json_match.group())
            else:
                raise ValueError("Failed to parse AI brand analysis response")

        # Merge crawl data
        if not brand_data.get("color_palette") and crawl_data["colors"]:
            brand_data["color_palette"] = crawl_data["colors"]
        if not brand_data.get("color_palette"):
            brand_data["color_palette"] = ["#2563EB", "#7C3AED", "#059669", "#DC2626"]

        brand_data["logo_url"] = crawl_data.get("og_image", "")
        brand_data["website_url"] = url
        brand_data["raw_crawl"] = {
            "title": crawl_data["title"],
            "headings": crawl_data["headings"],
        }

        return brand_data
