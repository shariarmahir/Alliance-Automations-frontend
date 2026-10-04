import type { Metadata } from "next"
import { AiView } from "@/components/ai/ai-view"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = { title: "AI agents" }

export default function AiPage() {
  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="AI agents"
        description="Rules first, models once the data exists. Each agent runs in shadow mode, compared against actuals, before it is allowed to act."
      />
      <AiView />
    </>
  )
}
