"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { STATUS_META, StatusBadge } from "@/components/plant/status"
import { ShadeSwatch, StepReadout } from "@/components/plant/step-readout"
import type { MachineView } from "@/lib/domain/types"
import { formatClock, formatHm } from "@/lib/format"
import { cn } from "@/lib/utils"

function Ring({ value, className }: { value: number; className: string }) {
  const radius = 15
  const circumference = 2 * Math.PI * radius
  return (
    <svg viewBox="0 0 36 36" className="size-11 -rotate-90" aria-hidden>
      <circle cx="18" cy="18" r={radius} fill="none" strokeWidth="3" className="stroke-muted" />
      <circle
        cx="18"
        cy="18"
        r={radius}
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - value)}
        className={cn("transition-[stroke-dashoffset] duration-700", className)}
      />
    </svg>
  )
}

export function MachineTile({ view }: { view: MachineView }) {
  const { machine, status, batch, order, buyer } = view
  const meta = STATUS_META[status]
  const active = view.state.phase === "running"

  return (
    <motion.div layout transition={{ type: "spring", stiffness: 420, damping: 38 }}>
      <Link
        href={`/control/${machine.id}`}
        className={cn(
          "group relative flex h-full flex-col gap-3 overflow-hidden rounded-xl bg-card p-4 ring-1 ring-foreground/10 transition-shadow hover:ring-foreground/25 focus-visible:outline-2 focus-visible:outline-ring",
          status === "offline" && "bg-hatch",
        )}
      >
        <span className={cn("absolute inset-y-0 left-0 w-0.5", meta.solid)} aria-hidden />

        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xs text-muted-foreground">{machine.id}</span>
              <span className="truncate font-semibold">{machine.name}</span>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {machine.type} · {machine.capacityKg} kg
            </p>
          </div>
          <div className="relative grid place-items-center">
            <Ring value={view.cycleProgress} className={cn("stroke-current", meta.text)} />
            <span className="absolute text-[10px] font-semibold tabular">{Math.round(view.cycleProgress * 100)}%</span>
          </div>
        </div>

        <StatusBadge status={status} className="self-start" />

        {batch && order ? (
          <div className="grid gap-1 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-medium">
                {buyer?.name} · {batch.id}
              </span>
              <span className="text-muted-foreground tabular">{batch.qtyKg} kg</span>
            </div>
            <ShadeSwatch hex={order.shade.hex} name={`${order.shade.name} · ${order.gsm} GSM`} className="text-muted-foreground" />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{view.remark}</p>
        )}

        {active && view.step && (
          <div className="flex flex-col gap-1.5">
            <StepReadout view={view} />
            <div className="h-1 overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full rounded-full transition-[width] duration-700", meta.solid)} style={{ width: `${view.step.progress * 100}%` }} />
            </div>
          </div>
        )}

        {view.startedAt && view.targetEndAt && (
          <div className="mt-auto grid grid-cols-3 gap-2 border-t pt-2.5 text-[11px]">
            <div>
              <p className="text-muted-foreground">Start</p>
              <p className="font-mono tabular">{formatClock(view.startedAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Target</p>
              <p className="font-mono tabular">{formatClock(view.targetEndAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Excess</p>
              <p className={cn("font-mono tabular", view.excessMin >= 15 ? "text-delayed" : view.excessMin > 0 ? "text-held" : "text-muted-foreground")}>
                {view.excessMin > 0 ? `+${formatHm(view.excessMin)}` : "—"}
              </p>
            </div>
          </div>
        )}
      </Link>
    </motion.div>
  )
}
