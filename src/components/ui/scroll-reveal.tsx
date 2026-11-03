import React from "react"
import { motion, type HTMLMotionProps, type Variants } from "motion/react"
import { cn } from "cn"

const ORGANIC_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1]

export interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  delay?: number
  duration?: number
  yOffset?: number
  direction?: "up" | "down" | "left" | "right"
  distance?: number
  once?: boolean
  amount?: number
  className?: string
}

/**
 * Scroll-driven Fade-in Up container.
 * Animates elements smoothly as the user scrolls down the page.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delay = 0,
  duration = 0.5,
  yOffset = 24,
  direction = "up",
  distance,
  once = true,
  amount = 0.12,
  className,
  ...props
}) => {
  const offset = distance ?? yOffset
  const initialPos =
    direction === "up"
      ? { opacity: 0, y: offset }
      : direction === "down"
      ? { opacity: 0, y: -offset }
      : direction === "left"
      ? { opacity: 0, x: offset }
      : { opacity: 0, x: -offset }

  return (
    <motion.div
      initial={initialPos}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount }}
      transition={{
        duration,
        delay,
        ease: ORGANIC_EASE,
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  staggerDelay?: number
  staggerChildren?: number
  delayChildren?: number
  once?: boolean
  amount?: number
  className?: string
}

/**
 * Staggered animation parent container.
 * Child <StaggerItem> elements appear sequentially separated by 100ms (0.1s) by default.
 */
export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.1,
  staggerChildren,
  delayChildren = 0.05,
  once = true,
  amount = 0.1,
  className,
  ...props
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerChildren ?? staggerDelay,
        delayChildren,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export interface StaggerItemProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  yOffset?: number
  duration?: number
  className?: string
}

/**
 * Individual card/item inside a StaggerContainer.
 */
export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  yOffset = 18,
  duration = 0.45,
  className,
  ...props
}) => {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: yOffset },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease: ORGANIC_EASE,
      },
    },
  }

  return (
    <motion.div variants={itemVariants} className={cn(className)} {...props}>
      {children}
    </motion.div>
  )
}
