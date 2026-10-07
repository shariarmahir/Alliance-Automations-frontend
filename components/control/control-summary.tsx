"use client"

import type { ComponentType, ReactNode } from "react"
import { GlowCard } from "@/components/glow-card"
import type { IconProps } from "@/components/landing/icons/frame"
import { ActionQueue, BayLoad, Delivery, Processing } from "@/components/plant/icons/console-icons"
import type { NextAction } from "@/lib/domain/actions"
import type { MachineView } from "@/lib/domain/types"
import { formatClock, formatKg } from "@/lib/format"

function Tile({ icon: Icon, label, value, hint, index }: { icon: ComponentType<IconProps>; label: string; value: ReactNode; hint: ReactNode; index: number }) {
  return (
    <GlowCard index={index} className="flex items-center gap-3.5 bg-card/45 p-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/20">
        <Icon className="size-6" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-xl font-semibold tracking-tight tabular">{value}</p>
        <p className="truncate text-xs text-muted-foreground">{hint}</p>
      </div>
    </GlowCard>
  )
}

/** The four numbers a shift supervisor checks before looking at any machine. */
export function ControlSummary({ views, actions }: { views: MachineView[]; actions: NextAction[] }) {
  const running = views.filter((view) => view.state.phase === "running")
  const kgInBath = running.reduce((sum, view) => sum + (view.batch?.qtyKg ?? 0), 0)
  const capacity = views.reduce((sum, view) => sum + view.machine.capacityKg, 0)
  const critical = actions.filter((action) => action.urgency === "critical").length
  const nextFinish = running
    .filter((view) => view.projectedEndAt)
    .reduce<MachineView | null>((soonest, view) => (!soonest || view.projectedEndAt! < soonest.projectedEndAt! ? view : soonest), null)

  return (
    <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
      <Tile index={0} icon={Processing} label="Processing" value={`${running.length} / ${views.length}`} hint={`${views.filter((v) => v.status === "running").length} on standard`} />
      <Tile
        index={1}
        icon={ActionQueue}
        label="Waiting on an operator"
        value={actions.length}
        hint={critical ? <span className="text-delayed">{critical} critical</span> : "None critical"}
      />
      <Tile index={2} icon={BayLoad} label="Fabric in the bath" value={formatKg(kgInBath)} hint={`${Math.round((kgInBath / Math.max(1, capacity)) * 100)}% of capacity`} />
      <Tile
        index={3}
        icon={Delivery}
        label="Next to finish"
        value={nextFinish?.projectedEndAt ? formatClock(nextFinish.projectedEndAt) : "—"}
        hint={nextFinish ? `${nextFinish.machine.id} ${nextFinish.machine.name} · ${nextFinish.batch?.id}` : "No batch running"}
      />
    </div>
  )
}
