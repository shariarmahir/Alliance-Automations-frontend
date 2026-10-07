"use client"

import { GlowCard } from "@/components/glow-card"
import { formatClock } from "@/lib/format"
import { useSnapshot } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

const SHOWN = 5

/** The machine's last few events, so the operator sees that a command landed and what the last shift noted. */
export function RecentEvents({ machineId }: { machineId: string }) {
  const events = useSnapshot((snapshot) => snapshot.events)
  const log = events.filter((event) => event.machineId === machineId).slice(-SHOWN).reverse()

  return (
    <GlowCard quiet className="bg-card/45 p-5">
      <p className="mb-3 font-medium">Machine log</p>
      <ol className="flex flex-col gap-2.5 text-sm">
        {log.map((event) => (
          <li key={event.id} className="flex gap-3">
            <span className="w-11 shrink-0 font-mono text-xs text-muted-foreground tabular">{formatClock(event.at)}</span>
            <span className={cn(event.kind === "note" ? "text-ready" : event.kind === "command" ? "text-brand" : event.kind === "hold" && "text-held")}>{event.message}</span>
          </li>
        ))}
        {!log.length && <li className="text-muted-foreground">No events yet.</li>}
      </ol>
    </GlowCard>
  )
}
