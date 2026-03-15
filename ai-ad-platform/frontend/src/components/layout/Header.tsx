"use client"
import { Bell, Search, User, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface HeaderProps {
  title: string
  description?: string
}

export default function Header({ title, description }: HeaderProps) {
  return (
    <header className="h-16 border-b border-white/5 bg-gray-950/50 backdrop-blur-sm flex items-center px-6 gap-4 sticky top-0 z-20">
      <div className="flex-1">
        <h1 className="text-white font-semibold text-lg">{title}</h1>
        {description && <p className="text-white/40 text-xs">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            placeholder="Search creatives..."
            className="h-9 pl-9 pr-4 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-violet-500 w-56 transition-all focus:w-72"
          />
        </div>
        <Link href="/brand/new">
          <Button size="sm" variant="gradient" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            New Brand
          </Button>
        </Link>
        <button className="w-9 h-9 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
        </button>
        <button className="w-9 h-9 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
