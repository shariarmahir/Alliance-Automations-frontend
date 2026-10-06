import { addWeeks, format } from "date-fns"
import { PROJECT_START, type PhaseStatus } from "@/lib/roadmap"

export const PHASE_STATUS: Record<PhaseStatus, { label: string; bar: string; badge: string }> = {
  done: { label: "Done", bar: "bg-running", badge: "bg-running/12 text-running" },
  active: { label: "In progress", bar: "bg-primary", badge: "bg-primary/12 text-primary" },
  next: { label: "Next", bar: "bg-primary/40", badge: "bg-secondary text-foreground" },
  later: { label: "Planned", bar: "bg-muted-foreground/30", badge: "bg-muted text-muted-foreground" },
}

/** Calendar date of a plan week, counted from the project start. */
export const weekDate = (week: number) => format(addWeeks(PROJECT_START, week), "d MMM")
