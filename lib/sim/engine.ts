import { REASONS, buildRecipe, correctionSteps, machineById, plannedMinutes } from "@/lib/domain/catalog"
import { COMPLETE_DWELL_MIN } from "@/lib/domain/rules"
import type {
  Batch,
  Hold,
  Machine,
  MachineState,
  PlantEventKind,
  PlantSnapshot,
  QueuedBatch,
  ReasonCode,
  Run,
} from "@/lib/domain/types"
import { HOUR, MINUTE } from "@/lib/time"
import { between, weighted, type Random } from "./random"

/** Chance per machine-minute that a running batch is put on hold. Roughly five holds an hour across 50 machines. */
const HOLD_RATE_PER_MIN = 0.0016
/** Chance per machine-minute that an idle machine is taken down for maintenance. */
const MAINTENANCE_RATE_PER_MIN = 0.0002
const PRODUCTION_DAY_START_HOUR = 6
const HISTORY_WINDOW_MS = 36 * HOUR
/** Minutes between a batch arriving at the machine and its run starting, varied per batch. */
const MIN_LOAD_GAP_MIN = 6
const MAX_LOAD_GAP_MIN = 18
const EVENT_LIMIT = 250

const HOLD_WEIGHTS: readonly (readonly [ReasonCode, number])[] = [
  ["shade-correction", 30],
  ["waiting-chemicals", 20],
  ["steam-pressure", 20],
  ["lab-approval", 15],
  ["machine-fault", 8],
  ["power-cut", 7],
]

export function productionDayStart(now: number) {
  const start = new Date(now)
  start.setHours(PRODUCTION_DAY_START_HOUR, 0, 0, 0)
  if (start.getTime() > now) start.setDate(start.getDate() - 1)
  return start.getTime()
}

function log(d: PlantSnapshot, machineId: string, kind: PlantEventKind, message: string) {
  d.events.push({ id: `${d.now.toString(36)}-${machineId}-${d.events.length}`, at: d.now, machineId, kind, message })
}

function planBatch(d: PlantSnapshot, machine: Machine, random: Random): QueuedBatch | null {
  let candidates = d.orders.filter((o) => o.stage === "dyeing" && o.dyedKg < o.qtyKg)

  if (candidates.length < 4) {
    const planned = d.orders
      .map((order, index) => ({ order, index }))
      .filter(({ order }) => order.stage === "planned")
      .sort((a, b) => a.order.dueAt - b.order.dueAt)[0]
    if (planned) {
      d.orders[planned.index] = { ...planned.order, stage: "dyeing" }
      candidates = [...candidates, d.orders[planned.index]]
    }
  }
  if (!candidates.length) return null

  const urgent = candidates.sort((a, b) => a.dueAt - b.dueAt).slice(0, 6)
  const order = urgent[Math.floor(random() * urgent.length)]
  const qtyKg = Math.round((machine.capacityKg * between(random, 0.82, 0.97)) / 10) * 10
  const batch: Batch = {
    id: `B-${d.batchSeq++}`,
    orderId: order.id,
    machineId: machine.id,
    qtyKg,
    recipe: buildRecipe(order.shade.depth, qtyKg),
  }
  d.batches[batch.id] = batch

  return { batchId: batch.id, prep: "preparing", prepReadyAt: d.now + between(random, 25, 120) * MINUTE }
}

function refreshPrep(next: QueuedBatch | null, now: number): QueuedBatch | null {
  return next?.prep === "preparing" && now >= next.prepReadyAt ? { ...next, prep: "ready" } : next
}

export function startRun(batch: Batch, startedAt: number, random: Random): Run {
  const onStandard = random() < 0.92
  return {
    batchId: batch.id,
    startedAt,
    targetEndAt: startedAt + plannedMinutes(batch.recipe) * MINUTE,
    stepIndex: 0,
    stepStartedAt: startedAt,
    pace: onStandard ? between(random, 0.96, 1.03) : between(random, 1.05, 1.15),
    hold: null,
    corrections: 0,
    steps: [],
  }
}

function completeBatch(d: PlantSnapshot, run: Run, batch: Batch, endedAt: number, random: Random) {
  const index = d.orders.findIndex((o) => o.id === batch.orderId)
  if (index >= 0) {
    const order = d.orders[index]
    const dyedKg = order.dyedKg + batch.qtyKg
    d.orders[index] = { ...order, dyedKg, stage: dyedKg >= order.qtyKg ? "finishing" : order.stage }
  }

  const rework = run.corrections > 0 ? 1.22 : 1
  d.completed.push({
    batchId: batch.id,
    machineId: batch.machineId,
    qtyKg: batch.qtyKg,
    startedAt: run.startedAt,
    endedAt,
    targetEndAt: run.targetEndAt,
    rightFirstTime: run.corrections === 0,
    energyKwh: batch.qtyKg * between(random, 0.72, 0.95) * run.pace * rework,
    steamKg: batch.qtyKg * between(random, 3.1, 4.2) * rework,
    waterL: batch.qtyKg * between(random, 52, 74) * rework,
  })
  log(d, batch.machineId, "complete", `${batch.id} finished · ${batch.qtyKg} kg`)
}

