"use client"

import { Slot } from "radix-ui"
import { useEffect, useRef, type ComponentProps, type CSSProperties, type PointerEvent } from "react"
import { onVisibilityChange } from "@/lib/visibility"
import { cn } from "@/lib/utils"

interface GlowCardProps extends ComponentProps<"div"> {
  /** Renders the child element as the card, so a link or list item keeps its own semantics. */
  asChild?: boolean
  /** Offsets the border light so neighbouring cards are never in step. */
  index?: number
  /** Raises the card on hover. Leave off for large containers such as forms. */
  lift?: boolean
}

const BEAM_STAGGER_S = 1.4

/**
 * A transparent card with a blue light that always travels its border and a spotlight that follows the
 * pointer on hover. The effect lives in `.glow-card` (globals.css); this feeds it the pointer position and marks the card
 * `data-offscreen` while it is scrolled out of view, which pauses the border light and any icon animating inside it.
 */
export function GlowCard({ asChild, index = 0, lift, className, style, onPointerMove, ...props }: GlowCardProps) {
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
      className={cn("glow-card", className)}
      style={{ "--beam-delay": `${-index * BEAM_STAGGER_S}s`, ...style } as CSSProperties}
      onPointerMove={track}
      {...props}
    />
  )
}
