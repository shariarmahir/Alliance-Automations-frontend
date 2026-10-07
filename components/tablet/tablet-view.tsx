"use client"

import { Expand } from "lucide-react"
import { useState } from "react"
import { LogoMark } from "@/components/brand/logo"
import { URGENCY_META } from "@/components/control/action-chip"
import { PlantGate } from "@/components/plant/plant-gate"
import { STATUS_META, StatusDot } from "@/components/plant/status"
import { MachinePanel } from "@/components/tablet/machine-panel"
import { toggleFullscreen } from "@/components/tv/tv-header"
import { Button } from "@/components/ui/button"
import { nextAction } from "@/lib/domain/actions"
import { BAYS } from "@/lib/domain/catalog"
import { shiftAt } from "@/lib/domain/shift"
import { formatClockSeconds } from "@/lib/format"
import { usePlant, useSnapshot } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

const firstMachineOf = (bay: number) => `D${String((bay - 1) * 10 + 1).padStart(2, "0")}`

function Tablet() {
  const views = usePlant((state) => state.views)
  const now = useSnapshot((snapshot) => snapshot.now)
  const [bay, setBay] = useState(1)
  const [machineId, setMachineId] = useState("D01")
  const bayViews = views.filter((view) => view.machine.bay === bay)
  const selected = bayViews.find((view) => view.machine.id === machineId) ?? bayViews[0]
  const shift = shiftAt(now)

  return (
    <div className="flex h-dvh flex-col bg-ambient">
      <header className="flex items-center gap-x-4 gap-y-2 border-b px-4 py-3">
        <LogoMark />
        <div className="flex min-w-0 gap-1.5 overflow-x-auto" role="tablist" aria-label="Bays">
          {BAYS.map((option) => {
            const alerts = views.filter((view) => view.machine.bay === option.bay && (view.status === "delayed" || view.status === "held")).length
            const active = option.bay === bay
            return (
              <Button
                key={option.bay}
                role="tab"
                aria-selected={active}
                variant={active ? "default" : "outline"}
                size="lg"
                className="h-11 shrink-0 gap-2 px-4 text-base"
                onClick={() => {
                  setBay(option.bay)
                  setMachineId(firstMachineOf(option.bay))
                }}
              >
                {option.label}
                {alerts > 0 && (
                  <span className={cn("rounded-full px-1.5 text-xs font-semibold tabular", active ? "bg-background/25" : "bg-delayed/15 text-delayed")}>{alerts}</span>
                )}
              </Button>
            )
          })}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right">
            <p className="font-mono text-xl font-semibold tabular">{formatClockSeconds(now)}</p>
            <p className="text-xs text-muted-foreground max-sm:hidden">Shift {shift.name} · Operator tablet</p>
          </div>
          <Button variant="outline" size="icon-lg" onClick={toggleFullscreen} aria-label="Full screen" className="max-md:hidden">
            <Expand />
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <nav className="flex shrink-0 gap-1.5 overflow-x-auto border-b p-3 md:w-64 md:flex-col md:overflow-x-visible md:overflow-y-auto md:border-r md:border-b-0" aria-label="Machines">
          {bayViews.map((view) => {
            const action = nextAction(view, now)
            const current = view.machine.id === selected.machine.id
            return (
              <button
                key={view.machine.id}
                type="button"
                onClick={() => setMachineId(view.machine.id)}
                className={cn(
                  "flex shrink-0 flex-col gap-2 rounded-xl px-3 py-2.5 text-left ring-1 transition-colors max-md:w-48",
                  current ? "bg-brand/12 ring-brand" : "ring-transparent hover:bg-muted",
                )}
                aria-current={current}
              >
                <div className="flex w-full items-center gap-2.5">
                  <StatusDot status={view.status} />
                  <p className="min-w-0 flex-1 truncate font-semibold">
                    <span className="font-mono text-sm text-muted-foreground">{view.machine.id}</span> {view.machine.name}
                  </p>
                  {action && action.urgency !== "info" && (
                    <span className={cn("size-2.5 shrink-0 rounded-full ring-2 ring-background", URGENCY_META[action.urgency].text, "bg-current")} title={action.title} />
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">{action && action.urgency !== "info" ? action.title : (view.step?.step.label ?? STATUS_META[view.status].label)}</p>
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full rounded-full transition-[width] duration-700", STATUS_META[view.status].solid)} style={{ width: `${view.cycleProgress * 100}%` }} />
                </div>
              </button>
            )
          })}
        </nav>
        <MachinePanel key={selected.machine.id} view={selected} />
      </div>
    </div>
  )
}

export function TabletView() {
  return (
    <PlantGate fallback={<div className="grid h-dvh place-items-center text-muted-foreground">Connecting to plant feed…</div>}>
      <Tablet />
    </PlantGate>
  )
}
