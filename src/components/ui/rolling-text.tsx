import React from "react"

export interface RollingTextProps {
  text?: string
  className?: string
  [key: string]: any
}

export const RollingText: React.FC<RollingTextProps> = ({ text, className = "" }) => {
  return <span className={className}>{text}</span>
}

