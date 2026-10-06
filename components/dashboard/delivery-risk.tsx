"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { deliveryRisk } from "@/lib/domain/analytics"
import { buyerById } from "@/lib/domain/catalog"
import { formatInt, formatShortDate } from "@/lib/format"
import { usePlant, useSnapshot } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

export function DeliveryRisk() {
  const orders = useSnapshot((snapshot) => snapshot.orders)
  const views = usePlant((state) => state.views)
  const now = useSnapshot((snapshot) => snapshot.now)
  const dailyKg = usePlant((state) => state.history.at(-1)?.producedKg ?? 60_000)
  const risks = deliveryRisk(orders, views, now, dailyKg).slice(0, 6)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Delivery risk</CardTitle>
        <CardDescription>Open orders ranked by slack between dyeing ETA and delivery</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" asChild>
            <Link href="/crm">All orders</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 gap-y-2.5 text-sm">
          <span className="text-xs text-muted-foreground">Order</span>
          <span className="text-right text-xs text-muted-foreground">Remaining</span>
          <span className="text-right text-xs text-muted-foreground">Due</span>
          <span className="text-right text-xs text-muted-foreground">Slack</span>
          {risks.map(({ order, remainingKg, slackHours }) => (
            <div key={order.id} className="contents">
              <span className="min-w-0 truncate">
                <span className="font-medium">{order.id}</span>{" "}
                <span className="text-muted-foreground">
                  {buyerById.get(order.buyerId)?.name} · {order.garment}
                </span>
              </span>
              <span className="text-right tabular">{formatInt(remainingKg)} kg</span>
              <span className="text-right tabular text-muted-foreground">{formatShortDate(order.dueAt)}</span>
              <span
                className={cn(
                  "text-right font-medium tabular",
                  slackHours < 0 ? "text-delayed" : slackHours < 24 ? "text-held" : "text-running",
                )}
              >
                {slackHours < 0 ? "−" : "+"}
                {Math.abs(slackHours / 24).toFixed(1)} d
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
