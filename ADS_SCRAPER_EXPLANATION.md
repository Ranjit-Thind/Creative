# Ads Scraper Repositories — Beginner's Guide

This document explains two GitHub repositories that scrape Meta's Ads Library.

---

## Repo 1: `JOBOYA/ads-library`

A full-stack app to scrape and browse Meta Ads Library data — like a simplified version of [Atria](https://www.useatria.com/). Built with Node.js, React, GraphQL, and PostgreSQL.

### Architecture at a Glance

```
User Browser
    ↓
React Frontend  ←→  Apollo GraphQL API  ←→  PostgreSQL Database
                                                  ↑
                                            Scraper Worker
                                          (Playwright/Node.js)
```

---

### 1. Main Scraper Logic

**File:** `scraper/src/scraper.js`

Three exported functions do all the work:

| Function | What it does |
|---|---|
| `scrapeAds(keyword, country, limit)` | Main function — launches a browser, goes to Meta's Ads Library, scrolls to load ads, extracts data, saves to DB |
| `extractAdsFromPage()` | Runs inside the browser to parse the page DOM and pull out ad details |
| `scrapeBatch(keywords[])` | Runs `scrapeAds()` for multiple keywords, one at a time with 5-second pauses between each |

**Entry point:** `scraper/src/index.js`

```js
// Called from command line:
// node index.js "Nike" "US"
const keyword = process.argv[2] || "Nike";
const country = process.argv[3] || "ALL";

scrapeAds(keyword, country, 50);
```

---

### 2. How Ads Are Fetched

The scraper uses **Playwright** (a browser automation library) to control a real Chromium browser — just like a human would use it.

**Step-by-step:**

1. Launch a headless (invisible) Chromium browser
2. Navigate to Meta's Ads Library URL:
   ```
   https://www.facebook.com/ads/library/
     ?active_status=all
     &ad_type=all
     &country=US
     &q=Nike
     &media_type=all
   ```
3. Handle cookie consent dialogs automatically
4. **Scroll the page up to 10 times** to load more ads (Meta uses "infinite scroll")
5. Extract ad data from the loaded HTML

**Why a real browser?** Meta's Ads Library is a JavaScript-heavy page. A plain HTTP request wouldn't work — you need a real browser to run the JavaScript and render the ads.

---

### 3. API Calls

The scraper does **not** call a Meta API directly. Instead it uses browser automation to scrape the public web interface.

However, the **GraphQL API layer** exposes these queries/mutations for the frontend:

```graphql
# Queries (read data)
query { ads(brand: "Nike", country: "US") { ... } }
query { stats { totalAds, activeCampaigns, platformDistribution } }

# Mutations (write/trigger actions)
mutation { createScrapingTask(keyword: "Nike") }
```

The GraphQL server is built with **Apollo Server 4** and runs on port `4000`.

---

### 4. Required Environment Variables

**File:** `.env.example`

```env
# PostgreSQL database connection string
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ads_library

# Port for the GraphQL API server
PORT=4000

# URL the React frontend uses to talk to the API
VITE_API_URL=http://localhost:4000
```

> Copy `.env.example` to `.env` and fill in your values before running.

---

### 5. Where Results Are Returned

The scraped data flows like this:

```
Playwright scrapes page
    ↓
extractAdsFromPage() returns JS objects with:
  - libraryId     (unique ad ID)
  - advertiserName
  - adText
  - imageUrls[]
  - videoSrcs[]
  - destinationUrl
  - cta           (call-to-action button text)
  - startDate
  - platforms[]   (Facebook, Instagram, etc.)
    ↓
getOrCreateAdvertiser() → saves advertiser to PostgreSQL
saveAd()               → saves ad to PostgreSQL
    ↓
GraphQL API serves data to React frontend
    ↓
User sees ads in browser with filters and stats
```

---

---

## Repo 2: `ayalbson/meta-ads-library-apify-ads-transparency-scraper`

A Python scraper built to run on the **Apify** cloud platform. It collects Meta ads by keyword and enriches them with transparency metadata (who paid for the ad, who it targeted, etc.).

### Architecture at a Glance

```
Apify Platform runs the Actor
    ↓
Python script searches Meta Ads Library by keyword
    ↓
For each ad found → visit detail page → extract transparency info
    ↓
Output: JSON file with 25+ fields per ad
```

---

### 1. Main Scraper Logic

**File structure:**
```
src/
├── main.py / actor.py      ← Entry point, orchestrates everything
├── extractors/             ← Parse search results & detail pages
├── services/
│   ├── api_client.py       ← Makes requests to Meta Ads Library
│   └── enrichment.py       ← Adds transparency data
├── utils/
│   ├── logging.py
│   ├── throttling.py       ← Rate limiting (don't hit Meta too fast)
│   └── time.py
└── config/
    └── settings.py         ← Configuration & env vars
```

**Main flow:**
1. Read input config (keyword + country)
2. Search Meta Ads Library for matching ads (with pagination)
3. For each ad found → visit its detail page
4. Extract transparency metadata
5. Write all results to Apify's key-value store as JSON

---

### 2. How Ads Are Fetched

The scraper calls **Meta's Ads Library API** (a public endpoint) with search parameters:

```
GET https://www.facebook.com/ads/library/
  ?q=Sisters+Republic
  &country=FR
  &active_status=all
  &ad_type=all
```

**Pagination handling:** Meta shows ads in pages. The scraper automatically follows "next page" links until all results are collected.

**Detail page enrichment:** After finding an ad in search results, it visits `https://www.facebook.com/ads/library/?id=<AD_ID>` to get deeper transparency info that isn't shown in the list view.

**Rate limiting:** The `throttling.py` utility adds delays between requests to avoid being blocked by Meta.

---

### 3. API Calls

| Call | Purpose |
|---|---|
| `GET /ads/library/?q=...` | Search for ads by keyword |
| `GET /ads/library/?id=<AD_ID>` | Get individual ad transparency details |

No authentication token is required — Meta's Ads Library is publicly accessible. However, aggressive scraping may trigger rate limits or CAPTCHAs.

**Apify API** (platform-level):
- The actor reads its input config from Apify's input API
- Writes output to Apify's dataset/key-value store via the Apify SDK

---

### 4. Required Environment Variables / Config

**Apify Input (configured in `apify.json`):**

```json
{
  "keyword": "Sisters Republic",
  "country": "FR"
}
```

These are set in the Apify console when running the actor — no `.env` file needed when deployed on Apify.

**For local development** (likely in `src/config/settings.py`):
```env
APIFY_TOKEN=your_apify_api_token
KEYWORD=Sisters Republic
COUNTRY_CODE=FR
```

---

### 5. Where Results Are Returned

Each scraped ad becomes one JSON record with 25+ fields:

```json
{
  "ad_id": "123456789",
  "page_id": "987654321",
  "page_name": "Sisters Republic",
  "body": "Ad copy text here...",
  "link_title": "Shop Now",
  "description": "Product description",
  "sponsor_name": "Sisters Republic",
  "funding_entity": "Sisters Republic SARL",
  "age_range": "18-65+",
  "gender": "female",
  "platforms": ["facebook", "instagram"],
  "regions": ["FR"],
  "impressions_range": "1000-5000",
  "spend_range": "100-499 EUR",
  "delivery_start": "2024-01-15",
  "delivery_end": null,
  "page_category": "Clothing",
  "query": "Sisters Republic",
  "country_code": "FR",
  "scrape_timestamp": "2024-03-16T10:00:00Z"
}
```

**Output destinations:**
- **Apify Dataset** — structured rows, viewable in the Apify console
- **Key-Value Store** — JSON file download
- **Webhook** — can push results to an external URL when the run finishes

---

## Side-by-Side Comparison

| Feature | JOBOYA/ads-library | ayalbson/meta-scraper |
|---|---|---|
| Language | JavaScript (Node.js) | Python |
| Scraping method | Playwright (real browser) | HTTP requests + pagination |
| Output | PostgreSQL database | JSON file / Apify dataset |
| Frontend | Yes (React + GraphQL) | No (data pipeline only) |
| Platform | Self-hosted (Docker) | Apify cloud |
| Authentication | None needed | Apify account |
| Env vars | `DATABASE_URL`, `PORT`, `VITE_API_URL` | `keyword`, `country` via Apify input |
| Best for | Building an ad browsing UI | Bulk data collection / analytics |
