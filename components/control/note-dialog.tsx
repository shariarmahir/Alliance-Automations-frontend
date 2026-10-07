"use client"

import { NotebookPen } from "lucide-react"
import { useState } from "react"
import { addNote } from "@/components/plant/operator-actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

/** Things operators report on a dyeing floor often enough to deserve one tap. */
export const QUICK_NOTES = ["Fabric tangled", "Foam in the bath", "Leak at the door seal", "Pump noise", "Dye lot changed", "Lint filter cleaned"]

const MAX_NOTE = 160

/** A note in the machine's event log, typed or picked from the common ones. */
export function NoteDialog({ machineId, label = "Add note" }: { machineId: string; label?: string }) {
  const [text, setText] = useState("")
  const note = text.trim()

  return (
    <Dialog onOpenChange={(open) => !open && setText("")}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11 justify-start">
          <NotebookPen />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Note for {machineId}</DialogTitle>
          <DialogDescription>Written to the machine log with the time, so the next shift and maintenance can see it.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          {QUICK_NOTES.map((quick) => (
            <Button key={quick} type="button" variant={text === quick ? "default" : "outline"} size="sm" onClick={() => setText(quick)}>
              {quick}
            </Button>
          ))}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="machine-note">Note</Label>
          <Textarea id="machine-note" value={text} maxLength={MAX_NOTE} onChange={(event) => setText(event.target.value)} placeholder="What did you see at the machine?" rows={3} />
          <p className="text-right text-xs text-muted-foreground tabular">
            {text.length}/{MAX_NOTE}
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button disabled={!note} onClick={() => addNote(machineId, note)}>
              Save note
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
