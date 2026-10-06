"use client"

import { format } from "date-fns"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { GlowCard } from "@/components/glow-card"
import { PhaseRow } from "@/components/proposal/phase-row"
import { PaceToggle } from "@/components/proposal/pace-toggle"
import { PhaseReveal } from "@/components/proposal/phase-reveal"
import { PlanGantt } from "@/components/proposal/plan-gantt"
import { TargetCheck } from "@/components/proposal/target-check"
import type { Timeline } from "@/components/proposal/use-timeline"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PACE_PRESETS, PHASES } from "@/lib/proposal/phases"

const PHASE_LIST_ID = "plan-phases"

const day = (date: Date) => format(date, "d MMM yyyy")

function Milestone({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl px-4 py-3 ring-1 ring-foreground/10">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular">{value}</p>
    </div>
  )
}

export function TimelinePlanner({ timeline }: { timeline: Timeline }) {
  const { state, schedule, targetCheck, activePace, minStart } = timeline
  const activePreset = PACE_PRESETS.find((preset) => preset.id === activePace)
  const [expanded, setExpanded] = useState(false)

  const renderPhase = (phase: (typeof PHASES)[number], index: number) => (
    <PhaseRow
      key={phase.id}
      phase={phase}
      weeks={state.weeks[index]}
      included={state.included[index]}
      entry={schedule.phases.find((scheduled) => scheduled.phase.id === phase.id)}
      onWeeks={(weeks) => timeline.setWeeks(index, weeks)}
      onIncluded={(included) => timeline.setIncluded(index, included)}
    />
  )

  return (
    <div className="flex flex-col gap-6">
      <GlowCard asChild>
        <Card className="rounded-2xl bg-transparent ring-0">
          <CardHeader>
            <CardTitle>Set your timeline</CardTitle>
            <CardDescription className="text-brand">
              Choose when we start and how fast we move. Adjust any phase; the plan and dates update as you go.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
              <div className="grid gap-2">
                <Label htmlFor="plan-start">Project start</Label>
                <Input id="plan-start" type="date" min={minStart} value={state.start} onChange={(event) => timeline.setStart(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="plan-target">Whole floor live by (optional)</Label>
                <Input id="plan-target" type="date" min={state.start} value={state.target} onChange={(event) => timeline.setTarget(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label id="plan-pace-label">Pace</Label>
                <PaceToggle active={activePace} onPick={timeline.applyPace} labelledBy="plan-pace-label" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{activePreset ? activePreset.note : "Custom durations. Pick a pace to reset every phase."}</p>

            <div className="grid gap-3 sm:grid-cols-3">
              <Milestone label="First machines live" value={day(schedule.pilotLive)} />
              <Milestone label="Whole floor live" value={day(schedule.floorLive)} />
              <Milestone label="Plan length" value={`${schedule.totalWeeks} weeks`} />
            </div>

            {targetCheck && <TargetCheck check={targetCheck} schedule={schedule} onAccelerate={() => timeline.applyPace(PACE_PRESETS[0].factor)} />}

            <PlanGantt schedule={schedule} expanded={expanded} />
            <PhaseReveal expanded={expanded} hidden={PHASES.length - 1} controls={PHASE_LIST_ID} onToggle={() => setExpanded((open) => !open)} />
          </CardContent>
        </Card>
      </GlowCard>

      <div id={PHASE_LIST_ID} className="flex flex-col gap-4">
        <ol className="flex flex-col gap-4">{PHASES.slice(0, 1).map(renderPhase)}</ol>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.ol
              key="later-phases"
              className="flex flex-col gap-4"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {PHASES.slice(1).map((phase, offset) => renderPhase(phase, offset + 1))}
            </motion.ol>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
