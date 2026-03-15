"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import Header from "@/components/layout/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { brandAPI, creativeAPI } from "@/lib/api"
import { Brand } from "@/lib/types"
import CreativeCard from "@/components/creatives/CreativeCard"
import CreativeEditor from "@/components/creatives/CreativeEditor"
import { Sparkles, Loader2, Globe, Target, Zap, TrendingUp, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function BrandDetailPage() {
  const params = useParams()
  const router = useRouter()
  const brandId = parseInt(params.id as string)

  const [brand, setBrand] = useState<Brand | null>(null)
  const [creatives, setCreatives] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [editingCreative, setEditingCreative] = useState<any>(null)
  const [generateCount, setGenerateCount] = useState(30)

  useEffect(() => {
    Promise.all([
      brandAPI.get(brandId).catch(() => ({ data: null })),
      creativeAPI.list({ brand_id: brandId, limit: 50 }).catch(() => ({ data: [] })),
    ]).then(([brandRes, creativesRes]) => {
      setBrand(brandRes.data)
      setCreatives(Array.isArray(creativesRes.data) ? creativesRes.data : [])
    }).finally(() => setLoading(false))
  }, [brandId])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await creativeAPI.generate(brandId, generateCount)
      const newCreatives = res.data.creatives || []
      setCreatives(prev => [...newCreatives, ...prev])
    } catch (err: any) {
      alert(err.response?.data?.detail || "Generation failed")
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        </div>
      </AppLayout>
    )
  }

  if (!brand) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <p className="text-white/50">Brand not found</p>
          <Link href="/brand"><Button variant="outline" className="mt-4">← Back to Brands</Button></Link>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Header title={brand.brand_name} description={`${brand.industry} · ${brand.category}`} />
      <div className="p-6 space-y-6">
        {/* Brand hero */}
        <div className="relative rounded-2xl overflow-hidden p-6 border border-white/10"
          style={{
            background: brand.color_palette?.[0]
              ? `linear-gradient(135deg, ${brand.color_palette[0]}30, ${brand.color_palette[1] || "#7c3aed"}20)`
              : "linear-gradient(135deg, #7c3aed20, #4f46e520)"
          }}>
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl shrink-0"
              style={{
                background: brand.color_palette?.[0]
                  ? `linear-gradient(135deg, ${brand.color_palette[0]}, ${brand.color_palette[1] || "#7c3aed"})`
                  : "linear-gradient(135deg, #7c3aed, #4f46e5)"
              }}>
              {brand.brand_name?.[0] || "B"}
            </div>
            <div className="flex-1">
              <h2 className="text-white text-2xl font-bold">{brand.brand_name}</h2>
              <p className="text-white/60 mt-1">{brand.value_proposition}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="default">{brand.category}</Badge>
                <Badge variant="secondary">{brand.industry}</Badge>
                <Badge variant="secondary" className="capitalize">{brand.tone_of_voice}</Badge>
                <Badge variant="secondary" className="capitalize">{brand.pricing_positioning}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={generateCount}
                onChange={e => setGenerateCount(Number(e.target.value))}
                className="bg-white/10 border border-white/20 rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none"
              >
                {[10, 20, 30, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <Button variant="gradient" onClick={handleGenerate} disabled={generating}>
                {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Creatives</>}
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="creatives">
          <TabsList>
            <TabsTrigger value="creatives">Creatives ({creatives.length})</TabsTrigger>
            <TabsTrigger value="intelligence">Brand Intel</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
          </TabsList>

          <TabsContent value="creatives">
            {creatives.length === 0 ? (
              <div className="text-center py-16">
                <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">No creatives generated yet</p>
                <Button className="mt-4" variant="gradient" onClick={handleGenerate}>Generate First Batch</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {creatives.map(c => (
                  <CreativeCard
                    key={c.creative_id}
                    creative={c}
                    onEdit={setEditingCreative}
                    onFavorite={async (id, fav) => {
                      await creativeAPI.update(id, { is_favorite: fav })
                      setCreatives(prev => prev.map(x => x.creative_id === id ? { ...x, is_favorite: fav } : x))
                    }}
                    onExport={() => {}}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="intelligence">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-white/10 bg-white/3">
                <CardHeader><CardTitle className="text-sm">Marketing Angles</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(brand as any).marketing_angles?.map((angle: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-violet-400 font-bold shrink-0">{i + 1}.</span>
                        <span className="text-white/70">{angle}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/3">
                <CardHeader><CardTitle className="text-sm">Ad Hooks</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(brand as any).ad_hooks?.map((hook: string, i: number) => (
                      <div key={i} className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                        <p className="text-white/70 text-sm italic">"{hook}"</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/3">
                <CardHeader><CardTitle className="text-sm">Key Differentiators</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    {(brand as any).key_differentiators?.map((d: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span className="text-white/70 text-sm">{d}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/3">
                <CardHeader><CardTitle className="text-sm">Emotional Triggers</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {brand.emotional_triggers?.map((trigger, i) => (
                      <div key={i} className="px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/25">
                        <span className="text-orange-300 text-sm capitalize">{trigger}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="audience">
            <Card className="border-white/10 bg-white/3">
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="text-white/40 text-xs mb-1">Target Audience</div>
                  <div className="text-white">{brand.audience}</div>
                </div>
                <div>
                  <div className="text-white/40 text-xs mb-1">Tone of Voice</div>
                  <div className="text-white capitalize">{brand.tone_of_voice}</div>
                </div>
                <div>
                  <div className="text-white/40 text-xs mb-1">Pricing Positioning</div>
                  <div className="text-white capitalize">{brand.pricing_positioning}</div>
                </div>
                {brand.products?.length > 0 && (
                  <div>
                    <div className="text-white/40 text-xs mb-2">Products / Services</div>
                    <div className="flex flex-wrap gap-2">
                      {brand.products.map((p, i) => (
                        <Badge key={i} variant="secondary">{p}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {editingCreative && (
        <CreativeEditor
          creative={editingCreative}
          onSave={async (updated) => {
            await creativeAPI.update(editingCreative.creative_id, updated).catch(() => {})
            setCreatives(prev => prev.map(c => c.creative_id === editingCreative.creative_id ? { ...c, ...updated } : c))
            setEditingCreative(null)
          }}
          onClose={() => setEditingCreative(null)}
        />
      )}
    </AppLayout>
  )
}
