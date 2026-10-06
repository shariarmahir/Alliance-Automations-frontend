"use client"

import { format } from "date-fns"
import { GlowCard } from "@/components/glow-card"
import { PaceToggle } from "@/components/proposal/pace-toggle"
import { TargetCheck } from "@/components/proposal/target-check"
import type { Timeline } from "@/components/proposal/use-timeline"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PACE_PRESETS } from "@/lib/proposal/phases"

const day = (date: Date) => format(date, "d MMM yyyy")

/**
 * The plan that travels with the request. It edits the same timeline as the planner above, so changing a date or
 * the pace here updates both places and the brief that is sent. Phase lengths and optional phases are set in the planner above.
 */
export function PlanSummary({ timeline }: { timeline: Timeline }) {
  const { state, schedule, targetCheck, activePace, minStart } = timeline

  return (
    <GlowCard asChild>
      <aside className="flex flex-col gap-5 p-6" aria-label="Your plan">
        <div>
          <p className="text-base font-semibold">Your plan</p>
          <p className="mt-1 text-sm text-brand">Adjust it here or in the timeline above. It is sent with your request.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="summary-start">Project start</Label>
            <Input id="summary-start" type="date" min={minStart} value={state.start} onChange={(event) => timeline.setStart(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="summary-target">Live by (optional)</Label>
            <Input id="summary-target" type="date" min={state.start} value={state.target} onChange={(event) => timeline.setTarget(event.target.value)} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label id="summary-pace-label">Pace</Label>
          <PaceToggle active={activePace} onPick={timeline.applyPace} labelledBy="summary-pace-label" fill />
        </div>

        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">First machines live</dt>
            <dd className="font-medium tabular">{day(schedule.pilotLive)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Whole floor live</dt>
            <dd className="font-medium tabular">{day(schedule.floorLive)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Plan length</dt>
            <dd className="font-medium tabular">{schedule.totalWeeks} weeks</dd>
          </div>
        </dl>

        {targetCheck && <TargetCheck check={targetCheck} schedule={schedule} onAccelerate={() => timeline.applyPace(PACE_PRESETS[0].factor)} />}
      </aside>
    </GlowCard>
  )
}
