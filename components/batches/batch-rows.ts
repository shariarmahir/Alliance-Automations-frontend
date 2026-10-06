import { buyerById, machineById } from "@/lib/domain/catalog"
import type { MachineStatus, PlantSnapshot, MachineView } from "@/lib/domain/types"

export interface BatchRow {
  batchId: string
  machineId: string
  machineName: string
  buyer: string
  orderId: string
  qtyKg: number
  gsm: number
  shadeName: string
  shadeHex: string
  status: MachineStatus | "unloaded"
  step: string
  startedAt: number
  targetEndAt: number
  endAt: number
  excessMin: number
  remark: string
}

export type Scope = "live" | "completed"

export function toRows(views: MachineView[], snapshot: PlantSnapshot, scope: Scope): BatchRow[] {
  if (scope === "live") {
    return views.flatMap((view): BatchRow[] => {
      const run = view.state.run
      if (!run || !view.batch || !view.order) return []
      return [
        {
          batchId: view.batch.id,
          machineId: view.machine.id,
          machineName: view.machine.name,
          buyer: view.buyer?.name ?? "",
          orderId: view.order.id,
          qtyKg: view.batch.qtyKg,
          gsm: view.order.gsm,
          shadeName: view.order.shade.name,
          shadeHex: view.order.shade.hex,
          status: view.status,
          step: view.step ? `${view.step.index + 1}/${view.step.total} ${view.step.step.label}` : "Done",
          startedAt: run.startedAt,
          targetEndAt: run.targetEndAt,
          endAt: view.projectedEndAt ?? run.targetEndAt,
          excessMin: view.excessMin,
          remark: view.remark,
        },
      ]
    })
  }

  const orders = new Map(snapshot.orders.map((order) => [order.id, order]))
  return snapshot.completed
    .filter((done) => done.endedAt >= snapshot.dayStart)
    .map((done): BatchRow => {
      const batch = snapshot.batches[done.batchId]
      const order = orders.get(batch.orderId)!
      const excessMin = Math.max(0, Math.round((done.endedAt - done.targetEndAt) / 60_000))
      return {
        batchId: done.batchId,
        machineId: done.machineId,
        machineName: machineById.get(done.machineId)?.name ?? "",
        buyer: buyerById.get(order.buyerId)?.name ?? "",
        orderId: order.id,
        qtyKg: done.qtyKg,
        gsm: order.gsm,
        shadeName: order.shade.name,
        shadeHex: order.shade.hex,
        status: "unloaded",
        step: "Unloaded",
        startedAt: done.startedAt,
        targetEndAt: done.targetEndAt,
        endAt: done.endedAt,
        excessMin,
        remark: done.rightFirstTime ? "Right first time" : "Shade corrected",
      }
    })
    .reverse()
}
