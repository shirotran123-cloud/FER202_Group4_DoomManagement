"use client"

import {
  RippleButton,
  RippleButtonRipples,
  type RippleButtonProps,
  type RippleButtonRipplesProps,
} from "@animate-ui/react/primitives/buttons/ripple"

export default function RippleButtonDemo({
  tapScale = 0.97,
}: {
  tapScale?: number
}) {
  return (
    <RippleButton
      tapScale={tapScale}
      className="bg-primary text-primary-foreground h-10 rounded-lg px-4 text-sm font-medium [--ripple-button-ripple-color:var(--primary-foreground)]"
    >
      Ripple Button
      <RippleButtonRipples />
    </RippleButton>
  )
}

export { RippleButton, RippleButtonRipples, type RippleButtonProps, type RippleButtonRipplesProps }
