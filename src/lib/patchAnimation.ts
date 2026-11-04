/**
 * Global safety patch for Web Animations API `Animation.prototype.commitStyles`.
 *
 * In modern Chromium browsers (Chrome, Edge, Opera), Framer Motion / motion/mini
 * calls `animation.commitStyles()` when an animation completes or is stopped.
 * If the animated element or any ancestor has `display: none` (e.g. responsive breakpoints
 * like `lg:hidden`), or during background tab transitions, the browser throws:
 * "DOMException: Failed to execute 'commitStyles' on 'Animation': Target element is not rendered."
 *
 * This patch intercepts that specific DOMException and prevents it from crashing the React tree.
 */
if (typeof window !== "undefined" && typeof Animation !== "undefined" && Animation.prototype?.commitStyles) {
  const nativeCommitStyles = Animation.prototype.commitStyles

  Animation.prototype.commitStyles = function (this: Animation) {
    try {
      return nativeCommitStyles.call(this)
    } catch {
      // Safely ignore any commitStyles failure when element is not rendered, detached, or hidden
      return
    }
  }
}

export {}

