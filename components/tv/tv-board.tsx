"use client"

import { useEffect } from "react"
import { PlantGate } from "@/components/plant/plant-gate"
import { AlertTicker } from "@/components/tv/alert-ticker"
import { AttentionList } from "@/components/tv/attention-list"
import { BayTabs } from "@/components/tv/bay-tabs"
import { KpiStrip } from "@/components/tv/kpi-strip"
import { MachineTable } from "@/components/tv/machine-table"
import { OutputPanel } from "@/components/tv/output-panel"
import { Header, toggleFullscreen } from "@/components/tv/tv-header"
import { useRotation } from "@/components/tv/use-rotation"
import { BAYS } from "@/lib/domain/catalog"

/** Time each bay stays on the wall before the board turns to the next. */
const ROTATE_MS = 15_000

function Board() {
  const { page, progress, paused, setPaused, go } = useRotation(BAYS.length, ROTATE_MS)
  const bay = page + 1

  // Space pauses the rotation, arrows page through bays, F goes full screen: a keyboard is often the only input on a wall.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === " ") {
        event.preventDefault()
        setPaused((current) => !current)
      } else if (event.key === "ArrowRight") go(page + 1)
      else if (event.key === "ArrowLeft") go(page - 1)
      else if (event.key.toLowerCase() === "f") toggleFullscreen()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [go, page, setPaused])

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <Header paused={paused} onPause={() => setPaused((current) => !current)} />
      <KpiStrip />
      <BayTabs bay={bay} progress={progress} paused={paused} onSelect={(next) => go(next - 1)} />
      <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 px-4 pt-4 md:px-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex min-h-0 flex-col">
          <MachineTable bay={bay} />
        </div>
        <aside className="grid min-h-0 grid-cols-1 content-start gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-[minmax(0,1fr)_auto]">
          <AttentionList />
          <OutputPanel />
        </aside>
      </main>
      <AlertTicker />
    </div>
  )
}

export function TvBoard() {
  return (
    <div className="tv-scale dark min-h-dvh bg-background bg-ambient text-foreground">
      <PlantGate fallback={<div className="grid h-dvh place-items-center text-muted-foreground">Connecting to plant feed…</div>}>
        <Board />
      </PlantGate>
    </div>
  )
}
