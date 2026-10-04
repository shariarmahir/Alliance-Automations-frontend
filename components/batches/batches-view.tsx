"use client"

import { CircleCheckBig } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { columnHelper, DataTable } from "@/components/data-table"
import { PlantGate } from "@/components/plant/plant-gate"
import { StatusBadge } from "@/components/plant/status"
import { ShadeSwatch } from "@/components/plant/step-readout"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { buyerById, machineById } from "@/lib/domain/catalog"
import type { MachineStatus, PlantSnapshot, MachineView } from "@/lib/domain/types"
import { formatClock, formatHm } from "@/lib/format"
import { usePlant } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

interface BatchRow {
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

type Scope = "live" | "completed"

function toRows(views: MachineView[], snapshot: PlantSnapshot, scope: Scope): BatchRow[] {
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

const col = columnHelper<BatchRow>()

const columns = [
  col.accessor("machineId", {
    header: "Machine",
    cell: ({ row }) => (
      <div className="leading-tight">
        <div className="font-mono text-xs font-semibold text-primary">{row.original.machineId}</div>
        <div className="text-xs text-muted-foreground">{row.original.machineName}</div>
      </div>
    ),
  }),
  col.accessor("batchId", { header: "Batch", cell: (info) => <span className="font-medium">{info.getValue()}</span> }),
  col.accessor("buyer", { header: "Buyer" }),
  col.accessor("orderId", { header: "Order", cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span> }),
  col.accessor("qtyKg", { header: "Qty kg", cell: (info) => <span className="tabular">{info.getValue().toLocaleString("en-US")}</span> }),
  col.accessor("gsm", { header: "GSM", cell: (info) => <span className="tabular">{info.getValue()}</span> }),
  col.accessor("shadeName", {
    header: "Shade",
    cell: ({ row }) => <ShadeSwatch hex={row.original.shadeHex} name={row.original.shadeName} />,
  }),
  col.accessor("status", {
    header: "Status",
    cell: (info) =>
      info.getValue() === "unloaded" ? (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <CircleCheckBig className="size-3.5" aria-hidden /> Unloaded
        </span>
      ) : (
        <StatusBadge status={info.getValue() as MachineStatus} />
      ),
  }),
  col.accessor("step", { header: "Step", cell: (info) => <span className="text-xs">{info.getValue()}</span> }),
  col.accessor("startedAt", { header: "Start", cell: (info) => <span className="font-mono text-xs tabular">{formatClock(info.getValue())}</span> }),
  col.accessor("targetEndAt", { header: "Target", cell: (info) => <span className="font-mono text-xs tabular">{formatClock(info.getValue())}</span> }),
  col.accessor("endAt", { header: "End", cell: (info) => <span className="font-mono text-xs tabular">{formatClock(info.getValue())}</span> }),
  col.accessor("excessMin", {
    header: "Excess",
    cell: (info) => {
      const value = info.getValue()
      return (
        <span className={cn("font-mono text-xs tabular", value >= 15 ? "text-delayed" : value > 0 ? "text-held" : "text-muted-foreground")}>
          {value > 0 ? `+${formatHm(value)}` : "—"}
        </span>
      )
    },
  }),
  col.accessor("remark", { header: "Remarks", enableSorting: false, cell: (info) => <span className="text-xs text-muted-foreground">{info.getValue()}</span> }),
]

function BatchesTable() {
  const router = useRouter()
  const views = usePlant((state) => state.views)
  const snapshot = usePlant((state) => state.snapshot)!
  const [scope, setScope] = useState<Scope>("live")
  const rows = toRows(views, snapshot, scope)

  return (
    <DataTable
      key={scope}
      columns={columns}
      data={rows}
      getRowId={(row) => row.batchId}
      searchPlaceholder="Search batch, buyer, shade…"
      onRowClick={(row) => router.push(`/control/${row.machineId}`)}
      toolbar={
        <ToggleGroup type="single" variant="outline" size="sm" value={scope} onValueChange={(value) => value && setScope(value as Scope)}>
          <ToggleGroupItem value="live" className="px-3">
            In machines
          </ToggleGroupItem>
          <ToggleGroupItem value="completed" className="px-3">
            Completed today
          </ToggleGroupItem>
        </ToggleGroup>
      }
    />
  )
}

export function BatchesView() {
  return (
    <PlantGate>
      <BatchesTable />
    </PlantGate>
  )
}
