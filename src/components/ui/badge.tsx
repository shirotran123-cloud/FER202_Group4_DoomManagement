import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

/**
 * Status badge. Only three colours carry meaning across the app:
 *   info     indigo  in-flight / pending / informational
 *   success  emerald available, paid, approved, completed
 *   danger   red     maintenance, overdue, rejected, error
 *   neutral  grey    occupied, cancelled, archived, "no state"
 * Always single-line so a status chip never breaks the row it sits in.
 */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold tracking-wide whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        info: "border-primary/20 bg-primary-soft text-primary-soft-foreground",
        success: "border-success/20 bg-success-soft text-success-soft-foreground",
        danger: "border-danger/20 bg-danger-soft text-danger-soft-foreground",
        neutral: "border-border bg-muted text-muted-foreground",
        outline: "border-border bg-transparent text-foreground",
        secondary: "border-transparent bg-primary-soft text-primary-soft-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="size-1.5 shrink-0 rounded-full bg-current" />}
      {children}
    </div>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants }
