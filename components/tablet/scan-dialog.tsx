"use client"

import { QrCode, ScanLine } from "lucide-react"
import { motion } from "motion/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { MachineView } from "@/lib/domain/types"

export function ScanDialog({ view, open, onOpenChange }: { view: MachineView; open: boolean; onOpenChange: (open: boolean) => void }) {
  const expected = view.state.next?.batchId ?? view.batch?.id
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan batch card</DialogTitle>
          <DialogDescription>Hold the QR code on the batch card inside the frame.</DialogDescription>
        </DialogHeader>
        <div className="relative grid aspect-square place-items-center overflow-hidden rounded-xl bg-muted">
          <QrCode className="size-24 text-muted-foreground/40" aria-hidden />
          <motion.span
            className="absolute inset-x-8 h-0.5 bg-primary shadow-[0_0_12px_var(--primary)]"
            animate={{ top: ["15%", "85%", "15%"] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <Button
          className="h-12"
          disabled={!expected}
          onClick={() => {
            onOpenChange(false)
            toast.success(`${expected} matches ${view.machine.id}`, { description: "Batch, recipe and machine verified" })
          }}
        >
          <ScanLine />
          Simulate scan of {expected ?? "batch"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
