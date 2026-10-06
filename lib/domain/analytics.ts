import { HOUR, MINUTE } from "@/lib/time"
import { BAYS, BUYERS, temperatureProfile } from "./catalog"
import type { CompletedBatch, MachineView, Order, RecipeStep, Run } from "./types"

/** Kilograms finished in each of the last `hours` clock hours, oldest first. */
export function hourlyOutput(completed: CompletedBatch[], now: number, hours = 24) {
  const currentHour = Math.floor(now / HOUR) * HOUR
  return Array.from({ length: hours }, (_, i) => {
    const start = currentHour - (hours - 1 - i) * HOUR
    const batches = completed.filter((c) => c.endedAt >= start && c.endedAt < start + HOUR)
    return {
      hour: start,
      kg: batches.reduce((sum, c) => sum + c.qtyKg, 0),
      batches: batches.length,
    }
  })
}

export function bayLoad(views: MachineView[]) {
  return BAYS.map(({ bay, label, range }) => {
    const machines = views.filter((v) => v.machine.bay === bay)
    const processing = machines.filter((v) => v.state.phase === "running")
    return {
      bay,
      label,
      range,
      processing: processing.length,
      available: machines.filter((v) => v.status !== "offline").length,
      alerts: machines.filter((v) => v.status === "delayed" || v.status === "held").length,
      kgInProcess: processing.reduce((sum, v) => sum + (v.batch?.qtyKg ?? 0), 0),
      capacityKg: machines.reduce((sum, v) => sum + v.machine.capacityKg, 0),
    }
  })
}

/**
 * Dyeing ETA per open order, assuming the floor's daily output is shared evenly across
 * every order still in dyeing. Negative slack means the order misses its delivery date.
 */
export function deliveryRisk(orders: Order[], views: MachineView[], now: number, dailyKg: number) {
  const open = orders.filter((o) => o.stage === "dyeing" || o.stage === "planned")
  const perOrderKgPerDay = Math.max(1, dailyKg / Math.max(1, open.length))

  return open
    .map((order) => {
      const remainingKg = Math.max(0, order.qtyKg - order.dyedKg)
      const etaAt = now + (remainingKg / perOrderKgPerDay) * 24 * HOUR
      const onMachines = views.filter((v) => v.order?.id === order.id && v.state.phase === "running").length
      return { order, remainingKg, etaAt, onMachines, slackHours: (order.dueAt - etaAt) / HOUR }
    })
    .sort((a, b) => a.slackHours - b.slackHours)
}

export function buyerVolumes(orders: Order[]) {
  return BUYERS.map((buyer) => {
    const own = orders.filter((o) => o.buyerId === buyer.id)
    return {
      buyer,
      openOrders: own.filter((o) => o.stage !== "shipped").length,
      openKg: own.filter((o) => o.stage !== "shipped").reduce((sum, o) => sum + o.qtyKg - o.dyedKg, 0),
      pendingApprovals: own.filter((o) => o.approval !== "approved").length,
    }
  })
}

export interface TracePoint {
  minute: number
  planned?: number
  actual?: number
}

/** Planned bath temperature from the recipe, against the actual path taken so far. */
export function temperatureTrace(recipe: RecipeStep[], run: Run, now: number, currentC: number): TracePoint[] {
  const profile = temperatureProfile(recipe)
  const points: TracePoint[] = []

  let minute = 0
  recipe.forEach((step, i) => {
    points.push({ minute, planned: profile[i].from })
    minute += step.plannedMin
    points.push({ minute, planned: profile[i].to })
  })

  const at = (time: number) => (time - run.startedAt) / MINUTE
  for (const record of run.steps) {
    points.push({ minute: at(record.startedAt), actual: profile[record.index].from })
    points.push({ minute: at(record.endedAt), actual: profile[record.index].to })
  }
  points.push({ minute: at(run.stepStartedAt), actual: profile[run.stepIndex].from })
  points.push({ minute: at(now), actual: currentC })

  return points.sort((a, b) => a.minute - b.minute)
}
