"use client"

import { useEffect, useRef, useState, type RefObject } from "react"
import { ActionQueue } from "@/components/control/action-queue"
import { useControlPrefs } from "@/components/control/control-prefs"
import { matchesQuery, sortViews } from "@/components/control/control-sort"
import { ControlSummary } from "@/components/control/control-summary"
import { ControlToolbar } from "@/components/control/control-toolbar"
import { MachineList } from "@/components/control/machine-list"
import { MachineTile } from "@/components/control/machine-tile"
import { PlantGate } from "@/components/plant/plant-gate"
import { STATUS_ORDER } from "@/components/plant/status"
import { Reveal } from "@/components/reveal"
import { actionQueue, nextAction, type NextAction } from "@/lib/domain/actions"
import type { MachineStatus } from "@/lib/domain/types"
import { usePlant, useSnapshot } from "@/lib/store/plant"

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))

/** `/` searches, `E` toggles efficiency mode, `V` switches tiles and list. Ignored while typing or inside a dialog. */
function useShortcuts(search: RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || typing(event.target) || document.querySelector("[role=dialog]")) return
      const prefs = useControlPrefs.getState()
      if (event.key === "/") {
        event.preventDefault()
        search.current?.focus()
      } else if (event.key.toLowerCase() === "e") {
        prefs.setFocus(!prefs.focus)
      } else if (event.key.toLowerCase() === "v") {
        prefs.setLayout(prefs.layout === "grid" ? "list" : "grid")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [search])
}

function Control() {
  const views = usePlant((state) => state.views)
  const now = useSnapshot((snapshot) => snapshot.now)
  const { layout, sort, focus, status, bay } = useControlPrefs()
  const [query, setQuery] = useState("")
  const search = useRef<HTMLInputElement>(null)
  useShortcuts(search)

  const needle = query.trim().toLowerCase()
  const scoped = views.filter((view) => (bay === null || view.machine.bay === bay) && (!needle || matchesQuery(view, needle)))
  const visible = sortViews(
    scoped.filter((view) => status === "all" || view.status === status),
    sort,
    now,
  )

  const counts = Object.fromEntries([["all", scoped.length], ...STATUS_ORDER.map((s) => [s, scoped.filter((v) => v.status === s).length])]) as Record<
    MachineStatus | "all",
    number
  >
  const actions = new Map<string, NextAction>()
  for (const view of views) {
    const action = nextAction(view, now)
    if (action) actions.set(view.machine.id, action)
  }
  const queue = actionQueue(scoped, now, true)
  const urgent = queue.filter((item) => item.urgency !== "info")

  return (
    <div className="flex flex-col gap-5">
      <Reveal>
        <ControlSummary views={views} actions={actionQueue(views, now)} />
      </Reveal>
      <Reveal order={1}>
        <ControlToolbar counts={counts} query={query} onQuery={setQuery} searchRef={search} />
      </Reveal>

      {focus ? (
        <ActionQueue actions={urgent} upcoming={queue.filter((item) => item.urgency === "info")} views={views} />
      ) : layout === "list" ? (
        <MachineList views={visible} actions={actions} />
      ) : (
        <div className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 min-[1800px]:grid-cols-5">
          {visible.map((view, index) => (
            <MachineTile key={view.machine.id} view={view} action={actions.get(view.machine.id) ?? null} index={index} />
          ))}
        </div>
      )}
      {!focus && !visible.length && <p className="py-16 text-center text-sm text-muted-foreground">No machines match these filters.</p>}
    </div>
  )
}

export function ControlView() {
  return (
    <PlantGate>
      <Control />
    </PlantGate>
  )
}
