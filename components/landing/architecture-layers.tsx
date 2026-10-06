const LAYERS = [
  { name: "Machines", detail: "PLC and dyeing controllers, PT100, level, flow and energy meters, QR batch cards" },
  { name: "Edge", detail: "Industrial gateway over Modbus and OPC UA, buffered offline, MQTT on wired LAN" },
  { name: "Platform", detail: "Ingestion, PostgreSQL + TimescaleDB, rules engine, AI agents, REST and WebSocket" },
  { name: "Screens", detail: "Control room, TV wallboards, operator tablets, CRM and ERP sync, mobile alerts" },
]

export function ArchitectureLayers() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">How it is built</h2>
      <ol className="grid gap-3 md:grid-cols-4">
        {LAYERS.map((layer, index) => (
          <li key={layer.name} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <span className="font-mono text-xs text-primary">0{index + 1}</span>
            <p className="mt-1 font-medium">{layer.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{layer.detail}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
