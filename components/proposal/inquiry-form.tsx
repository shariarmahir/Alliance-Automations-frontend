"use client"

import { Copy, Mail, MessageCircle, Pencil, Send } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { GlowCard } from "@/components/glow-card"
import { PlanSummary } from "@/components/proposal/plan-summary"
import { TextField } from "@/components/proposal/text-field"
import type { Timeline } from "@/components/proposal/use-timeline"
import { Button } from "@/components/ui/button"
import { emailLink, whatsappLink } from "@/lib/proposal/contact"
import { formatInquiry, validateInquiry, type InquiryErrors, type InquiryField } from "@/lib/proposal/inquiry"

type Step = "details" | "channel"

const EMPTY: Record<InquiryField, string> = { name: "", company: "", email: "", phone: "", machines: "", controllers: "", erp: "", message: "" }
const EASE = [0.22, 1, 0.36, 1] as const

interface ChannelChoiceProps {
  company: string
  brief: string
  onEdit: () => void
}

/** Replaces the submit button once the details are valid: send the brief by email or WhatsApp. */
function ChannelChoice({ company, brief, onEdit }: ChannelChoiceProps) {
  return (
    <motion.div
      key="channel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="flex flex-col gap-3"
    >
      <p className="text-sm font-medium">How would you like to reach us? Your brief is filled in for you.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button asChild size="lg" className="h-12 text-base">
          <a href={emailLink(`Alliance Automations proposal · ${company}`, brief)}>
            <Mail />
            Email
          </a>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-12 text-base">
          <a href={whatsappLink(brief)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="text-[#25d366]" />
            WhatsApp
          </a>
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={async () => {
            await navigator.clipboard.writeText(brief)
            toast.success("Brief copied")
          }}
        >
          <Copy />
          Copy brief
        </Button>
        <Button type="button" variant="ghost" onClick={onEdit}>
          <Pencil />
          Edit details
        </Button>
      </div>
    </motion.div>
  )
}

export function InquiryForm({ timeline }: { timeline: Timeline }) {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState<InquiryErrors>({})
  const [step, setStep] = useState<Step>("details")
  const [brief, setBrief] = useState("")

  const field = (id: InquiryField) => ({
    id,
    value: values[id],
    error: errors[id],
    onChange: (value: string) => {
      setValues((current) => ({ ...current, [id]: value }))
      setStep("details")
    },
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = validateInquiry({ ...values, timeline: timeline.summary })

    if (!result.ok) {
      setErrors(result.errors)
      const first = Object.keys(result.errors).find((key) => key in EMPTY)
      if (first) document.getElementById(first)?.focus()
      return
    }

    setErrors({})
    setBrief(formatInquiry(result.value))
    setStep("channel")
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_380px]">
      <GlowCard asChild>
        <form onSubmit={submit} noValidate className="grid gap-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField {...field("name")} label="Your name" required autoComplete="name" />
            <TextField {...field("company")} label="Company" required autoComplete="organization" />
            <TextField {...field("email")} label="Work email" required type="email" inputMode="email" autoComplete="email" />
            <TextField {...field("phone")} label="Phone or WhatsApp" type="tel" inputMode="tel" autoComplete="tel" />
            <TextField {...field("machines")} label="Dyeing machines on your floor" inputMode="numeric" placeholder="e.g. 50" />
            <TextField {...field("erp")} label="ERP or other systems" placeholder="e.g. SAP, in-house, Excel" />
          </div>
          <TextField {...field("controllers")} label="Machine brands and controllers" placeholder="e.g. Thies, Fong's, Then, or not sure" />
          <TextField {...field("message")} label="Anything we should know" multiline placeholder="Goals, constraints, peak seasons, buyers you serve" />
          {errors.timeline && (
            <p className="text-sm text-delayed" role="alert">
              {errors.timeline}
            </p>
          )}
          <AnimatePresence mode="wait" initial={false}>
            {step === "details" ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="flex flex-wrap items-center gap-3"
              >
                <Button type="submit" size="lg" className="h-11 px-5 text-base">
                  <Send />
                  Start the conversation
                </Button>
                <p className="text-xs text-muted-foreground">Next, pick email or WhatsApp. Nothing is sent until you do.</p>
              </motion.div>
            ) : (
              <ChannelChoice company={values.company} brief={brief} onEdit={() => setStep("details")} />
            )}
          </AnimatePresence>
        </form>
      </GlowCard>
      <PlanSummary timeline={timeline} />
    </div>
  )
}
