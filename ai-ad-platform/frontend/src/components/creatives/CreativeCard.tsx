"use client"
import { useState } from "react"
import { Creative } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, getScoreBg } from "@/lib/utils"
import {
  Edit3, Heart, Download, MoreHorizontal, Star,
  TrendingUp, Eye, MousePointerClick, Zap
} from "lucide-react"

interface CreativeCardProps {
  creative: Creative
  onEdit?: (creative: Creative) => void
  onFavorite?: (creativeId: string, isFavorite: boolean) => void
  onExport?: (creative: Creative) => void
}

const LAYOUT_GRADIENTS: Record<string, string> = {
  before_after: "from-orange-600 via-red-600 to-pink-600",
  product_hero: "from-blue-600 via-indigo-600 to-violet-600",
  testimonial_proof: "from-emerald-600 via-teal-600 to-cyan-600",
  expert_authority: "from-amber-600 via-yellow-600 to-orange-600",
  problem_solution: "from-red-600 via-rose-600 to-pink-600",
  product_grid: "from-violet-600 via-purple-600 to-indigo-600",
  limited_offer: "from-red-600 via-orange-600 to-yellow-600",
  comparison: "from-cyan-600 via-blue-600 to-indigo-600",
  lifestyle_benefit: "from-pink-600 via-rose-600 to-red-600",
  statistic_proof: "from-indigo-600 via-blue-600 to-cyan-600",
  step_by_step: "from-teal-600 via-emerald-600 to-green-600",
  social_proof_count: "from-purple-600 via-violet-600 to-indigo-600",
}

export default function CreativeCard({
  creative, onEdit, onFavorite, onExport
}: CreativeCardProps) {
  const [isFav, setIsFav] = useState(creative.is_favorite)
  const [showDetails, setShowDetails] = useState(false)

  const gradient = LAYOUT_GRADIENTS[creative.layout_key || "product_hero"]
    || "from-violet-600 via-indigo-600 to-blue-600"

  const overallScore = creative.overall_score || 0
  const scoreBg = getScoreBg(overallScore)
  const colors = creative.design_data?.theme
  const primaryColor = colors?.primaryColor || "#1e1b4b"
  const accentColor = colors?.accentColor || "#7c3aed"

  const handleFavorite = () => {
    const newFav = !isFav
    setIsFav(newFav)
    onFavorite?.(creative.creative_id, newFav)
  }

  return (
    <div className="group relative rounded-2xl border border-white/10 bg-white/3 overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-0.5">
      {/* Creative Preview */}
      <div
        className="relative aspect-square overflow-hidden cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
        style={{ background: primaryColor }}
      >
        {/* Gradient overlay */}
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", gradient)} />

        {/* Layout type pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 right-4 h-24 rounded-xl bg-white/20" />
          <div className="absolute bottom-16 left-8 right-8 h-3 rounded bg-white/40" />
          <div className="absolute bottom-8 left-12 right-12 h-3 rounded bg-white/20" />
          <div className="absolute bottom-24 left-6 right-6 h-2 rounded bg-white/30" />
        </div>

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <div className="bg-black/50 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <p className="text-white font-bold text-sm leading-tight line-clamp-2 mb-1">
              {creative.headline}
            </p>
            {creative.supporting_copy && (
              <p className="text-white/70 text-xs line-clamp-1">{creative.supporting_copy}</p>
            )}
            {creative.cta && (
              <div
                className="mt-2 inline-block px-3 py-1 rounded-full text-white text-xs font-semibold"
                style={{ backgroundColor: accentColor }}
              >
                {creative.cta}
              </div>
            )}
          </div>
        </div>

        {/* Performance rank badge */}
        {creative.performance_rank <= 5 && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-amber-500/90 rounded-full px-2 py-0.5">
            <Star className="w-3 h-3 text-white fill-white" />
            <span className="text-white text-xs font-bold">#{creative.performance_rank}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(creative) }}
            className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-violet-600 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onExport?.(creative) }}
            className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-emerald-600 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleFavorite() }}
            className={cn(
              "w-10 h-10 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center transition-colors",
              isFav ? "bg-red-500/80 text-white" : "bg-white/20 text-white hover:bg-red-500/60"
            )}
          >
            <Heart className={cn("w-4 h-4", isFav && "fill-white")} />
          </button>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{creative.headline}</p>
            <p className="text-white/40 text-xs truncate">{creative.layout_type}</p>
          </div>
          <div className={cn("shrink-0 px-2 py-0.5 rounded-full border text-xs font-bold", scoreBg)}>
            {overallScore.toFixed(1)}
          </div>
        </div>

        {/* Metrics mini row */}
        <div className="grid grid-cols-3 gap-1">
          <MetricMini
            icon={<MousePointerClick className="w-2.5 h-2.5" />}
            label="CTR"
            value={`${creative.predicted_ctr?.toFixed(1)}%`}
          />
          <MetricMini
            icon={<Eye className="w-2.5 h-2.5" />}
            label="Scroll"
            value={`${creative.scroll_stop_score?.toFixed(1)}`}
          />
          <MetricMini
            icon={<Zap className="w-2.5 h-2.5" />}
            label="Impact"
            value={`${creative.emotional_impact_score?.toFixed(1)}`}
          />
        </div>

        {/* Emotional trigger badge */}
        {creative.emotional_trigger && (
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs capitalize">
              {creative.emotional_trigger}
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}

function MetricMini({
  icon, label, value
}: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center bg-white/5 rounded-lg py-1 px-1.5">
      <div className="text-white/40 mb-0.5">{icon}</div>
      <div className="text-white text-xs font-bold">{value}</div>
      <div className="text-white/30 text-[9px]">{label}</div>
    </div>
  )
}
