"use client"

import Link from "next/link"
import { useState } from "react"
import { SCREEN_ICONS } from "@/components/landing/icons/screens"
import { Panel } from "@/components/panel"
import { PanelTitle } from "@/components/panel-title"
import { WINDOW_BACK, WINDOW_AHEAD, segmentsFor } from "@/components/schedule/timeline-segments"
import { CardAction, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { BAYS } from "@/lib/domain/catalog"
import { formatClock } from "@/lib/format"
import { usePlantDerived } from "@/lib/store/plant"
import { HOUR, MINUTE } from "@/lib/time"
import { cn } from "@/lib/utils"

export function Timeline() {
  const [bay, setBay] = useState("1")
  // Rounded to the minute, the timeline redraws once a minute instead of on every tick.
  const { now, rows } = usePlantDerived(({ views, snapshot }) => {
    const minute = Math.floor(snapshot!.now / MINUTE) * MINUTE
    return {
      now: minute,
      rows: views
        .filter((view) => view.machine.bay === Number(bay))
        .map((view) => ({
          id: view.machine.id,
          name: view.machine.name,
          offline: view.status === "offline",
          segments: segmentsFor(view, { ...snapshot!, now: minute }).map((segment) => ({
            ...segment,
            start: Math.round(segment.start / MINUTE) * MINUTE,
            end: Math.round(segment.end / MINUTE) * MINUTE,
          })),
        })),
    }
  })
  const from = now - WINDOW_BACK
  const span = WINDOW_BACK + WINDOW_AHEAD
  const position = (time: number) => Math.min(100, Math.max(0, ((time - from) / span) * 100))
  const hours = Array.from({ length: span / HOUR + 1 }, (_, i) => Math.ceil(from / HOUR) * HOUR + i * HOUR).filter((h) => h <= from + span)

  return (
    <Panel>
      <CardHeader>
        <PanelTitle icon={SCREEN_ICONS.Schedule}>Machine timeline</PanelTitle>
        <CardDescription>Finished, running and next batch per machine. The vertical line is now.</CardDescription>
        <CardAction>
          <Select value={bay} onValueChange={setBay}>
            <SelectTrigger size="sm" className="w-40" aria-label="Bay">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BAYS.map((option) => (
                <SelectItem key={option.bay} value={String(option.bay)}>
                  {option.label} · D{option.range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[860px]">
          <div className="flex gap-3">
            <span className="w-28 shrink-0" />
            <div className="relative h-6 flex-1 text-[11px] text-muted-foreground">
              {hours.map((hour) => (
                <span key={hour} className="absolute -translate-x-1/2 font-mono tabular" style={{ left: `${position(hour)}%` }}>
                  {formatClock(hour)}
                </span>
              ))}
            </div>
          </div>
          <div className="relative flex flex-col gap-1.5">
            {rows.map((row) => (
              <div key={row.id} className="flex items-center gap-3">
                <Link href={`/control/${row.id}`} className="w-28 shrink-0 truncate text-xs hover:underline">
                  <span className="font-mono text-muted-foreground">{row.id}</span> {row.name}
                </Link>
                <div className={cn("relative h-8 flex-1 rounded-md bg-muted/40", row.offline && "bg-hatch")}>
                  {hours.map((hour) => (
                    <span key={hour} className="absolute inset-y-0 w-px bg-border" style={{ left: `${position(hour)}%` }} />
                  ))}
                  {row.segments
                    .filter((segment) => segment.end > from && segment.start < from + span)
                    .map((segment) => (
                      <Tooltip key={segment.key}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "absolute inset-y-1 flex items-center overflow-hidden rounded-[5px] px-1.5 text-[10px] font-medium whitespace-nowrap",
                              segment.kind === "planned" ? "border border-dashed border-primary/60 text-primary" : segment.className,
                              segment.kind === "live" && "text-background",
                            )}
                            style={{ left: `${position(segment.start)}%`, width: `calc(${position(segment.end) - position(segment.start)}% - 2px)` }}
                          >
                            {segment.label}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">
                          <p className="font-medium">{segment.label}</p>
                          <p className="opacity-80">{segment.detail}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                </div>
              </div>
            ))}
            <span className="pointer-events-none absolute inset-y-0 w-0.5 rounded bg-primary" style={{ left: `calc(7rem + 0.75rem + (100% - 7.75rem) * ${position(now) / 100})` }} />
          </div>
        </div>
      </CardContent>
    </Panel>
  )
}
