export interface Brand {
  id: number
  brand_name: string
  industry: string
  category: string
  audience: string
  tone_of_voice: string
  value_proposition: string
  color_palette: string[]
  typography: { primary_font?: string; style?: string }
  emotional_triggers: string[]
  products: string[]
  testimonials: string[]
  pricing_positioning: string
  key_differentiators: string[]
  marketing_angles: string[]
  ad_hooks: string[]
  logo_url?: string
  website_url: string
  analysis_status: string
}

export interface Creative {
  id?: number
  creative_id: string
  layout_type: string
  layout_key?: string
  visual_concept: string
  headline: string
  supporting_copy: string
  cta: string
  emotional_trigger: string
  creative_format: string
  aspect_ratio: string
  platform: string
  copy_variations?: CopyVariation[]
  predicted_ctr: number
  engagement_score: number
  scroll_stop_score: number
  emotional_impact_score: number
  overall_score: number
  performance_rank: number
  winning_elements?: string[]
  improvement_suggestions?: string[]
  design_data?: DesignData
  preview_url?: string
  status: string
  is_favorite: boolean
  created_at?: string
  marketing_psychology?: string
  target_audience_segment?: string
}

export interface CopyVariation {
  variation_id: number
  primary_text: string
  short_headline: string
  long_headline: string
  description: string
  cta: string
  hook: string
  performance_score: number
}

export interface DesignData {
  canvas: { width: number; height: number; background: string }
  elements: DesignElement[]
  theme: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fontFamily: string
  }
  format: string
  layout_key: string
}

export interface DesignElement {
  id: string
  type: "text" | "image" | "rectangle" | "button" | "shape"
  x: number
  y: number
  width: number
  height: number
  text?: string
  fontSize?: number
  fontWeight?: string
  color?: string
  textAlign?: string
  fill?: string
  backgroundColor?: string
  textColor?: string
  borderRadius?: number
  placeholder?: string
  objectFit?: string
  layer: number
}

export interface Layout {
  layout_key: string
  layout_name: string
  visual_structure: string
  design_guidelines: string
  best_for: string[]
  emotional_trigger: string
}

export interface Campaign {
  id: number
  brand_id: number
  name: string
  objective: string
  platform: string
  budget: number
  status: string
  intelligence_report?: CampaignReport
  created_at: string
}

export interface CampaignReport {
  campaign_strategy: object
  audience_targeting: object
  creative_strategy: object
  media_plan: object
  kpis: object[]
}

export interface Asset {
  id: number
  brand_id: number
  name: string
  asset_type: string
  file_url: string
  thumbnail_url?: string
  file_size: number
  mime_type: string
  tags: string[]
}
