import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        accent: "bg-accent text-accent-foreground font-bold",
        outline: "border border-border text-foreground",
        available: "bg-[#679436]/15 text-[#4e7426] dark:text-[#2dd4bf] border border-[#679436]/30",
        holding: "bg-[#0891b2]/15 text-[#0e7490] dark:text-[#67e8f9] border border-[#0891b2]/30",
        occupied: "bg-[#427AA1]/15 text-[#2b5a7c] dark:text-[#88c0e8] border border-[#427AA1]/30",
        maintenance: "bg-destructive/15 text-destructive dark:text-blue-400 border border-destructive/30",
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
                ? "bg-[#06B6D4]"
                : variant === "occupied"
                ? "bg-[#94A3B8]"
                : variant === "maintenance"
                ? "bg-[#3B82F6]"
                : "bg-current")
          )}
        />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
