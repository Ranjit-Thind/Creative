"use client"
import { useState } from "react"
import { brandAPI } from "@/lib/api"
import { Brand } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Globe, Loader2, CheckCircle2, Sparkles, ArrowRight } from "lucide-react"

interface BrandAnalyzerProps {
  onComplete: (brand: Brand) => void
}

const ANALYSIS_STEPS = [
  { label: "Crawling website...", progress: 20 },
  { label: "Analyzing brand identity...", progress: 40 },
  { label: "Extracting color palette...", progress: 55 },
  { label: "Understanding target audience...", progress: 70 },
  { label: "Identifying emotional triggers...", progress: 85 },
  { label: "Generating brand intelligence...", progress: 100 },
]

export default function BrandAnalyzer({ onComplete }: BrandAnalyzerProps) {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [error, setError] = useState("")
  const [brand, setBrand] = useState<Brand | null>(null)

  const handleAnalyze = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError("")
    setStep(0)

    // Simulate progress steps
    const stepInterval = setInterval(() => {
      setStep(prev => Math.min(prev + 1, ANALYSIS_STEPS.length - 1))
    }, 2500)

    try {
      const response = await brandAPI.analyze(url.trim())
      clearInterval(stepInterval)
      setStep(ANALYSIS_STEPS.length - 1)
      const brandData = response.data as Brand
      setBrand(brandData)
      setTimeout(() => onComplete(brandData), 500)
    } catch (err: any) {
      clearInterval(stepInterval)
      setError(err.response?.data?.detail || "Analysis failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const currentStep = ANALYSIS_STEPS[step]

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>Brand Intelligence Engine</CardTitle>
              <p className="text-white/40 text-sm mt-0.5">
                AI-powered brand analysis in 30 seconds
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!loading && !brand && (
            <>
              <div>
                <label className="text-white/60 text-sm mb-2 block">Website URL</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      className="pl-10"
                      placeholder="https://yourwebsite.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                    />
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={!url.trim()}
                    variant="gradient"
                    className="shrink-0"
                  >
                    Analyze
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Brand Identity", desc: "Name, tone, positioning" },
                  { label: "Visual DNA", desc: "Colors, typography, style" },
                  { label: "Audience Intel", desc: "Demographics, triggers" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-3 rounded-xl bg-white/5 border border-white/5"
                  >
                    <div className="text-white text-xs font-medium">{item.label}</div>
                    <div className="text-white/40 text-xs mt-0.5">{item.desc}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {loading && (
            <div className="py-4 space-y-6">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                <span className="text-white/70 text-sm">{currentStep?.label}</span>
              </div>
              <Progress value={currentStep?.progress || 0} className="h-2" />
              <div className="grid grid-cols-2 gap-2">
                {ANALYSIS_STEPS.map((s, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 text-xs ${
                      i < step
                        ? "text-emerald-400"
                        : i === step
                        ? "text-violet-400"
                        : "text-white/20"
                    }`}
                  >
                    {i < step ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <div className={`w-3 h-3 rounded-full border ${
                        i === step ? "border-violet-400 bg-violet-400/20" : "border-white/20"
                      }`} />
                    )}
                    {s.label.replace("...", "")}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
