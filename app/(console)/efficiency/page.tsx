import type { Metadata } from "next"
import { EfficiencyView } from "@/components/efficiency/efficiency-view"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = { title: "Efficiency" }

export default function EfficiencyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Efficiency & losses"
        description="Four weeks of baseline before go-live, then the effect of live monitoring. Losses come from reason codes raised on every hold."
      />
      <EfficiencyView />
    </>
  )
}
