import type { Metadata } from "next"
import { TabletView } from "@/components/tablet/tablet-view"

export const metadata: Metadata = { title: "Operator tablet" }

export default function TabletPage() {
  return <TabletView />
}
