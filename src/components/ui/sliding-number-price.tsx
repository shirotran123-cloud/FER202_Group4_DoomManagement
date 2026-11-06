import React from "react"

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

export const SlidingNumber: React.FC<{
  number: number
  thousandSeparator?: string
  decimalSeparator?: string
  decimalPlaces?: number
  [key: string]: any
}> = ({ number, thousandSeparator = "." }) => {
  const safeNumber = isNaN(number) ? 0 : Math.round(number)
  const formatted = safeNumber
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator)
  return <span>{formatted}</span>
}

export const SlidingNumberPrice: React.FC<SlidingNumberPriceProps> = ({
  number,
  prefix = "₫",
  suffix = "",
  className = "",
  thousandSeparator = ".",
}) => {
  const safeNumber = isNaN(number) ? 0 : Math.round(number)
  const formatted = safeNumber
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator)

  return (
    <span className={`inline-flex items-center tabular-nums ${className}`}>
      {prefix && <span className="select-none mr-0.5">{prefix}</span>}
      <span>{formatted}</span>
      {suffix && <span className="select-none ml-0.5">{suffix}</span>}
    </span>
  )
}
