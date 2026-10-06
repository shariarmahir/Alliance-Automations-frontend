import { addWeeks } from "date-fns"
import { PHASES, type Phase } from "./phases"

export interface TimelineSettings {
  start: Date
  /** Duration in weeks per phase, aligned with PHASES. */
  weeks: number[]
  /** Whether each phase is part of the plan, aligned with PHASES. Required phases are always included. */
  included: boolean[]
}

export interface ScheduledPhase {
  phase: Phase
  weeks: number
  startWeek: number
  endWeek: number
  start: Date
  end: Date
}

export interface Schedule {
  phases: ScheduledPhase[]
  totalWeeks: number
  end: Date
  /** End of the pilot phase: first machines delivering live signals. */
  pilotLive: Date
  /** End of the scale phase: every machine on the live system. */
  floorLive: Date
}

const PILOT_PHASE_ID = 2
const FLOOR_PHASE_ID = 3

/** Lays the chosen phases end to end from the start date. Skipped phases take no time. */
export function buildSchedule({ start, weeks, included }: TimelineSettings): Schedule {
  let cursor = 0
  const phases = PHASES.flatMap((phase, index): ScheduledPhase[] => {
    if (phase.optional && !included[index]) return []
    const scheduled = {
      phase,
      weeks: weeks[index],
      startWeek: cursor,
      endWeek: cursor + weeks[index],
      start: addWeeks(start, cursor),
      end: addWeeks(start, cursor + weeks[index]),
    }
    cursor += weeks[index]
    return [scheduled]
  })

  const endOf = (id: number) => phases.find((entry) => entry.phase.id === id)!.end

  return { phases, totalWeeks: cursor, end: addWeeks(start, cursor), pilotLive: endOf(PILOT_PHASE_ID), floorLive: endOf(FLOOR_PHASE_ID) }
}
