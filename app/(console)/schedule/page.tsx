import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"
import { ScheduleView } from "@/components/schedule/schedule-view"

export const metadata: Metadata = { title: "Schedule" }

export default function SchedulePage() {
  return (
    <>
      <PageHeader
        eyebrow="Planning"
        title="Schedule"
        description="What each machine did, is doing and runs next, plus the delivery and maintenance calendar the plan is built around."
      />
      <ScheduleView />
    </>
  )
}
