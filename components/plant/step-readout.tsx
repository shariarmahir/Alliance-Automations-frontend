import {
  ArrowDownToLine,
  Droplets,
  Flame,
  FlaskConical,
  type LucideIcon,
  PackageCheck,
  PackageOpen,
  Snowflake,
  Thermometer,
  WashingMachine,
} from "lucide-react"
import type { MachineView, StepKind } from "@/lib/domain/types"
import { formatInt } from "@/lib/format"
import { cn } from "@/lib/utils"

export const STEP_ICON: Record<StepKind, LucideIcon> = {
  load: PackageOpen,
  fill: Droplets,
  dose: FlaskConical,
  heat: Flame,
  hold: Thermometer,
  cool: Snowflake,
  drain: ArrowDownToLine,
  rinse: WashingMachine,
  unload: PackageCheck,
}

/** The one live value that matters for the current step. */
export function stepValue(view: MachineView): string {
  const { step, telemetry } = view
  if (!step) return "—"
  switch (step.step.kind) {
    case "fill":
      return `${formatInt(telemetry.levelL)} L`
    case "dose":
      return `${telemetry.dosedL.toFixed(0)} L`
    case "heat":
    case "hold":
    case "cool":
      return `${telemetry.temperatureC.toFixed(1)} °C`
    case "drain":
      return `${telemetry.drainPct.toFixed(0)} %`
    case "rinse": {
      const left = Math.max(0, step.step.plannedMin - step.elapsedMin)
      return `${Math.floor(left)}:${String(Math.floor((left % 1) * 60)).padStart(2, "0")} left`
    }
    case "load":
    case "unload":
      return `${Math.round(step.progress * 100)} %`
  }
}

export function StepReadout({ view, className }: { view: MachineView; className?: string }) {
  if (!view.step) {
    return <span className={cn("text-sm text-muted-foreground", className)}>—</span>
  }
  const Icon = STEP_ICON[view.step.step.kind]
  const thermal = view.step.step.kind === "heat" || view.step.step.kind === "hold"
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-md bg-muted",
          thermal ? "text-chart-2" : "text-primary",
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 leading-tight">
        <div className="truncate text-xs text-muted-foreground">{view.step.step.label}</div>
        <div className="tabular font-mono text-sm font-medium">{stepValue(view)}</div>
      </div>
    </div>
  )
}

export function ShadeSwatch({ hex, name, className }: { hex: string; name: string; className?: string }) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <span className="size-4 shrink-0 rounded-[5px] ring-1 ring-inset ring-foreground/15" style={{ backgroundColor: hex }} />
      <span className="truncate">{name}</span>
    </span>
  )
}
