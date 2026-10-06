"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

const MAX_LENGTH = 60

function ClientName() {
  const name = useSearchParams().get("client")?.trim().slice(0, MAX_LENGTH)
  if (!name) return null
  return <span className="rounded-full bg-brand/15 px-3 py-1 text-xs font-medium text-brand">Prepared for {name}</span>
}

/** Personalises the proposal from the link, e.g. /?client=Acme%20Textiles. Renders nothing without it. */
export function PreparedFor() {
  return (
    <Suspense fallback={null}>
      <ClientName />
    </Suspense>
  )
}
