"use client"

import { ApprovalBadge } from "@/components/crm/approval-badge"
import { STAGES } from "@/components/crm/order-meta"
import { ShadeSwatch } from "@/components/plant/step-readout"
import { Progress } from "@/components/ui/progress"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { buyerById } from "@/lib/domain/catalog"
import type { Order } from "@/lib/domain/types"
import { formatInt, formatKg, formatShortDate } from "@/lib/format"
import { DAY } from "@/lib/time"
import { cn } from "@/lib/utils"

function OrderCard({ order, now }: { order: Order; now: number }) {
  const buyer = buyerById.get(order.buyerId)
  const daysLeft = Math.ceil((order.dueAt - now) / DAY)
  return (
    <div className="flex flex-col gap-2.5 rounded-lg bg-background/60 p-3 ring-1 ring-foreground/10">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{order.id}</span>
        <span className="text-xs font-medium text-muted-foreground">{buyer?.name}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {order.garment} · {order.gsm} GSM
      </p>
      <ShadeSwatch hex={order.shade.hex} name={order.shade.name} className="text-xs" />
      <div className="flex flex-col gap-1">
        <Progress value={(order.dyedKg / order.qtyKg) * 100} aria-label="Dyed share" />
        <div className="flex justify-between text-[11px] text-muted-foreground tabular">
          <span>
            {formatInt(order.dyedKg)} / {formatInt(order.qtyKg)} kg
          </span>
          <span className={cn(order.stage !== "shipped" && daysLeft <= 3 && "font-medium text-held")}>
            {order.stage === "shipped" ? `Shipped ${formatShortDate(order.dueAt)}` : `Due ${formatShortDate(order.dueAt)}`}
          </span>
        </div>
      </div>
      {order.approval !== "approved" && <ApprovalBadge approval={order.approval} />}
    </div>
  )
}

export function Pipeline({ orders, now }: { orders: Order[]; now: number }) {
  return (
    <ScrollArea className="w-full">
      <div className="grid min-w-[1100px] grid-cols-6 gap-3 pb-3">
        {STAGES.map(({ stage, label }) => {
          const items = orders.filter((order) => order.stage === stage).sort((a, b) => a.dueAt - b.dueAt)
          return (
            <div key={stage} className="flex flex-col gap-2 rounded-xl bg-muted/40 p-2.5">
              <div className="flex items-center justify-between px-1 py-1">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs text-muted-foreground tabular">
                  {items.length} · {formatKg(items.reduce((sum, o) => sum + o.qtyKg, 0))}
                </span>
              </div>
              {items.map((order) => (
                <OrderCard key={order.id} order={order} now={now} />
              ))}
            </div>
          )
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
