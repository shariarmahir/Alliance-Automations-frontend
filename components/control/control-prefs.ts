import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { MachineStatus } from "@/lib/domain/types"

export type ControlLayout = "grid" | "list"
export type ControlSort = "machine" | "urgency" | "finish" | "progress"

interface ControlPrefs {
  layout: ControlLayout
  sort: ControlSort
  /** Efficiency mode: only machines that need the operator, as an action queue. */
  focus: boolean
  status: MachineStatus | "all"
  bay: number | null
  setLayout: (layout: ControlLayout) => void
  setSort: (sort: ControlSort) => void
  setFocus: (focus: boolean) => void
  setStatus: (status: MachineStatus | "all") => void
  setBay: (bay: number | null) => void
}

/**
 * How this operator likes the control panel laid out. A per-viewer convenience, so it lives in this browser only.
 * The panel renders inside `PlantGate`, after hydration, so reading storage here cannot cause a hydration mismatch.
 */
export const useControlPrefs = create<ControlPrefs>()(
  persist(
    (set) => ({
      layout: "grid",
      sort: "machine",
      focus: false,
      status: "all",
      bay: null,
      setLayout: (layout) => set({ layout }),
      setSort: (sort) => set({ sort }),
      setFocus: (focus) => set({ focus }),
      setStatus: (status) => set({ status }),
      setBay: (bay) => set({ bay }),
    }),
    {
      name: "alliance-control-prefs",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ layout, sort, focus }) => ({ layout, sort, focus }),
    },
  ),
)
