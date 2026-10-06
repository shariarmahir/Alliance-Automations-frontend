"use client"

import { BatchCard } from "@/components/control/batch-card"
import { EventLog } from "@/components/control/event-log"
import { MachineCommands } from "@/components/control/machine-commands"
import { MachineHeader } from "@/components/control/machine-header"
import { RecipeTimeline } from "@/components/control/recipe-timeline"
import { SensorGauges } from "@/components/control/sensor-gauges"
import { TemperatureCard } from "@/components/control/temperature-card"
import { PlantGate } from "@/components/plant/plant-gate"
import { Reveal } from "@/components/reveal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useMachineView, useSnapshot } from "@/lib/store/plant"

function Detail({ machineId }: { machineId: string }) {
  const view = useMachineView(machineId)!
  const now = useSnapshot((snapshot) => snapshot.now)

  return (
    <div className="flex flex-col gap-4">
      <Reveal className="flex flex-wrap items-center gap-3">
        <MachineHeader view={view} />
      </Reveal>

      <Reveal order={1} className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <SensorGauges view={view} />
      </Reveal>

      <div className="grid gap-4 xl:grid-cols-3">
        <Reveal order={2} className="xl:col-span-2">
          <TemperatureCard view={view} now={now} />
        </Reveal>
        <Reveal order={3}>
          <BatchCard view={view} />
        </Reveal>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Reveal order={4}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recipe steps</CardTitle>
              <CardDescription>Actual ′ / planned ′ minutes</CardDescription>
            </CardHeader>
            <CardContent>
              {view.batch ? <RecipeTimeline view={view} /> : <p className="text-sm text-muted-foreground">No recipe loaded.</p>}
            </CardContent>
          </Card>
        </Reveal>
        <Reveal order={5}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Operator commands</CardTitle>
              <CardDescription>Logged with time and user</CardDescription>
            </CardHeader>
            <CardContent>
              <MachineCommands view={view} />
            </CardContent>
          </Card>
        </Reveal>
        <Reveal order={6}>
          <EventLog machineId={machineId} />
        </Reveal>
      </div>
    </div>
  )
}

export function MachineDetail({ machineId }: { machineId: string }) {
  return (
    <PlantGate>
      <Detail machineId={machineId} />
    </PlantGate>
  )
}
