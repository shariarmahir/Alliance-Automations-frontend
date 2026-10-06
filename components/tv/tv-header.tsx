"use client"

import { BRAND, LogoMark } from "@/components/brand/logo"
import { formatClockSeconds, formatLongDate } from "@/lib/format"
import { useSnapshot } from "@/lib/store/plant"

export function Header() {
  const now = useSnapshot((snapshot) => snapshot.now)
  return (
    <header className="flex items-center gap-5 border-b px-8 py-4">
      <LogoMark size="lg" />
      <div className="leading-tight">
        <p className="text-2xl font-semibold tracking-tight">
          Dyeing floor <span className="text-muted-foreground">·</span> <span className="text-primary">Live monitoring</span>
        </p>
        <p className="text-sm text-muted-foreground">
          {BRAND.company} · {BRAND.product}
        </p>
      </div>
      <div className="ml-auto text-right">
        <p className="font-mono text-4xl font-semibold text-held tabular">{formatClockSeconds(now)}</p>
        <p className="text-sm text-muted-foreground">{formatLongDate(now)}</p>
      </div>
    </header>
  )
}
