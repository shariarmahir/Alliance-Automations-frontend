import type { Metadata } from "next"
import { TvBoard } from "@/components/tv/tv-board"

export const metadata: Metadata = { title: "TV wallboard" }

export default function TvPage() {
  return <TvBoard />
}
