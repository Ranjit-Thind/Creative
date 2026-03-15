"use client"
import { useState, useEffect } from "react"
import AppLayout from "@/components/layout/AppLayout"
import Header from "@/components/layout/Header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { templateAPI } from "@/lib/api"
import { Layout } from "@/lib/types"
import { LayoutTemplate, Filter, Sparkles } from "lucide-react"

const LAYOUT_ICONS: Record<string, string> = {
  before_after: "↔️", product_hero: "⭐", testimonial_proof: "💬",
  expert_authority: "🏆", problem_solution: "💡", product_grid: "🔲",
  limited_offer: "⏰", comparison: "⚖️", lifestyle_benefit: "✨",
  statistic_proof: "📊", step_by_step: "📋", social_proof_count: "👥",
}

const LAYOUT_PERF: Record<string, number> = {
  before_after: 9.2, testimonial_proof: 8.9, limited_offer: 8.7,
  problem_solution: 8.4, social_proof_count: 8.1, product_hero: 7.9,
  comparison: 7.8, statistic_proof: 7.6, lifestyle_benefit: 7.3,
  expert_authority: 7.1, step_by_step: 6.9, product_grid: 6.6,
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      templateAPI.list().catch(() => ({ data: { templates: [] } })),
      templateAPI.categories().catch(() => ({ data: { categories: [] } })),
    ]).then(([templatesRes, categoriesRes]) => {
      setTemplates(templatesRes.data.templates || [])
      setCategories(categoriesRes.data.categories || [])
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selectedCategory === "all") {
      templateAPI.list().then(res => setTemplates(res.data.templates || []))
    } else {
      templateAPI.list(selectedCategory).then(res => setTemplates(res.data.templates || []))
    }
  }, [selectedCategory])

  return (
    <AppLayout>
      <Header title="Templates" description="12 proven ad creative layouts used by top brands" />
      <div className="p-6 space-y-6">
        {/* Category filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === "all"
                ? "bg-violet-600 text-white"
                : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/10"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === cat.key
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="h-56 skeleton rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {templates.map((template: any) => {
              const perfScore = LAYOUT_PERF[template.layout_key] || 7.0
              const icon = LAYOUT_ICONS[template.layout_key] || "📐"
              return (
                <Card key={template.layout_key} className="border-white/10 bg-white/3 hover:bg-white/5 transition-all hover:border-white/20 hover:-translate-y-0.5 group cursor-pointer">
                  <CardContent className="p-0">
                    {/* Preview area */}
                    <div className="aspect-video relative rounded-t-xl overflow-hidden bg-gradient-to-br from-violet-900/50 to-indigo-900/50 p-4">
                      <div className="text-4xl mb-2">{icon}</div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                        <Button size="sm" variant="gradient">
                          <Sparkles className="w-3.5 h-3.5" />
                          Use Template
                        </Button>
                      </div>
                      {/* Visual mock */}
                      <div className="absolute bottom-3 left-3 right-3 bg-black/40 rounded-lg p-2">
                        <div className="h-2 bg-white/30 rounded w-2/3 mb-1" />
                        <div className="h-1.5 bg-white/20 rounded w-1/2" />
                      </div>
                    </div>

                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="text-white text-sm font-medium leading-tight">{template.layout_name}</div>
                        <div className={`text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          perfScore >= 8 ? "bg-emerald-500/20 text-emerald-400" :
                          perfScore >= 7 ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-white/10 text-white/50"
                        }`}>
                          {perfScore}
                        </div>
                      </div>
                      <p className="text-white/40 text-xs line-clamp-2 mb-2">{template.visual_structure}</p>
                      <div className="flex flex-wrap gap-1">
                        {template.best_for?.slice(0, 2).map((cat: string) => (
                          <Badge key={cat} variant="secondary" className="text-xs capitalize">{cat}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
