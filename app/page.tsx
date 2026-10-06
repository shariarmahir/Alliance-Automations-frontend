import { ArchitectureLayers } from "@/components/landing/architecture-layers"
import { Challenges } from "@/components/landing/challenges"
import { Hero } from "@/components/landing/hero"
import { LiveCounters } from "@/components/landing/live-counters"
import { ScreenGrid } from "@/components/landing/screen-grid"
import { Section } from "@/components/landing/section"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { ProposalBuilder } from "@/components/proposal/proposal-builder"
import { RiskList } from "@/components/proposal/risk-list"
import { Reveal } from "@/components/reveal"

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-ambient">
      <SiteHeader />
      <main className="mx-auto flex max-w-6xl flex-col gap-20 px-4 pb-24 md:gap-24 md:px-6 md:pb-28">
        <Hero />

        <Section
          id="challenge"
          detailsHref="/blueprint#problem"
          title="Where a dyeing floor loses time"
          description="Delay and waste are lost a few minutes at a time, and nobody sees it until a delivery slips."
        >
          <Reveal inView>
            <Challenges />
          </Reveal>
        </Section>

        <Section
          id="solution"
          detailsHref="/blueprint#solution"
          title="One system, a screen for every role"
          description="Managers, supervisors, operators and buyers each get the view they need, from one live source."
        >
          <Reveal inView>
            <ScreenGrid />
          </Reveal>
        </Section>

        <Section
          id="demo"
          title="A 50-machine floor, running right now"
          description="A simulated floor, so you can see every screen working. In your plant, they read your machines."
        >
          <Reveal inView>
            <LiveCounters />
          </Reveal>
        </Section>

        <Section
          id="how"
          detailsHref="/blueprint#architecture"
          title="From the machine to the wall screen"
          description="Industrial-grade layers, read-only toward your controllers, buffered so a network drop loses nothing."
        >
          <Reveal inView>
            <ArchitectureLayers />
          </Reveal>
        </Section>

        <Section
          id="risks"
          title="What could go wrong, and our answer"
          description="Every floor has surprises. These are the ones we plan for from day one."
        >
          <Reveal inView>
            <RiskList />
          </Reveal>
        </Section>

        <ProposalBuilder />
      </main>
      <SiteFooter />
    </div>
  )
}
