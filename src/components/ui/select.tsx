import * as React from "react"
import { cn } from "cn"
import { ChevronDown } from "lucide-react"

/** Native select styled to match Input. The caret is decorative and never wraps. */
function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative w-full min-w-0">
      <select
        data-slot="select"
        className={cn(
          "h-10 w-full min-w-0 appearance-none rounded-xl border border-input bg-card px-3 py-2 pr-9 text-sm text-foreground shadow-xs transition-colors",
          "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-danger aria-invalid:ring-danger/25",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}

export { Select }
