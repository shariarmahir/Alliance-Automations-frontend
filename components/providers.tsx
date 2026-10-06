"use client"

import { MotionConfig } from "motion/react"
import { ThemeProvider } from "next-themes"
import { useEffect, type ReactNode } from "react"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { usePlant } from "@/lib/store/plant"

const TICK_MS = 1000

/** Boots the plant feed once and advances it every second for every screen. */
function PlantFeed() {
  const boot = usePlant((state) => state.boot)
  const tick = usePlant((state) => state.tick)

  useEffect(() => {
    boot()
    const id = window.setInterval(() => tick(TICK_MS), TICK_MS)
    return () => window.clearInterval(id)
  }, [boot, tick])

  return null
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={150}>
          <PlantFeed />
          {children}
          <Toaster position="bottom-right" dir="ltr" />
        </TooltipProvider>
      </MotionConfig>
    </ThemeProvider>
  )
}
