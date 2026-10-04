import { formatHm } from "@/lib/format"
import { MACHINES, REASONS, buyerById, plannedMinutes, temperatureProfile } from "./catalog"
import type {
  Alert,
  Batch,
  CompletedBatch,
  Machine,
  MachineState,
  MachineStatus,
  MachineView,
  Order,
  PlantKpis,
  PlantSnapshot,
  RecipeStep,
  Run,
  StepProgress,
  Telemetry,
} from "./types"

export const MINUTE = 60_000

/** A batch is delayed once its projected end passes the standard target by this many minutes. */
export const DELAY_THRESHOLD_MIN = 15
/** Overruns beyond this escalate from the supervisor to the production manager. */
export const ESCALATION_MIN = 60
/** How long a finished batch may wait for unloading before the machine is counted idle. */
export const COMPLETE_DWELL_MIN = 10

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const lerp = (from: number, to: number, t: number) => from + (to - from) * t

/** Smooth, deterministic sensor jitter so values breathe without random re-renders. */
function jitter(now: number, seed: number, amplitude: number) {
  return (Math.sin(now / 7_000 + seed) * 0.6 + Math.sin(now / 2_300 + seed * 1.7) * 0.4) * amplitude
}

/** Minutes spent in the current step. Time on hold does not count. */
export function stepElapsedMin(run: Run, now: number) {
  const until = run.hold ? run.hold.since : now
  return Math.max(0, (until - run.stepStartedAt) / MINUTE)
}

export function stepProgress(run: Run, recipe: RecipeStep[], now: number): StepProgress {
  const step = recipe[run.stepIndex]
  const elapsedMin = stepElapsedMin(run, now)
  return {
    index: run.stepIndex,
    total: recipe.length,
    step,
    elapsedMin,
    progress: clamp(elapsedMin / (step.plannedMin * run.pace)),
  }
}

/** Projected end = now + planned time left in the current step + every remaining planned step. */
export function projectedEndAt(run: Run, recipe: RecipeStep[], now: number) {
  const current = recipe[run.stepIndex]
  const leftInStep = Math.max(0, current.plannedMin - stepElapsedMin(run, now))
  const leftAfter = plannedMinutes(recipe.slice(run.stepIndex + 1))
  return now + (leftInStep + leftAfter) * MINUTE
}

export const excessMinutes = (projectedEnd: number, targetEnd: number) =>
  Math.max(0, Math.round((projectedEnd - targetEnd) / MINUTE))

export function deriveStatus(state: MachineState, excessMin: number): MachineStatus {
  if (state.phase !== "running") return state.phase
  if (state.run?.hold) return "held"
  return excessMin >= DELAY_THRESHOLD_MIN ? "delayed" : "running"
}

const AMBIENT_C = 32
const IDLE_TELEMETRY: Telemetry = {
  temperatureC: AMBIENT_C,
  levelL: 0,
  pressureBar: 0,
  circulationPct: 0,
  dosedL: 0,
  drainPct: 0,
  powerKw: 0,
}

export function readTelemetry(
  machine: Machine,
  recipe: RecipeStep[],
  progress: StepProgress,
  held: boolean,
  now: number,
): Telemetry {
  const seed = Number(machine.id.slice(1))
  const { step, progress: p } = progress
  const range = temperatureProfile(recipe)[progress.index]
  const liquorL = recipe.find((s) => s.kind === "fill")?.target ?? machine.capacityKg * 8

  const thermalHold = step.kind === "hold"
  const temperatureC = thermalHold
    ? range.to + jitter(now, seed, 0.6)
    : lerp(range.from, range.to, p) + jitter(now, seed, 0.25)

  const levelL =
    step.kind === "load" || step.kind === "unload"
      ? 0
      : step.kind === "fill"
        ? liquorL * p
        : step.kind === "drain"
          ? liquorL * (1 - p)
          : step.kind === "rinse"
            ? liquorL * 0.85
            : liquorL

  const wetProcess = step.kind !== "load" && step.kind !== "unload" && step.kind !== "drain"
  const circulationPct = wetProcess ? (held ? 35 : step.kind === "fill" ? 40 : 78) + jitter(now, seed + 3, 4) : 0

  return {
    temperatureC,
    levelL,
    pressureBar: wetProcess ? 0.4 + Math.max(0, temperatureC - 40) / 40 + jitter(now, seed + 5, 0.05) : 0,
    circulationPct,
    dosedL: step.kind === "dose" ? step.target * p : 0,
    drainPct: step.kind === "drain" ? p * 100 : 0,
    powerKw: machine.capacityKg * 0.025 * (0.3 + circulationPct / 100) + jitter(now, seed + 7, 0.4),
  }
}

