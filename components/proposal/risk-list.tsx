import { ShieldAlert } from "lucide-react"
import { GlowCard } from "@/components/glow-card"
import { RISK_ICONS } from "@/components/landing/icons/risks"
import { RISKS } from "@/lib/proposal/phases"

export function RiskList() {
  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {RISKS.map((item, index) => {
        const Icon = RISK_ICONS[index] ?? ShieldAlert
        return (
          <GlowCard asChild lift index={index} key={item.risk}>
            <li className="flex flex-col items-center gap-2 p-5 text-center text-sm">
              <Icon className="size-7 text-held" aria-hidden />
              <p className="font-medium">{item.risk}</p>
              <p className="text-sm text-brand">{item.mitigation}</p>
            </li>
          </GlowCard>
        )
      })}
    </ul>
  )
}
