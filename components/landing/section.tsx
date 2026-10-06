import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"
import { GlowCard } from "@/components/glow-card"

interface SectionProps {
  id: string
  title: string
  description?: string
  /** Adds a "View details" button that opens the matching part of the blueprint page. */
  detailsHref?: string
  children: ReactNode
}

/** A proposal section: anchor target, heading block, then its content. */
export function Section({ id, title, description, detailsHref, children }: SectionProps) {
  return (
    <section id={id} className="flex scroll-mt-28 flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">{title}</h2>
          {description && <p className="mt-3 text-lg font-medium text-brand text-pretty">{description}</p>}
        </div>
        {detailsHref && (
          <GlowCard asChild lift>
            <Link
              href={detailsHref}
              className="group inline-flex h-11 items-center gap-2.5 px-5 text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              View details
              <ArrowUpRight
                className="size-4 text-brand transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </GlowCard>
        )}
      </div>
      {children}
    </section>
  )
}
