import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-violet-500/30 bg-violet-500/20 text-violet-300",
        secondary: "border-white/10 bg-white/10 text-white/70",
        destructive: "border-red-500/30 bg-red-500/20 text-red-300",
        outline: "border-white/20 text-white/70",
        success: "border-emerald-500/30 bg-emerald-500/20 text-emerald-300",
        warning: "border-yellow-500/30 bg-yellow-500/20 text-yellow-300",
        info: "border-blue-500/30 bg-blue-500/20 text-blue-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
