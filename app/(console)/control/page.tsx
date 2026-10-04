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
        description="Live state of every machine. Open a machine for its recipe timeline, sensors and operator commands."
      />
      <ControlView />
    </>
  )
}
