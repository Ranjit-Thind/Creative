"use client"
import AppLayout from "@/components/layout/AppLayout"
import Header from "@/components/layout/Header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Settings, Key, Bell, Palette, Database, Zap } from "lucide-react"

export default function SettingsPage() {
  return (
    <AppLayout>
      <Header title="Settings" description="Platform configuration and preferences" />
      <div className="p-6 max-w-3xl space-y-6">
        {/* API Keys */}
        <Card className="border-white/10 bg-white/3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Key className="w-4 h-4 text-violet-400" /> API Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-white/50 text-xs mb-1.5 block">Anthropic API Key</label>
              <div className="flex gap-2">
                <Input type="password" placeholder="sk-ant-..." className="font-mono text-xs" />
                <Button variant="outline" size="sm">Save</Button>
              </div>
              <p className="text-white/30 text-xs mt-1">Used for Claude AI creative generation and brand analysis</p>
            </div>
          </CardContent>
        </Card>

        {/* Generation Defaults */}
        <Card className="border-white/10 bg-white/3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="w-4 h-4 text-yellow-400" /> Generation Defaults
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/50 text-xs mb-1.5 block">Default Creative Count</label>
                <select className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500">
                  {[10, 20, 30, 50].map(n => <option key={n} value={n}>{n} creatives</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1.5 block">Default Platform</label>
                <select className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500">
                  <option value="meta">Meta (FB/IG)</option>
                  <option value="google">Google Ads</option>
                  <option value="tiktok">TikTok Ads</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1.5 block">AI Model</label>
              <select className="w-full h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500">
                <option value="claude-opus-4-6">Claude Opus 4.6 (Most powerful)</option>
                <option value="claude-sonnet-4-6">Claude Sonnet 4.6 (Balanced)</option>
                <option value="claude-haiku-4-5">Claude Haiku 4.5 (Fastest)</option>
              </select>
            </div>
            <Button variant="gradient" size="sm">Save Defaults</Button>
          </CardContent>
        </Card>

        {/* Plan */}
        <Card className="border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-indigo-600/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-white font-semibold">Free Plan</div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="text-white/40 text-sm">50 creatives/month · 3 brands · Basic export</div>
              </div>
              <Button variant="gradient">Upgrade to Pro</Button>
            </div>
            <div className="mt-4 space-y-2">
              {[
                { label: "Creatives used", used: 12, total: 50 },
                { label: "Brands", used: 1, total: 3 },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs text-white/40 mb-1">
                    <span>{item.label}</span>
                    <span>{item.used}/{item.total}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                      style={{ width: `${(item.used / item.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
