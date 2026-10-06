const clock = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })
const clockWithSeconds = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
})
const longDate = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })
const shortDate = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" })
const integer = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 })

/** Minutes as hh:mm, the format used on the floor. */
export function formatHm(minutes: number) {
  const m = Math.max(0, Math.round(minutes))
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`
}

export const formatClock = (ms: number) => clock.format(ms)
export const formatClockSeconds = (ms: number) => clockWithSeconds.format(ms)
export const formatLongDate = (ms: number) => longDate.format(ms)
export const formatShortDate = (ms: number) => shortDate.format(ms)
export const formatInt = (value: number) => integer.format(value)

export function formatKg(kg: number) {
  return kg >= 10_000 ? `${(kg / 1000).toFixed(1)} t` : `${integer.format(kg)} kg`
}
