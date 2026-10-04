"use client"

import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { StatusDot } from "@/components/plant/status"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Kbd } from "@/components/ui/kbd"
import { NAV_ITEMS } from "@/lib/navigation"
import { usePlant } from "@/lib/store/plant"

export function CommandMenu() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const views = usePlant((state) => state.views)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const go = (href: string, external?: boolean) => {
    setOpen(false)
    if (external) window.open(href, "_blank")
    else router.push(href)
  }

  return (
    <>
      <Button
        variant="outline"
        className="hidden h-8 w-56 justify-start gap-2 text-muted-foreground md:flex"
        onClick={() => setOpen(true)}
      >
        <Search />
        <span className="flex-1 text-left">Find machine or page</span>
        <Kbd>Ctrl K</Kbd>
      </Button>
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)} aria-label="Search">
        <Search />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Search" description="Jump to a machine, batch or screen">
        <CommandInput placeholder="Type a machine name, ID or batch…" />
        <CommandList>
          <CommandEmpty>Nothing matches.</CommandEmpty>
          <CommandGroup heading="Screens">
            {NAV_ITEMS.map((item) => (
              <CommandItem key={item.href} value={`${item.title} ${item.description}`} onSelect={() => go(item.href, item.external)}>
                <item.icon />
                {item.title}
                <span className="ml-auto truncate text-xs text-muted-foreground">{item.description}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Machines">
            {views.map((view) => (
              <CommandItem
                key={view.machine.id}
                value={`${view.machine.id} ${view.machine.name} ${view.batch?.id ?? ""} ${view.buyer?.name ?? ""}`}
                onSelect={() => go(`/control/${view.machine.id}`)}
              >
                <StatusDot status={view.status} />
                <span className="font-mono text-xs text-muted-foreground">{view.machine.id}</span>
                {view.machine.name}
                <span className="ml-auto text-xs text-muted-foreground">{view.batch?.id ?? view.remark}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
