"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Sparkles, LayoutTemplate, Building2,
  Megaphone, FolderOpen, Zap, Settings, ChevronRight
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/creatives", label: "Creatives", icon: Sparkles },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/brand", label: "Brand Profile", icon: Building2 },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/assets", label: "Asset Library", icon: FolderOpen },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-950/80 backdrop-blur-xl border-r border-white/5 flex flex-col z-30">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-none">AdGenius</div>
            <div className="text-white/40 text-xs mt-0.5">AI Ad Platform</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-white/30 text-xs font-medium uppercase tracking-wider px-3 py-2">
          Platform
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-4.5 h-4.5 flex-shrink-0", isActive ? "text-violet-400" : "text-white/40 group-hover:text-white/70")} />
              {item.label}
              {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-violet-400" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-white/5">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20">
          <div className="text-white text-xs font-medium">Upgrade to Pro</div>
          <div className="text-white/40 text-xs mt-0.5">Unlimited creatives & exports</div>
          <div className="mt-2 text-xs font-medium text-violet-400 hover:text-violet-300 cursor-pointer">
            Get Pro →
          </div>
        </div>
      </div>
    </aside>
  )
}
