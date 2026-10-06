"use client"

import { useState } from "react"
import { LogoMark } from "@/components/brand/logo"
import { PlantGate } from "@/components/plant/plant-gate"
import { STATUS_META, StatusDot } from "@/components/plant/status"
import { MachinePanel } from "@/components/tablet/machine-panel"
import { Button } from "@/components/ui/button"
import { BAYS } from "@/lib/domain/catalog"
import { formatClockSeconds } from "@/lib/format"
import { usePlant, useSnapshot } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

function Tablet() {
  const views = usePlant((state) => state.views)
  const now = useSnapshot((snapshot) => snapshot.now)
  const [bay, setBay] = useState(1)
  const [machineId, setMachineId] = useState("D01")
  const bayViews = views.filter((view) => view.machine.bay === bay)
  const selected = bayViews.find((view) => view.machine.id === machineId) ?? bayViews[0]

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center gap-4 border-b px-4 py-3">
        <LogoMark className="size-9" />
        <div className="flex gap-1.5">
          {BAYS.map((option) => (
            <Button
              key={option.bay}
              variant={option.bay === bay ? "default" : "outline"}
              size="lg"
              className="h-11 px-4 text-base"
              onClick={() => {
                setBay(option.bay)
                setMachineId(`D${String((option.bay - 1) * 10 + 1).padStart(2, "0")}`)
              }}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <div className="ml-auto text-right">
          <p className="font-mono text-xl font-semibold tabular">{formatClockSeconds(now)}</p>
          <p className="text-xs text-muted-foreground">Shift A · Operator tablet</p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <nav className="flex w-60 shrink-0 flex-col gap-1.5 overflow-y-auto border-r p-3" aria-label="Machines">
          {bayViews.map((view) => (
            <button
              key={view.machine.id}
              type="button"
              onClick={() => setMachineId(view.machine.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-left ring-1 transition-colors",
                view.machine.id === selected.machine.id ? "bg-primary/12 ring-primary" : "ring-transparent hover:bg-muted",
              )}
              aria-current={view.machine.id === selected.machine.id}
            >
              <StatusDot status={view.status} />
              <div className="min-w-0">
                <p className="font-semibold">
                  <span className="font-mono text-sm text-muted-foreground">{view.machine.id}</span> {view.machine.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">{view.step?.step.label ?? STATUS_META[view.status].label}</p>
              </div>
            </button>
          ))}
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
