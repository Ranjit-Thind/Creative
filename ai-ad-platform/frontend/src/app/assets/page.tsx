"use client"
import { useState, useEffect, useRef } from "react"
import AppLayout from "@/components/layout/AppLayout"
import Header from "@/components/layout/Header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { assetAPI, brandAPI } from "@/lib/api"
import { FolderOpen, Upload, Image, Video, Type, Trash2, Loader2 } from "lucide-react"

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [selectedBrand, setSelectedBrand] = useState("")
  const [assetType, setAssetType] = useState("all")
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      brandAPI.list().catch(() => ({ data: [] })),
      assetAPI.list().catch(() => ({ data: [] })),
    ]).then(([brandsRes, assetsRes]) => {
      setBrands(Array.isArray(brandsRes.data) ? brandsRes.data : [])
      setAssets(Array.isArray(assetsRes.data) ? assetsRes.data : [])
    }).finally(() => setLoading(false))
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedBrand || !e.target.files?.length) return
    setUploading(true)
    const file = e.target.files[0]
    const type = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "font"
    try {
      const res = await assetAPI.upload(parseInt(selectedBrand), type, file)
      setAssets(prev => [res.data, ...prev])
    } catch (err: any) {
      alert("Upload failed")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDelete = async (assetId: number) => {
    await assetAPI.delete(assetId).catch(() => {})
    setAssets(prev => prev.filter(a => a.id !== assetId))
  }

  const filteredAssets = assets.filter(a => {
    if (assetType !== "all" && a.asset_type !== assetType) return false
    if (selectedBrand && a.brand_id !== parseInt(selectedBrand)) return false
    return true
  })

  const typeIcon = (type: string) => {
    if (type === "image") return <Image className="w-4 h-4" />
    if (type === "video") return <Video className="w-4 h-4" />
    return <Type className="w-4 h-4" />
  }

  return (
    <AppLayout>
      <Header title="Asset Library" description="Manage brand assets, images, and uploads" />
      <div className="p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Brands</SelectItem>
              {brands.map(b => (
                <SelectItem key={b.id} value={String(b.id)}>{b.brand_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
            {["all", "image", "video", "font"].map(t => (
              <button
                key={t}
                onClick={() => setAssetType(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                  assetType === t ? "bg-violet-600 text-white" : "text-white/40 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {!selectedBrand && (
              <p className="text-white/40 text-xs">Select a brand to upload</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,.ttf,.otf"
              onChange={handleUpload}
              className="hidden"
            />
            <Button
              variant="gradient"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !selectedBrand}
            >
              {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</> : <><Upload className="w-3.5 h-3.5" /> Upload Asset</>}
            </Button>
          </div>
        </div>

        {/* Asset count */}
        <div className="text-white/40 text-sm">{filteredAssets.length} assets</div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
            {Array(14).fill(0).map((_, i) => <div key={i} className="aspect-square skeleton rounded-xl" />)}
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-white/50 text-lg mb-2">No assets yet</h3>
            <p className="text-white/30 text-sm mb-6">Upload logos, product images, and brand assets</p>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={!selectedBrand}>
              <Upload className="w-4 h-4" /> Upload First Asset
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
            {filteredAssets.map((asset: any) => (
              <div key={asset.id} className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:border-white/20 transition-colors">
                {asset.asset_type === "image" ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "")}${asset.file_url}`}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30">
                    {typeIcon(asset.asset_type)}
                  </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                  <p className="text-white text-xs text-center px-2 line-clamp-2">{asset.name}</p>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="w-7 h-7 rounded-lg bg-red-500/80 flex items-center justify-center text-white mt-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Type badge */}
                <div className="absolute top-1.5 left-1.5">
                  <div className="w-5 h-5 rounded-full bg-black/50 flex items-center justify-center text-white/60">
                    {typeIcon(asset.asset_type)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
