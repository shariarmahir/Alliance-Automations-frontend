"use client"

import { usePathname } from "next/navigation"
import { AlertsMenu } from "@/components/shell/alerts-menu"
import { CommandMenu } from "@/components/shell/command-menu"
import { PlantClock } from "@/components/shell/plant-clock"
import { SpeedControl } from "@/components/shell/speed-control"
import { ThemeToggle } from "@/components/shell/theme-toggle"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NAV_ITEMS } from "@/lib/navigation"

export function TopBar() {
  const pathname = usePathname()
  const current = NAV_ITEMS.find((item) => pathname.startsWith(item.href))

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5!" />
      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold">{current?.title ?? "Alliance Automations"}</h1>
      </div>
      <span className="hidden rounded-full border border-dashed px-2 py-0.5 text-[11px] text-muted-foreground xl:inline">
        Simulated feed
      </span>
      <div className="ml-auto flex items-center gap-2">
        <CommandMenu />
        <SpeedControl />
        <PlantClock />
        <AlertsMenu />
        <ThemeToggle />
      </div>
    </header>
  )
}
