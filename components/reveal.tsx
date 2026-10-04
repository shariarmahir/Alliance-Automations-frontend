"use client"

import { motion, type HTMLMotionProps } from "motion/react"

/** Staggered entrance for dashboard sections. `order` sets the delay step. */
export function Reveal({ order = 0, ...props }: HTMLMotionProps<"div"> & { order?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: order * 0.06, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    />
  )
}
