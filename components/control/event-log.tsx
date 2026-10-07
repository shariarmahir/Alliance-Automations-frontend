"use client"

import { useState } from "react"
import { Panel } from "@/components/panel"
import { PanelTitle } from "@/components/panel-title"
import { EventFeed } from "@/components/plant/icons/console-icons"
import { CardAction, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { PlantEventKind } from "@/lib/domain/types"
import { formatClock } from "@/lib/format"
import { useSnapshot } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

const VISIBLE_EVENTS = 30

const EVENT_TONE: Partial<Record<PlantEventKind, string>> = {
  hold: "text-held",
  command: "text-brand",
  "shade-check": "text-brand",
  note: "text-ready",
}

/** Events a person caused, as opposed to the machine's own signals. */
const OPERATOR_EVENTS = new Set<PlantEventKind>(["command", "shade-check", "note"])

type EventFilter = "all" | "operator" | "machine"

export function EventLog({ machineId }: { machineId: string }) {
  const events = useSnapshot((snapshot) => snapshot.events)
  const [filter, setFilter] = useState<EventFilter>("all")
  const log = events
    .filter((event) => event.machineId === machineId && (filter === "all" || OPERATOR_EVENTS.has(event.kind) === (filter === "operator")))
    .slice(-VISIBLE_EVENTS)
    .reverse()

  return (
    <Panel className="h-full">
      <CardHeader>
        <PanelTitle icon={EventFeed}>Event log</PanelTitle>
        <CardDescription>Machine signals and operator actions</CardDescription>
        <CardAction>
          <ToggleGroup type="single" size="sm" variant="outline" value={filter} onValueChange={(value) => value && setFilter(value as EventFilter)} aria-label="Filter events">
            <ToggleGroupItem value="all" className="px-2.5 text-xs">
              All
            </ToggleGroupItem>
            <ToggleGroupItem value="operator" className="px-2.5 text-xs">
              People
            </ToggleGroupItem>
            <ToggleGroupItem value="machine" className="px-2.5 text-xs">
              Machine
            </ToggleGroupItem>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80 pr-3">
          <ol className="relative ml-1.5 flex flex-col gap-3 border-l border-border pl-5 text-sm">
            {log.map((event) => (
              <li key={event.id} className="relative">
                <span
                  className={cn("absolute top-1.5 left-[-1.5rem] size-2 rounded-full ring-2 ring-background", OPERATOR_EVENTS.has(event.kind) ? "bg-brand" : "bg-muted-foreground/60")}
                  aria-hidden
                />
                <p className={cn("leading-snug", EVENT_TONE[event.kind])}>{event.message}</p>
                <p className="font-mono text-xs text-muted-foreground tabular">{formatClock(event.at)}</p>
              </li>
            ))}
            {!log.length && <li className="text-muted-foreground">No events yet.</li>}
          </ol>
        </ScrollArea>
      </CardContent>
    </Panel>
  )
}
