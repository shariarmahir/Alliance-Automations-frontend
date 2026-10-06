/** Validation and the plain-text brief for the proposal form. */

export interface TimelineSummary {
  /** ISO dates, yyyy-MM-dd. */
  start: string
  floorLive: string
  targetDate: string | null
  totalWeeks: number
  phases: { name: string; weeks: number }[]
}

export interface Inquiry {
  name: string
  company: string
  email: string
  phone: string
  machines: string
  controllers: string
  erp: string
  message: string
  timeline: TimelineSummary
}

export type InquiryField = Exclude<keyof Inquiry, "timeline">
export type InquiryErrors = Partial<Record<InquiryField | "timeline", string>>

const LIMITS: Record<InquiryField, number> = {
  name: 100,
  company: 120,
  email: 160,
  phone: 40,
  machines: 5,
  controllers: 300,
  erp: 200,
  message: 2000,
}

const REQUIRED: InquiryField[] = ["name", "company", "email"]
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

const asText = (value: unknown) => (typeof value === "string" ? value.trim() : "")

function readTimeline(value: unknown): TimelineSummary | null {
  if (typeof value !== "object" || value === null) return null
  const raw = value as Record<string, unknown>
  const phases = Array.isArray(raw.phases) ? raw.phases.slice(0, 10) : []
  const parsed = phases.flatMap((phase) => {
    const entry = phase as Record<string, unknown>
    return typeof entry?.name === "string" && Number.isFinite(entry.weeks)
      ? [{ name: entry.name.slice(0, 80), weeks: Number(entry.weeks) }]
      : []
  })
  const target = asText(raw.targetDate)
  if (!ISO_DATE.test(asText(raw.start)) || !ISO_DATE.test(asText(raw.floorLive)) || !parsed.length) return null
  return {
    start: asText(raw.start),
    floorLive: asText(raw.floorLive),
    targetDate: ISO_DATE.test(target) ? target : null,
    totalWeeks: Number(raw.totalWeeks) || 0,
    phases: parsed,
  }
}

export function validateInquiry(input: unknown): { ok: true; value: Inquiry } | { ok: false; errors: InquiryErrors } {
  const raw = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>
  const errors: InquiryErrors = {}
  const fields = Object.fromEntries((Object.keys(LIMITS) as InquiryField[]).map((key) => [key, asText(raw[key])])) as Record<InquiryField, string>

  for (const key of REQUIRED) if (!fields[key]) errors[key] = "This field is required."
  for (const key of Object.keys(LIMITS) as InquiryField[]) {
    if (fields[key].length > LIMITS[key]) errors[key] = `Keep this under ${LIMITS[key]} characters.`
  }
  if (fields.email && !errors.email && !EMAIL.test(fields.email)) errors.email = "Enter a valid email address."
  if (fields.machines && !/^\d{1,4}$/.test(fields.machines)) errors.machines = "Enter a whole number."

  const timeline = readTimeline(raw.timeline)
  if (!timeline) errors.timeline = "The timeline is missing. Reload the page and try again."

  return Object.keys(errors).length || !timeline ? { ok: false, errors } : { ok: true, value: { ...fields, timeline } }
}

const optional = (label: string, value: string) => (value ? `${label}: ${value}` : null)

/** Plain-text brief, sent by email or WhatsApp and used for the copy button. */
export function formatInquiry(inquiry: Inquiry): string {
  const { timeline } = inquiry
  const goLive = `${timeline.floorLive}${timeline.targetDate ? ` (target ${timeline.targetDate})` : ""}`
  const lines = [
    "New project inquiry · Alliance Automations",
    "",
    `Name: ${inquiry.name}`,
    `Company: ${inquiry.company}`,
    `Email: ${inquiry.email}`,
    optional("Phone", inquiry.phone),
    optional("Machines", inquiry.machines),
    optional("Machine brands / controllers", inquiry.controllers),
    optional("ERP / systems", inquiry.erp),
    "",
    `Preferred start: ${timeline.start}`,
    `Floor-wide go-live: ${goLive}`,
    `Plan length: ${timeline.totalWeeks} weeks`,
    ...timeline.phases.map((phase) => `  - ${phase.name}: ${phase.weeks} wk`),
    inquiry.message ? `\nMessage:\n${inquiry.message}` : null,
  ]
  return lines.filter((line): line is string => line !== null).join("\n")
}
