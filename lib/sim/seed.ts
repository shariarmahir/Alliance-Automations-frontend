import { BUYERS, GARMENTS, MACHINES, SHADES, buildRecipe } from "@/lib/domain/catalog"
import { MINUTE } from "@/lib/domain/rules"
import type { Batch, BuyerTier, MachineState, Order, OrderStage, PlantSnapshot } from "@/lib/domain/types"
import { advance, productionDayStart, startRun } from "./engine"
import { between, pick, weighted, type Random } from "./random"

const DAY = 24 * 60 * MINUTE
const WARM_UP_MS = 30 * 60 * MINUTE

const ORDERS_PER_TIER: Record<BuyerTier, number> = { Strategic: 6, Key: 5, Growth: 4 }

const ORDER_PREFIX: Record<string, string> = {
  hm: "HM", zara: "Z", next: "NX", ca: "CA", uniqlo: "UQ", gap: "GAP", ms: "MS", primark: "PK",
}

const STAGE_MIX: readonly (readonly [OrderStage, number])[] = [
  ["dyeing", 46],
  ["planned", 18],
  ["lab-dip", 10],
  ["finishing", 12],
  ["packed", 8],
  ["shipped", 6],
]

/** Days from now until delivery, by how far along the order is. */
const DUE_WINDOW: Record<OrderStage, [number, number]> = {
  shipped: [-4, -1],
  packed: [0, 3],
  finishing: [2, 6],
  dyeing: [3, 12],
  planned: [8, 18],
  "lab-dip": [14, 28],
}

function createOrders(now: number, random: Random): Order[] {
  let serial = 26_040
  const deliveryCutoff = new Date(now)
  deliveryCutoff.setHours(17, 0, 0, 0)

  return BUYERS.flatMap((buyer) =>
    Array.from({ length: ORDERS_PER_TIER[buyer.tier] }, (): Order => {
      const stage = weighted(random, STAGE_MIX)
      const { garment, gsm } = pick(random, GARMENTS)
      const qtyKg = Math.round(between(random, 6_000, 24_000) / 100) * 100
      const [minDays, maxDays] = DUE_WINDOW[stage]
      const dueAt = deliveryCutoff.getTime() + Math.round(between(random, minDays, maxDays)) * DAY
      const dyedShare =
        stage === "dyeing" ? between(random, 0.05, 0.4) : stage === "planned" || stage === "lab-dip" ? 0 : 1

      return {
        id: `${ORDER_PREFIX[buyer.id]}-${serial++}`,
        buyerId: buyer.id,
        style: `${ORDER_PREFIX[buyer.id]}${Math.round(between(random, 1000, 9999))}`,
        garment,
        shade: pick(random, SHADES),
        gsm: pick(random, gsm),
        qtyKg,
        dyedKg: Math.round((qtyKg * dyedShare) / 10) * 10,
        createdAt: dueAt - Math.round(between(random, 25, 45)) * DAY,
        dueAt,
        stage,
        approval: stage === "lab-dip" ? "pending" : stage === "dyeing" && random() < 0.12 ? "correction" : "approved",
      }
    }),
  )
}

/**
 * Builds a believable plant at `now`: every machine starts mid-batch 30 hours earlier and the
 * engine runs forward to the present, so history, today's output and live state all agree.
 */
export function seedPlant(now: number, random: Random): PlantSnapshot {
  const start = now - WARM_UP_MS
  const orders = createOrders(now, random)
  const dyeing = orders.filter((o) => o.stage === "dyeing")
  const batches: Record<string, Batch> = {}
  let batchSeq = 10_000

  const downMachines = new Set([Math.floor(random() * 25), 25 + Math.floor(random() * 25)])

  const states = MACHINES.map((machine, i): MachineState => {
    if (downMachines.has(i)) {
      return {
        machineId: machine.id,
        phase: "offline",
        phaseSince: start,
        run: null,
        next: null,
        downtime: {
          reason: i % 2 ? "machine-fault" : "maintenance",
          since: start,
          until: now + between(random, 60, 300) * MINUTE,
        },
      }
    }

    const order = pick(random, dyeing)
    const qtyKg = Math.round((machine.capacityKg * between(random, 0.82, 0.97)) / 10) * 10
    const batch: Batch = {
      id: `B-${batchSeq++}`,
      orderId: order.id,
      machineId: machine.id,
      qtyKg,
      recipe: buildRecipe(order.shade.depth, qtyKg),
    }
    batches[batch.id] = batch

    return {
      machineId: machine.id,
      phase: "running",
      phaseSince: start,
      run: startRun(batch, start - between(random, 0, 240) * MINUTE, random),
      next: null,
      downtime: null,
    }
  })

  const initial: PlantSnapshot = {
    now: start,
    dayStart: productionDayStart(start),
    orders,
    batches,
    states,
    completed: [],
    events: [],
    acknowledged: [],
    batchSeq,
  }

  return advance(initial, now, random)
}
