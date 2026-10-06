"use client"

import type { ReactNode } from "react"

export function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-medium tabular">{children}</dd>
    </div>
  )
}
