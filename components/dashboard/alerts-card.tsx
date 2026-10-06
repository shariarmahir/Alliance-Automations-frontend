"use client"

import { AlertList } from "@/components/plant/alert-list"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePlant } from "@/lib/store/plant"

export function AlertsCard() {
  const alerts = usePlant((state) => state.alerts)
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Live alerts</CardTitle>
        <CardDescription>Delays escalate to the manager after 60 minutes</CardDescription>
        <CardAction className="text-sm font-medium text-delayed tabular">
          {alerts.filter((a) => !a.acknowledged).length} open
        </CardAction>
      </CardHeader>
      <CardContent>
        <AlertList alerts={alerts} limit={6} />
      </CardContent>
    </Card>
  )
}
