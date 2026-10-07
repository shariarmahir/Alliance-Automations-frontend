"use client"

import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import { ActionButton } from "@/components/control/action-button"
import { ActionChip } from "@/components/control/action-chip"
import { GlowCard } from "@/components/glow-card"
import { CycleRing } from "@/components/plant/cycle-ring"
import { ExcessTime } from "@/components/plant/excess"
import { STATUS_META, StatusBadge } from "@/components/plant/status"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import type { NextAction } from "@/lib/domain/actions"
import { MACHINES } from "@/lib/domain/catalog"
import type { MachineView } from "@/lib/domain/types"
import { formatClock, formatHm, formatInt } from "@/lib/format"

const neighbour = (machineId: string, step: number) => {
  const index = MACHINES.findIndex((machine) => machine.id === machineId)
  return MACHINES[(index + step + MACHINES.length) % MACHINES.length]
}

/** `[` and `]` step to the previous and next machine, so a walk down the bay needs no mouse. */
function useMachineKeys(previous: string, next: string) {
  const router = useRouter()
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement
      if (event.metaKey || event.ctrlKey || ["INPUT", "TEXTAREA"].includes(target.tagName) || document.querySelector("[role=dialog]")) return
      if (event.key === "[") router.push(`/control/${previous}`)
      if (event.key === "]") router.push(`/control/${next}`)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [router, previous, next])
}

function Timing({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-mono text-sm font-medium tabular">{children}</dd>
    </div>
  )
}

export function MachineHeader({ view, action }: { view: MachineView; action: NextAction | null }) {
  const { machine } = view
  const previous = neighbour(machine.id, -1)
  const next = neighbour(machine.id, 1)
  useMachineKeys(previous.id, next.id)

  return (
    <GlowCard tone={STATUS_META[view.status].color} className="flex flex-col gap-5 bg-card/45 p-4 md:p-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/control">
            <ArrowLeft />
            Control panel
          </Link>
        </Button>
        <div className="ml-auto flex items-center gap-1.5">
          <Kbd className="max-md:hidden">[</Kbd>
          <Button variant="outline" size="icon-sm" asChild>
            <Link href={`/control/${previous.id}`} aria-label={`Previous machine, ${previous.id} ${previous.name}`}>
              <ChevronLeft />
            </Link>
          </Button>
          <Button variant="outline" size="icon-sm" asChild>
            <Link href={`/control/${next.id}`} aria-label={`Next machine, ${next.id} ${next.name}`}>
              <ChevronRight />
            </Link>
          </Button>
          <Kbd className="max-md:hidden">]</Kbd>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <CycleRing view={view} className="size-24 shrink-0 md:size-28">
          <div>
            <p className="text-xl font-semibold tabular md:text-2xl">{Math.round(view.cycleProgress * 100)}%</p>
            <p className="text-[10px] text-muted-foreground">{view.step ? `step ${view.step.index + 1}/${view.step.total}` : "cycle"}</p>
          </div>
        </CycleRing>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-mono text-sm text-muted-foreground">{machine.id}</span>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{machine.name}</h2>
            <StatusBadge status={view.status} className="h-7 px-3 text-sm" />
          </div>
          <p className="mt-1 text-sm font-medium text-brand">
            Bay {machine.bay} · {machine.type} · {formatInt(machine.capacityKg)} kg · {machine.link}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-5">
            <Timing label="Started">{view.startedAt ? formatClock(view.startedAt) : "—"}</Timing>
            <Timing label="Target">{view.targetEndAt ? formatClock(view.targetEndAt) : "—"}</Timing>
            <Timing label="Projected">{view.projectedEndAt ? formatClock(view.projectedEndAt) : "—"}</Timing>
            <Timing label="Running">{view.runningMin ? formatHm(view.runningMin) : "—"}</Timing>
            <Timing label="Excess">
              <ExcessTime minutes={view.excessMin} empty="On standard" />
            </Timing>
          </dl>
        </div>
        {action && (
          <div className="flex w-full flex-col gap-2 lg:w-72">
            <ActionChip action={action} />
            {action.command && action.command !== "inspect" && <ActionButton action={action} size="default" />}
          </div>
        )}
      </div>
    </GlowCard>
  )
}
