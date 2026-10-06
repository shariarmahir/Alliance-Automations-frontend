"use client"

import { motion, type HTMLMotionProps } from "motion/react"
import { cn } from "@/lib/utils"

/**
 * Staggered entrance for dashboard sections. `order` sets the delay step.
 * `inView` waits until the block scrolls into view.
 * `min-w-0` lets grid children shrink below their content width instead of stretching the track.
 */
export function Reveal({ order = 0, inView = false, className, ...props }: HTMLMotionProps<"div"> & { order?: number; inView?: boolean }) {
  const visible = { opacity: 1, y: 0 }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      {...(inView ? { whileInView: visible, viewport: { once: true, margin: "-60px" } } : { animate: visible })}
      className={cn("min-w-0", className)}
      transition={{ duration: 0.45, delay: order * 0.06, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    />
  )
}
