import * as React from "react"
import { cn } from "cn"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            "flex h-9 w-full appearance-none rounded-lg border border-input bg-card px-3 py-1.5 pr-8 text-xs text-foreground shadow-xs transition-colors",
            "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive/30",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
          ▼
        </div>
        {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
