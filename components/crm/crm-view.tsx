"use client"

import { BadgeCheck, CalendarClock, ClipboardList, Package } from "lucide-react"
import { columnHelper, DataTable } from "@/components/data-table"
import { PlantGate } from "@/components/plant/plant-gate"
import { ShadeSwatch } from "@/components/plant/step-readout"
import { Reveal } from "@/components/reveal"
import { StatCard } from "@/components/stat-card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { buyerVolumes } from "@/lib/domain/analytics"
import { BUYERS, buyerById } from "@/lib/domain/catalog"
import type { Order, OrderStage, ShadeApproval } from "@/lib/domain/types"
import { formatInt, formatKg, formatShortDate } from "@/lib/format"
import { usePlant } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

const STAGES: { stage: OrderStage; label: string }[] = [
  { stage: "lab-dip", label: "Lab dip" },
  { stage: "planned", label: "Planned" },
  { stage: "dyeing", label: "Dyeing" },
  { stage: "finishing", label: "Finishing" },
  { stage: "packed", label: "Packed" },
  { stage: "shipped", label: "Shipped" },
]

const APPROVAL: Record<ShadeApproval, { label: string; className: string }> = {
  approved: { label: "Shade approved", className: "bg-running/12 text-running" },
  pending: { label: "Approval pending", className: "bg-held/12 text-held" },
  correction: { label: "Correction asked", className: "bg-delayed/12 text-delayed" },
}

const initials = (name: string) => name.split(" ").map((part) => part[0]).join("").slice(0, 2)

function ApprovalBadge({ approval }: { approval: ShadeApproval }) {
  return <span className={cn("rounded-md px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap", APPROVAL[approval].className)}>{APPROVAL[approval].label}</span>
}

function OrderCard({ order, now }: { order: Order; now: number }) {
  const buyer = buyerById.get(order.buyerId)
  const daysLeft = Math.ceil((order.dueAt - now) / 86_400_000)
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
          <span className={cn(daysLeft < 0 ? "" : daysLeft <= 3 && "font-medium text-held")}>
            {daysLeft < 0 ? `Shipped ${formatShortDate(order.dueAt)}` : `Due ${formatShortDate(order.dueAt)}`}
          </span>
        </div>
      </div>
      {order.approval !== "approved" && <ApprovalBadge approval={order.approval} />}
    </div>
  )
}

function Pipeline({ orders, now }: { orders: Order[]; now: number }) {
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

const col = columnHelper<Order>()
const orderColumns = [
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

function Buyers({ orders }: { orders: Order[] }) {
  const volumes = buyerVolumes(orders)
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {volumes.map(({ buyer, openOrders, openKg, pendingApprovals }) => (
        <Card key={buyer.id} size="sm">
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
        </Card>
      ))}
    </div>
  )
}

function Crm() {
  const orders = usePlant((state) => state.snapshot!.orders)
  const now = usePlant((state) => state.snapshot!.now)
  const open = orders.filter((order) => order.stage !== "shipped")
  const weekAhead = open.filter((order) => order.dueAt - now < 7 * 86_400_000)

  return (
    <div className="flex flex-col gap-4">
      <Reveal className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Open orders" value={open.length} icon={ClipboardList} hint={`${BUYERS.length} active buyers`} />
        <StatCard label="Left to dye" value={open.reduce((sum, o) => sum + o.qtyKg - o.dyedKg, 0)} suffix=" kg" icon={Package} />
        <StatCard
          label="Shade approvals pending"
          value={orders.filter((order) => order.approval !== "approved").length}
          icon={BadgeCheck}
          tone="text-held"
          hint="Lab dips and corrections"
        />
        <StatCard label="Due in 7 days" value={weekAhead.length} icon={CalendarClock} tone="text-delayed" hint={formatKg(weekAhead.reduce((s, o) => s + o.qtyKg, 0))} />
      </Reveal>

      <Reveal order={1}>
        <Tabs defaultValue="pipeline">
          <TabsList>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="buyers">Buyers</TabsTrigger>
          </TabsList>
          <TabsContent value="pipeline" className="mt-3">
            <Pipeline orders={orders} now={now} />
          </TabsContent>
          <TabsContent value="orders" className="mt-3">
            <DataTable columns={orderColumns} data={orders} getRowId={(order) => order.id} searchPlaceholder="Search order, buyer, shade…" />
          </TabsContent>
          <TabsContent value="buyers" className="mt-3">
            <Buyers orders={orders} />
          </TabsContent>
        </Tabs>
      </Reveal>
    </div>
  )
}

export function CrmView() {
  return (
    <PlantGate>
      <Crm />
    </PlantGate>
  )
}
