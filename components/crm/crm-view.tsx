"use client"

import { Buyers } from "@/components/crm/buyers"
import { CrmStats } from "@/components/crm/crm-stats"
import { OrdersTable } from "@/components/crm/orders-table"
import { Pipeline } from "@/components/crm/pipeline"
import { PlantGate } from "@/components/plant/plant-gate"
import { Reveal } from "@/components/reveal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSnapshot } from "@/lib/store/plant"

function Crm() {
  const orders = useSnapshot((snapshot) => snapshot.orders)
  const now = useSnapshot((snapshot) => snapshot.now)

  return (
    <div className="flex flex-col gap-4">
      <Reveal className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <CrmStats orders={orders} now={now} />
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
            <OrdersTable orders={orders} />
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
