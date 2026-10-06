import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { PlantEventKind } from "@/lib/domain/types"
import { formatClock } from "@/lib/format"
import { useSnapshot } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

const VISIBLE_EVENTS = 14

const EVENT_TONE: Partial<Record<PlantEventKind, string>> = {
  hold: "text-held",
  command: "text-primary",
  "shade-check": "text-primary",
}

export function EventLog({ machineId }: { machineId: string }) {
  const events = useSnapshot((snapshot) => snapshot.events)
  const log = events.filter((event) => event.machineId === machineId).slice(-VISIBLE_EVENTS).reverse()

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Event log</CardTitle>
        <CardDescription>Latest machine and operator events</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80 pr-3">
          <ul className="flex flex-col gap-2.5 text-sm">
            {log.map((event) => (
              <li key={event.id} className="flex gap-3">
                <span className="w-11 shrink-0 font-mono text-xs text-muted-foreground tabular">{formatClock(event.at)}</span>
                <span className={cn(EVENT_TONE[event.kind])}>{event.message}</span>
              </li>
            ))}
            {!log.length && <li className="text-muted-foreground">No events yet.</li>}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
