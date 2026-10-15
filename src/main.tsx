import { StrictMode, useEffect } from "react"
import { createRoot } from "react-dom/client"
import Lenis from "lenis"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

/** Lenis smooth scroll per interactive-3d-scroll-web skill (lerp 0.08).
 * Native scroll position is preserved (no transform) so sticky + scroll
 * listeners keep working; Lenis only smooths wheel input. */
function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true })
    lenis.on("scroll", () => {
      // Lenis emits its own scroll events during smoothing; mirror to native
      // listeners so sticky scrub stages update every smoothed frame.
      window.dispatchEvent(new Event("scroll"))
    })
    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [])
  return null
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <SmoothScroll />
      <App />
    </ThemeProvider>
  </StrictMode>
)
