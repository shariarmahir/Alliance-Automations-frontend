"use client"

import { ActionCard } from "@/components/dashboard/action-card"
import { AlertsCard } from "@/components/dashboard/alerts-card"
import { BayLoad } from "@/components/dashboard/bay-load"
import { DeliveryRisk } from "@/components/dashboard/delivery-risk"
import { FleetCard } from "@/components/dashboard/fleet-card"
import { KpiRow } from "@/components/dashboard/kpi-row"
import { OutputChart } from "@/components/dashboard/output-chart"
import { UtilityIntensity } from "@/components/dashboard/utility-intensity"
import { PlantGate } from "@/components/plant/plant-gate"
import { Reveal } from "@/components/reveal"

export function DashboardView() {
  return (
    <PlantGate>
      <div className="flex flex-col gap-4">
        <Reveal>
          <KpiRow />
        </Reveal>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          <Reveal order={1} className="xl:col-span-3">
            <FleetCard />
          </Reveal>
          <Reveal order={2} className="xl:col-span-2">
            <ActionCard />
          </Reveal>
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
          <Reveal order={3} className="xl:col-span-3">
            <OutputChart />
          </Reveal>
          <Reveal order={4} className="xl:col-span-2">
            <AlertsCard />
          </Reveal>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <Reveal order={5} className="lg:col-span-2 xl:col-span-1">
            <DeliveryRisk />
          </Reveal>
          <Reveal order={6}>
            <BayLoad />
          </Reveal>
          <Reveal order={7}>
            <UtilityIntensity />
          </Reveal>
        </div>
      </div>
    </PlantGate>
  )
}
