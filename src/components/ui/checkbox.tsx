import * as React from "react"
import { cn } from "cn"

function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      className={cn(
        "size-4 shrink-0 cursor-pointer rounded-[5px] border border-input bg-card transition-colors",
        "checked:border-primary checked:bg-primary",
        "focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "accent-[var(--primary)]",
        className,
      )}
      {...props}
    />
  )
}

export { Checkbox }
