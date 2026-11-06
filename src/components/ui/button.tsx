import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"
import {
  RippleButton,
  RippleButtonRipples,
} from "@animate-ui/react/primitives/buttons/ripple"

const buttonVariants = cva(
  "group/button ui-btn-interactive relative overflow-hidden inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-xs/relaxed font-semibold whitespace-nowrap transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-250 [&_svg]:ease-[cubic-bezier(0.4,0,0.2,1)] [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-[#235330] hover:shadow-md [--ripple-button-ripple-color:var(--primary-foreground)]",
        outline:
          "border border-border bg-card text-foreground hover:bg-muted/80 hover:border-secondary/40 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:bg-input/30 dark:text-slate-100 dark:hover:text-white [--ripple-button-ripple-color:rgba(100,116,139,0.35)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-[#162c49] hover:shadow-md aria-expanded:bg-secondary aria-expanded:text-secondary-foreground [--ripple-button-ripple-color:var(--secondary-foreground)]",
        ghost:
          "text-foreground hover:bg-muted/80 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:text-slate-100 dark:hover:text-white dark:hover:bg-muted/50 [--ripple-button-ripple-color:rgba(100,116,139,0.25)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-[#991b1b] focus-visible:border-destructive/40 focus-visible:ring-destructive/20 [--ripple-button-ripple-color:var(--destructive-foreground)]",
        link: "text-primary underline-offset-4 hover:underline [--ripple-button-ripple-color:transparent]",
      },
      size: {
        default:
          "h-10 gap-2 px-4 text-xs sm:text-sm has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-4",
        xs: "h-6 gap-1 rounded-lg px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-lg px-3 text-xs has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 rounded-xl px-6 text-sm has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 [&_svg:not([class*='size-'])]:size-4",
        icon: "size-8 [&_svg:not([class*='size-'])]:size-4",
        "icon-xs": "size-6 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-10 [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends Omit<React.ComponentProps<"button">, "ref">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  tapScale?: number
  disableRipple?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      tapScale = 0.97,
      disableRipple = false,
      children,
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot.Root
          ref={ref as any}
          data-slot="button"
          data-variant={variant}
          data-size={size}
          className={cn(buttonVariants({ variant, size, className }))}
          {...(props as any)}
        >
          {children}
        </Slot.Root>
      )
    }

    return (
      <RippleButton
        ref={ref as any}
        tapScale={tapScale}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size, className }))}
        {...(props as any)}
      >
        {children}
        {!disableRipple && <RippleButtonRipples />}
      </RippleButton>
    )
  }
)
Button.displayName = "Button"

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants, RippleButton, RippleButtonRipples }
