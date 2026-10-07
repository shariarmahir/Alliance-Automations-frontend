import { Gauge } from "@/components/control/gauge"
import { Utility, Utilization } from "@/components/plant/icons/console-icons"
import { ANIMATED_STEP_ICON } from "@/components/plant/icons/step-icons"
import type { MachineView } from "@/lib/domain/types"

/** Full-scale values for gauges that have no recipe-derived range. */
const TEMPERATURE_MAX_C = 135
const PRESSURE_MAX_BAR = 4
/** Rated pump power per kilogram of machine capacity. */
const PUMP_KW_PER_KG = 0.05
/** Fallback liquor ratio (litres per kilogram) when the recipe has no fill step. */
const DEFAULT_LIQUOR_RATIO = 8

export function SensorGauges({ view }: { view: MachineView }) {
  const { machine, batch, telemetry } = view
  const liquorL = batch?.recipe.find((step) => step.kind === "fill")?.target ?? machine.capacityKg * DEFAULT_LIQUOR_RATIO

  return (
    <>
      <Gauge index={0} icon={ANIMATED_STEP_ICON.heat} label="Bath temperature" value={telemetry.temperatureC} max={TEMPERATURE_MAX_C} unit="°C" digits={1} tone="text-chart-2" />
      <Gauge index={1} icon={ANIMATED_STEP_ICON.fill} label="Liquor level" value={telemetry.levelL} max={liquorL} unit="L" />
      <Gauge index={2} icon={Utilization} label="Pressure" value={telemetry.pressureBar} max={PRESSURE_MAX_BAR} unit="bar" digits={2} />
      <Gauge index={3} icon={ANIMATED_STEP_ICON.rinse} label="Circulation" value={telemetry.circulationPct} max={100} unit="%" />
      <Gauge index={4} icon={Utility} label="Pump power" value={telemetry.powerKw} max={machine.capacityKg * PUMP_KW_PER_KG} unit="kW" digits={1} />
    </>
  )
}

