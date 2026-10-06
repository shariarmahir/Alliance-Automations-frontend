"use client"

import { Copy, Mail, MessageCircle, Pencil, Send } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { emailLink, whatsappLink } from "@/lib/proposal/contact"

const EASE = [0.22, 1, 0.36, 1] as const

interface ContactChoiceProps {
  /** Text of the single call-to-action button. */
  label: string
  subject: string
  /** The message both channels open with. */
  brief: string
  /** Return false to keep the choices closed, for example while required fields are empty. */
  canOpen?: () => boolean
}

/**
 * One call to action. Pressing it swaps the button for Email and WhatsApp, each opening a message with the brief
 * filled in. The address and number are never shown, only used in the link.
 */
export function ContactChoice({ label, subject, brief, canOpen }: ContactChoiceProps) {
  const [open, setOpen] = useState(false)

  return (
    <AnimatePresence mode="wait" initial={false}>
      {open ? (
        <motion.div
          key="choices"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="flex flex-col gap-3"
        >
          <p className="text-sm font-medium">How would you like to reach us? Your message is filled in for you.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild size="lg" className="h-12 text-base">
              <a href={emailLink(subject, brief)}>
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
                toast.success("Message copied")
              }}
            >
              <Copy />
              Copy message
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              <Pencil />
              Back
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="cta"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <Button
            type="button"
            size="lg"
            className="h-12 px-6 text-base"
            onClick={() => {
              if (canOpen?.() !== false) setOpen(true)
            }}
          >
            <Send />
            {label}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
