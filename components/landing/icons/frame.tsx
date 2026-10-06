import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Pivot points for SVG animation. `fill-box` turns around the shape itself, `view-box` around the icon's centre (24, 24). */
export const PIVOT = "origin-center [transform-box:fill-box]"
export const PIVOT_VIEW = "origin-center [transform-box:view-box]"
export const FROM_BOTTOM = "origin-bottom [transform-box:fill-box]"
export const FROM_LEFT = "origin-left [transform-box:fill-box]"

export interface IconProps {
  className?: string
}

/** Delay for the nth item of a staggered group. */
export const stagger = (index: number, step = 0.4) => ({ animationDelay: `${index * step}s` })

/** One shared 48-unit canvas so every animated icon draws, scales and strokes the same way. */
export function IconFrame({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("size-12", className)}
    >
      {children}
    </svg>
  )
}
