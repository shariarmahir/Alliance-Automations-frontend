import type { Metadata } from "next"
import { ControlView } from "@/components/control/control-view"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = { title: "Control panel" }

export default function ControlPage() {
  return (
    <>
      <PageHeader
        eyebrow="Supervisory control"
        title="Control panel"
        description="Every machine, live. Switch on efficiency mode to see only the machines waiting on you, each with a one-tap fix."
      />
      <ControlView />
    </>
  )
}
