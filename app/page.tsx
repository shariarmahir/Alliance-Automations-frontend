import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { ArchitectureLayers } from "@/components/landing/architecture-layers"
import { Hero } from "@/components/landing/hero"
import { LiveCounters } from "@/components/landing/live-counters"
import { ScreenGrid } from "@/components/landing/screen-grid"
import { SiteFooter } from "@/components/landing/site-footer"
import { Reveal } from "@/components/reveal"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-ambient">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-8 md:px-6 md:py-12">
        <header className="flex items-center justify-between">
          <Logo />
          <Button asChild variant="outline">
            <Link href="/dashboard">
              Open console <ArrowRight />
            </Link>
          </Button>
        </header>
        <Reveal>
          <Hero />
        </Reveal>
        <Reveal order={1}>
          <LiveCounters />
          <p className="mt-2 text-xs text-muted-foreground">Live demo on a simulated feed of a 50-machine garment dyeing floor.</p>
        </Reveal>
        <Reveal order={2}>
          <ScreenGrid />
        </Reveal>
        <Reveal order={3}>
          <ArchitectureLayers />
        </Reveal>
        <SiteFooter />
      </div>
    </div>
  )
}
