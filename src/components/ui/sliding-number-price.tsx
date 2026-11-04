import React from "react"
import { SlidingNumber } from "@animate-ui/react/primitives/texts/sliding-number"

export interface SlidingNumberPriceProps {
  number: number
  prefix?: string
  suffix?: string
  className?: string
  delay?: number
  fromNumber?: boolean | number
  padStart?: boolean
  decimalSeparator?: string
  decimalPlaces?: number
  thousandSeparator?: string
}

export const SlidingNumberPrice: React.FC<SlidingNumberPriceProps> = ({
  number,
  prefix = "₫",
  suffix = "",
  className = "",
  delay = 0,
  fromNumber = true,
  padStart = true,
  decimalSeparator = ",",
  decimalPlaces = 0,
  thousandSeparator = ".",
}) => {
  const from =
    typeof fromNumber === "number" ? fromNumber : fromNumber ? 0 : undefined
  const safeNumber = isNaN(number) ? 0 : Math.round(number)

  return (
    <span className={`inline-flex items-center tabular-nums ${className}`}>
      {prefix && <span className="select-none">{prefix}</span>}
      <SlidingNumber
        number={safeNumber}
        fromNumber={from}
        padStart={padStart}
        decimalSeparator={decimalSeparator}
        decimalPlaces={decimalPlaces}
        thousandSeparator={thousandSeparator}
        delay={delay}
      />
      {suffix && <span className="select-none">{suffix}</span>}
    </span>
  )
}

export { SlidingNumber }

