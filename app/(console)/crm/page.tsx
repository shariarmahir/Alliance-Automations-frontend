import type { Metadata } from "next"
import { CrmView } from "@/components/crm/crm-view"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = { title: "CRM" }

export default function CrmPage() {
  return (
    <>
      <PageHeader
        eyebrow="Business"
        title="Buyers & orders"
        description="Order pipeline from lab dip to shipment. Dyed quantity updates automatically as batches unload; shade approvals gate dyeing."
      />
      <CrmView />
    </>
  )
}
