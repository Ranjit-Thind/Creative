"use client"
import { useState, useEffect } from "react"
import AppLayout from "@/components/layout/AppLayout"
import Header from "@/components/layout/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { campaignAPI, brandAPI } from "@/lib/api"
import { Megaphone, Loader2, TrendingUp, Target, BarChart3, Zap, ChevronDown, Plus } from "lucide-react"

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [selectedBrand, setSelectedBrand] = useState("")
  const [objective, setObjective] = useState("conversions")
  const [platform, setPlatform] = useState("meta")
  const [budget, setBudget] = useState(1000)
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      brandAPI.list().catch(() => ({ data: [] })),
      campaignAPI.list().catch(() => ({ data: [] })),
    ]).then(([brandsRes, campaignsRes]) => {
      setBrands(Array.isArray(brandsRes.data) ? brandsRes.data : [])
      setCampaigns(Array.isArray(campaignsRes.data) ? campaignsRes.data : [])
    }).finally(() => setLoading(false))
  }, [])

  const handleGenerate = async () => {
    if (!selectedBrand) return
    setGenerating(true)
    try {
      const res = await campaignAPI.generateIntelligence(
        parseInt(selectedBrand), objective, platform, budget
      )
      setCampaigns(prev => [res.data, ...prev])
      setSelectedReport(res.data.intelligence_report)
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to generate campaign intelligence")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <AppLayout>
      <Header title="Campaign Intelligence" description="AI-powered campaign strategy and media planning" />
      <div className="p-6 space-y-6">
        {/* Generator Panel */}
        <Card className="border-white/10 bg-white/3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-violet-400" />
              Generate Campaign Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-white/40 text-xs mb-1 block">Brand</label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map(b => (
                      <SelectItem key={b.id} value={String(b.id)}>{b.brand_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-white/40 text-xs mb-1 block">Objective</label>
                <Select value={objective} onValueChange={setObjective}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["conversions", "traffic", "awareness", "leads", "app_installs"].map(o => (
                      <SelectItem key={o} value={o} className="capitalize">{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-white/40 text-xs mb-1 block">Platform</label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meta">Meta (FB/IG)</SelectItem>
                    <SelectItem value="google">Google Ads</SelectItem>
                    <SelectItem value="tiktok">TikTok Ads</SelectItem>
                    <SelectItem value="all">All Platforms</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-white/40 text-xs mb-1 block">Monthly Budget ($)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={e => setBudget(Number(e.target.value))}
                  className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>
            <Button variant="gradient" onClick={handleGenerate} disabled={generating || !selectedBrand}>
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><TrendingUp className="w-4 h-4" /> Generate Campaign Intelligence</>}
            </Button>
          </CardContent>
        </Card>

        {/* Report Display */}
        {selectedReport && (
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Campaign Intelligence Report</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campaign Strategy */}
              {selectedReport.campaign_strategy && (
                <Card className="border-white/10 bg-white/3">
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Target className="w-4 h-4 text-violet-400" />Campaign Strategy</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-white/40 text-xs mb-1">Objective</div>
                      <div className="text-white text-sm capitalize">{selectedReport.campaign_strategy.primary_objective}</div>
                    </div>
                    {selectedReport.campaign_strategy.recommended_budget_split && (
                      <div>
                        <div className="text-white/40 text-xs mb-2">Budget Split</div>
                        {Object.entries(selectedReport.campaign_strategy.recommended_budget_split).map(([stage, pct]: any) => (
                          <div key={stage} className="flex items-center gap-2 mb-1">
                            <div className="text-white/60 text-xs capitalize w-24">{stage}</div>
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-violet-500 rounded-full" style={{ width: pct }} />
                            </div>
                            <div className="text-white/60 text-xs w-8 text-right">{pct}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Media Plan */}
              {selectedReport.media_plan && (
                <Card className="border-white/10 bg-white/3">
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4 text-emerald-400" />Media Plan</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {selectedReport.media_plan.bidding_strategy && (
                      <div>
                        <div className="text-white/40 text-xs mb-1">Bidding Strategy</div>
                        <div className="text-white text-sm">{selectedReport.media_plan.bidding_strategy}</div>
                      </div>
                    )}
                    {selectedReport.media_plan.expected_results && (
                      <div>
                        <div className="text-white/40 text-xs mb-2">Expected Results</div>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(selectedReport.media_plan.expected_results).map(([key, val]: any) => (
                            <div key={key} className="bg-white/5 rounded-lg p-2 text-center">
                              <div className="text-white font-bold text-sm">{val}</div>
                              <div className="text-white/40 text-xs">{key.replace(/_/g, " ")}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* KPIs */}
              {selectedReport.kpis && (
                <Card className="border-white/10 bg-white/3">
                  <CardHeader><CardTitle className="text-sm">KPIs</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedReport.kpis.map((kpi: any, i: number) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                          <div>
                            <div className="text-white text-sm font-medium">{kpi.metric}</div>
                            <div className="text-white/40 text-xs">{kpi.tracking_method}</div>
                          </div>
                          <Badge variant="success">{kpi.target}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Audience */}
              {selectedReport.audience_targeting?.primary_audience && (
                <Card className="border-white/10 bg-white/3">
                  <CardHeader><CardTitle className="text-sm">Primary Audience</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-white/60 text-sm">{selectedReport.audience_targeting.primary_audience.description}</div>
                    {selectedReport.audience_targeting.primary_audience.interests?.length > 0 && (
                      <div>
                        <div className="text-white/40 text-xs mb-1.5">Interest Targeting</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedReport.audience_targeting.primary_audience.interests.slice(0, 8).map((interest: string) => (
                            <Badge key={interest} variant="secondary" className="text-xs">{interest}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Past Campaigns */}
        {campaigns.length > 0 && (
          <div>
            <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">Past Reports</h3>
            <div className="space-y-2">
              {campaigns.map((campaign: any) => (
                <div
                  key={campaign.campaign_id || campaign.id}
                  onClick={() => setSelectedReport(campaign.intelligence_report)}
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/3 hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                    <Megaphone className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{campaign.campaign_name}</div>
                    <div className="text-white/40 text-xs capitalize">{campaign.intelligence_report?.campaign_strategy?.primary_objective || "—"}</div>
                  </div>
                  <Badge variant="secondary" className="capitalize">{platform}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
