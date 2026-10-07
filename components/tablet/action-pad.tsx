"use client"

import { BellRing, PackageCheck, PackageOpen, Play, QrCode, TimerReset } from "lucide-react"
import { QUICK_NOTES } from "@/components/control/note-dialog"
import { GlowCard } from "@/components/glow-card"
import { addNote, callSupervisor, confirmLoad, confirmUnload, extendHold, raiseHold, releaseHold } from "@/components/plant/operator-actions"
import { Button } from "@/components/ui/button"
import { HOLD_REASONS, REASONS } from "@/lib/domain/catalog"
import type { MachineView } from "@/lib/domain/types"

/** A hold raised from the tablet assumes this length; the owner can extend it. */
const HOLD_MINUTES = 20
const EXTEND_MIN = 15

/**
 * Every command the operator can give at the machine, as large touch targets. The main command for the machine's
 * state comes first; hold reasons, the scan, help and quick notes follow.
 */
export function ActionPad({ view, onScan }: { view: MachineView; onScan: () => void }) {
  const id = view.machine.id
  const running = view.state.phase === "running"
  const hold = view.state.run?.hold

  return (
    <GlowCard className="flex flex-col gap-4 bg-card/45 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-semibold">{hold ? "Machine on hold" : running ? "Raise a hold" : "Machine commands"}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="lg" className="h-12 px-4" onClick={onScan}>
            <QrCode />
            Scan batch
          </Button>
          <Button variant="outline" size="lg" className="h-12 px-4" onClick={() => callSupervisor(id)}>
            <BellRing />
            Call supervisor
          </Button>
        </div>
      </div>

      {hold && (
        <div className="grid gap-2 sm:grid-cols-[2fr_1fr]">
          <Button className="h-16 text-lg" onClick={() => releaseHold(id)}>
            <Play className="size-5" />
            Resume · {REASONS[hold.reason].label}
          </Button>
          <Button variant="outline" className="h-16 text-base" onClick={() => extendHold(id, EXTEND_MIN)}>
            <TimerReset className="size-5" />+{EXTEND_MIN} min
          </Button>
        </div>
      )}
      {view.state.phase === "complete" && (
        <Button className="h-16 text-lg" onClick={() => confirmUnload(id)}>
          <PackageCheck className="size-5" />
          Confirm {view.batch?.id} unloaded
        </Button>
      )}
      {view.state.phase === "ready" && (
        <Button className="h-16 text-lg" onClick={() => confirmLoad(id)}>
          <PackageOpen className="size-5" />
          Confirm {view.state.next?.batchId} loaded
        </Button>
      )}

      {running && !hold && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {HOLD_REASONS.map((reason) => (
            <Button key={reason} variant="outline" className="h-16 flex-col gap-0.5 text-base whitespace-normal" onClick={() => raiseHold(id, reason, HOLD_MINUTES)}>
              {REASONS[reason].label}
              <span className="text-xs font-normal text-muted-foreground">{REASONS[reason].owner}</span>
            </Button>
          ))}
        </div>
      )}

      <div className="border-t pt-4">
        <p className="mb-2 text-sm text-muted-foreground">Quick note to the machine log</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_NOTES.map((note) => (
            <Button key={note} variant="secondary" className="h-11 px-4" onClick={() => addNote(id, note)}>
              {note}
            </Button>
          ))}
        </div>
      </div>
    </GlowCard>
  )
}
