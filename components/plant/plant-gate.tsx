"use client"

import type { ReactNode } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { usePlant } from "@/lib/store/plant"

/** Live screens render on the client only; this holds their layout until the first snapshot lands. */
export function PlantGate({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const ready = usePlant((state) => state.snapshot !== null)
  if (ready) return children
  return (
    fallback ?? (
      <div className="grid gap-4" aria-busy="true" aria-label="Connecting to plant feed">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  )
}
