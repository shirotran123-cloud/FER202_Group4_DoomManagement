import * as React from "react"
import { cn } from "cn"

/**
 * Label. `whitespace-nowrap` is deliberate: a form label that wraps to two lines
 * misaligns the field it belongs to, and long labels are a content bug worth
 * seeing rather than hiding.
 */
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap text-foreground select-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Label }
