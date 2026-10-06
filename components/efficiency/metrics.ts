import { REASONS } from "@/lib/domain/catalog"
import { GO_LIVE_DAYS_AGO, HISTORY_DAYS, average, type DailyMetric, type LossReason } from "@/lib/sim/history"

export const pct = (value: number) => `${(value * 100).toFixed(1)}%`

export function split(history: DailyMetric[]) {
  const baseline = history.slice(0, HISTORY_DAYS - GO_LIVE_DAYS_AGO)
  const recent = history.slice(-7)
  return { baseline, recent }
}

export function lossRows(history: DailyMetric[]) {
  const { baseline, recent } = split(history)
  return (Object.keys(REASONS) as LossReason[])
    .filter((reason) => reason in recent[0].losses)
    .map((reason) => ({
      reason,
      label: REASONS[reason].label,
      minutes: Math.round(average(recent, (d) => d.losses[reason])),
      baseline: Math.round(average(baseline, (d) => d.losses[reason])),
    }))
    .sort((a, b) => b.minutes - a.minutes)
}
