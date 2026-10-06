import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"
import { Reveal } from "@/components/reveal"
import { PhaseCard } from "@/components/roadmap/phase-card"
import { PlanCalendar } from "@/components/roadmap/plan-calendar"
import { RiskList } from "@/components/roadmap/risk-list"
import { PHASES } from "@/lib/roadmap"

export const metadata: Metadata = { title: "Roadmap" }

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
              <PhaseCard phase={phase} />
            </Reveal>
          ))}
        </div>
        <Reveal order={PHASES.length + 1}>
          <RiskList />
        </Reveal>
      </div>
    </>
  )
}
