import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatScore(score: number): string {
  return `${(score * 10).toFixed(0)}%`
}

export function getScoreColor(score: number): string {
  if (score >= 7.5) return "text-emerald-400"
  if (score >= 5.0) return "text-yellow-400"
  return "text-red-400"
}

export function getScoreBg(score: number): string {
  if (score >= 7.5) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
  if (score >= 5.0) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
  return "bg-red-500/20 text-red-400 border-red-500/30"
}
