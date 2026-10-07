import { STATUS_META } from "@/components/plant/status"
import { plannedMinutes } from "@/lib/domain/catalog"
import type { MachineView, PlantSnapshot } from "@/lib/domain/types"
import { formatClock, formatInt } from "@/lib/format"
import { HOUR, MINUTE } from "@/lib/time"

export const WINDOW_BACK = 8 * HOUR

export const WINDOW_AHEAD = 10 * HOUR

const CHANGEOVER_MIN = 15

interface Segment {
  key: string
  start: number
  end: number
  label: string
  detail: string
  kind: "done" | "live" | "planned"
  className: string
}

export function segmentsFor(view: MachineView, snapshot: PlantSnapshot): Segment[] {
  const id = view.machine.id
  const segments: Segment[] = snapshot.completed
    .filter((c) => c.machineId === id)
    .map((c) => ({
      key: c.batchId,
      start: c.startedAt,
      end: c.endedAt,
      label: c.batchId,
      detail: `${formatInt(c.qtyKg)} kg · ${formatClock(c.startedAt)}–${formatClock(c.endedAt)}`,
      kind: "done",
      className: "bg-muted-foreground/25",
    }))

  // A finished batch keeps its run until it is unloaded, but it is already in `completed`; drawing it again here
  // would put the same batch on the timeline twice.
  const run = view.state.phase === "running" ? view.state.run : null
  let freeAt = snapshot.now
  if (run && view.batch) {
    const end = view.projectedEndAt ?? run.targetEndAt
    segments.push({
      key: run.batchId,
      start: run.startedAt,
      end: Math.max(end, snapshot.now),
      label: `${run.batchId} · ${view.buyer?.name ?? ""}`,
      detail: `Target ${formatClock(run.targetEndAt)} · projected ${formatClock(end)}`,
      kind: "live",
      className: STATUS_META[view.status].solid,
    })
    freeAt = Math.max(end, snapshot.now) + CHANGEOVER_MIN * MINUTE
  }

  const next = view.state.next
  if (next) {
    const batch = snapshot.batches[next.batchId]
    segments.push({
      key: next.batchId,
      start: freeAt,
      end: freeAt + plannedMinutes(batch.recipe) * MINUTE,
      label: `${next.batchId} · next`,
      detail: `${formatInt(batch.qtyKg)} kg · prep ${next.prep}`,
      kind: "planned",
      className: "",
    })
  }
  return segments
}
