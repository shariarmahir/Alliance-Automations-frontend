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
        description="Illustrative demo data, not measured results. It shows the format of the four-week baseline and the before-and-after view a real pilot produces."
      />
      <EfficiencyView />
    </>
  )
}
