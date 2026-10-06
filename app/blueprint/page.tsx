import type { Metadata } from "next"
import { BlueprintHero } from "@/components/blueprint/blueprint-hero"
import { BuildDetail } from "@/components/blueprint/build-detail"
import { OptionsDetail } from "@/components/blueprint/options-detail"
import { ProblemDetail } from "@/components/blueprint/problem-detail"
import { SolutionDetail } from "@/components/blueprint/solution-detail"
import { TechnologyDetail } from "@/components/blueprint/technology-detail"
import { WhyUsDetail } from "@/components/blueprint/why-us-detail"
import { Section } from "@/components/landing/section"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader, type HeaderLink } from "@/components/landing/site-header"
import { Reveal } from "@/components/reveal"

export const metadata: Metadata = {
  title: "Project blueprint · Alliance Automations",
  description: "The problem, the solution and the full build for a dyeing floor, with two technology options and a form to draw your own structure.",
}

const LINKS: HeaderLink[] = [
  { href: "#problem", label: "Problem" },
  { href: "#solution", label: "Solution" },
  { href: "#architecture", label: "Options" },
  { href: "#technology", label: "Technology" },
  { href: "#build", label: "Your build" },
  { href: "#why-us", label: "Why us" },
]

export default function BlueprintPage() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-ambient">
      <SiteHeader links={LINKS} />
      <main className="mx-auto flex max-w-6xl flex-col gap-20 px-4 pb-24 md:gap-24 md:px-6 md:pb-28">
        <BlueprintHero />

        <Section
          id="problem"
          title="The problem, in detail"
          description="Delay and waste are lost a few minutes at a time, and nobody sees it until a delivery slips."
        >
          <Reveal inView>
            <ProblemDetail />
          </Reveal>
        </Section>

        <Section
          id="solution"
          title="The solution, step by step"
          description="Sense every vat, decide early, and put the next action in front of the right person."
        >
          <Reveal inView>
            <SolutionDetail />
          </Reveal>
        </Section>

        <Section
          id="architecture"
          title="Two ways to build it"
          description="Moderate gets the floor under control. Advanced adds prediction, full utility metering and reach. Pick one to see its structure."
        >
          <Reveal inView>
            <OptionsDetail />
          </Reveal>
        </Section>

        <Section
          id="technology"
          title="Why this technology"
          description="Open standards, proven parts and live screens. Each choice makes the floor more efficient, more productive and easier to control."
        >
          <Reveal inView>
            <TechnologyDetail />
          </Reveal>
        </Section>

        <Section
          id="build"
          title="Draw your own build"
          description="Choose what you run and what you want. The structure drawing updates as you go, and you can send it to us."
        >
          <Reveal inView>
            <BuildDetail />
          </Reveal>
        </Section>

        <Section id="why-us" title="Why you need us" description="One team from sensor to screen, with proof at every step.">
          <Reveal inView>
            <WhyUsDetail />
          </Reveal>
        </Section>
      </main>
      <SiteFooter />
    </div>
  )
}
