import { Batch, Completed, Delivery, Produced } from "@/components/plant/icons/console-icons"
import { StatCard } from "@/components/stat-card"
import { BUYERS } from "@/lib/domain/catalog"
import type { Order } from "@/lib/domain/types"
import { formatKg } from "@/lib/format"
import { DAY } from "@/lib/time"

const sumKg = (orders: Order[], kg: (order: Order) => number) => orders.reduce((sum, order) => sum + kg(order), 0)

export function CrmStats({ orders, now }: { orders: Order[]; now: number }) {
  const open = orders.filter((order) => order.stage !== "shipped")
  const dueThisWeek = open.filter((order) => order.dueAt - now < 7 * DAY)

  return (
    <>
      <StatCard label="Open orders" value={open.length} index={0} icon={Batch} hint={`${BUYERS.length} active buyers`} />
      <StatCard label="Left to dye" value={sumKg(open, (order) => order.qtyKg - order.dyedKg)} suffix=" kg" index={1} icon={Produced} />
      <StatCard
        label="Shade approvals pending"
        value={orders.filter((order) => order.approval !== "approved").length}
        index={2}
        icon={Completed}
        tone="text-held"
        hint="Lab dips and corrections"
      />
      <StatCard
        label="Due in 7 days"
        value={dueThisWeek.length}
        index={3}
        icon={Delivery}
        tone="text-delayed"
        hint={formatKg(sumKg(dueThisWeek, (order) => order.qtyKg))}
      />
    </>
  )
}
