import { Fact } from "@/components/control/fact"
import { Panel } from "@/components/panel"
import { PanelTitle } from "@/components/panel-title"
import { excessTone } from "@/components/plant/excess"
import { Batch } from "@/components/plant/icons/console-icons"
import { ShadeSwatch } from "@/components/plant/step-readout"
import { CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import type { MachineView } from "@/lib/domain/types"
import { formatClock, formatHm, formatInt } from "@/lib/format"

const time = (at: number | null) => (at ? formatClock(at) : "—")

export function BatchCard({ view }: { view: MachineView }) {
  const { batch, order, buyer } = view

  return (
    <Panel className="h-full">
      <CardHeader>
        <PanelTitle icon={Batch}>Batch</PanelTitle>
        <CardDescription>{batch ? `${batch.id} · ${buyer?.name}` : view.remark}</CardDescription>
      </CardHeader>
      {batch && order && (
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Fact label="Order">{order.id}</Fact>
            <Fact label="Garment">{order.garment}</Fact>
            <Fact label="Shade">
              <ShadeSwatch hex={order.shade.hex} name={`${order.shade.name} (${order.shade.code})`} />
            </Fact>
            <Fact label="Weight · GSM">
              {formatInt(batch.qtyKg)} kg · {order.gsm}
            </Fact>
            <Fact label="Start">{time(view.startedAt)}</Fact>
            <Fact label="Target unload">{time(view.targetEndAt)}</Fact>
            <Fact label="Projected">{time(view.projectedEndAt)}</Fact>
            <Fact label="Excess">
              <span className={excessTone(view.excessMin)}>{view.excessMin > 0 ? `+${formatHm(view.excessMin)}` : "On standard"}</span>
            </Fact>
            <Fact label="Running time">{formatHm(view.runningMin)}</Fact>
            <Fact label="Corrections">{view.state.run?.corrections ?? 0}</Fact>
          </dl>
        </CardContent>
      )}
    </Panel>
  )
}
