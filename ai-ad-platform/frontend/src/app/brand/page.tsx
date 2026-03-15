"use client"
import { useState, useEffect } from "react"
import AppLayout from "@/components/layout/AppLayout"
import Header from "@/components/layout/Header"
import BrandAnalyzer from "@/components/brand/BrandAnalyzer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { brandAPI } from "@/lib/api"
import { Brand } from "@/lib/types"
import { Plus, Globe, Trash2, ChevronRight, Sparkles } from "lucide-react"
import Link from "next/link"

export default function BrandProfilePage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [showAnalyzer, setShowAnalyzer] = useState(false)

  useEffect(() => {
    brandAPI.list()
      .then(res => setBrands(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (brandId: number) => {
    if (!confirm("Delete this brand and all its creatives?")) return
    await brandAPI.delete(brandId).catch(() => {})
    setBrands(prev => prev.filter(b => b.id !== brandId))
  }

  return (
    <AppLayout>
      <Header title="Brand Profile" description="Manage your brand profiles and AI analysis" />
      <div className="p-6 space-y-6">
        {showAnalyzer ? (
          <div>
            <Button variant="ghost" onClick={() => setShowAnalyzer(false)} className="mb-4">
              ← Back
            </Button>
            <BrandAnalyzer onComplete={(brand) => {
              setBrands(prev => [brand as any, ...prev])
              setShowAnalyzer(false)
            }} />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold">Your Brands</h2>
                <p className="text-white/40 text-sm">{brands.length} brand{brands.length !== 1 ? "s" : ""} analyzed</p>
              </div>
              <Button variant="gradient" onClick={() => setShowAnalyzer(true)}>
                <Plus className="w-4 h-4" />
                Add Brand
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(i => <div key={i} className="h-40 skeleton rounded-2xl" />)}
              </div>
            ) : brands.length === 0 ? (
              <div className="text-center py-20">
                <Globe className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <h3 className="text-white/50 text-lg mb-2">No brands yet</h3>
                <p className="text-white/30 text-sm mb-6">Analyze your first brand website to get started</p>
                <Button variant="gradient" onClick={() => setShowAnalyzer(true)}>
                  <Plus className="w-4 h-4" /> Analyze Brand Website
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {brands.map((brand: any) => (
                  <Card key={brand.id} className="border-white/10 bg-white/3 hover:bg-white/5 transition-colors group">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
                            style={{
                              background: brand.color_palette?.[0]
                                ? `linear-gradient(135deg, ${brand.color_palette[0]}, ${brand.color_palette[1] || "#7c3aed"})`
                                : "linear-gradient(135deg, #7c3aed, #4f46e5)"
                            }}
                          >
                            {brand.brand_name?.[0] || "B"}
                          </div>
                          <div>
                            <div className="text-white font-semibold">{brand.brand_name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="secondary" className="text-xs capitalize">{brand.category}</Badge>
                              <span className="text-white/30 text-xs">{brand.industry}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(brand.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Color palette */}
                      {brand.color_palette?.length > 0 && (
                        <div className="flex gap-1.5 mb-3">
                          {brand.color_palette.slice(0, 6).map((color: string, i: number) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full border border-white/10"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      )}

                      {brand.value_proposition && (
                        <p className="text-white/50 text-xs mb-3 line-clamp-2">{brand.value_proposition}</p>
                      )}

                      {brand.emotional_triggers?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {brand.emotional_triggers.slice(0, 3).map((trigger: string) => (
                            <Badge key={trigger} variant="outline" className="text-xs capitalize">{trigger}</Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                        <Link href={`/brand/${brand.id}`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full h-7 text-xs">
                            View Profile
                          </Button>
                        </Link>
                        <Link href={`/creatives?brand=${brand.id}`}>
                          <Button size="sm" variant="gradient" className="h-7 text-xs">
                            <Sparkles className="w-3 h-3" /> Generate
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
