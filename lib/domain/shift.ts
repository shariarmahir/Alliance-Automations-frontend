import { HOUR } from "@/lib/time"

/** Three eight-hour shifts. Shift A opens the production day at 06:00. */
const SHIFT_HOURS = 8
const SHIFTS = [
  { name: "A", startHour: 6 },
  { name: "B", startHour: 14 },
  { name: "C", startHour: 22 },
] as const

export interface Shift {
  name: string
  start: number
  end: number
  /** 0 to 1 through the shift. */
  progress: number
}

export function shiftAt(now: number): Shift {
  const date = new Date(now)
  const hour = date.getHours()
  const current = [...SHIFTS].reverse().find((shift) => hour >= shift.startHour) ?? SHIFTS[SHIFTS.length - 1]
  const start = new Date(date)
  start.setHours(current.startHour, 0, 0, 0)
  if (start.getTime() > now) start.setDate(start.getDate() - 1)
  const begin = start.getTime()
  return { name: current.name, start: begin, end: begin + SHIFT_HOURS * HOUR, progress: (now - begin) / (SHIFT_HOURS * HOUR) }
}
