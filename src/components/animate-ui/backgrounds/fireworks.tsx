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
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true })
    if (!ctx) return

    let animId: number
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    let width = (canvas.width = Math.floor(window.innerWidth * dpr))
    let height = (canvas.height = Math.floor(window.innerHeight * dpr))

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = Math.floor(window.innerWidth * dpr)
      height = canvas.height = Math.floor(window.innerHeight * dpr)
    }
    window.addEventListener("resize", handleResize, { passive: true })

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
      trail: { x: number; y: number }[]
    }

    const particles: Particle[] = []
    const rockets: Rocket[] = []
    const MAX_PARTICLES = 280

    const createExplosion = (x: number, y: number, baseColor?: string) => {
      // Giới hạn số lượng hạt hợp lý để đảm bảo mượt mà 60-120fps
      const particleCount = 36 + Math.floor(Math.random() * 20)
      for (let i = 0; i < particleCount; i++) {
        if (particles.length >= MAX_PARTICLES) {
          particles.shift() // Xóa hạt cũ nhất nếu quá giới hạn
        }
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.35
        const speed = (Math.random() * 4.5 + 2) * dpr
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
          size: (Math.random() * 2 + 1.2) * dpr,
          decay: Math.random() * 0.016 + 0.012,
          sparkle: Math.random() > 0.45,
        })
      }
    }

    const launchRocket = () => {
      if (rockets.length >= 5) return
      const x = (Math.random() * 0.76 + 0.12) * width
      const targetY = (Math.random() * 0.38 + 0.12) * height
      const color = colors[Math.floor(Math.random() * colors.length)]
      rockets.push({
        x,
        y: height,
        targetY,
        vy: -(Math.random() * 3 + 8.5) * dpr,
        color,
        trail: [],
      })
    }

    // Bắn đợt pháo hoa ban đầu
    const initialBatch = Math.min(3, Math.max(1, Math.round(population)))
    for (let i = 0; i < initialBatch; i++) {
      setTimeout(() => {
        launchRocket()
      }, i * 320)
    }

    let frameCount = 0
    let lastTime = performance.now()

    const loop = (currentTime: number) => {
      animId = requestAnimationFrame(loop)

      // Delta time physics để chuyển động mượt mà trên mọi màn hình (60Hz, 120Hz, 144Hz)
      const delta = Math.min((currentTime - lastTime) / 16.67, 2)
      lastTime = currentTime
      frameCount++

      // Xóa mờ nhẹ tạo hiệu ứng đuôi sao băng tự nhiên
      ctx.globalCompositeOperation = "destination-out"
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
      ctx.fillRect(0, 0, width, height)

      // Chế độ pha trộn ánh sáng Lighter (Additive Blending) - Siêu mượt và rực rỡ không cần shadowBlur
      ctx.globalCompositeOperation = "lighter"

      // Phóng rocket mới định kỳ
      const spawnInterval = Math.max(14, Math.floor(32 / population))
      if (frameCount % spawnInterval === 0) {
        launchRocket()
      }

      // Cập nhật và vẽ các rocket bay lên
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i]
        r.y += r.vy * delta

        // Vẽ thân rocket
        ctx.globalAlpha = 1
        ctx.fillStyle = r.color
        ctx.beginPath()
        ctx.arc(r.x, r.y, 2.2 * dpr, 0, Math.PI * 2)
        ctx.fill()

        // Vẽ vệt sáng đầu rocket
        ctx.fillStyle = "#ffffff"
        ctx.beginPath()
        ctx.arc(r.x, r.y, 1.2 * dpr, 0, Math.PI * 2)
        ctx.fill()

        if (r.y <= r.targetY) {
          createExplosion(r.x, r.y, r.color)
          rockets.splice(i, 1)
        }
      }

      // Cập nhật và vẽ các hạt pháo hoa nổ
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx * delta
        p.y += p.vy * delta
        p.vy += 0.065 * dpr * delta // Trọng lực nhẹ
        p.vx *= Math.pow(0.978, delta) // Lực cản không khí
        p.vy *= Math.pow(0.978, delta)
        p.alpha -= p.decay * delta

        if (p.alpha <= 0) {
          particles.splice(i, 1)
          continue
        }

        // Vẽ hạt pháo hoa màu rực rỡ
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        // Đối với hạt lấp lánh (sparkle), vẽ lõi trắng nhỏ tạo hiệu ứng phát sáng lấp lánh tự nhiên
        if (p.sparkle && p.alpha > 0.35) {
          ctx.globalAlpha = p.alpha * 0.85
          ctx.fillStyle = "#ffffff"
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 0.45, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    animId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", handleResize)
    }
  }, [population, colors])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none block ${className}`}
      style={{
        width: "100%",
        height: "100%",
        transform: "translateZ(0)",
        willChange: "contents",
      }}
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
