import * as React from "react"
import { cn } from "cn"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-lg border border-input bg-card px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground shadow-xs transition-colors",
            "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-9",
            error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
