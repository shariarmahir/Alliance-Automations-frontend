"use client"

import { Slot } from "radix-ui"
import { useEffect, useRef, type ComponentProps, type CSSProperties, type PointerEvent } from "react"
import { cn } from "@/lib/utils"
import { onVisibilityChange } from "@/lib/visibility"

interface GlowCardProps extends ComponentProps<"div"> {
  /** Renders the child element as the card, so a link or list item keeps its own semantics. */
  asChild?: boolean
  /** Offsets the border light so neighbouring cards are never in step. */
  index?: number
  /** Raises the card on hover. Leave off for large containers such as forms. */
  lift?: boolean
  /** Shows the border light only on hover, for grids of many cards. */
  quiet?: boolean
  /** A colour for the border light and spotlight instead of the brand blue, such as a status colour. */
  tone?: string
}

const BEAM_STAGGER_S = 1.4

/**
 * A transparent card with a blue light that always travels its border and a spotlight that follows the
 * pointer on hover. The effect lives in `.glow-card` (globals.css); this feeds it the pointer position and marks the card
 * `data-offscreen` while it is scrolled out of view, which pauses the border light and any icon animating inside it.
 */
export function GlowCard({ asChild, index = 0, lift, quiet, tone, className, style, onPointerMove, ...props }: GlowCardProps) {
  const Comp = asChild ? Slot.Root : "div"
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = ref.current
    if (!card) return
    return onVisibilityChange(card, (visible) => card.toggleAttribute("data-offscreen", !visible))
  }, [])

  function track(event: PointerEvent<HTMLDivElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty("--mx", `${event.clientX - box.left}px`)
    event.currentTarget.style.setProperty("--my", `${event.clientY - box.top}px`)
    onPointerMove?.(event)
  }

  return (
    <Comp
      ref={ref}
      data-lift={lift ? "" : undefined}
      data-quiet={quiet ? "" : undefined}
      className={cn("glow-card", className)}
      style={{ "--beam-delay": `${-index * BEAM_STAGGER_S}s`, "--glow-tone": tone, ...style } as CSSProperties}
      onPointerMove={track}
      {...props}
    />
  )
}
