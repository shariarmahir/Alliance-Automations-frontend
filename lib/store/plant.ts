import { useMemo } from "react"
import { create } from "zustand"
import { buildViews, computeKpis, deriveAlerts } from "@/lib/domain/rules"
import type { Alert, MachineView, PlantKpis, PlantSnapshot, ReasonCode } from "@/lib/domain/types"
import { advance, applyHold, confirmLoad, confirmUnload, extendHold, logCommand, releaseHold } from "@/lib/sim/engine"
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
  /** Bay-wide versions for shared causes such as low steam or a power cut. They skip machines the command does not fit. */
  holdMany: (machineIds: string[], reason: ReasonCode, minutes: number) => void
  releaseMany: (machineIds: string[]) => void
  extendHold: (machineId: string, minutes: number) => void
  confirmUnload: (machineId: string) => void
  confirmLoad: (machineId: string) => void
  /** Free-text note or a call for help, written to the machine's event log. */
  note: (machineId: string, message: string) => void
  recordShadeCheck: (machineId: string, deltaE: number) => void
  acknowledge: (alertId: string) => void
  acknowledgeAll: () => void
}

const random = createRandom(2026)

function derive(snapshot: PlantSnapshot) {
  const views = buildViews(snapshot)
  return { snapshot, views, alerts: deriveAlerts(views, snapshot.acknowledged), kpis: computeKpis(views, snapshot) }
}

/** Running, and on hold (`held`) or not. */
function isRunning(snapshot: PlantSnapshot, machineId: string, held: boolean) {
  const state = snapshot.states.find((s) => s.machineId === machineId)
  return state?.phase === "running" && Boolean(state.run?.hold) === held
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

    holdMany: (machineIds, reason, minutes) =>
      update((s) => machineIds.filter((id) => isRunning(s, id, false)).reduce((next, id) => applyHold(next, id, reason, minutes), s)),

    releaseMany: (machineIds) =>
      update((s) => machineIds.filter((id) => isRunning(s, id, true)).reduce((next, id) => releaseHold(next, id), s)),

    extendHold: (machineId, minutes) => update((s) => extendHold(s, machineId, minutes)),

    confirmUnload: (machineId) => update((s) => confirmUnload(s, machineId)),

    confirmLoad: (machineId) => update((s) => confirmLoad(s, machineId)),

    note: (machineId, message) => update((s) => logCommand(s, machineId, "note", message)),

    recordShadeCheck: (machineId, deltaE) =>
      update((s) => {
        const message = `Shade check ΔE ${deltaE.toFixed(2)} · ${deltaE <= SHADE_TOLERANCE_DE ? "pass" : "fail"}`
        const logged = logCommand(s, machineId, "shade-check", message)
        return deltaE <= SHADE_TOLERANCE_DE ? logged : applyHold(logged, machineId, "shade-correction", 25)
      }),

    acknowledge: (alertId) =>
      update((s) => (s.acknowledged.includes(alertId) ? s : { ...s, acknowledged: [...s.acknowledged, alertId] })),

    acknowledgeAll: () => {
      const open = get().alerts.filter((alert) => !alert.acknowledged).map((alert) => alert.id)
      if (open.length) update((s) => ({ ...s, acknowledged: [...s.acknowledged, ...open] }))
    },
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

/** One KPI value. A component that reads only this re-renders only when it changes, not on every tick. */
export const useKpi = <T,>(select: (kpis: PlantKpis) => T) => usePlant((state) => select(state.kpis!))

export const useMachineView = (machineId: string) =>
  usePlant((state) => state.views.find((view) => view.machine.id === machineId))

/**
 * For values derived from the whole plant, such as per-bay totals or a ranked list. The component re-renders only when
 * the derived content changes, not on every tick. Keep the result small and plain (it is compared as JSON).
 */
export function usePlantDerived<T>(select: (state: PlantState) => T): T {
  const json = usePlant((state) => JSON.stringify(select(state)))
  return useMemo(() => JSON.parse(json) as T, [json])
}
