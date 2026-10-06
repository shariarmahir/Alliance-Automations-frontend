"use client"

import { Check } from "lucide-react"
import { ContactChoice } from "@/components/blueprint/contact-choice"
import { GlowCard } from "@/components/glow-card"
import { chosenCount, formatBuild } from "@/lib/blueprint/build"
import { useBuild } from "@/lib/blueprint/build-store"
import { WHY_US } from "@/lib/blueprint/content"

const GENERAL_MESSAGE = "Hello, I read the Alliance Automations blueprint and would like to talk about my dyeing floor."

export function WhyUsDetail() {
  const selection = useBuild((state) => state.selection)
  const contact = useBuild((state) => state.contact)
  // Carries the client's drawing along if they made one, so the conversation starts from it.
  const brief = chosenCount(selection) ? `${GENERAL_MESSAGE}\n\n${formatBuild(selection, contact)}` : GENERAL_MESSAGE

  return (
    <div className="flex flex-col gap-8">
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {WHY_US.map((item, index) => (
          <GlowCard asChild lift index={index} key={item.title}>
            <li className="flex flex-col gap-2 p-6">
              <span className="grid size-9 place-items-center rounded-lg bg-brand/15 text-brand">
                <Check className="size-5" aria-hidden />
              </span>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-brand text-pretty">{item.body}</p>
            </li>
          </GlowCard>
        ))}
      </ul>

      <GlowCard className="flex flex-col items-start gap-5 p-8 md:p-10">
        <h3 className="max-w-2xl text-2xl font-semibold tracking-tight text-balance md:text-3xl">Ready to see your whole floor on one screen?</h3>
        <p className="max-w-xl text-brand text-pretty">Tell us about your floor. We reply with a pilot scope built around your timeline and your structure.</p>
        <ContactChoice label="Connect with us" subject="Alliance Automations enquiry" brief={brief} />
      </GlowCard>
    </div>
  )
}
