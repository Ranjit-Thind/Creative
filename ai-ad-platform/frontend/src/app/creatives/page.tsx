"use client"
import { useState, useEffect, useCallback } from "react"
import AppLayout from "@/components/layout/AppLayout"
import Header from "@/components/layout/Header"
import CreativeCard from "@/components/creatives/CreativeCard"
import CreativeEditor from "@/components/creatives/CreativeEditor"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { creativeAPI, brandAPI } from "@/lib/api"
import { Creative, Brand } from "@/lib/types"
import {
  Sparkles, Loader2, Filter, Grid3X3, List, Download,
  TrendingUp, Star, Heart, LayoutGrid, Zap, RefreshCw
} from "lucide-react"

export default function CreativesPage() {
  const [creatives, setCreatives] = useState<Creative[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string>("all")
  const [sortBy, setSortBy] = useState("performance_rank")
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [editingCreative, setEditingCreative] = useState<Creative | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [generateCount, setGenerateCount] = useState(30)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadCreatives()
  }, [selectedBrand, sortBy])

  const loadData = async () => {
    const [brandsRes, creativesRes] = await Promise.all([
      brandAPI.list().catch(() => ({ data: [] })),
      creativeAPI.list({ sort_by: sortBy, limit: 100 }).catch(() => ({ data: [] })),
    ])
    setBrands(Array.isArray(brandsRes.data) ? brandsRes.data : [])
    setCreatives(Array.isArray(creativesRes.data) ? creativesRes.data : [])
    setLoading(false)
  }

  const loadCreatives = async () => {
    const params: any = { sort_by: sortBy, limit: 100 }
    if (selectedBrand !== "all") params.brand_id = parseInt(selectedBrand)
    const res = await creativeAPI.list(params).catch(() => ({ data: [] }))
    setCreatives(Array.isArray(res.data) ? res.data : [])
  }

  const handleGenerate = async () => {
    if (selectedBrand === "all" || !selectedBrand) {
      alert("Please select a brand first")
      return
    }
    setGenerating(true)
    try {
      const res = await creativeAPI.generate(parseInt(selectedBrand), generateCount)
      const newCreatives = res.data.creatives || []
      setCreatives(prev => [...newCreatives, ...prev])
    } catch (err: any) {
      alert(err.response?.data?.detail || "Generation failed")
    } finally {
      setGenerating(false)
    }
  }

  const handleFavorite = async (creativeId: string, isFavorite: boolean) => {
    await creativeAPI.update(creativeId, { is_favorite: isFavorite }).catch(() => {})
    setCreatives(prev => prev.map(c =>
      c.creative_id === creativeId ? { ...c, is_favorite: isFavorite } : c
    ))
  }

  const handleEditorSave = async (updated: Partial<Creative>) => {
    if (!editingCreative) return
    await creativeAPI.update(editingCreative.creative_id, updated).catch(() => {})
    setCreatives(prev => prev.map(c =>
      c.creative_id === editingCreative.creative_id ? { ...c, ...updated } : c
    ))
    setEditingCreative(null)
  }

  const handleExport = async (creative: Creative) => {
    try {
      const res = await creativeAPI.export(creative.creative_id, ["meta", "google", "tiktok"])
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${creative.headline.replace(/\s+/g, "-")}-export.json`
      a.click()
    } catch {}
  }

  const filteredCreatives = creatives.filter(c => {
    if (activeTab === "favorites") return c.is_favorite
    if (activeTab === "top") return c.performance_rank <= 5
    return true
  })

  const platformCounts = {
    meta: creatives.filter(c => c.platform === "meta").length,
    google: creatives.filter(c => c.platform === "google").length,
    tiktok: creatives.filter(c => c.platform === "tiktok").length,
  }

  return (
    <AppLayout>
      <Header title="Creatives" description="AI-generated ad creatives for all platforms" />

      {/* Toolbar */}
      <div className="border-b border-white/5 px-6 py-3 flex items-center gap-3 flex-wrap">
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map(b => (
              <SelectItem key={b.id} value={String(b.id)}>{b.brand_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="performance_rank">Best Performing</SelectItem>
            <SelectItem value="created_at">Most Recent</SelectItem>
            <SelectItem value="ctr">Highest CTR</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-violet-600 text-white" : "text-white/40 hover:text-white"}`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-violet-600 text-white" : "text-white/40 hover:text-white"}`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-white/40 text-xs">Count:</span>
            <select
              value={generateCount}
              onChange={e => setGenerateCount(Number(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              {[10, 15, 20, 25, 30, 40, 50].map(n => (
                <option key={n} value={n}>{n} creatives</option>
              ))}
            </select>
          </div>
          <Button
            variant="gradient"
            size="sm"
            onClick={handleGenerate}
            disabled={generating || selectedBrand === "all"}
          >
            {generating ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-3.5 h-3.5" /> Generate {generateCount}</>
            )}
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Stats row */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-violet-400" />
            <span className="text-white/60 text-sm">{creatives.length} creatives</span>
          </div>
          {Object.entries(platformCounts).map(([platform, count]) => count > 0 && (
            <Badge key={platform} variant="secondary" className="capitalize text-xs">
              {platform}: {count}
            </Badge>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">
              <LayoutGrid className="w-3.5 h-3.5" />
              All ({creatives.length})
            </TabsTrigger>
            <TabsTrigger value="top">
              <TrendingUp className="w-3.5 h-3.5" />
              Top Performers
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart className="w-3.5 h-3.5" />
              Favorites ({creatives.filter(c => c.is_favorite).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Creative Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array(15).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="aspect-square skeleton rounded-2xl mb-2" />
                <div className="h-3 skeleton rounded w-3/4 mb-1" />
                <div className="h-3 skeleton rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredCreatives.length === 0 ? (
          <div className="text-center py-24">
            <Sparkles className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-white/50 text-lg font-medium mb-2">No creatives yet</h3>
            <p className="text-white/30 text-sm mb-6">
              Select a brand and click Generate to create your first batch of AI ad creatives
            </p>
            <Button variant="gradient" onClick={handleGenerate} disabled={selectedBrand === "all"}>
              <Sparkles className="w-4 h-4" />
              Generate Creatives
            </Button>
          </div>
        ) : (
          <div className={`grid gap-4 ${
            viewMode === "grid"
              ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              : "grid-cols-1 md:grid-cols-2"
          }`}>
            {filteredCreatives.map(creative => (
              <CreativeCard
                key={creative.creative_id}
                creative={creative}
                onEdit={setEditingCreative}
                onFavorite={handleFavorite}
                onExport={handleExport}
              />
            ))}
          </div>
        )}
      </div>

      {/* Editor overlay */}
      {editingCreative && (
        <CreativeEditor
          creative={editingCreative}
          onSave={handleEditorSave}
          onClose={() => setEditingCreative(null)}
        />
      )}
    </AppLayout>
  )
}
