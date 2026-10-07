"use client"

import type { ComponentType } from "react"
import { GlowCard } from "@/components/glow-card"
import type { IconProps } from "@/components/landing/icons/frame"
import { Utilization } from "@/components/plant/icons/console-icons"
import { ANIMATED_STEP_ICON } from "@/components/plant/icons/step-icons"
import type { MachineView } from "@/lib/domain/types"
import { formatInt } from "@/lib/format"

/** Full-scale values for the tile meters, the same scales the control panel gauges use. */
const TEMPERATURE_MAX_C = 135
const PRESSURE_MAX_BAR = 4
const DEFAULT_LIQUOR_RATIO = 8

interface Tile {
  label: string
  value: string
  unit: string
  ratio: number
  icon: ComponentType<IconProps>
  tone: string
}

/** The four readings an operator checks at the machine, big enough to read from a step away. */
export function SensorTiles({ view }: { view: MachineView }) {
  const { telemetry, batch, machine } = view
  const liquorL = batch?.recipe.find((step) => step.kind === "fill")?.target ?? machine.capacityKg * DEFAULT_LIQUOR_RATIO
  const tiles: Tile[] = [
    { label: "Temperature", value: telemetry.temperatureC.toFixed(1), unit: "°C", ratio: telemetry.temperatureC / TEMPERATURE_MAX_C, icon: ANIMATED_STEP_ICON.heat, tone: "text-chart-2" },
    { label: "Liquor", value: formatInt(telemetry.levelL), unit: "L", ratio: telemetry.levelL / liquorL, icon: ANIMATED_STEP_ICON.fill, tone: "text-brand" },
    { label: "Pressure", value: telemetry.pressureBar.toFixed(2), unit: "bar", ratio: telemetry.pressureBar / PRESSURE_MAX_BAR, icon: Utilization, tone: "text-brand" },
    { label: "Circulation", value: telemetry.circulationPct.toFixed(0), unit: "%", ratio: telemetry.circulationPct / 100, icon: ANIMATED_STEP_ICON.rinse, tone: "text-brand" },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {tiles.map((tile, index) => (
        <GlowCard key={tile.label} index={index} quiet className="flex flex-col gap-2 bg-card/45 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{tile.label}</p>
            <tile.icon className={`size-6 ${tile.tone}`} />
          </div>
          <p className="font-mono text-2xl font-semibold tabular">
            {tile.value}
            <span className="ml-1 text-sm font-normal text-muted-foreground">{tile.unit}</span>
          </p>
          <div className={`h-1.5 overflow-hidden rounded-full bg-muted ${tile.tone}`}>
            <div className="h-full rounded-full bg-current transition-[width] duration-700" style={{ width: `${Math.min(1, Math.max(0, tile.ratio)) * 100}%` }} />
          </div>
        </GlowCard>
      ))}
    </div>
  )
}
