"use client"

import { CircleCheckBig } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { BatchRow, Scope, toRows } from "@/components/batches/batch-rows"
import { columnHelper, DataTable } from "@/components/data-table"
import { ExcessTime } from "@/components/plant/excess"
import { StatusBadge } from "@/components/plant/status"
import { ShadeSwatch } from "@/components/plant/step-readout"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { MachineStatus } from "@/lib/domain/types"
import { formatClock } from "@/lib/format"
import { usePlant, useSnapshot } from "@/lib/store/plant"

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
      return <ExcessTime minutes={value} className="text-xs" />
    },
  }),
  col.accessor("remark", { header: "Remarks", enableSorting: false, cell: (info) => <span className="text-xs text-muted-foreground">{info.getValue()}</span> }),
]

export function BatchesTable() {
  const router = useRouter()
  const views = usePlant((state) => state.views)
  const snapshot = useSnapshot((snapshot) => snapshot)
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
