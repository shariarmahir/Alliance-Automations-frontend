import { formatClock, formatHm } from "@/lib/format"
import { MINUTE } from "@/lib/time"
import { REASONS } from "./catalog"
import { ESCALATION_MIN } from "./rules"
import type { MachineView } from "./types"

/** The one command that moves a machine forward, when there is one the operator can give. */
export type ActionCommand = "release" | "unload" | "load" | "inspect"

export type ActionUrgency = "critical" | "high" | "normal" | "info"

export interface NextAction {
  machineId: string
  urgency: ActionUrgency
  /** Higher first. Combines urgency with how long the machine has been waiting. */
  priority: number
  title: string
  detail: string
  command: ActionCommand | null
}

const URGENCY_BASE: Record<ActionUrgency, number> = { critical: 400, high: 300, normal: 200, info: 100 }

const waited = (view: MachineView, now: number) => Math.max(0, Math.round((now - view.state.phaseSince) / MINUTE))

function action(view: MachineView, urgency: ActionUrgency, weight: number, title: string, detail: string, command: ActionCommand | null): NextAction {
  return { machineId: view.machine.id, urgency, priority: URGENCY_BASE[urgency] + Math.min(99, weight), title, detail, command }
}

/**
 * What an operator should do next at this machine. It reads only derived state, so it agrees with the status,
 * delay and escalation rules in `rules.ts`. Returns null when the machine needs nothing.
 */
export function nextAction(view: MachineView, now: number): NextAction | null {
  const { state, step } = view
  const batchId = view.batch?.id ?? state.next?.batchId ?? ""

  switch (view.status) {
    case "held": {
      const hold = state.run!.hold!
      const heldMin = Math.round((now - hold.since) / MINUTE)
      const reason = REASONS[hold.reason]
      return action(view, heldMin >= 20 ? "high" : "normal", heldMin, `Clear hold · ${reason.label}`, `${reason.owner} · on hold ${formatHm(heldMin)}`, "release")
    }
    case "delayed": {
      const critical = view.excessMin >= ESCALATION_MIN
      return action(
        view,
        critical ? "critical" : "high",
        view.excessMin,
        critical ? "Escalated overrun" : "Check the running step",
        `${step?.step.label ?? "Cycle"} · projected +${formatHm(view.excessMin)}`,
        "inspect",
      )
    }
    case "complete":
      return action(view, "high", waited(view, now), `Unload ${batchId}`, `Finished ${formatHm(waited(view, now))} ago`, "unload")
    case "ready":
      return action(view, "normal", waited(view, now), `Load ${batchId}`, `Batch at the machine ${formatHm(waited(view, now))}`, "load")
    case "running":
      if (step && step.progress >= 1) return action(view, "normal", 0, `${step.step.label} running long`, "Check before it becomes a delay", "inspect")
      return null
    case "idle":
      if (state.next?.prep === "preparing") return action(view, "info", 0, "Batch preparing", `${state.next.batchId} ready ${formatClock(state.next.prepReadyAt)}`, null)
      return action(view, "info", waited(view, now), "No batch planned", "Ask planning for the next batch", null)
    case "offline":
      return state.downtime
        ? action(view, "info", 0, REASONS[state.downtime.reason].label, `Back in service ${formatClock(state.downtime.until)}`, null)
        : null
  }
}

/** Every machine that needs something, most urgent first. */
export function actionQueue(views: MachineView[], now: number, includeInfo = false): NextAction[] {
  return views
    .map((view) => nextAction(view, now))
    .filter((item): item is NextAction => item !== null && (includeInfo || item.urgency !== "info"))
    .sort((a, b) => b.priority - a.priority)
}
