"use client"

import NumberFlow from "@number-flow/react"
import { useEffect, useRef, useState } from "react"
import { GlowCard } from "@/components/glow-card"
import { PERCENT_FORMAT } from "@/lib/number-format"
import { usePlant } from "@/lib/store/plant"
import { onVisibilityChange } from "@/lib/visibility"

const LOCALE = "en-US"
const plainNumber = new Intl.NumberFormat(LOCALE)
const plainPercent = new Intl.NumberFormat(LOCALE, PERCENT_FORMAT)

interface CounterProps {
  label: string
  value: number
  percent?: boolean
  index: number
}

/**
 * Plain text until the counter first scrolls into view, then an animated NumberFlow. NumberFlow measures its layout
 * as it mounts and updates, which is wasted work (and a forced reflow) for numbers nobody can see yet.
 */
function Counter({ label, value, percent, index }: CounterProps) {
  const [animated, setAnimated] = useState(false)
  const term = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = term.current
    if (!element) return
    const stop = onVisibilityChange(element, (visible) => {
      if (!visible) return
      setAnimated(true)
      stop()
    })
    return stop
  }, [])

  return (
    <GlowCard lift index={index} className="p-6">
      <dt ref={term} className="text-xs text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-3xl font-semibold tracking-tight text-brand">
        {animated ? (
          <NumberFlow value={value} locales={LOCALE} format={percent ? PERCENT_FORMAT : undefined} className="tabular" />
        ) : (
          <span className="tabular">{(percent ? plainPercent : plainNumber).format(value)}</span>
        )}
      </dd>
    </GlowCard>
  )
}

/**
 * Each counter subscribes to its own number, so the simulator's one-second tick only re-renders a counter
 * whose value actually changed, instead of all four every second.
 */
export function LiveCounters() {
  const processing = usePlant((state) => (state.kpis ? state.kpis.running + state.kpis.delayed + state.kpis.held : 0))
  const producedKg = usePlant((state) => state.kpis?.producedKg ?? 0)
  const batches = usePlant((state) => state.kpis?.batchesCompleted ?? 0)
  const rightFirstTime = usePlant((state) => state.kpis?.rightFirstTime ?? 0)

  return (
    <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Counter index={0} label="Machines processing" value={processing} />
      <Counter index={1} label="Kilograms dyed today" value={producedKg} />
      <Counter index={2} label="Batches completed" value={batches} />
      <Counter index={3} label="Right first time" value={rightFirstTime} percent />
    </dl>
  )
}
