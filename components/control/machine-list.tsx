"use client"

import Link from "next/link"
import { memo } from "react"
import { ActionChip } from "@/components/control/action-chip"
import { Panel } from "@/components/panel"
import { CycleRing } from "@/components/plant/cycle-ring"
import { ExcessTime } from "@/components/plant/excess"
import { STATUS_META, StatusBadge } from "@/components/plant/status"
import { ShadeSwatch, StepReadout, stepValue } from "@/components/plant/step-readout"
import type { NextAction } from "@/lib/domain/actions"
import type { MachineView } from "@/lib/domain/types"
import { formatClock } from "@/lib/format"
import { cn } from "@/lib/utils"

/** One track list shared by the header and every row, so the columns line up. */
const COLUMNS = "md:grid-cols-[minmax(11rem,1.1fr)_7.5rem_minmax(10rem,1fr)_minmax(10rem,1fr)_4.5rem_4.5rem_minmax(11rem,1fr)]"
const HEADERS = ["Machine", "Status", "Live step", "Batch", "Projected", "Excess", "Next action"]

interface RowProps {
  view: MachineView
  action: NextAction | null
}

function Row({ view, action }: RowProps) {
  const { machine, batch, order, buyer } = view
  const meta = STATUS_META[view.status]
  return (
    <li>
      <Link
        href={`/control/${machine.id}`}
        className={cn(
          "relative grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2 px-4 py-3 outline-none transition-colors hover:bg-brand/5 focus-visible:bg-brand/8 md:gap-x-4",
          COLUMNS,
          view.status === "offline" && "bg-hatch",
        )}
      >
        <span className={cn("absolute inset-y-2 left-0 w-0.5 rounded-full", meta.solid)} aria-hidden />
        <div className="flex min-w-0 items-center gap-3 max-md:col-span-2">
          <CycleRing view={view} className="size-9 shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              <span className="font-mono text-xs font-normal text-muted-foreground">{machine.id}</span> {machine.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {machine.type} · {machine.capacityKg} kg
            </p>
          </div>
        </div>
        <StatusBadge status={view.status} className="justify-self-end md:justify-self-start" />
        <div className="min-w-0 max-md:col-span-2">
          {view.step ? (
            <div className="flex flex-col gap-1.5">
              <StepReadout view={view} />
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div className={cn("h-full rounded-full transition-[width] duration-700", meta.solid)} style={{ width: `${view.step.progress * 100}%` }} />
              </div>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">{view.remark}</span>
          )}
        </div>
        <div className="min-w-0 text-xs max-md:hidden">
          {batch && order ? (
            <>
              <p className="truncate font-medium">
                {buyer?.name} · {batch.id}
              </p>
              <ShadeSwatch hex={order.shade.hex} name={`${order.shade.name} · ${batch.qtyKg} kg`} className="text-muted-foreground" />
            </>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
        <span className="font-mono text-xs tabular max-md:hidden">
          {view.state.phase === "running" && view.projectedEndAt ? formatClock(view.projectedEndAt) : "—"}
        </span>
        <span className="text-xs max-md:justify-self-end">
          <ExcessTime minutes={view.excessMin} />
        </span>
        <div className="min-w-0 max-md:col-span-3">{action ? <ActionChip action={action} compact /> : <span className="text-xs text-muted-foreground max-md:hidden">On standard</span>}</div>
      </Link>
    </li>
  )
}

const signature = ({ view, action }: RowProps) =>
  [
    view.status,
    view.batch?.id,
    view.step?.index,
    Math.round((view.step?.progress ?? 0) * 100),
    Math.round(view.cycleProgress * 100),
    view.excessMin,
    view.projectedEndAt && formatClock(view.projectedEndAt),
    view.remark,
    stepValue(view),
    action?.title,
    action?.detail,
  ].join("|")

const MachineRow = memo(Row, (previous, next) => signature(previous) === signature(next))

/** The dense layout: one line per machine, for scanning the whole floor without scrolling through tiles. */
export function MachineList({ views, actions }: { views: MachineView[]; actions: Map<string, NextAction> }) {
  return (
    <Panel className="gap-0 py-0">
      <div className={cn("grid gap-x-4 border-b px-4 py-2.5 text-[11px] font-medium tracking-wider text-muted-foreground uppercase max-md:hidden", COLUMNS)}>
        {HEADERS.map((header) => (
          <span key={header}>{header}</span>
        ))}
      </div>
      <ul className="flex flex-col divide-y">
        {views.map((view) => (
          <MachineRow key={view.machine.id} view={view} action={actions.get(view.machine.id) ?? null} />
        ))}
      </ul>
    </Panel>
  )
}
