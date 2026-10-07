"use client"

import { StatusDot } from "@/components/plant/status"
import { CommandGroup, CommandItem } from "@/components/ui/command"
import { usePlantDerived } from "@/lib/store/plant"

/**
 * The machine results of the command menu. It mounts only while the menu is open, so the closed menu in the top bar
 * does not re-render fifty entries on every plant tick.
 */
export function CommandMachines({ onSelect }: { onSelect: (machineId: string) => void }) {
  const machines = usePlantDerived(({ views }) =>
    views.map((view) => ({
      id: view.machine.id,
      name: view.machine.name,
      status: view.status,
      batch: view.batch?.id ?? "",
      buyer: view.buyer?.name ?? "",
      remark: view.remark,
    })),
  )

  return (
    <CommandGroup heading="Machines">
      {machines.map((machine) => (
        <CommandItem key={machine.id} value={`${machine.id} ${machine.name} ${machine.batch} ${machine.buyer}`} onSelect={() => onSelect(machine.id)}>
          <StatusDot status={machine.status} />
          <span className="font-mono text-xs text-muted-foreground">{machine.id}</span>
          {machine.name}
          <span className="ml-auto text-xs text-muted-foreground">{machine.batch || machine.remark}</span>
        </CommandItem>
      ))}
    </CommandGroup>
  )
}
