import { toast } from "sonner"
import { REASONS } from "@/lib/domain/catalog"
import type { ReasonCode } from "@/lib/domain/types"
import { usePlant } from "@/lib/store/plant"

/**
 * Operator commands with their confirmation toasts, shared by the control panel, the action queue and the tablet so
 * every screen says the same thing. Commands change tracking only; nothing is written to a controller.
 */
const plant = () => usePlant.getState()

export function raiseHold(machineId: string, reason: ReasonCode, minutes: number) {
  plant().hold(machineId, reason, minutes)
  toast.warning(`${machineId} on hold`, { description: `${REASONS[reason].label} · ${REASONS[reason].owner} notified` })
}

export function releaseHold(machineId: string) {
  plant().release(machineId)
  toast.success(`${machineId} resumed`, { description: "Step timer running again" })
}

export function extendHold(machineId: string, minutes: number) {
  plant().extendHold(machineId, minutes)
  toast(`${machineId} hold extended`, { description: `${minutes} more minutes, owner notified` })
}

export function confirmUnload(machineId: string) {
  plant().confirmUnload(machineId)
  toast.success(`${machineId} unloaded`, { description: "Machine freed for the next batch" })
}

export function confirmLoad(machineId: string) {
  plant().confirmLoad(machineId)
  toast.success(`${machineId} loaded`, { description: "Run starts on the next signal" })
}

export function addNote(machineId: string, message: string) {
  plant().note(machineId, message)
  toast(`Note added to ${machineId}`, { description: message })
}

export function callSupervisor(machineId: string) {
  plant().note(machineId, "Supervisor called to the machine")
  toast.info(`Supervisor called to ${machineId}`, { description: "Shift supervisor notified on the floor app" })
}

export function holdBay(bayLabel: string, machineIds: string[], reason: ReasonCode, minutes: number) {
  plant().holdMany(machineIds, reason, minutes)
  toast.warning(`${bayLabel}: running machines on hold`, { description: `${REASONS[reason].label} · ${REASONS[reason].owner} notified` })
}

export function releaseBay(bayLabel: string, machineIds: string[]) {
  plant().releaseMany(machineIds)
  toast.success(`${bayLabel}: holds released`)
}

export function acknowledgeAll() {
  plant().acknowledgeAll()
  toast.success("All open alerts acknowledged")
}
