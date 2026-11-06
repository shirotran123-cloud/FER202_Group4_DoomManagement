import React, { useEffect, useRef } from "react"

export interface FireworksBackgroundProps {
  className?: string
  color?: string
  population?: number
  colors?: string[]
}

const DEFAULT_VIBRANT_COLORS = [
  "#10B981", // Emerald green
  "#3B82F6", // Royal blue
  "#F59E0B", // Amber gold
  "#EF4444", // Crimson red
  "#8B5CF6", // Purple violet
  "#EC4899", // Neon pink
  "#06B6D4", // Cyan
  "#F97316", // Bright orange
  "#FACC15", // Sparkle yellow
  "#22D3EE", // Sky blue
  "#A855F7", // Amethyst
]

export const FireworksBackground: React.FC<FireworksBackgroundProps> = ({
  className = "absolute inset-0",
  population = 2,
  colors = DEFAULT_VIBRANT_COLORS,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener("resize", handleResize)

    // Particle system
    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      alpha: number
      color: string
      size: number
      decay: number
      sparkle: boolean
    }

    interface Rocket {
      x: number
      y: number
      targetY: number
      vy: number
      color: string
      exploded: boolean
    }

    const particles: Particle[] = []
    const rockets: Rocket[] = []

    const createExplosion = (x: number, y: number, baseColor?: string) => {
      const particleCount = 45 + Math.floor(Math.random() * 30)
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.4
        const speed = Math.random() * 5 + 2
        // Vibrant multicolored sparkles
        const color =
          Math.random() > 0.3
            ? colors[Math.floor(Math.random() * colors.length)]
            : baseColor || colors[Math.floor(Math.random() * colors.length)]

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color,
          size: Math.random() * 2.5 + 1.5,
          decay: Math.random() * 0.015 + 0.01,
          sparkle: Math.random() > 0.4,
        })
      }
    }

    const launchRocket = () => {
      const x = Math.random() * width * 0.8 + width * 0.1
      const targetY = Math.random() * height * 0.4 + height * 0.15
      const color = colors[Math.floor(Math.random() * colors.length)]
      rockets.push({
        x,
        y: height,
        targetY,
        vy: -(Math.random() * 4 + 9),
        color,
        exploded: false,
      })
    }

    // Launch initial batch
    for (let i = 0; i < Math.max(1, population * 2); i++) {
      setTimeout(() => {
        launchRocket()
      }, i * 350)
    }

    let frameCount = 0
    const loop = () => {
      animId = requestAnimationFrame(loop)
      frameCount++

      // Smooth clear with trail effect
      ctx.globalCompositeOperation = "destination-out"
      ctx.fillStyle = "rgba(0, 0, 0, 0.22)"
      ctx.fillRect(0, 0, width, height)

      ctx.globalCompositeOperation = "lighter"

      // Spawn rockets periodically
      if (frameCount % Math.max(12, Math.floor(25 / population)) === 0) {
        launchRocket()
      }

      // Update and draw rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i]
        r.y += r.vy

        // Rocket trail
        ctx.beginPath()
        ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = r.color
        ctx.shadowColor = r.color
        ctx.shadowBlur = 8
        ctx.fill()

        if (r.y <= r.targetY) {
          createExplosion(r.x, r.y, r.color)
          rockets.splice(i, 1)
        }
      }

      // Update and draw explosion particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.07 // Gravity
        p.vx *= 0.98 // Air drag
        p.vy *= 0.98
        p.alpha -= p.decay

        if (p.alpha <= 0) {
          particles.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = p.sparkle ? 12 : 5
        ctx.fill()
        ctx.restore()
      }
    }

    loop()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", handleResize)
    }
  }, [population, colors])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none block ${className}`}
      style={{ width: "100%", height: "100%" }}
    />
  )
}

export default function FireworksBackgroundDemo({
  population = 1,
}: {
  population?: number
}) {
  return (
    <FireworksBackground
      className="absolute inset-0"
      population={population}
    />
  )
}