function advanceRunning(state: MachineState, d: PlantSnapshot, dtMin: number, random: Random): MachineState {
  let run = state.run!
  let batch = d.batches[run.batchId]

  if (run.hold) {
    if (d.now < run.hold.until) return state

    const pausedMs = d.now - run.hold.since
    if (run.hold.reason === "shade-correction") {
      const at = run.stepIndex + 1
      batch = {
        ...batch,
        recipe: [...batch.recipe.slice(0, at), ...correctionSteps(batch.recipe, batch.qtyKg), ...batch.recipe.slice(at)],
      }
      d.batches[batch.id] = batch
      run = { ...run, corrections: run.corrections + 1 }
    }
    log(d, state.machineId, "release", `${REASONS[run.hold!.reason].label} cleared`)
    run = { ...run, hold: null, stepStartedAt: run.stepStartedAt + pausedMs }
  } else if (random() < HOLD_RATE_PER_MIN * dtMin) {
    const rolled = weighted(random, HOLD_WEIGHTS)
    const reason = rolled === "shade-correction" && batch.recipe[run.stepIndex].kind !== "hold" ? "waiting-chemicals" : rolled
    const hold: Hold = { reason, since: d.now, until: d.now + between(random, 8, 28) * MINUTE }
    log(d, state.machineId, "hold", REASONS[reason].label)
    return { ...state, run: { ...run, hold } }
  }

  for (;;) {
    const step = batch.recipe[run.stepIndex]
    const stepEnd = run.stepStartedAt + step.plannedMin * run.pace * MINUTE
    if (d.now < stepEnd) break

    run = { ...run, steps: [...run.steps, { index: run.stepIndex, startedAt: run.stepStartedAt, endedAt: stepEnd }] }
    if (run.stepIndex === batch.recipe.length - 1) {
      completeBatch(d, run, batch, stepEnd, random)
      return { ...state, phase: "complete", phaseSince: stepEnd, run, next: refreshPrep(state.next, d.now) }
    }
    run = { ...run, stepIndex: run.stepIndex + 1, stepStartedAt: stepEnd }
    log(d, state.machineId, "step", batch.recipe[run.stepIndex].label)
  }

  const halfway = d.now - run.startedAt > (run.targetEndAt - run.startedAt) / 2
  const next = refreshPrep(state.next ?? (halfway ? planBatch(d, machineById.get(state.machineId)!, random) : null), d.now)

  return run === state.run && next === state.next ? state : { ...state, run, next }
}

function advanceMachine(state: MachineState, d: PlantSnapshot, dtMin: number, random: Random): MachineState {
  const machine = machineById.get(state.machineId)!

  switch (state.phase) {
    case "offline": {
      if (!state.downtime || d.now < state.downtime.until) return state
      log(d, state.machineId, "release", "Back in service")
      return { ...state, phase: "idle", phaseSince: d.now, downtime: null }
    }

    case "complete": {
      const next = refreshPrep(state.next, d.now)
      if (d.now - state.phaseSince < COMPLETE_DWELL_MIN * MINUTE) return next === state.next ? state : { ...state, next }
      return { ...state, phase: next?.prep === "ready" ? "ready" : "idle", phaseSince: d.now, run: null, next }
    }

    case "idle": {
      if (random() < MAINTENANCE_RATE_PER_MIN * dtMin) {
        const downtime: Hold = { reason: "maintenance", since: d.now, until: d.now + between(random, 60, 180) * MINUTE }
        log(d, state.machineId, "hold", REASONS.maintenance.label)
        return { ...state, phase: "offline", phaseSince: d.now, downtime }
      }
      const next = refreshPrep(state.next ?? planBatch(d, machine, random), d.now)
      if (next?.prep === "ready") return { ...state, phase: "ready", phaseSince: d.now, next }
      return next === state.next ? state : { ...state, next }
    }

    case "ready": {
      const loadGapMin = MIN_LOAD_GAP_MIN + (Number(state.next!.batchId.slice(2)) % (MAX_LOAD_GAP_MIN - MIN_LOAD_GAP_MIN))
      if (d.now - state.phaseSince < loadGapMin * MINUTE) return state
      const batch = d.batches[state.next!.batchId]
      log(d, state.machineId, "start", `${batch.id} started · ${batch.qtyKg} kg`)
      return { ...state, phase: "running", phaseSince: d.now, run: startRun(batch, d.now, random), next: null }
    }

    case "running":
      return advanceRunning(state, d, dtMin, random)
  }
}

