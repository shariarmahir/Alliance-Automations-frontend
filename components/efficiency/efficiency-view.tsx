"use client"

import { Levers } from "@/components/efficiency/levers"
import { LossPareto } from "@/components/efficiency/loss-pareto"
import { OeeTiles } from "@/components/efficiency/oee-tiles"
import { OeeTrend } from "@/components/efficiency/oee-trend"
import { UtilityMultiples } from "@/components/efficiency/utility-multiples"
import { PlantGate } from "@/components/plant/plant-gate"
import { Reveal } from "@/components/reveal"
import { usePlant } from "@/lib/store/plant"

function Efficiency() {
  const history = usePlant((state) => state.history)
  return (
    <div className="flex flex-col gap-4">
      <Reveal>
        <OeeTiles history={history} />
      </Reveal>
      <div className="grid gap-4 xl:grid-cols-2">
        <Reveal order={1}>
          <OeeTrend history={history} />
        </Reveal>
        <Reveal order={2}>
          <LossPareto history={history} />
        </Reveal>
      </div>
      <Reveal order={3}>
        <UtilityMultiples history={history} />
      </Reveal>
      <Reveal order={4}>
        <Levers history={history} />
      </Reveal>
    </div>
  )
}

export function EfficiencyView() {
  return (
    <PlantGate>
      <Efficiency />
    </PlantGate>
  )
}
