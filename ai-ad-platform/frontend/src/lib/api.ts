import axios from "axios"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 120000,
})

// Brand Intelligence API
export const brandAPI = {
  analyze: (websiteUrl: string, userId = "default") =>
    api.post("/brands/analyze", { website_url: websiteUrl, user_id: userId }),
  list: (userId = "default") => api.get(`/brands/?user_id=${userId}`),
  get: (brandId: number) => api.get(`/brands/${brandId}`),
  delete: (brandId: number) => api.delete(`/brands/${brandId}`),
}

// Creative API
export const creativeAPI = {
  generate: (brandId: number, count = 30, platforms = ["meta"], generateCopy = true) =>
    api.post("/creatives/generate", {
      brand_id: brandId,
      count,
      platforms,
      generate_copy: generateCopy,
    }),
  list: (params?: {
    brand_id?: number
    platform?: string
    sort_by?: string
    limit?: number
    offset?: number
  }) => api.get("/creatives/", { params }),
  get: (creativeId: string) => api.get(`/creatives/${creativeId}`),
  update: (creativeId: string, data: object) =>
    api.patch(`/creatives/${creativeId}`, data),
  export: (creativeId: string, platforms: string[]) =>
    api.post(`/creatives/${creativeId}/export`, null, { params: { platforms } }),
  delete: (creativeId: string) => api.delete(`/creatives/${creativeId}`),
}

// Templates API
export const templateAPI = {
  list: (category?: string) =>
    api.get("/templates/", { params: { category } }),
  categories: () => api.get("/templates/categories"),
  get: (layoutKey: string) => api.get(`/templates/${layoutKey}`),
}

// Campaign API
export const campaignAPI = {
  generateIntelligence: (
    brandId: number,
    objective = "conversions",
    platform = "meta",
    budget = 1000
  ) =>
    api.post("/campaigns/generate-intelligence", null, {
      params: { brand_id: brandId, objective, platform, budget },
    }),
  list: (brandId?: number) =>
    api.get("/campaigns/", { params: { brand_id: brandId } }),
  export: (campaignId: number, platforms: string[]) =>
    api.post(`/campaigns/${campaignId}/export`, null, { params: { platforms } }),
}

// Asset API
export const assetAPI = {
  upload: (brandId: number, assetType: string, file: File) => {
    const form = new FormData()
    form.append("brand_id", String(brandId))
    form.append("asset_type", assetType)
    form.append("file", file)
    return api.post("/assets/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
  list: (brandId?: number, assetType?: string) =>
    api.get("/assets/", { params: { brand_id: brandId, asset_type: assetType } }),
  delete: (assetId: number) => api.delete(`/assets/${assetId}`),
}
