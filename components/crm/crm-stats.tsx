import { BadgeCheck, CalendarClock, ClipboardList, Package } from "lucide-react"
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
      <StatCard label="Open orders" value={open.length} icon={ClipboardList} hint={`${BUYERS.length} active buyers`} />
      <StatCard label="Left to dye" value={sumKg(open, (order) => order.qtyKg - order.dyedKg)} suffix=" kg" icon={Package} />
      <StatCard
        label="Shade approvals pending"
        value={orders.filter((order) => order.approval !== "approved").length}
        icon={BadgeCheck}
        tone="text-held"
        hint="Lab dips and corrections"
      />
      <StatCard
        label="Due in 7 days"
        value={dueThisWeek.length}
        icon={CalendarClock}
        tone="text-delayed"
        hint={formatKg(sumKg(dueThisWeek, (order) => order.qtyKg))}
      />
    </>
  )
}
