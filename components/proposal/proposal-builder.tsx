"use client"

import { Section } from "@/components/landing/section"
import { InquiryForm } from "@/components/proposal/inquiry-form"
import { TimelinePlanner } from "@/components/proposal/timeline-planner"
import { useTimeline } from "@/components/proposal/use-timeline"
import { Skeleton } from "@/components/ui/skeleton"
import { useHydrated } from "@/hooks/use-hydrated"

/** Shares one timeline between the planner and the inquiry form so the request carries the client's choices. */
function Builder() {
  const timeline = useTimeline()

  return (
    <>
      <Section
        id="timeline"
        title="Your timeline, your pace"
        description="Six phases, each with one exit test. Set your start, your pace and the optional phases."
      >
        <TimelinePlanner timeline={timeline} />
      </Section>
      <Section
        id="start"
        detailsHref="/blueprint#build"
        title="Tell us about your floor"
        description="Share a few details and we will come back with a pilot scope built around the timeline above."
      >
        <InquiryForm timeline={timeline} />
      </Section>
    </>
  )
}

/** Dates depend on today, so the builder renders on the client only. */
export function ProposalBuilder() {
  const hydrated = useHydrated()
  if (hydrated) return <Builder />

  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <Skeleton className="h-96 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  )
}
