import type { ReasonCode } from "@/lib/domain/types"
import { DAY } from "@/lib/time"
import { createRandom } from "./random"

export type LossReason = Exclude<ReasonCode, "maintenance">

export interface DailyMetric {
  date: number
  producedKg: number
  availability: number
  performance: number
  quality: number
  oee: number
  energyKwhPerKg: number
  steamKgPerKg: number
  waterLPerKg: number
  losses: Record<LossReason, number>
}

export const HISTORY_DAYS = 42
/** Monitoring went live two weeks ago; everything before is the measured baseline. */
export const GO_LIVE_DAYS_AGO = 14

/** Average lost machine-minutes per day before go-live. */
const BASELINE_LOSSES: Record<LossReason, number> = {
  "shade-correction": 430,
  "waiting-batch": 390,
  changeover: 310,
  "waiting-chemicals": 270,
  "steam-pressure": 220,
  "machine-fault": 180,
  "lab-approval": 150,
  "power-cut": 90,
}

export function buildHistory(today: number): DailyMetric[] {
  const random = createRandom(4_2026)
  const noise = (spread: number) => (random() - 0.5) * 2 * spread

  return Array.from({ length: HISTORY_DAYS }, (_, i) => {
    const daysAgo = HISTORY_DAYS - i
    const sinceGoLive = GO_LIVE_DAYS_AGO - daysAgo
    const adoption = Math.min(1, Math.max(0, sinceGoLive / 10))

    const availability = 0.8 + 0.06 * adoption + noise(0.02)
    const performance = 0.84 + 0.05 * adoption + noise(0.02)
    const quality = 0.86 + 0.05 * adoption + noise(0.015)

    const losses = Object.fromEntries(
      Object.entries(BASELINE_LOSSES).map(([reason, minutes]) => [
        reason,
        Math.round(minutes * (1 - 0.38 * adoption) * (1 + noise(0.18))),
      ]),
    ) as Record<LossReason, number>

    return {
      date: today - daysAgo * DAY,
      producedKg: Math.round(56_000 + 9_000 * adoption + noise(3_500)),
      availability,
      performance,
      quality,
      oee: availability * performance * quality,
      energyKwhPerKg: 1.02 - 0.14 * adoption + noise(0.03),
      steamKgPerKg: 4.3 - 0.5 * adoption + noise(0.12),
      waterLPerKg: 76 - 10 * adoption + noise(2.5),
      losses,
    }
  })
}

export function average<T>(rows: T[], pick: (row: T) => number) {
  return rows.length ? rows.reduce((sum, row) => sum + pick(row), 0) / rows.length : 0
}
