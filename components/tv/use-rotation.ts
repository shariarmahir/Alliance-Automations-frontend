import { useEffect, useState } from "react"

/** How often the rotation clock advances. Also the length of the progress bar's width transition. */
export const ROTATION_TICK_MS = 250

/**
 * Cycles through `count` pages every `periodMs`, with pause and manual paging. Driven by a timer rather than a CSS
 * animation end, so reduced motion (which shortens animations to nothing) cannot make it spin.
 */
export function useRotation(count: number, periodMs: number) {
  const [page, setPage] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => setElapsed((current) => current + ROTATION_TICK_MS), ROTATION_TICK_MS)
    return () => window.clearInterval(id)
  }, [paused])

  // Turning the page while rendering, React's pattern for state that follows other state, avoids a second effect.
  if (elapsed >= periodMs) {
    setElapsed(0)
    setPage((page + 1) % count)
  }

  const go = (next: number) => {
    setPage(((next % count) + count) % count)
    setElapsed(0)
  }

  return { page, progress: Math.min(1, elapsed / periodMs), paused, setPaused, go }
}
