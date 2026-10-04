import type { Metadata } from "next"
import { BatchesView } from "@/components/batches/batches-view"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = { title: "Batches" }

export default function BatchesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Production"
        title="Batches"
        description="Batches in machines and those unloaded since the 06:00 shift start. Planning fields come from ERP; times and status come from the machines."
      />
      <BatchesView />
    </>
  )
}
