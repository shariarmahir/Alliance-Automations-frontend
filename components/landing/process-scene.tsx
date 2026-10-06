"use client"

import { useEffect, useRef } from "react"
import { SceneMotionProvider } from "@/components/landing/scene/anim"
import { Conveyors } from "@/components/landing/scene/conveyors"
import { DataBus } from "@/components/landing/scene/data-bus"
import { DyeVat } from "@/components/landing/scene/dye-vat"
import { GantryRobot } from "@/components/landing/scene/gantry-robot"
import { SCENE, VATS } from "@/components/landing/scene/layout"
import { LoaderArm } from "@/components/landing/scene/loader-arm"
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion"
import { onVisibilityChange } from "@/lib/visibility"

const RAIL = { x: 170, width: 780 }
const SUPPORTS = [290, 950]

/** A robotic dye line: loader arm, belt, gantry, three vats and a live data feed. Decorative. */
export function ProcessScene() {
  const reduceMotion = usePrefersReducedMotion()
  const svg = useRef<SVGSVGElement>(null)

  // The scene runs about eighty SMIL animations; stop them while it is scrolled out of view.
  useEffect(() => {
    const element = svg.current
    if (!element) return
    return onVisibilityChange(element, (visible) => (visible ? element.unpauseAnimations() : element.pauseAnimations()))
  }, [])

  return (
    <SceneMotionProvider value={!reduceMotion}>
      <svg ref={svg} viewBox={`0 0 ${SCENE.width} ${SCENE.height}`} className="h-auto w-full" aria-hidden>
        <rect x={0} y={SCENE.floorY} width={SCENE.width} height={3} className="fill-foreground/20" />
        <rect x={RAIL.x} y={SCENE.railY} width={RAIL.width} height={10} rx={5} className="fill-foreground/45" />
        {SUPPORTS.map((x) => (
          <rect key={x} x={x - 5} y={SCENE.railY} width={10} height={SCENE.floorY - SCENE.railY} rx={3} className="fill-foreground/15" />
        ))}

        <DataBus />
        <Conveyors />
        <LoaderArm />
        {VATS.map((vat) => (
          <DyeVat key={vat.x} vat={vat} />
        ))}
        <GantryRobot />
      </svg>
    </SceneMotionProvider>
  )
}
