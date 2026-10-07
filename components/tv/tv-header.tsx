"use client"

import { Expand, Pause, Play } from "lucide-react"
import { BRAND, LogoMark } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import { shiftAt } from "@/lib/domain/shift"
import { formatClock, formatClockSeconds, formatLongDate } from "@/lib/format"
import { useSnapshot } from "@/lib/store/plant"

export function toggleFullscreen() {
  if (document.fullscreenElement) void document.exitFullscreen()
  else void document.documentElement.requestFullscreen?.()
}

export function Header({ paused, onPause }: { paused: boolean; onPause: () => void }) {
  const now = useSnapshot((snapshot) => snapshot.now)
  const shift = shiftAt(now)

  return (
    <header className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b px-4 py-3 md:px-8 md:py-4">
      <LogoMark size="lg" />
      <div className="min-w-0 leading-tight">
        <p className="text-xl font-semibold tracking-tight md:text-2xl">
          Dyeing floor <span className="text-muted-foreground">·</span> <span className="text-brand">Live monitoring</span>
        </p>
        <p className="text-sm text-muted-foreground">
          {BRAND.company} · {BRAND.product}
        </p>
      </div>

      <div className="order-last w-full min-w-48 sm:order-0 sm:ml-auto sm:w-64">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium">
            Shift {shift.name} <span className="font-normal text-muted-foreground">· {Math.round(shift.progress * 100)}% through</span>
          </span>
          <span className="font-mono text-xs text-muted-foreground tabular">
            {formatClock(shift.start)}–{formatClock(shift.end)}
          </span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-brand transition-[width] duration-1000" style={{ width: `${shift.progress * 100}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-1.5 max-sm:ml-auto">
        <Button variant="outline" size="icon" onClick={onPause} aria-label={paused ? "Resume bay rotation" : "Pause bay rotation"} title="Space">
          {paused ? <Play /> : <Pause />}
        </Button>
        <Button variant="outline" size="icon" onClick={toggleFullscreen} aria-label="Full screen" title="F" className="max-md:hidden">
          <Expand />
        </Button>
      </div>

      <div className="text-right max-sm:hidden">
        <p className="font-mono text-3xl font-semibold text-brand tabular md:text-4xl">{formatClockSeconds(now)}</p>
        <p className="text-sm text-muted-foreground">{formatLongDate(now)}</p>
      </div>
    </header>
  )
}

