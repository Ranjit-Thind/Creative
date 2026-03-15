"use client"
import { useState, useRef, useCallback } from "react"
import { Creative, DesignData, DesignElement } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  X, Download, Copy, Undo, Redo, ZoomIn, ZoomOut,
  Type, Image, Square, AlignCenter, Bold, Italic,
  Palette, Monitor, Smartphone, Layout
} from "lucide-react"

interface CreativeEditorProps {
  creative: Creative
  onSave: (updated: Partial<Creative>) => void
  onClose: () => void
}

const ASPECT_RATIOS = [
  { label: "1:1", value: "1:1", w: 400, h: 400, icon: <Square className="w-3 h-3" />, desc: "Meta Feed" },
  { label: "4:5", value: "4:5", w: 400, h: 500, icon: <Smartphone className="w-3 h-3" />, desc: "Meta Portrait" },
  { label: "9:16", value: "9:16", w: 225, h: 400, icon: <Smartphone className="w-3 h-3" />, desc: "Stories/Reels" },
  { label: "16:9", value: "16:9", w: 400, h: 225, icon: <Monitor className="w-3 h-3" />, desc: "Display Ads" },
]

export default function CreativeEditor({ creative, onSave, onClose }: CreativeEditorProps) {
  const [headline, setHeadline] = useState(creative.headline)
  const [supportingCopy, setSupportingCopy] = useState(creative.supporting_copy)
  const [cta, setCta] = useState(creative.cta)
  const [aspectRatio, setAspectRatio] = useState(creative.aspect_ratio || "1:1")
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [bgColor, setBgColor] = useState(
    creative.design_data?.theme?.primaryColor || "#1e1b4b"
  )
  const [accentColor, setAccentColor] = useState(
    creative.design_data?.theme?.accentColor || "#7c3aed"
  )
  const [textColor, setTextColor] = useState(
    creative.design_data?.theme?.secondaryColor || "#ffffff"
  )

  const canvasRef = useRef<HTMLDivElement>(null)

  const currentRatio = ASPECT_RATIOS.find(r => r.value === aspectRatio) || ASPECT_RATIOS[0]
  const scale = zoom / 100

  const handleSave = () => {
    const updatedDesignData: DesignData = {
      ...(creative.design_data as DesignData),
      canvas: {
        width: 1080,
        height: 1080,
        background: bgColor,
      },
      theme: {
        primaryColor: bgColor,
        secondaryColor: textColor,
        accentColor: accentColor,
        fontFamily: creative.design_data?.theme?.fontFamily || "Inter",
      },
      elements: (creative.design_data?.elements || []).map(el => {
        if (el.id === "headline") return { ...el, text: headline, color: textColor }
        if (el.id === "supporting_copy") return { ...el, text: supportingCopy, color: textColor }
        if (el.id === "cta_button") return { ...el, text: cta, backgroundColor: accentColor }
        if (el.id === "bg") return { ...el, fill: bgColor }
        return el
      }),
      format: aspectRatio,
      layout_key: creative.design_data?.layout_key || "",
    }

    onSave({
      headline,
      supporting_copy: supportingCopy,
      cta,
      aspect_ratio: aspectRatio,
      design_data: updatedDesignData,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/95 backdrop-blur-xl flex flex-col">
      {/* Top toolbar */}
      <div className="h-14 border-b border-white/10 flex items-center px-4 gap-4">
        <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div className="h-4 w-px bg-white/10" />
        <span className="text-white font-medium text-sm truncate max-w-xs">{headline}</span>
        <div className="flex-1" />

        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          <button onClick={() => setZoom(z => Math.max(25, z - 25))} className="w-7 h-7 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-white/50 text-xs w-10 text-center">{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(200, z + 25))} className="w-7 h-7 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white">
          <Undo className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white">
          <Redo className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-white/10" />
        <Button size="sm" variant="outline" onClick={() => {}}>
          <Download className="w-3.5 h-3.5" />
          Export
        </Button>
        <Button size="sm" variant="gradient" onClick={handleSave}>
          Save Changes
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — element tools */}
        <div className="w-14 border-r border-white/10 flex flex-col items-center py-4 gap-2">
          {[
            { icon: <Type className="w-4 h-4" />, label: "Text" },
            { icon: <Image className="w-4 h-4" />, label: "Image" },
            { icon: <Square className="w-4 h-4" />, label: "Shape" },
            { icon: <Palette className="w-4 h-4" />, label: "Colors" },
            { icon: <Layout className="w-4 h-4" />, label: "Layout" },
          ].map((tool) => (
            <button
              key={tool.label}
              title={tool.label}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              {tool.icon}
            </button>
          ))}
        </div>

        {/* Canvas area */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-[#111115] p-8">
          <div
            ref={canvasRef}
            className="relative shadow-2xl shadow-black/50"
            style={{
              width: currentRatio.w * scale,
              height: currentRatio.h * scale,
              background: bgColor,
              borderRadius: 12,
              overflow: "hidden",
              transition: "all 0.2s",
            }}
          >
            {/* Background gradient */}
            <div
              className="absolute inset-0 opacity-70"
              style={{
                background: `linear-gradient(135deg, ${bgColor}, ${accentColor}80)`,
              }}
            />

            {/* Image placeholder area */}
            <div className="absolute top-0 left-0 right-0 h-[45%] bg-white/5 flex items-center justify-center border-b border-white/5">
              <div className="text-center">
                <Image className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-white/20 text-xs">Upload or generate image</p>
              </div>
            </div>

            {/* Text content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2">
              <div
                className="text-white font-bold text-lg leading-tight text-center cursor-text"
                style={{ color: textColor, fontSize: `${scale * 20}px` }}
                onClick={() => setSelectedElement("headline")}
              >
                {headline}
              </div>
              <div
                className="text-center cursor-text"
                style={{ color: textColor + "CC", fontSize: `${scale * 13}px` }}
                onClick={() => setSelectedElement("supporting_copy")}
              >
                {supportingCopy}
              </div>
              <div className="flex justify-center mt-1">
                <div
                  className="rounded-full px-4 py-1.5 text-white font-semibold text-center cursor-text"
                  style={{ backgroundColor: accentColor, fontSize: `${scale * 13}px` }}
                  onClick={() => setSelectedElement("cta")}
                >
                  {cta}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — properties */}
        <div className="w-72 border-l border-white/10 overflow-y-auto">
          {/* Aspect ratio selector */}
          <div className="p-4 border-b border-white/10">
            <div className="text-white/60 text-xs font-medium mb-3">Format</div>
            <div className="grid grid-cols-2 gap-1.5">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.value}
                  onClick={() => setAspectRatio(ratio.value)}
                  className={cn(
                    "p-2 rounded-lg border text-xs transition-all",
                    aspectRatio === ratio.value
                      ? "border-violet-500/50 bg-violet-600/20 text-violet-300"
                      : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                  )}
                >
                  <div className="font-bold">{ratio.label}</div>
                  <div className="text-[10px] opacity-60">{ratio.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Text editing */}
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="text-white/60 text-xs font-medium">Content</div>
            <div>
              <label className="text-white/40 text-xs mb-1 block">Headline (max 6 words)</label>
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="text-sm"
              />
              <div className="text-right text-white/30 text-xs mt-0.5">
                {headline.split(" ").length}/6 words
              </div>
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1 block">Supporting Copy</label>
              <textarea
                value={supportingCopy}
                onChange={(e) => setSupportingCopy(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1 block">CTA Button</label>
              <Input
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          {/* Color editing */}
          <div className="p-4 space-y-3">
            <div className="text-white/60 text-xs font-medium">Colors</div>
            {[
              { label: "Background", value: bgColor, setter: setBgColor },
              { label: "Text Color", value: textColor, setter: setTextColor },
              { label: "Accent / CTA", value: accentColor, setter: setAccentColor },
            ].map((colorItem) => (
              <div key={colorItem.label} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg border border-white/10 shrink-0 cursor-pointer relative overflow-hidden"
                  style={{ backgroundColor: colorItem.value }}
                >
                  <input
                    type="color"
                    value={colorItem.value}
                    onChange={(e) => colorItem.setter(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-white/50 text-xs">{colorItem.label}</div>
                  <div className="text-white/30 text-xs font-mono">{colorItem.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
