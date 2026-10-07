"use client"

import { Panel } from "@/components/panel"
import { PanelTitle } from "@/components/panel-title"
import { AlertList } from "@/components/plant/alert-list"
import { Bell } from "@/components/plant/icons/console-icons"
import { CardAction, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { usePlantDerived } from "@/lib/store/plant"

export function AlertsCard() {
  const alerts = usePlantDerived((state) => state.alerts)
  return (
    <Panel className="h-full">
      <CardHeader>
        <PanelTitle icon={Bell}>Live alerts</PanelTitle>
        <CardDescription>Delays escalate to the manager after 60 minutes</CardDescription>
        <CardAction className="text-sm font-medium text-delayed tabular">
          {alerts.filter((a) => !a.acknowledged).length} open
        </CardAction>
      </CardHeader>
      <CardContent>
        <AlertList alerts={alerts} limit={6} />
      </CardContent>
    </Panel>
  )
}
