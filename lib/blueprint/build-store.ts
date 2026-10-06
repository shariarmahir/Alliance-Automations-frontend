import { create } from "zustand"
import { emptyBuild, OPTION_GROUPS, PRESETS, type BuildContact, type BuildSelection, type GroupId, type PackageId } from "@/lib/blueprint/build"

interface BuildState {
  selection: BuildSelection
  contact: BuildContact
  /** Adds or removes an option. A single-choice group keeps one value and clears it when picked again. */
  toggle: (group: GroupId, value: string) => void
  setMachines: (count: string) => void
  applyPreset: (id: PackageId) => void
  setContact: (patch: Partial<BuildContact>) => void
  reset: () => void
}

const EMPTY_CONTACT: BuildContact = { name: "", company: "", note: "" }
const mode = (group: GroupId) => OPTION_GROUPS.find((candidate) => candidate.id === group)?.mode

/** Holds the custom build so the builder and the closing call to action share it. */
export const useBuild = create<BuildState>((set) => ({
  selection: emptyBuild(),
  contact: EMPTY_CONTACT,
  toggle: (group, value) =>
    set((state) => {
      const current = state.selection[group]
      const has = current.includes(value)
      const next = mode(group) === "single" ? (has ? [] : [value]) : has ? current.filter((item) => item !== value) : [...current, value]
      return { selection: { ...state.selection, [group]: next } }
    }),
  setMachines: (count) => set((state) => ({ selection: { ...state.selection, machines: count.replace(/\D/g, "").slice(0, 4) } })),
  applyPreset: (id) => set((state) => ({ selection: { ...PRESETS[id], machines: state.selection.machines } })),
  setContact: (patch) => set((state) => ({ contact: { ...state.contact, ...patch } })),
  reset: () => set({ selection: emptyBuild(), contact: EMPTY_CONTACT }),
}))
