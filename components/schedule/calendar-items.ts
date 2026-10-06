import { isSameDay } from "date-fns"
import { MACHINES, buyerById } from "@/lib/domain/catalog"
import type { Order } from "@/lib/domain/types"
import { formatInt } from "@/lib/format"
import { DAY } from "@/lib/time"

interface CalendarItem {
  id: string
  kind: "delivery" | "maintenance"
  title: string
  detail: string
}

/** Preventive maintenance repeats every 28 days per machine, staggered so two machines are serviced per day at most. */
export function maintenanceOn(day: Date): CalendarItem[] {
  const dayIndex = Math.floor(day.getTime() / DAY)
  return MACHINES.filter((_, i) => (dayIndex + i * 11) % 28 === 0).map((machine) => ({
    id: `pm-${machine.id}-${dayIndex}`,
    kind: "maintenance",
    title: `${machine.id} ${machine.name}`,
    detail: "Preventive maintenance · pump seals, heat exchanger",
  }))
}

export function deliveriesOn(day: Date, orders: Order[]): CalendarItem[] {
  return orders
    .filter((order) => isSameDay(order.dueAt, day))
    .map((order) => ({
      id: order.id,
      kind: "delivery",
      title: `${order.id} · ${buyerById.get(order.buyerId)?.name}`,
      detail: `${order.garment} · ${formatInt(order.qtyKg)} kg · ${order.shade.name}`,
    }))
}
