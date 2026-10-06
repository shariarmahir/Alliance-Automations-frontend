import { ArrowDown, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { HeroTitle } from "@/components/landing/hero-title"
import { PreparedFor } from "@/components/landing/prepared-for"
import { ProcessScene } from "@/components/landing/process-scene"
import { Reveal } from "@/components/reveal"
import { Button } from "@/components/ui/button"

const TITLE = [{ text: "Optimize dyeing efficiency" }, { text: "through automation." }]

/**
 * Copy on the left, the running dye line on the right, on the same container edges as the header and every
 * section below. Two columns in a 5 : 7 ratio keep the scene inside its column, so it never crosses the type
 * or leaves the page grid. On phones the scene runs beneath the copy.
 */
export function Hero() {
  return (
    <div className="grid items-center gap-12 py-10 md:py-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:pt-20 lg:pb-12">
      <div className="flex flex-col gap-7">
        <PreparedFor />
        <HeroTitle lines={TITLE} />
        <Reveal order={6}>
          <p className="max-w-md text-base/7 font-medium text-brand text-pretty md:text-lg/8">
            Alliance Automations links your machines, recipes and orders into one live system. It senses every vat, warns you before a batch runs late, and
            hands your team a plan instead of a problem.
          </p>
        </Reveal>
        <Reveal order={7} className="flex gap-2 sm:gap-3">
          <Button
            asChild
            size="lg"
            className="h-11 min-w-0 flex-1 px-3 text-sm max-sm:h-auto max-sm:min-h-11 max-sm:py-1.5 max-sm:leading-tight max-sm:whitespace-normal sm:flex-none sm:px-5 sm:text-base"
          >
            <a href="#timeline">
              Plan your timeline <ArrowDown className="max-sm:hidden" />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-11 min-w-0 flex-1 px-3 text-sm max-sm:h-auto max-sm:min-h-11 max-sm:py-1.5 max-sm:leading-tight max-sm:whitespace-normal sm:flex-none sm:px-5 sm:text-base"
          >
            <Link href="/dashboard">
              Explore the live demo <ArrowUpRight className="max-sm:hidden" />
            </Link>
          </Button>
        </Reveal>
      </div>

      <div aria-hidden>
        <ProcessScene />
      </div>
    </div>
  )
}
