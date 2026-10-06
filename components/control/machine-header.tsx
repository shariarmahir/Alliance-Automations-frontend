import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { StatusBadge } from "@/components/plant/status"
import { Button } from "@/components/ui/button"
import type { MachineView } from "@/lib/domain/types"
import { formatInt } from "@/lib/format"

export function MachineHeader({ view }: { view: MachineView }) {
  const { machine } = view
  return (
    <>
      <Button variant="ghost" size="icon" asChild>
        <Link href="/control" aria-label="Back to control panel">
          <ArrowLeft />
        </Link>
      </Button>
      <div className="mr-auto min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-sm text-muted-foreground">{machine.id}</span>
          <h2 className="text-2xl font-semibold tracking-tight">{machine.name}</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Bay {machine.bay} · {machine.type} · {formatInt(machine.capacityKg)} kg · {machine.link}
        </p>
      </div>
      <StatusBadge status={view.status} className="h-7 px-3 text-sm" />
    </>
  )
}
