"use client"

import Link from "next/link"
import { SCREEN_ICONS } from "@/components/landing/icons/screens"
import { Panel } from "@/components/panel"
import { PanelTitle } from "@/components/panel-title"
import { FleetMap, fleetCell } from "@/components/plant/fleet-map"
import { Button } from "@/components/ui/button"
import { CardAction, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { usePlantDerived } from "@/lib/store/plant"

export function FleetCard() {
  const cells = usePlantDerived((state) => state.views.map(fleetCell))
  return (
    <Panel className="h-full">
      <CardHeader>
        <PanelTitle icon={SCREEN_ICONS.Overview}>Fleet map</PanelTitle>
        <CardDescription>Every machine by bay. The bar under each cell is cycle progress.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" asChild>
            <Link href="/control">Control panel</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <FleetMap cells={cells} />
      </CardContent>
    </Panel>
  )
}
