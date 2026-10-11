import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary-container text-on-secondary-container",
        outline: "border border-border text-foreground",
        available: "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]",
        holding: "bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]",
        occupied: "bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1]",
        maintenance: "bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
  dotColor?: string
}

function Badge({ className, variant, dot, dotColor, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            dotColor ||
              (variant === "available"
                ? "bg-[#10B981]"
                : variant === "holding"
                ? "bg-[#F59E0B]"
                : variant === "occupied"
                ? "bg-[#94A3B8]"
                : variant === "maintenance"
                ? "bg-[#EF4444]"
                : "bg-current")
          )}
        />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
