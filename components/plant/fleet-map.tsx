"use client"

import Link from "next/link"
import { STATUS_META, STATUS_ORDER } from "@/components/plant/status"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { BAYS } from "@/lib/domain/catalog"
import type { MachineStatus, MachineView } from "@/lib/domain/types"
import { cn } from "@/lib/utils"

/** Cycle progress is drawn in steps of this size, so the map only changes when a bar visibly moves. */
const PROGRESS_STEP = 0.02

export interface FleetCell {
  id: string
  name: string
  bay: number
  status: MachineStatus
  progress: number
  step: string | null
}

export const fleetCell = (view: MachineView): FleetCell => ({
  id: view.machine.id,
  name: view.machine.name,
  bay: view.machine.bay,
  status: view.status,
  progress: Math.round(view.cycleProgress / PROGRESS_STEP) * PROGRESS_STEP,
  step: view.step?.step.label ?? null,
})

/** All 50 machines at a glance: one cell per machine, one row per bay. */
export function FleetMap({ cells }: { cells: FleetCell[] }) {
  const counts = Object.fromEntries(STATUS_ORDER.map((s) => [s, cells.filter((c) => c.status === s).length]))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {BAYS.map(({ bay, label }) => (
          <div key={bay} className="flex items-center gap-2 sm:gap-3">
            <span className="w-9 shrink-0 text-xs text-muted-foreground sm:w-12">
              <span className="max-sm:hidden">Bay </span>
              {bay}
            </span>
            <div className="grid flex-1 grid-cols-5 gap-1 min-[480px]:grid-cols-10 sm:gap-1.5">
              {cells
                .filter((cell) => cell.bay === bay)
                .map((cell) => {
                  const meta = STATUS_META[cell.status]
                  return (
                    <Tooltip key={cell.id}>
                      <TooltipTrigger asChild>
                        <Link
                          href={`/control/${cell.id}`}
                          className={cn(
                            "relative h-9 overflow-hidden rounded-md ring-1 ring-inset transition-transform hover:scale-[1.06] focus-visible:outline-2 focus-visible:outline-ring",
                            meta.soft,
                            meta.ring,
                            cell.status === "offline" && "bg-hatch",
                          )}
                          aria-label={`${cell.id} ${cell.name}: ${meta.label}, ${label}`}
                        >
                          <span className={cn("absolute inset-x-0 bottom-0 h-1 transition-[width] duration-700", meta.solid)} style={{ width: `${cell.progress * 100}%` }} />
                          <span className={cn("absolute top-1 left-1.5 font-mono text-[10px] font-semibold", meta.text)}>{cell.id.slice(1)}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-medium">
                          {cell.id} · {cell.name}
                        </p>
                        <p className="opacity-80">
                          {meta.label}
                          {cell.step && ` · ${cell.step}`} · {Math.round(cell.progress * 100)}%
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