/** Advances the plant to `to` in steps of at most one minute so every transition lands on time. */
export function advance(snapshot: PlantSnapshot, to: number, random: Random): PlantSnapshot {
  const d: PlantSnapshot = {
    ...snapshot,
    batches: { ...snapshot.batches },
    orders: snapshot.orders.slice(),
    completed: snapshot.completed.slice(),
    events: snapshot.events.slice(),
  }

  while (d.now < to) {
    const dtMs = Math.min(to - d.now, MINUTE)
    d.now += dtMs
    d.states = d.states.map((state) => advanceMachine(state, d, dtMs / MINUTE, random))
  }

  d.dayStart = productionDayStart(d.now)
  const completed = d.completed.filter((c) => c.endedAt >= d.now - HISTORY_WINDOW_MS)
  d.completed = sameItems(completed, snapshot.completed) ? snapshot.completed : completed
  d.events = d.events.length === snapshot.events.length ? snapshot.events : d.events.slice(-EVENT_LIMIT)
  d.orders = sameItems(d.orders, snapshot.orders) ? snapshot.orders : d.orders
  if (Object.keys(d.batches).length === Object.keys(snapshot.batches).length && Object.entries(d.batches).every(([id, b]) => snapshot.batches[id] === b)) {
    d.batches = snapshot.batches
  }
  return d
}

/**
 * Most ticks change no order, batch, event or finished batch. Handing back the previous array when nothing changed
 * keeps its identity, so charts and lists built from it skip their re-render.
 */
function sameItems<T>(next: T[], previous: T[]) {
  return next.length === previous.length && next.every((item, index) => item === previous[index])
}

/** Operator commands. The pilot never writes to a PLC; commands only change the tracked state. */
export function applyHold(d: PlantSnapshot, machineId: string, reason: ReasonCode, minutes: number): PlantSnapshot {
  const next = updateRun(d, machineId, (run) =>
    run.hold ? run : { ...run, hold: { reason, since: d.now, until: d.now + minutes * MINUTE } },
  )
  return logCommand(next, machineId, "command", `Hold raised · ${REASONS[reason].label}`)
}

/** Ends the hold on the next tick, so release side effects (shade correction steps) run in one place. */
export function releaseHold(d: PlantSnapshot, machineId: string): PlantSnapshot {
  const next = updateRun(d, machineId, (run) => (run.hold ? { ...run, hold: { ...run.hold, until: d.now } } : run))
  return logCommand(next, machineId, "command", "Hold released by operator")
}

export function extendHold(d: PlantSnapshot, machineId: string, minutes: number): PlantSnapshot {
  const next = updateRun(d, machineId, (run) => (run.hold ? { ...run, hold: { ...run.hold, until: run.hold.until + minutes * MINUTE } } : run))
  return logCommand(next, machineId, "command", `Hold extended by ${minutes} min`)
}

/**
 * The operator confirms the fabric is out of the machine. The finished batch would otherwise wait out its full unload
 * dwell; moving the phase start back lets the next tick free the machine.
 */
export function confirmUnload(d: PlantSnapshot, machineId: string): PlantSnapshot {
  const next = updatePhase(d, machineId, "complete", COMPLETE_DWELL_MIN)
  return next === d ? d : logCommand(next, machineId, "command", "Unload confirmed by operator")
}

/** The operator confirms the next batch is loaded, so the run starts on the next tick instead of after the load gap. */
export function confirmLoad(d: PlantSnapshot, machineId: string): PlantSnapshot {
  const next = updatePhase(d, machineId, "ready", MAX_LOAD_GAP_MIN)
  return next === d ? d : logCommand(next, machineId, "command", "Batch load confirmed by operator")
}

function updatePhase(d: PlantSnapshot, machineId: string, phase: MachineState["phase"], minutes: number): PlantSnapshot {
  const index = d.states.findIndex((state) => state.machineId === machineId && state.phase === phase)
  if (index < 0) return d
  const states = d.states.slice()
  states[index] = { ...states[index], phaseSince: Math.min(states[index].phaseSince, d.now - minutes * MINUTE) }
  return { ...d, states }
}

export function logCommand(d: PlantSnapshot, machineId: string, kind: PlantEventKind, message: string): PlantSnapshot {
  const event = { id: `${d.now.toString(36)}-${machineId}-${kind}-${d.events.length}`, at: d.now, machineId, kind, message }
  return { ...d, events: [...d.events, event].slice(-EVENT_LIMIT) }
}

function updateRun(d: PlantSnapshot, machineId: string, change: (run: Run) => Run): PlantSnapshot {
  const states = d.states.map((state) =>
    state.machineId === machineId && state.phase === "running" && state.run ? { ...state, run: change(state.run) } : state,
  )
  return { ...d, states }
}
