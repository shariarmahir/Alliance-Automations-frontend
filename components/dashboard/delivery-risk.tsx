"use client"

import Link from "next/link"
import { Panel } from "@/components/panel"
import { PanelTitle } from "@/components/panel-title"
import { Delivery } from "@/components/plant/icons/console-icons"
import { Button } from "@/components/ui/button"
import { CardAction, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { deliveryRisk } from "@/lib/domain/analytics"
import { buyerById } from "@/lib/domain/catalog"
import { formatInt, formatShortDate } from "@/lib/format"
import { usePlantDerived } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

/** Daily output assumed before the history has a day in it. */
const FALLBACK_DAILY_KG = 60_000
const ROWS = 6

export function DeliveryRisk() {
  // Slack is rounded to a tenth of a day, so the list re-renders when a ranking or a shown figure changes, not every tick.
  const risks = usePlantDerived(({ snapshot, views, history }) =>
    deliveryRisk(snapshot!.orders, views, snapshot!.now, history.at(-1)?.producedKg ?? FALLBACK_DAILY_KG)
      .slice(0, ROWS)
      .map(({ order, remainingKg, slackHours }) => ({ order, remainingKg, slackDays: Math.round(slackHours / 2.4) / 10 })),
  )

  return (
    <Panel className="h-full">
      <CardHeader>
        <PanelTitle icon={Delivery}>Delivery risk</PanelTitle>
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
          {risks.map(({ order, remainingKg, slackDays }) => (
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
                  slackDays < 0 ? "text-delayed" : slackDays < 1 ? "text-held" : "text-running",
                )}
              >
                {slackDays < 0 ? "−" : "+"}
                {Math.abs(slackDays).toFixed(1)} d
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Panel>
  )
}
