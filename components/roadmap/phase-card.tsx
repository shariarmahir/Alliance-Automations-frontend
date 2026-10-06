import { Circle, CircleCheck, CircleDot } from "lucide-react"
import { PHASE_STATUS, weekDate } from "@/components/roadmap/phase-meta"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Phase } from "@/lib/roadmap"
import { cn } from "@/lib/utils"

function StepList({ phase }: { phase: Phase }) {
  const currentIndex = phase.status === "active" ? phase.steps.findIndex((step) => !step.done) : -1

  return (
    <ol className="flex flex-col gap-2">
      {phase.steps.map((step, index) => {
        const Icon = step.done ? CircleCheck : index === currentIndex ? CircleDot : Circle
        const tone = step.done ? "text-running" : index === currentIndex ? "text-primary" : "text-muted-foreground/60"
        return (
          <li key={step.label} className="flex gap-2">
            <Icon className={cn("mt-0.5 size-4 shrink-0", tone)} aria-hidden />
            <span className={cn(step.done && "text-muted-foreground line-through")}>{step.label}</span>
          </li>
        )
      })}
    </ol>
  )
}

export function PhaseCard({ phase }: { phase: Phase }) {
  const status = PHASE_STATUS[phase.status]

  return (
    <Card className={cn("h-full", phase.status === "active" && "ring-primary/50")}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-mono text-xs text-muted-foreground">
              Phase {phase.id} · weeks {phase.startWeek}–{phase.endWeek} · {weekDate(phase.startWeek)} to {weekDate(phase.endWeek)}
            </p>
            <CardTitle className="mt-1">{phase.name}</CardTitle>
          </div>
          <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap", status.badge)}>{status.label}</span>
        </div>
        <CardDescription>{phase.goal}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 text-sm">
        <StepList phase={phase} />
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
  )
}
