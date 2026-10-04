import { addWeeks, format } from "date-fns"
import { CircleCheck, CircleDot, Circle, ShieldAlert } from "lucide-react"
import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"
import { Reveal } from "@/components/reveal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PHASES, PLAN_WEEKS, PROJECT_START, RISKS, type PhaseStatus } from "@/lib/roadmap"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Roadmap" }

const STATUS: Record<PhaseStatus, { label: string; bar: string; badge: string }> = {
  done: { label: "Done", bar: "bg-running", badge: "bg-running/12 text-running" },
  active: { label: "In progress", bar: "bg-primary", badge: "bg-primary/12 text-primary" },
  next: { label: "Next", bar: "bg-primary/40", badge: "bg-secondary text-foreground" },
  later: { label: "Planned", bar: "bg-muted-foreground/30", badge: "bg-muted text-muted-foreground" },
}

const weekDate = (week: number) => format(addWeeks(PROJECT_START, week), "d MMM")
const QUARTERS = [0, 13, 26, 39]

function PlanCalendar() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>52-week plan</CardTitle>
        <CardDescription>
          Week 0 is {format(PROJECT_START, "d MMMM yyyy")}. Phases overlap where one team can start before the last one closes.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="flex gap-3">
            <span className="w-44 shrink-0" />
            <div className="relative h-5 flex-1 text-[11px] text-muted-foreground">
              {QUARTERS.map((week) => (
                <span key={week} className="absolute font-mono" style={{ left: `${(week / PLAN_WEEKS) * 100}%` }}>
                  W{week} · {weekDate(week)}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {PHASES.map((phase) => (
              <div key={phase.id} className="flex items-center gap-3">
                <span className="w-44 shrink-0 truncate text-sm">
                  <span className="font-mono text-xs text-muted-foreground">P{phase.id}</span> {phase.name}
                </span>
                <div className="relative h-8 flex-1 rounded-md bg-muted/40">
                  {QUARTERS.map((week) => (
                    <span key={week} className="absolute inset-y-0 w-px bg-border" style={{ left: `${(week / PLAN_WEEKS) * 100}%` }} />
                  ))}
                  <div
                    className={cn("absolute inset-y-1 flex items-center rounded-[5px] px-2 text-[11px] font-medium whitespace-nowrap", STATUS[phase.status].bar, phase.status === "active" && "text-primary-foreground")}
                    style={{ left: `${(phase.startWeek / PLAN_WEEKS) * 100}%`, width: `${((phase.endWeek - phase.startWeek) / PLAN_WEEKS) * 100}%` }}
                  >
                    W{phase.startWeek}–{phase.endWeek}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RoadmapPage() {
  return (
    <>
      <PageHeader
        eyebrow="Kandari-lab · build plan"
        title="Roadmap"
        description="From this demo to a multi-factory product. Each phase has one exit test; the next phase starts only when it passes."
      />
      <div className="flex flex-col gap-4">
        <Reveal>
          <PlanCalendar />
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PHASES.map((phase, index) => (
            <Reveal key={phase.id} order={index + 1}>
              <Card className={cn("h-full", phase.status === "active" && "ring-primary/50")}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">
                        Phase {phase.id} · weeks {phase.startWeek}–{phase.endWeek} · {weekDate(phase.startWeek)} to {weekDate(phase.endWeek)}
                      </p>
                      <CardTitle className="mt-1">{phase.name}</CardTitle>
                    </div>
                    <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap", STATUS[phase.status].badge)}>{STATUS[phase.status].label}</span>
                  </div>
                  <CardDescription>{phase.goal}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4 text-sm">
                  <ol className="flex flex-col gap-2">
                    {phase.steps.map((step, i) => {
                      const Icon = step.done ? CircleCheck : phase.status === "active" && i === phase.steps.findIndex((s) => !s.done) ? CircleDot : Circle
                      return (
                        <li key={step.label} className="flex gap-2">
                          <Icon className={cn("mt-0.5 size-4 shrink-0", step.done ? "text-running" : Icon === CircleDot ? "text-primary" : "text-muted-foreground/60")} aria-hidden />
                          <span className={cn(step.done && "text-muted-foreground line-through")}>{step.label}</span>
                        </li>
                      )
                    })}
                  </ol>
                  <dl className="mt-auto grid gap-2 border-t pt-3 text-xs">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Output</dt>
                      <dd className="text-right">{phase.output}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Team</dt>
                      <dd className="text-right">{phase.team.join(", ")}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Exit test</dt>
                      <dd className="text-right font-medium">{phase.exit}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal order={7}>
          <Card>
            <CardHeader>
              <CardTitle>Main risks</CardTitle>
              <CardDescription>And what the plan does about each</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {RISKS.map((item) => (
                <div key={item.risk} className="flex flex-col gap-1 rounded-lg bg-muted/40 p-3 text-sm">
                  <ShieldAlert className="size-4 text-held" aria-hidden />
                  <p className="font-medium">{item.risk}</p>
                  <p className="text-xs text-muted-foreground">{item.mitigation}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </>
  )
}
