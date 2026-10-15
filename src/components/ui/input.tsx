import * as React from "react"
import { cn } from "cn"

/**
 * Text input. Single-line by contract: `whitespace-nowrap` on the control itself
 * is wrong for inputs (text should scroll, not wrap), so the label pattern lives
 * in Field instead. Placeholder and value stay on one line via `text-ellipsis`.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground shadow-xs transition-colors",
        "placeholder:text-muted-foreground",
        "file:mr-2 file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-primary",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-danger aria-invalid:ring-danger/25",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
