"use client"

import { ArrowUpRight, PackageCheck, PackageOpen, Play } from "lucide-react"
import Link from "next/link"
import { confirmLoad, confirmUnload, releaseHold } from "@/components/plant/operator-actions"
import { Button } from "@/components/ui/button"
import type { NextAction } from "@/lib/domain/actions"

const COMMANDS = {
  release: { label: "Release hold", icon: Play, run: releaseHold },
  unload: { label: "Confirm unload", icon: PackageCheck, run: confirmUnload },
  load: { label: "Confirm load", icon: PackageOpen, run: confirmLoad },
} as const

/** The one-tap command for a queued action, or a link to the machine when the fix needs a person at it. */
export function ActionButton({ action, size = "sm" }: { action: NextAction; size?: "sm" | "default" | "lg" }) {
  if (action.command && action.command !== "inspect") {
    const command = COMMANDS[action.command]
    return (
      <Button size={size} onClick={() => command.run(action.machineId)} className="shrink-0">
        <command.icon />
        {command.label}
      </Button>
    )
  }
  return (
    <Button size={size} variant="outline" asChild className="shrink-0">
      <Link href={`/control/${action.machineId}`}>
        Open {action.machineId}
        <ArrowUpRight />
      </Link>
    </Button>
  )
}
