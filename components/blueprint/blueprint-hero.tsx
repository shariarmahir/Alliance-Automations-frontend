import { ArrowDown, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { HeroTitle } from "@/components/landing/hero-title"
import { ProcessScene } from "@/components/landing/process-scene"
import { Reveal } from "@/components/reveal"
import { Button } from "@/components/ui/button"

const TITLE = [{ text: "The full build," }, { text: "explained step by step." }]

/** Same two-column hero as the proposal page, pointing at the blueprint's own sections. */
export function BlueprintHero() {
  return (
    <div className="grid items-center gap-12 py-10 md:py-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12 lg:pt-20 lg:pb-12">
      <div className="flex flex-col gap-7">
        <HeroTitle lines={TITLE} />
        <Reveal order={6}>
          <p className="max-w-md text-base/7 font-medium text-brand text-pretty md:text-lg/8">
            See the problem we solve, two ways to build the solution, why each technology earns its place, and draw the structure you want.
          </p>
        </Reveal>
        <Reveal order={7} className="flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-11 px-5 text-base">
            <a href="#build">
              Design your build <ArrowDown />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-11 px-5 text-base">
            <Link href="/">
              <ArrowLeft /> Back to proposal
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
