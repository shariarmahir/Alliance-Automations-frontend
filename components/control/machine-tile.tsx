"use client"

import Link from "next/link"
import { memo } from "react"
import { ActionChip } from "@/components/control/action-chip"
import { GlowCard } from "@/components/glow-card"
import { CycleRing } from "@/components/plant/cycle-ring"
import { ExcessTime } from "@/components/plant/excess"
import { STATUS_META, StatusBadge } from "@/components/plant/status"
import { ShadeSwatch, StepReadout, stepValue } from "@/components/plant/step-readout"
import type { NextAction } from "@/lib/domain/actions"
import type { MachineView } from "@/lib/domain/types"
import { formatClock } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Statuses whose border light stays on, so problems call out across a grid of fifty quiet tiles. */
const CALLS_OUT = new Set(["delayed", "held", "complete"])

interface MachineTileProps {
  view: MachineView
  action: NextAction | null
  index: number
}

function Tile({ view, action, index }: MachineTileProps) {
  const { machine, status, batch, order, buyer } = view
  const meta = STATUS_META[status]
  const running = view.state.phase === "running"

  return (
    <GlowCard asChild quiet={!CALLS_OUT.has(status)} tone={meta.color} index={index} lift>
      <Link
        href={`/control/${machine.id}`}
        className={cn(
          "group flex h-full flex-col gap-3.5 bg-card/45 p-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          status === "offline" && "bg-hatch",
        )}
      >
        <div className="flex items-start gap-3">
          <CycleRing view={view} className="size-14 shrink-0">
            <span className="text-xs font-semibold tabular">{Math.round(view.cycleProgress * 100)}%</span>
          </CycleRing>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xs text-muted-foreground">{machine.id}</span>
              <span className="truncate font-semibold">{machine.name}</span>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {machine.type} · {machine.capacityKg} kg
            </p>
            <StatusBadge status={status} className="mt-1.5" />
          </div>
        </div>

        {batch && order ? (
          <div className="grid gap-1 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-medium">
                {buyer?.name} · {batch.id}
              </span>
              <span className="shrink-0 text-muted-foreground tabular">{batch.qtyKg} kg</span>
            </div>
            <ShadeSwatch hex={order.shade.hex} name={`${order.shade.name} · ${order.gsm} GSM`} className="text-muted-foreground" />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{view.remark}</p>
        )}

        {running && view.step && (
          <div className="flex flex-col gap-1.5">
            <StepReadout view={view} />
            <div className="h-1 overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full rounded-full transition-[width] duration-700", meta.solid)} style={{ width: `${view.step.progress * 100}%` }} />
            </div>
          </div>
        )}

        {view.startedAt && view.targetEndAt && (
          <dl className="mt-auto grid grid-cols-3 gap-2 border-t pt-2.5 text-[11px]">
            <div>
              <dt className="text-muted-foreground">Start</dt>
              <dd className="font-mono tabular">{formatClock(view.startedAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{running ? "Projected" : "Finished"}</dt>
              <dd className="font-mono tabular">{view.projectedEndAt ? formatClock(view.projectedEndAt) : "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Excess</dt>
              <dd>
                <ExcessTime minutes={view.excessMin} />
              </dd>
            </div>
          </dl>
        )}

        {action && <ActionChip action={action} />}
      </Link>
    </GlowCard>
  )
}

/** What the tile shows, as text. The tile re-renders only when this changes, not on every plant tick. */
const signature = ({ view, action, index }: MachineTileProps) =>
  [
    index,
    view.status,
    view.batch?.id,
    view.step?.index,
    Math.round((view.step?.progress ?? 0) * 100),
    Math.round(view.cycleProgress * 200),
    view.excessMin,
    view.projectedEndAt && formatClock(view.projectedEndAt),
    view.remark,
    stepValue(view),
    action?.title,
    action?.detail,
  ].join("|")

export const MachineTile = memo(Tile, (previous, next) => signature(previous) === signature(next))
