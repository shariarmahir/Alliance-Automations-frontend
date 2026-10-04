export type Random = () => number

/** mulberry32: tiny, fast and good enough for a reproducible plant simulation. */
export function createRandom(seed: number): Random {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }
}

export const between = (random: Random, min: number, max: number) => min + random() * (max - min)

export const pick = <T>(random: Random, items: readonly T[]): T => items[Math.floor(random() * items.length)]

export function weighted<T>(random: Random, entries: readonly (readonly [T, number])[]): T {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = random() * total
  for (const [value, weight] of entries) {
    roll -= weight
    if (roll <= 0) return value
  }
  return entries[entries.length - 1][0]
}
