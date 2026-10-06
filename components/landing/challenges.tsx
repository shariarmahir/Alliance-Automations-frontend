import { GlowCard } from "@/components/glow-card"
import { ClockIcon, DropletsIcon, HourglassIcon, PaletteIcon } from "@/components/landing/icons/challenges"

const CHALLENGES = [
  {
    icon: ClockIcon,
    problem: "Delays surface after the fact",
    answer: "Projected end times flag a late batch while there is still time to act, and escalate if it keeps slipping.",
  },
  {
    icon: PaletteIcon,
    problem: "Shade corrections eat capacity",
    answer: "Every re-dye costs a machine slot, dye, water and steam. ΔE checks and reason codes show exactly where right-first-time slips.",
  },
  {
    icon: HourglassIcon,
    problem: "Machines wait for batches",
    answer: "Next-batch readiness is tracked per machine, so idle gaps between batches become visible and fixable.",
  },
  {
    icon: DropletsIcon,
    problem: "Energy and water per kilo are guesses",
    answer: "Steam, power and water are metered per batch, turning intensity into a number the team can bring down.",
  },
]

export function Challenges() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CHALLENGES.map(({ icon: Icon, problem, answer }, index) => (
        <GlowCard asChild lift index={index} key={problem}>
          <li className="flex flex-col items-center gap-4 p-6 text-center">
            <span className="grid size-10 place-items-center rounded-lg bg-brand/15 text-brand">
              <Icon className="size-7" />
            </span>
            <h3 className="font-medium text-balance">{problem}</h3>
            <p className="text-sm text-brand text-pretty">{answer}</p>
          </li>
        </GlowCard>
      ))}
    </ul>
  )
}
