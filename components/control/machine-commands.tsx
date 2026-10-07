"use client"

import { BellRing, PackageCheck, PackageOpen, Play, ShieldAlert, TimerReset } from "lucide-react"
import { HoldDialog } from "@/components/control/hold-dialog"
import { NoteDialog } from "@/components/control/note-dialog"
import { ShadeCheckDialog } from "@/components/control/shade-check-dialog"
import { callSupervisor, confirmLoad, confirmUnload, extendHold, releaseHold } from "@/components/plant/operator-actions"
import { Button } from "@/components/ui/button"
import { REASONS } from "@/lib/domain/catalog"
import type { MachineView } from "@/lib/domain/types"

/** Minutes added by one tap on "Extend hold". */
const EXTEND_MIN = 15

/** Every command that fits the machine's current state, largest first. Commands change tracking, never the PLC. */
export function MachineCommands({ view }: { view: MachineView }) {
  const id = view.machine.id
  const running = view.state.phase === "running"
  const hold = view.state.run?.hold

  return (
    <div className="flex flex-col gap-2">
      {hold && (
        <>
          <Button onClick={() => releaseHold(id)} className="h-11 justify-start">
            <Play />
            Release hold · {REASONS[hold.reason].label}
          </Button>
          <Button variant="outline" onClick={() => extendHold(id, EXTEND_MIN)} className="h-11 justify-start">
            <TimerReset />
            Extend hold by {EXTEND_MIN} min
          </Button>
        </>
      )}
      {running && !hold && <HoldDialog view={view} />}
      {running && <ShadeCheckDialog view={view} />}
      {view.state.phase === "complete" && (
        <Button onClick={() => confirmUnload(id)} className="h-11 justify-start">
          <PackageCheck />
          Confirm unload of {view.batch?.id}
        </Button>
      )}
      {view.state.phase === "ready" && (
        <Button onClick={() => confirmLoad(id)} className="h-11 justify-start">
          <PackageOpen />
          Confirm {view.state.next?.batchId} loaded
        </Button>
      )}
      <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
        <NoteDialog machineId={id} />
        <Button variant="outline" onClick={() => callSupervisor(id)} className="h-11 justify-start">
          <BellRing />
          Call supervisor
        </Button>
      </div>
      <p className="mt-2 flex gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
        <ShieldAlert className="size-4 shrink-0 text-held" aria-hidden />
        Pilot mode is read-only toward the PLC. Commands update tracking and notify staff; no setpoints are written to the controller.
      </p>
    </div>
  )
}
