import type { Metadata } from "next"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = { title: "Overview" }

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Dyeing floor · live"
        title="Plant overview"
        description="Fifty machines, five bays. Status is derived from machine signals; delay is projected end minus standard target."
      />
      <DashboardView />
    </>
  )
}
