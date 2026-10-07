import type { ControlSort } from "@/components/control/control-prefs"
import { nextAction } from "@/lib/domain/actions"
import type { MachineView } from "@/lib/domain/types"

export const SORT_LABEL: Record<ControlSort, string> = {
  machine: "Machine number",
  urgency: "Most urgent first",
  finish: "Finishing soonest",
  progress: "Most progress",
}

/** Machines with no projected end sort after every machine that has one. */
const NO_END = Number.POSITIVE_INFINITY

export function sortViews(views: MachineView[], sort: ControlSort, now: number): MachineView[] {
  switch (sort) {
    case "machine":
      return views
    case "urgency": {
      const priority = new Map(views.map((view) => [view.machine.id, nextAction(view, now)?.priority ?? 0]))
      return [...views].sort((a, b) => priority.get(b.machine.id)! - priority.get(a.machine.id)!)
    }
    case "finish": {
      const end = (view: MachineView) => (view.state.phase === "running" ? view.projectedEndAt ?? NO_END : NO_END)
      // Two machines without an end compare equal; Infinity minus Infinity would be NaN.
      return [...views].sort((a, b) => (end(a) === end(b) ? 0 : end(a) - end(b)))
    }
    case "progress":
      return [...views].sort((a, b) => b.cycleProgress - a.cycleProgress)
  }
}

export function matchesQuery(view: MachineView, needle: string) {
  return [view.machine.id, view.machine.name, view.batch?.id, view.buyer?.name, view.order?.shade.name, view.order?.id]
    .some((field) => field?.toLowerCase().includes(needle))
}
