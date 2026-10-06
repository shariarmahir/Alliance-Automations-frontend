import { GlowCard } from "@/components/glow-card"
import { LAYER_ICONS } from "@/components/landing/icons/layers"

const LAYERS = [
  { name: "Machines", detail: "PLC and dyeing controllers, PT100, level, flow and energy meters, QR batch cards" },
  { name: "Edge", detail: "Industrial gateway over Modbus and OPC UA, buffered offline, MQTT on wired LAN" },
  { name: "Platform", detail: "Ingestion, PostgreSQL + TimescaleDB, rules engine, AI agents, REST and WebSocket" },
  { name: "Screens", detail: "Control room, TV wallboards, operator tablets, CRM and ERP sync, mobile alerts" },
] as const

export function ArchitectureLayers() {
  return (
    <ol className="grid gap-4 md:grid-cols-4">
      {LAYERS.map((layer, index) => {
        const Icon = LAYER_ICONS[layer.name]
        return (
          <GlowCard asChild lift index={index} key={layer.name}>
            <li className="flex flex-col items-center gap-3 p-6 text-center">
              <span className="grid size-16 place-items-center rounded-2xl bg-brand/10 text-brand">
                <Icon />
              </span>
              <p className="font-medium">{layer.name}</p>
              <p className="text-sm text-brand text-pretty">{layer.detail}</p>
            </li>
          </GlowCard>
        )
      })}
    </ol>
  )
}
