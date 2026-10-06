"use client"

import { motion, type HTMLMotionProps } from "motion/react"
import { cn } from "@/lib/utils"

/**
 * Staggered entrance for dashboard sections. `order` sets the delay step.
 * `min-w-0` lets grid children shrink below their content width instead of stretching the track.
 */
export function Reveal({ order = 0, className, ...props }: HTMLMotionProps<"div"> & { order?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("min-w-0", className)}
      transition={{ duration: 0.45, delay: order * 0.06, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    />
  )
}
