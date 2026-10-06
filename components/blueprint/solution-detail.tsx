import { GlowCard } from "@/components/glow-card"
import { LAYER_ICONS } from "@/components/landing/icons/layers"
import { ROLES } from "@/lib/blueprint/content"

const STEPS = [
  {
    icon: LAYER_ICONS.Machines,
    title: "Sense",
    body: "Sensors and your own controllers report every vat's temperature, level, flow and state, second by second.",
  },
  {
    icon: LAYER_ICONS.Platform,
    title: "Decide",
    body: "A rules engine projects each batch's end time, spots a delay early and says why, in words a supervisor can check.",
  },
  {
    icon: LAYER_ICONS.Screens,
    title: "Act",
    body: "The right screen shows the right person what to do next, and one tap holds, releases or reorders a batch.",
  },
]

export function SolutionDetail() {
  return (
    <div className="flex flex-col gap-8">
      <ol className="grid gap-4 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <GlowCard asChild lift index={index} key={step.title}>
            <li className="flex flex-col items-center gap-3 p-6 text-center">
              <span className="grid size-16 place-items-center rounded-2xl bg-brand/10 text-brand">
                <step.icon />
              </span>
              <p className="text-lg font-medium">{step.title}</p>
              <p className="text-sm text-brand text-pretty">{step.body}</p>
            </li>
          </GlowCard>
        ))}
      </ol>

      <div>
        <h3 className="mb-4 font-medium">One live source, a screen for every role</h3>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((item, index) => (
            <GlowCard asChild lift index={index + 3} key={item.role}>
              <li className="flex flex-col gap-2 p-5">
                <p className="font-medium">{item.role}</p>
                <p className="text-sm text-brand">{item.gets}</p>
              </li>
            </GlowCard>
          ))}
        </ul>
      </div>
    </div>
  )
}
