import { addDays, differenceInCalendarWeeks, format, isValid, nextMonday, parseISO, startOfToday } from "date-fns"
import { useState } from "react"
import type { TimelineSummary } from "@/lib/proposal/inquiry"
import { MAX_WEEKS, MIN_WEEKS, PACE_PRESETS, PHASES, weeksForPace, type PacePreset } from "@/lib/proposal/phases"
import { buildSchedule, type Schedule } from "@/lib/proposal/schedule"

const ISO = "yyyy-MM-dd"
/** Earliest sensible kick-off: leaves two weeks to agree scope and book site access. */
const LEAD_DAYS = 13

interface TimelineState {
  start: string
  target: string
  weeks: number[]
  included: boolean[]
}

const defaultStart = () => nextMonday(addDays(startOfToday(), LEAD_DAYS))

const initialState = (): TimelineState => ({
  start: format(defaultStart(), ISO),
  target: "",
  weeks: weeksForPace(1),
  included: PHASES.map((phase) => !phase.optional),
})

const sameWeeks = (a: number[], b: number[]) => a.every((value, index) => value === b[index])

export interface TargetCheck {
  target: Date
  meets: boolean
  /** Whole weeks between the plan's floor-wide go-live and the target. Positive means the plan is later. */
  weeksLate: number
  /** Floor-wide go-live if every phase ran at the accelerated pace. */
  acceleratedLive: Date
}

/** Owns the client's timeline choices and derives the schedule from them. Mount it after hydration. */
export function useTimeline() {
  const [state, setState] = useState(initialState)
  const parsedStart = parseISO(state.start)
  const start = isValid(parsedStart) ? parsedStart : defaultStart()

  const schedule: Schedule = buildSchedule({ start, weeks: state.weeks, included: state.included })

  const parsedTarget = parseISO(state.target)
  const targetCheck: TargetCheck | null = isValid(parsedTarget)
    ? {
        target: parsedTarget,
        meets: schedule.floorLive <= parsedTarget,
        weeksLate: differenceInCalendarWeeks(schedule.floorLive, parsedTarget),
        acceleratedLive: buildSchedule({ start, weeks: weeksForPace(PACE_PRESETS[0].factor), included: state.included }).floorLive,
      }
    : null

  const activePace: PacePreset["id"] | "custom" =
    PACE_PRESETS.find((preset) => sameWeeks(state.weeks, weeksForPace(preset.factor)))?.id ?? "custom"

  const summary: TimelineSummary = {
    start: format(start, ISO),
    floorLive: format(schedule.floorLive, ISO),
    targetDate: targetCheck ? format(targetCheck.target, ISO) : null,
    totalWeeks: schedule.totalWeeks,
    phases: schedule.phases.map((entry) => ({ name: entry.phase.name, weeks: entry.weeks })),
  }

  return {
    state,
    start,
    schedule,
    summary,
    targetCheck,
    activePace,
    minStart: format(startOfToday(), ISO),
    setStart: (value: string) => setState((current) => ({ ...current, start: value })),
    setTarget: (value: string) => setState((current) => ({ ...current, target: value })),
    setWeeks: (index: number, weeks: number) =>
      setState((current) => ({
        ...current,
        weeks: current.weeks.map((value, i) => (i === index ? Math.min(MAX_WEEKS, Math.max(MIN_WEEKS, weeks)) : value)),
      })),
    setIncluded: (index: number, included: boolean) =>
      setState((current) => ({ ...current, included: current.included.map((value, i) => (i === index ? included : value)) })),
    applyPace: (factor: number) => setState((current) => ({ ...current, weeks: weeksForPace(factor) })),
  }
}

export type Timeline = ReturnType<typeof useTimeline>
