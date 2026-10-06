import { create } from "zustand"
import { buildViews, computeKpis, deriveAlerts } from "@/lib/domain/rules"
import type { Alert, MachineView, PlantKpis, PlantSnapshot, ReasonCode } from "@/lib/domain/types"
import { advance, applyHold, logCommand, releaseHold } from "@/lib/sim/engine"
import { buildHistory, type DailyMetric } from "@/lib/sim/history"
import { createRandom } from "@/lib/sim/random"
import { seedPlant } from "@/lib/sim/seed"

export const SIM_SPEEDS = [1, 10, 60] as const
export type SimSpeed = (typeof SIM_SPEEDS)[number]

/** ΔE (CIE2000) at or below this passes the buyer's shade tolerance. */
export const SHADE_TOLERANCE_DE = 1

interface PlantState {
  snapshot: PlantSnapshot | null
  views: MachineView[]
  alerts: Alert[]
  kpis: PlantKpis | null
  history: DailyMetric[]
  speed: SimSpeed
  boot: () => void
  tick: (elapsedMs: number) => void
  setSpeed: (speed: SimSpeed) => void
  hold: (machineId: string, reason: ReasonCode, minutes: number) => void
  release: (machineId: string) => void
  recordShadeCheck: (machineId: string, deltaE: number) => void
  acknowledge: (alertId: string) => void
}

const random = createRandom(2026)

function derive(snapshot: PlantSnapshot) {
  const views = buildViews(snapshot)
  return { snapshot, views, alerts: deriveAlerts(views, snapshot.acknowledged), kpis: computeKpis(views, snapshot) }
}

/**
 * Single source of live plant state. Today it is fed by the simulator; in production the same
 * shape is filled from the WebSocket stream of the ingestion service.
 */
export const usePlant = create<PlantState>()((set, get) => {
  const update = (change: (snapshot: PlantSnapshot) => PlantSnapshot) => {
    const { snapshot } = get()
    if (snapshot) set(derive(change(snapshot)))
  }

  return {
    snapshot: null,
    views: [],
    alerts: [],
    kpis: null,
    history: [],
    speed: 1,

    boot: () => {
      if (get().snapshot) return
      const snapshot = seedPlant(Date.now(), random)
      set({ ...derive(snapshot), history: buildHistory(snapshot.dayStart) })
    },

    tick: (elapsedMs) => update((s) => advance(s, s.now + elapsedMs * get().speed, random)),

    setSpeed: (speed) => set({ speed }),

    hold: (machineId, reason, minutes) => update((s) => applyHold(s, machineId, reason, minutes)),

    release: (machineId) => update((s) => releaseHold(s, machineId)),

    recordShadeCheck: (machineId, deltaE) =>
      update((s) => {
        const message = `Shade check ΔE ${deltaE.toFixed(2)} · ${deltaE <= SHADE_TOLERANCE_DE ? "pass" : "fail"}`
        const logged = logCommand(s, machineId, "shade-check", message)
        return deltaE <= SHADE_TOLERANCE_DE ? logged : applyHold(logged, machineId, "shade-correction", 25)
      }),

    acknowledge: (alertId) =>
      update((s) => (s.acknowledged.includes(alertId) ? s : { ...s, acknowledged: [...s.acknowledged, alertId] })),
  }
})

/**
 * Selectors for components rendered inside <PlantGate>. The gate mounts its children only after the
 * first snapshot exists, so the snapshot and KPIs are never null there.
 */
export function useSnapshot<T>(select: (snapshot: PlantSnapshot) => T): T {
  return usePlant((state) => select(state.snapshot!))
}

export const useKpis = () => usePlant((state) => state.kpis!)

export const useMachineView = (machineId: string) =>
  usePlant((state) => state.views.find((view) => view.machine.id === machineId))
