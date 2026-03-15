"use client"
import { useState, useEffect } from "react"
import AppLayout from "@/components/layout/AppLayout"
import Header from "@/components/layout/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { brandAPI, creativeAPI } from "@/lib/api"
import {
  Sparkles, TrendingUp, Zap, Globe, ArrowRight,
  MousePointerClick, Eye, BarChart3, Plus, ChevronRight
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [brands, setBrands] = useState<any[]>([])
  const [recentCreatives, setRecentCreatives] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      brandAPI.list().catch(() => ({ data: [] })),
      creativeAPI.list({ limit: 6, sort_by: "created_at" }).catch(() => ({ data: [] })),
    ]).then(([brandsRes, creativesRes]) => {
      setBrands(Array.isArray(brandsRes.data) ? brandsRes.data : [])
      setRecentCreatives(Array.isArray(creativesRes.data) ? creativesRes.data : [])
    }).finally(() => setLoading(false))
  }, [])

  const totalCreatives = recentCreatives.length
  const avgCTR = recentCreatives.length > 0
    ? (recentCreatives.reduce((s, c) => s + (c.predicted_ctr || 0), 0) / recentCreatives.length).toFixed(1)
    : "0.0"

  const stats = [
    {
      label: "Total Brands",
      value: brands.length || "0",
      change: "+2 this week",
      icon: Globe,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Creatives Generated",
      value: totalCreatives || "0",
      change: "Last 30 days",
      icon: Sparkles,
      color: "from-violet-500 to-purple-500",
    },
    {
      label: "Avg Predicted CTR",
      value: `${avgCTR}%`,
      change: "+0.3% vs last batch",
      icon: MousePointerClick,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Performance Score",
      value: "8.4",
      change: "Top 15% globally",
      icon: TrendingUp,
      color: "from-orange-500 to-amber-500",
    },
  ]

  return (
    <AppLayout>
      <Header
        title="Dashboard"
        description="Welcome back — your AI creative studio"
      />
      <div className="p-6 space-y-6">
        {/* Hero CTA if no brands */}
        {!loading && brands.length === 0 && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600/30 via-indigo-600/20 to-purple-600/30 border border-violet-500/20 p-8">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
            <div className="relative">
              <Badge variant="default" className="mb-4">
                <Zap className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
              <h2 className="text-2xl font-bold text-white mb-2">
                Generate Your First 30 Ad Creatives
              </h2>
              <p className="text-white/60 mb-6 max-w-md">
                Add your brand website and our AI will analyze it, then generate
                high-converting ad creatives optimized for Meta, Google & TikTok.
              </p>
              <Link href="/brand/new">
                <Button variant="gradient" size="lg">
                  <Plus className="w-4 h-4" />
                  Add Your Brand
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="border-white/10 bg-white/3 hover:bg-white/5 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
                  <div className="text-white/60 text-sm">{stat.label}</div>
                  <div className="text-emerald-400 text-xs mt-1">{stat.change}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Brands panel */}
          <div className="lg:col-span-1">
            <Card className="border-white/10 bg-white/3 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Your Brands</CardTitle>
                  <Link href="/brand/new">
                    <Button size="sm" variant="ghost" className="h-7 text-xs">
                      <Plus className="w-3 h-3" />
                      Add
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-14 rounded-xl skeleton" />
                    ))}
                  </div>
                ) : brands.length === 0 ? (
                  <div className="text-center py-8">
                    <Globe className="w-8 h-8 text-white/20 mx-auto mb-2" />
                    <p className="text-white/40 text-sm">No brands yet</p>
                    <Link href="/brand/new" className="text-violet-400 text-xs mt-1 block hover:text-violet-300">
                      Add your first brand →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {brands.map((brand: any) => (
                      <Link key={brand.id} href={`/brand/${brand.id}`}>
                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                            style={{
                              background: brand.color_palette?.[0]
                                ? `linear-gradient(135deg, ${brand.color_palette[0]}, ${brand.color_palette[1] || "#7c3aed"})`
                                : "linear-gradient(135deg, #7c3aed, #4f46e5)"
                            }}
                          >
                            {brand.brand_name?.[0] || "B"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate">{brand.brand_name}</div>
                            <div className="text-white/40 text-xs capitalize">{brand.category}</div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Creatives */}
          <div className="lg:col-span-2">
            <Card className="border-white/10 bg-white/3">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Recent Creatives</CardTitle>
                  <Link href="/creatives">
                    <Button size="sm" variant="ghost" className="h-7 text-xs">
                      View All
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="aspect-square rounded-xl skeleton" />
                    ))}
                  </div>
                ) : recentCreatives.length === 0 ? (
                  <div className="text-center py-12">
                    <Sparkles className="w-10 h-10 text-white/20 mx-auto mb-3" />
                    <p className="text-white/50 text-sm mb-1">No creatives yet</p>
                    <p className="text-white/30 text-xs">Add a brand and generate your first batch</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {recentCreatives.slice(0, 6).map((creative: any) => (
                      <Link key={creative.creative_id} href="/creatives">
                        <div
                          className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform relative"
                          style={{
                            background: creative.design_data?.theme?.primaryColor || "#1e1b4b"
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/60 to-indigo-600/60" />
                          <div className="absolute inset-0 flex flex-col justify-end p-2">
                            <div className="bg-black/50 rounded-lg p-1.5">
                              <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">
                                {creative.headline}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: "/brand/new", icon: Globe, label: "Analyze Brand", desc: "Add website URL", color: "from-blue-600 to-cyan-600" },
              { href: "/creatives", icon: Sparkles, label: "Generate Creatives", desc: "Create ad batch", color: "from-violet-600 to-purple-600" },
              { href: "/templates", icon: BarChart3, label: "Browse Templates", desc: "12 layout types", color: "from-emerald-600 to-teal-600" },
              { href: "/campaigns", icon: TrendingUp, label: "Campaign Intel", desc: "AI strategy report", color: "from-orange-600 to-amber-600" },
            ].map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.href} href={action.href}>
                  <div className="p-4 rounded-xl border border-white/10 bg-white/3 hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer group">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div className="text-white text-sm font-medium">{action.label}</div>
                    <div className="text-white/40 text-xs mt-0.5">{action.desc}</div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
