"use client"

import { useState } from "react"
import { ChipGroup } from "@/components/blueprint/chip-group"
import { ContactChoice } from "@/components/blueprint/contact-choice"
import { StackDiagram } from "@/components/blueprint/stack-diagram"
import { GlowCard } from "@/components/glow-card"
import { LAYER_ICONS } from "@/components/landing/icons/layers"
import { TextField } from "@/components/proposal/text-field"
import { Button } from "@/components/ui/button"
import { chosenCount, closestPackage, formatBuild, LAYER_META, layersFromBuild, OPTION_GROUPS, type PackageId } from "@/lib/blueprint/build"
import { useBuild } from "@/lib/blueprint/build-store"
import { cn } from "@/lib/utils"

const STARTERS: { id: PackageId | "blank"; label: string }[] = [
  { id: "moderate", label: "Start from Moderate" },
  { id: "advanced", label: "Start from Advanced" },
  { id: "blank", label: "Start blank" },
]

type ContactErrors = Partial<Record<"name" | "company", string>>

export function BuildDetail() {
  const selection = useBuild((state) => state.selection)
  const contact = useBuild((state) => state.contact)
  const { toggle, setMachines, applyPreset, setContact, reset } = useBuild.getState()
  const [errors, setErrors] = useState<ContactErrors>({})

  const layers = layersFromBuild(selection)
  const closest = closestPackage(selection)

  function validate() {
    const next: ContactErrors = {}
    if (!contact.name.trim()) next.name = "This field is required."
    if (!contact.company.trim()) next.company = "This field is required."
    setErrors(next)
    const first = Object.keys(next)[0]
    if (first) document.getElementById(`build-${first}`)?.focus()
    return !first
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Starting point">
        {STARTERS.map((starter) => (
          <Button key={starter.id} type="button" variant="outline" onClick={() => (starter.id === "blank" ? reset() : applyPreset(starter.id))}>
            {starter.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[7fr_5fr]">
        <div className="flex flex-col gap-6">
          {LAYER_META.map((layer, index) => {
            const Icon = LAYER_ICONS[layer.name as keyof typeof LAYER_ICONS]
            return (
              <GlowCard key={layer.id} index={index} className="flex flex-col gap-6 p-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                    <Icon className="size-9" />
                  </span>
                  <div>
                    <h3 className="font-medium">{layer.name}</h3>
                    <p className="text-sm text-brand">{layer.summary}</p>
                  </div>
                </div>

                {layer.id === "machines" && (
                  <div className="sm:max-w-xs">
                    <TextField
                      id="build-machines"
                      label="Dyeing machines on your floor"
                      inputMode="numeric"
                      placeholder="e.g. 50"
                      value={selection.machines}
                      onChange={setMachines}
                    />
                  </div>
                )}

                {OPTION_GROUPS.filter((group) => group.layer === layer.id).map((group) => (
                  <ChipGroup
                    key={group.id}
                    id={`group-${group.id}`}
                    label={group.label}
                    hint={group.hint}
                    options={group.options}
                    selected={selection[group.id]}
                    onToggle={(option) => toggle(group.id, option)}
                  />
                ))}
              </GlowCard>
            )
          })}
        </div>

        <GlowCard className="flex flex-col gap-4 p-5 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-medium">Your structure drawing</h3>
              <p className="text-sm text-brand">It redraws as you choose.</p>
            </div>
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap",
                closest ? "border-primary text-primary" : "border-input text-muted-foreground",
              )}
            >
              {closest ? `Closest to ${closest === "advanced" ? "Advanced" : "Moderate"}` : `${chosenCount(selection)} chosen`}
            </span>
          </div>
          <StackDiagram layers={layers} vertical />
        </GlowCard>
      </div>

      <GlowCard className="flex flex-col gap-5 p-6">
        <div>
          <h3 className="font-medium">Send us your build</h3>
          <p className="text-sm text-brand">We read it before we reply, so the first conversation starts from your drawing.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="build-name"
            label="Your name"
            required
            autoComplete="name"
            value={contact.name}
            error={errors.name}
            onChange={(name) => setContact({ name })}
          />
          <TextField
            id="build-company"
            label="Company"
            required
            autoComplete="organization"
            value={contact.company}
            error={errors.company}
            onChange={(company) => setContact({ company })}
          />
        </div>
        <TextField
          id="build-note"
          label="Anything we should know"
          multiline
          value={contact.note}
          onChange={(note) => setContact({ note })}
          placeholder="Goals, constraints, peak seasons"
        />
        <ContactChoice
          label="Send my build"
          subject={`Custom build · ${contact.company || "Alliance Automations"}`}
          brief={formatBuild(selection, contact)}
          canOpen={validate}
        />
      </GlowCard>
    </div>
  )
}
