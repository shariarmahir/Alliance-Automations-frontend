"use client"

import { BatchCard } from "@/components/control/batch-card"
import { EventLog } from "@/components/control/event-log"
import { MachineCommands } from "@/components/control/machine-commands"
import { MachineHeader } from "@/components/control/machine-header"
import { ProcessStrip } from "@/components/control/process-strip"
import { RecipeTimeline } from "@/components/control/recipe-timeline"
import { SensorGauges } from "@/components/control/sensor-gauges"
import { TemperatureCard } from "@/components/control/temperature-card"
import { SCREEN_ICONS } from "@/components/landing/icons/screens"
import { Panel } from "@/components/panel"
import { PanelTitle } from "@/components/panel-title"
import { Recipe } from "@/components/plant/icons/console-icons"
import { PlantGate } from "@/components/plant/plant-gate"
import { Reveal } from "@/components/reveal"
import { CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { nextAction } from "@/lib/domain/actions"
import { useMachineView, useSnapshot } from "@/lib/store/plant"

function Detail({ machineId }: { machineId: string }) {
  const view = useMachineView(machineId)!
  const now = useSnapshot((snapshot) => snapshot.now)

  return (
    <div className="flex flex-col gap-4">
      <Reveal>
        <MachineHeader view={view} action={nextAction(view, now)} />
      </Reveal>

      <Reveal order={1}>
        <ProcessStrip view={view} />
      </Reveal>

      <Reveal order={2} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <SensorGauges view={view} />
      </Reveal>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Reveal order={3} className="xl:col-span-2">
          <TemperatureCard view={view} now={now} />
        </Reveal>
        <Reveal order={4}>
          <BatchCard view={view} />
        </Reveal>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Reveal order={5}>
          <Panel className="h-full">
            <CardHeader>
              <PanelTitle icon={Recipe}>Recipe steps</PanelTitle>
              <CardDescription>Actual ′ / planned ′ minutes</CardDescription>
            </CardHeader>
            <CardContent>
              {view.batch ? <RecipeTimeline view={view} /> : <p className="text-sm text-muted-foreground">No recipe loaded.</p>}
            </CardContent>
          </Panel>
        </Reveal>
        <Reveal order={6}>
          <Panel className="h-full">
            <CardHeader>
              <PanelTitle icon={SCREEN_ICONS["Control panel"]}>Operator commands</PanelTitle>
              <CardDescription>Only the commands that fit the machine right now</CardDescription>
            </CardHeader>
            <CardContent>
              <MachineCommands view={view} />
            </CardContent>
          </Panel>
        </Reveal>
        <Reveal order={7} className="md:col-span-2 xl:col-span-1">
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
