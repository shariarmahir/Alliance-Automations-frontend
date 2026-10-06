"use client"

import { PlantGate } from "@/components/plant/plant-gate"
import { Reveal } from "@/components/reveal"
import { MonthCalendar } from "@/components/schedule/month-calendar"
import { Timeline } from "@/components/schedule/timeline"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ScheduleView() {
  return (
    <PlantGate>
      <Reveal>
        <Tabs defaultValue="timeline">
          <TabsList>
            <TabsTrigger value="timeline">Machine timeline</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
          <TabsContent value="timeline" className="mt-3">
            <Timeline />
          </TabsContent>
          <TabsContent value="calendar" className="mt-3">
            <MonthCalendar />
          </TabsContent>
        </Tabs>
      </Reveal>
    </PlantGate>
  )
}
