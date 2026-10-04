"use client"

import Link from "next/link"
import { STATUS_META, STATUS_ORDER } from "@/components/plant/status"
import { stepValue } from "@/components/plant/step-readout"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { BAYS } from "@/lib/domain/catalog"
import type { MachineView } from "@/lib/domain/types"
import { cn } from "@/lib/utils"

/** All 50 machines at a glance: one cell per machine, one row per bay. */
export function FleetMap({ views }: { views: MachineView[] }) {
  const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, views.filter((v) => v.status === s).length]))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {BAYS.map(({ bay, label }) => (
          <div key={bay} className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-xs text-muted-foreground">{label}</span>
            <div className="grid flex-1 grid-cols-10 gap-1.5">
              {views
                .filter((v) => v.machine.bay === bay)
                .map((view) => {
                  const meta = STATUS_META[view.status]
                  return (
                    <Tooltip key={view.machine.id}>
                      <TooltipTrigger asChild>
                        <Link
                          href={`/control/${view.machine.id}`}
                          className={cn(
                            "relative h-9 overflow-hidden rounded-md ring-1 ring-inset transition-transform hover:scale-[1.06] focus-visible:outline-2 focus-visible:outline-ring",
                            meta.soft,
                            meta.ring,
                            view.status === "offline" && "bg-hatch",
                          )}
                          aria-label={`${view.machine.id} ${view.machine.name}: ${meta.label}`}
                        >
                          <span className={cn("absolute inset-x-0 bottom-0 h-1", meta.solid)} style={{ width: `${view.cycleProgress * 100}%` }} />
                          <span className={cn("absolute top-1 left-1.5 font-mono text-[10px] font-semibold", meta.text)}>
                            {view.machine.id.slice(1)}
                          </span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-medium">
                          {view.machine.id} · {view.machine.name}
                        </p>
                        <p className="opacity-80">
                          {meta.label}
                          {view.step && ` · ${view.step.step.label} ${stepValue(view)}`}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
        {STATUS_ORDER.map((status) => {
          const meta = STATUS_META[status]
          return (
            <span key={status} className="inline-flex items-center gap-1.5 text-muted-foreground">
              <span className={cn("size-2 rounded-sm", meta.solid)} />
              {meta.label}
              <span className="font-medium text-foreground tabular">{counts[status]}</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
