"use client"

import { Panel } from "@/components/panel"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buyerVolumes } from "@/lib/domain/analytics"
import type { Order } from "@/lib/domain/types"
import { formatKg } from "@/lib/format"

const initials = (name: string) => name.split(" ").map((part) => part[0]).join("").slice(0, 2)

export function Buyers({ orders }: { orders: Order[] }) {
  const volumes = buyerVolumes(orders)
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {volumes.map(({ buyer, openOrders, openKg, pendingApprovals }) => (
        <Panel key={buyer.id} className="[--card-spacing:--spacing(3)] md:[--card-spacing:--spacing(4)]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar className="size-10 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary/12 font-semibold text-primary">{initials(buyer.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <CardTitle>{buyer.name}</CardTitle>
                <CardDescription>
                  {buyer.country} · {buyer.tier}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
              <div>
                <dt className="text-xs text-muted-foreground">Open orders</dt>
                <dd className="font-medium tabular">{openOrders}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">To dye</dt>
                <dd className="font-medium tabular">{formatKg(openKg)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">On-time</dt>
                <dd className="font-medium tabular">{Math.round(buyer.onTimeRate * 100)}%</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Right first time</dt>
                <dd className="font-medium tabular">{Math.round(buyer.rightFirstTime * 100)}%</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">YTD volume</dt>
                <dd className="font-medium tabular">{formatKg(buyer.ytdKg)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Terms</dt>
                <dd className="font-medium tabular">{buyer.paymentTermsDays} days</dd>
              </div>
            </dl>
            <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
              <span>
                {buyer.contact} · AM {buyer.accountManager.split(" ")[0]}
              </span>
              {pendingApprovals > 0 && <span className="font-medium text-held">{pendingApprovals} approval{pendingApprovals > 1 && "s"}</span>}
            </div>
          </CardContent>
        </Panel>
      ))}
    </div>
  )
}
