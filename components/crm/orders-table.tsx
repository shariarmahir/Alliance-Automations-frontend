"use client"

import { ApprovalBadge } from "@/components/crm/approval-badge"
import { STAGES } from "@/components/crm/order-meta"
import { columnHelper, DataTable } from "@/components/data-table"
import { ShadeSwatch } from "@/components/plant/step-readout"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { buyerById } from "@/lib/domain/catalog"
import type { Order } from "@/lib/domain/types"
import { formatInt, formatShortDate } from "@/lib/format"

const col = columnHelper<Order>()

const columns = [
  col.accessor("id", { header: "Order", cell: (info) => <span className="font-medium">{info.getValue()}</span> }),
  col.accessor((order) => buyerById.get(order.buyerId)?.name ?? "", { id: "buyer", header: "Buyer" }),
  col.accessor("garment", { header: "Garment" }),
  col.accessor((order) => order.shade.name, {
    id: "shade",
    header: "Shade",
    cell: ({ row }) => <ShadeSwatch hex={row.original.shade.hex} name={row.original.shade.name} />,
  }),
  col.accessor("qtyKg", { header: "Qty kg", cell: (info) => <span className="tabular">{formatInt(info.getValue())}</span> }),
  col.accessor((order) => order.dyedKg / order.qtyKg, {
    id: "progress",
    header: "Dyed",
    cell: (info) => (
      <div className="flex w-28 items-center gap-2">
        <Progress value={info.getValue() * 100} />
        <span className="text-xs tabular">{Math.round(info.getValue() * 100)}%</span>
      </div>
    ),
  }),
  col.accessor("stage", {
    header: "Stage",
    cell: (info) => <Badge variant="secondary">{STAGES.find((s) => s.stage === info.getValue())?.label}</Badge>,
  }),
  col.accessor("approval", { header: "Shade approval", cell: (info) => <ApprovalBadge approval={info.getValue()} /> }),
  col.accessor("dueAt", { header: "Delivery", cell: (info) => <span className="tabular">{formatShortDate(info.getValue())}</span> }),
]

export function OrdersTable({ orders }: { orders: Order[] }) {
  return <DataTable columns={columns} data={orders} getRowId={(order) => order.id} searchPlaceholder="Search order, buyer, shade…" />
}
