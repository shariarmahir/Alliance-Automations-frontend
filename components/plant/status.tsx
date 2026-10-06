import {
  CircleCheckBig,
  CirclePause,
  CircleSlash,
  Clock,
  type LucideIcon,
  Moon,
  PackageCheck,
  Play,
  Siren,
} from "lucide-react"
import type { MachineStatus } from "@/lib/domain/types"
import { cn } from "@/lib/utils"

interface StatusMeta {
  label: string
  icon: LucideIcon
  text: string
  soft: string
  solid: string
  ring: string
}

/** Status colors are reserved for machine state and always ship with an icon and a label. */
export const STATUS_META: Record<MachineStatus, StatusMeta> = {
  running: { label: "Running", icon: Play, text: "text-running", soft: "bg-running/12", solid: "bg-running", ring: "ring-running/30" },
  delayed: { label: "Delayed", icon: Siren, text: "text-delayed", soft: "bg-delayed/12", solid: "bg-delayed", ring: "ring-delayed/35" },
  held: { label: "On hold", icon: CirclePause, text: "text-held", soft: "bg-held/12", solid: "bg-held", ring: "ring-held/35" },
  ready: { label: "Batch ready", icon: PackageCheck, text: "text-ready", soft: "bg-ready/12", solid: "bg-ready", ring: "ring-ready/30" },
  complete: { label: "Complete", icon: CircleCheckBig, text: "text-complete", soft: "bg-complete/12", solid: "bg-complete", ring: "ring-complete/30" },
  idle: { label: "Idle", icon: Moon, text: "text-idle", soft: "bg-idle/12", solid: "bg-idle", ring: "ring-idle/25" },
  offline: { label: "Not available", icon: CircleSlash, text: "text-offline", soft: "bg-offline/15", solid: "bg-offline", ring: "ring-offline/30" },
}

export const STATUS_ORDER: MachineStatus[] = ["running", "delayed", "held", "ready", "complete", "idle", "offline"]

export function StatusBadge({ status, className }: { status: MachineStatus; className?: string }) {
  const meta = STATUS_META[status]
  const Icon = meta.icon
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        meta.soft,
        meta.text,
        meta.ring,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {meta.label}
    </span>
  )
}

/** A dot that pulses while the machine is actively processing. */
export function StatusDot({ status, className }: { status: MachineStatus; className?: string }) {
  const meta = STATUS_META[status]
  const live = status === "running" || status === "delayed" || status === "held"
  return (
    <span className={cn("relative inline-flex size-2.5 shrink-0", className)} aria-label={meta.label} role="img">
      {live && <span className={cn("absolute inset-0 rounded-full animate-pulse-ring", meta.solid)} />}
      <span className={cn("relative size-2.5 rounded-full", meta.solid)} />
    </span>
  )
}

/** Preparation state of the batch a row shows. "loaded" means it is already in the machine. */
export function PrepBadge({ prep }: { prep: "ready" | "preparing" | "loaded" | null }) {
  if (!prep) return <span className="text-xs text-muted-foreground">Not planned</span>
  if (prep === "loaded") return <span className="text-xs text-muted-foreground">In machine</span>
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", prep === "ready" ? "text-running" : "text-held")}>
      {prep === "ready" ? <PackageCheck className="size-3.5" aria-hidden /> : <Clock className="size-3.5" aria-hidden />}
      {prep === "ready" ? "Ready" : "Preparing"}
    </span>
  )
}
