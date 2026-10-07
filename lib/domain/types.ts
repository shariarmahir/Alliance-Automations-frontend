/**
 * Domain model for the dyeing floor.
 *
 * Timestamps are epoch milliseconds. Durations are minutes unless the name says otherwise.
 * These shapes mirror the planned backend (Django + TimescaleDB) so the simulated data
 * source can later be replaced by the real API without touching the UI.
 */

export type MachineType = "Soft-flow Jet" | "Rotary Drum" | "Side Paddle" | "Front Loader"

export type ControllerLink = "OPC UA" | "Modbus TCP" | "RS485 retrofit"

export interface Machine {
  id: string
  name: string
  bay: number
  type: MachineType
  capacityKg: number
  link: ControllerLink
}

/** Lifecycle phase owned by the machine itself. */
export type MachinePhase = "offline" | "idle" | "ready" | "running" | "complete"

/** Status shown to people. Derived from phase, holds and the delay rule. */
export type MachineStatus = "running" | "delayed" | "held" | "ready" | "complete" | "idle" | "offline"

export type StepKind = "load" | "fill" | "dose" | "heat" | "hold" | "cool" | "drain" | "rinse" | "unload"

export interface RecipeStep {
  kind: StepKind
  label: string
  plannedMin: number
  /** Setpoint whose unit depends on the step kind: °C for thermal steps, litres for fill/dose. */
  target: number
}

export type ShadeDepth = "light" | "medium" | "dark"

export interface Shade {
  code: string
  name: string
  hex: string
  depth: ShadeDepth
}

export type ReasonCode =
  | "shade-correction"
  | "waiting-chemicals"
  | "steam-pressure"
  | "lab-approval"
  | "machine-fault"
  | "power-cut"
  | "waiting-batch"
  | "changeover"
  | "maintenance"

export type BuyerTier = "Strategic" | "Key" | "Growth"

export interface Buyer {
  id: string
  name: string
  country: string
  tier: BuyerTier
  accountManager: string
  contact: string
  paymentTermsDays: number
  ytdKg: number
  onTimeRate: number
  rightFirstTime: number
}

export type OrderStage = "lab-dip" | "planned" | "dyeing" | "finishing" | "packed" | "shipped"

export type ShadeApproval = "pending" | "approved" | "correction"

export interface Order {
  id: string
  buyerId: string
  style: string
  garment: string
  shade: Shade
  gsm: number
  qtyKg: number
  dyedKg: number
  createdAt: number
  dueAt: number
  stage: OrderStage
  approval: ShadeApproval
}

export interface Batch {
  id: string
  orderId: string
  machineId: string
  qtyKg: number
  recipe: RecipeStep[]
}

export interface StepRecord {
  index: number
  startedAt: number
  endedAt: number
}

export interface Hold {
  reason: ReasonCode
  since: number
  until: number
}

export interface Run {
  batchId: string
  startedAt: number
  /** Standard cycle end: start + sum of planned step minutes. */
  targetEndAt: number
  stepIndex: number
  stepStartedAt: number
  /** Actual / planned speed of this machine. 1 is on standard, above 1 is slower. */
  pace: number
  hold: Hold | null
  /** Shade corrections applied to this batch. Any correction means it was not right first time. */
  corrections: number
  steps: StepRecord[]
}

export type PrepStatus = "ready" | "preparing"

export interface QueuedBatch {
  batchId: string
  prep: PrepStatus
  prepReadyAt: number
}

export interface MachineState {
  machineId: string
  phase: MachinePhase
  phaseSince: number
  run: Run | null
  next: QueuedBatch | null
  downtime: Hold | null
}

export interface CompletedBatch {
  batchId: string
  machineId: string
  qtyKg: number
  startedAt: number
  endedAt: number
  targetEndAt: number
  rightFirstTime: boolean
  energyKwh: number
  steamKg: number
  waterL: number
}

export type PlantEventKind = "start" | "step" | "hold" | "release" | "complete" | "command" | "shade-check" | "note"

export interface PlantEvent {
  id: string
  at: number
  machineId: string
  kind: PlantEventKind
  message: string
}

export type AlertSeverity = "warning" | "critical"

export interface Alert {
  id: string
  machineId: string
  batchId: string
  severity: AlertSeverity
  cause: ReasonCode | "overrun"
  excessMin: number
  since: number
  acknowledged: boolean
}

export interface Telemetry {
  temperatureC: number
  levelL: number
  pressureBar: number
  circulationPct: number
  dosedL: number
  drainPct: number
  powerKw: number
}

export interface StepProgress {
  index: number
  total: number
  step: RecipeStep
  progress: number
  elapsedMin: number
}

/** Everything a screen needs about one machine, resolved once per tick. */
export interface MachineView {
  machine: Machine
  state: MachineState
  status: MachineStatus
  batch: Batch | null
  order: Order | null
  buyer: Buyer | null
  step: StepProgress | null
  telemetry: Telemetry
  startedAt: number | null
  targetEndAt: number | null
  projectedEndAt: number | null
  runningMin: number
  excessMin: number
  cycleProgress: number
  remark: string
}

/** Raw plant state owned by the data source (simulator today, MQTT/API tomorrow). */
export interface PlantSnapshot {
  now: number
  dayStart: number
  orders: Order[]
  batches: Record<string, Batch>
  states: MachineState[]
  completed: CompletedBatch[]
  events: PlantEvent[]
  acknowledged: string[]
  batchSeq: number
}

export interface PlantKpis {
  total: number
  running: number
  delayed: number
  held: number
  ready: number
  complete: number
  idle: number
  offline: number
  batchesPrepared: number
  producedKg: number
  batchesCompleted: number
  utilization: number
  rightFirstTime: number
  energyKwhPerKg: number
  steamKgPerKg: number
  waterLPerKg: number
}
