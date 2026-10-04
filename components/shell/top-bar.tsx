"use client"

import { Bell, Check, FastForward, Moon, Sun } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { CommandMenu } from "@/components/shell/command-menu"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { REASONS } from "@/lib/domain/catalog"
import { formatClockSeconds, formatHm, formatLongDate } from "@/lib/format"
import { NAV_ITEMS } from "@/lib/navigation"
import { SIM_SPEEDS, usePlant, type SimSpeed } from "@/lib/store/plant"
import { cn } from "@/lib/utils"

function PlantClock() {
  const now = usePlant((state) => state.snapshot?.now)
  if (!now) return <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
  return (
    <div className="hidden text-right leading-tight sm:block">
      <div className="font-mono text-sm font-semibold tabular">{formatClockSeconds(now)}</div>
      <div className="text-[11px] text-muted-foreground">{formatLongDate(now)}</div>
    </div>
  )
}

function SpeedControl() {
  const speed = usePlant((state) => state.speed)
  const setSpeed = usePlant((state) => state.setSpeed)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="hidden items-center gap-1.5 lg:flex">
          <FastForward className="size-3.5 text-muted-foreground" aria-hidden />
          <ToggleGroup
            type="single"
            size="sm"
            variant="outline"
            value={String(speed)}
            onValueChange={(value) => value && setSpeed(Number(value) as SimSpeed)}
            aria-label="Simulation speed"
          >
            {SIM_SPEEDS.map((option) => (
              <ToggleGroupItem key={option} value={String(option)} className="px-2 font-mono text-xs">
                {option}×
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </TooltipTrigger>
      <TooltipContent>Demo feed speed. Real deployments stream at 1×.</TooltipContent>
    </Tooltip>
  )
}

function AlertsMenu() {
  const alerts = usePlant((state) => state.alerts)
  const acknowledge = usePlant((state) => state.acknowledge)
  const open = alerts.filter((alert) => !alert.acknowledged).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`${open} open alerts`}>
          <Bell />
          {open > 0 && (
            <span className="absolute -top-0.5 -right-0.5 grid min-w-4 place-items-center rounded-full bg-delayed px-1 text-[10px] font-semibold text-white tabular">
              {open}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm font-medium">Alerts</p>
          <span className="text-xs text-muted-foreground">{open} open</span>
        </div>
        <Separator />
        <ScrollArea className="max-h-96">
          {alerts.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">All machines on standard.</p>}
          {alerts.map((alert) => (
            <div key={alert.id} className={cn("flex items-start gap-3 px-4 py-3", alert.acknowledged && "opacity-55")}>
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", alert.severity === "critical" ? "bg-delayed" : "bg-held")} />
              <div className="min-w-0 flex-1 text-sm">
                <Link href={`/control/${alert.machineId}`} className="font-medium hover:underline">
                  {alert.machineId} · {alert.cause === "overrun" ? "Cycle overrun" : REASONS[alert.cause].label}
                </Link>
                <p className="text-xs text-muted-foreground tabular">
                  {alert.batchId} · projected +{formatHm(alert.excessMin)} ·{" "}
                  {alert.severity === "critical" ? "Manager" : "Supervisor"}
                </p>
              </div>
              {!alert.acknowledged && (
                <Button size="xs" variant="outline" onClick={() => acknowledge(alert.id)}>
                  <Check />
                  Ack
                </Button>
              )}
            </div>
          ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </Button>
  )
}

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