function remarkFor(status: MachineStatus, state: MachineState, excessMin: number, step: StepProgress | null) {
  switch (status) {
    case "held":
      return REASONS[state.run!.hold!.reason].label
    case "delayed":
      return `Projected +${formatHm(excessMin)} over target`
    case "running":
      return step && step.progress >= 1 ? `${step.step.label} running long` : "On standard"
    case "complete":
      return "Awaiting unload"
    case "ready":
      return "Batch at machine"
    case "idle":
      return state.next ? (state.next.prep === "ready" ? "Next batch ready" : "Next batch preparing") : "No batch planned"
    case "offline":
      return state.downtime ? REASONS[state.downtime.reason].label : "Not available"
  }
}

export function buildView(
  machine: Machine,
  state: MachineState,
  batches: Record<string, Batch>,
  orders: Map<string, Order>,
  now: number,
): MachineView {
  const run = state.run
  const batchId = run?.batchId ?? state.next?.batchId
  const batch = batchId ? batches[batchId] ?? null : null
  const order = batch ? orders.get(batch.orderId) ?? null : null

  const active = state.phase === "running" && run && batch
  const step = active ? stepProgress(run, batch.recipe, now) : null
  const projected = active ? projectedEndAt(run, batch.recipe, now) : run?.steps.at(-1)?.endedAt ?? null
  const excessMin = run && projected ? excessMinutes(projected, run.targetEndAt) : 0
  const status = deriveStatus(state, excessMin)
  const total = batch ? plannedMinutes(batch.recipe) : 0
  const donePlanned = batch && step ? plannedMinutes(batch.recipe.slice(0, step.index)) + Math.min(step.elapsedMin, step.step.plannedMin) : 0

  return {
    machine,
    state,
    status,
    batch,
    order,
    buyer: order ? buyerById.get(order.buyerId) ?? null : null,
    step,
    telemetry: active ? readTelemetry(machine, batch.recipe, step!, Boolean(run.hold), now) : IDLE_TELEMETRY,
    startedAt: run?.startedAt ?? null,
    targetEndAt: run?.targetEndAt ?? null,
    projectedEndAt: projected,
    runningMin: run ? Math.round(((active ? now : projected ?? now) - run.startedAt) / MINUTE) : 0,
    excessMin,
    cycleProgress: state.phase === "complete" ? 1 : total ? clamp(donePlanned / total) : 0,
    remark: remarkFor(status, state, excessMin, step),
  }
}

export function buildViews(snapshot: PlantSnapshot): MachineView[] {
  const orders = new Map(snapshot.orders.map((o) => [o.id, o]))
  return MACHINES.map((machine, i) => buildView(machine, snapshot.states[i], snapshot.batches, orders, snapshot.now))
}

export function deriveAlerts(views: MachineView[], acknowledged: string[]): Alert[] {
  const acked = new Set(acknowledged)
  const alerts: Alert[] = []

  for (const view of views) {
    const run = view.state.run
    if (!run || view.state.phase !== "running") continue

    const cause = run.hold ? run.hold.reason : view.excessMin >= DELAY_THRESHOLD_MIN ? "overrun" : null
    if (!cause) continue

    const id = `${view.machine.id}:${run.batchId}:${cause}`
    alerts.push({
      id,
      machineId: view.machine.id,
      batchId: run.batchId,
      cause,
      excessMin: view.excessMin,
      severity: view.excessMin >= ESCALATION_MIN || cause === "machine-fault" ? "critical" : "warning",
      since: run.hold?.since ?? view.projectedEndAt ?? run.startedAt,
      acknowledged: acked.has(id),
    })
  }

  return alerts.sort((a, b) => Number(a.acknowledged) - Number(b.acknowledged) || b.excessMin - a.excessMin)
}

function perKg(completed: CompletedBatch[], pick: (c: CompletedBatch) => number) {
  const kg = completed.reduce((sum, c) => sum + c.qtyKg, 0)
  return kg ? completed.reduce((sum, c) => sum + pick(c), 0) / kg : 0
}

export function computeKpis(views: MachineView[], snapshot: PlantSnapshot): PlantKpis {
  const count = (status: MachineStatus) => views.filter((v) => v.status === status).length
  const today = snapshot.completed.filter((c) => c.endedAt >= snapshot.dayStart)
  const available = views.filter((v) => v.status !== "offline").length
  const processing = views.filter((v) => v.state.phase === "running").length

  return {
    total: views.length,
    running: count("running"),
    delayed: count("delayed"),
    held: count("held"),
    ready: count("ready"),
    complete: count("complete"),
    idle: count("idle"),
    offline: count("offline"),
    batchesPrepared: snapshot.states.filter((s) => s.next?.prep === "ready").length,
    producedKg: today.reduce((sum, c) => sum + c.qtyKg, 0),
    batchesCompleted: today.length,
    utilization: available ? processing / available : 0,
    rightFirstTime: today.length ? today.filter((c) => c.rightFirstTime).length / today.length : 0,
    energyKwhPerKg: perKg(today, (c) => c.energyKwh),
    steamKgPerKg: perKg(today, (c) => c.steamKg),
    waterLPerKg: perKg(today, (c) => c.waterL),
  }
}
