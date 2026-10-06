@AGENTS.md

# Alliance Automations frontend

Live monitoring, control and analytics UI for a 50-machine garment dyeing floor, by Kandari-lab. Read [project.md](project.md) for the product, data rules and roadmap before changing behavior.

## Commands

```bash
npm run dev         # http://localhost:3000
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run build       # production build, prerenders all 64 pages
```

Run `typecheck`, `lint` and `build` before calling work done. `next typegen` regenerates the global `LayoutProps` and `PageProps` types; run it after adding routes if the editor cannot find them.

## Stack

- Next.js 16 App Router, React 19, TypeScript strict. Read the bundled docs in `node_modules/next/dist/docs/` before using an API you are unsure of: `params` is a promise, `middleware` is now `proxy`.
- Tailwind CSS v4, configured in `app/globals.css` only (there is no tailwind config file).
- shadcn/ui (Radix base, Nova preset) in `components/ui/`. Add components with `npx shadcn@latest add <name>`. Do not restyle them in place; wrap or extend them.
- `motion` for animation, `@number-flow/react` for animated numbers, Recharts through the shadcn `chart` wrapper, `@tanstack/react-table` **v9**, `zustand` for the live store, `date-fns` for the calendar.

## Layout

There is no `src/` directory. Keep it that way.

```
app/
  page.tsx               landing page
  (console)/             sidebar + top bar shell: dashboard, control, batches, schedule,
                         efficiency, ai, crm, roadmap
  tv/  tablet/           full-screen displays, no shell
components/
  ui/                    shadcn primitives
  plant/                 status badges, step readout, fleet map, alert list (shared by screens)
  <feature>/             one folder per screen (dashboard, control, crm, ...); the screen entry
                         is <feature>-view.tsx and only composes the components beside it
lib/
  domain/                types, catalog (master data), rules (derivation), analytics
  sim/                   simulator: engine, seed, history, seeded random
  store/plant.ts         the single source of live state (usePlant, useSnapshot, useKpis)
  time.ts                MINUTE, HOUR, DAY. Never write 86_400_000 or 60 * 60_000 inline
  ai/agents.ts           agent registry and insights computed from live data
```

## Architecture rules

1. **Screens read only from `usePlant`.** The simulator is one implementation of the feed. Replacing it with the real WebSocket/API means changing `lib/store/plant.ts`, never a screen.
2. **Derived values live in `lib/domain/rules.ts`.** Status, projected end, excess time, delay and alerts are defined once there. Never recompute them inside a component.
3. **One delay rule:** a batch is delayed when projected end minus standard target is at least `DELAY_THRESHOLD_MIN` (15). A hold is shown as on hold, not delayed. Escalation to the manager is at `ESCALATION_MIN` (60).
4. **Excess time is projected, not elapsed.** Projected end is now plus the planned time left in the current step plus every remaining planned step.
5. **Machine state is derived from signals and the machine phase, never typed.** Hold time pauses the step timer and counts toward the overrun.
6. **Read-only toward the PLC.** Operator commands change tracking state and notify people. Do not add anything that implies writing setpoints to a controller.
7. **Fake data is labelled.** The efficiency history is illustrative demo data and the top bar says "Simulated feed". Do not present simulated numbers as measured results.

## Code style

- **Pages stay thin.** A `page.tsx` exports metadata and composes components; it holds no data, helpers or markup beyond that.
- **One component per file**, named after the file (`bay-load.tsx` exports `BayLoad`). A view file such as `dashboard-view.tsx` only arranges the pieces. Split a component when it passes roughly 120 lines or mixes data logic with markup; move pure logic to a plain `.ts` file beside it.
- **No magic numbers.** Name thresholds and scales as constants with a comment giving the unit and reason. Delay colours come from `excessTone` / `ExcessTime` in `components/plant/excess.tsx`, never an inline `>= 15`.
- Inside `<PlantGate>`, read the store with `useSnapshot` and `useKpis`; do not add `!` assertions in components.
- Import order: packages first, then `@/` imports, each alphabetical. Lint fails on unused variables and imports.

- Match the existing files: no semicolons, double quotes, two-space indent, `@/` imports, named exports for components (default exports only for `page`, `layout`).
- Server components by default. Add `"use client"` only where hooks, the store, or motion are used.
- Keep components small and typed from `lib/domain/types.ts`. No `any` (the one documented exception is `DataTableColumn`), no dead code, no comments that restate the code. Comment the *why*: units, assumptions, non-obvious rules.
- Machines use robot names from `lib/domain/catalog.ts` (`D01` Dum-E, `D02` Wall-E, ...). Keep the `D01`-`D50` IDs; they are the keys everywhere.
- Status colors (`running`, `delayed`, `held`, ...) are reserved for machine state and always pair with an icon and a label. Use `STATUS_META` from `components/plant/status.tsx`; do not hardcode them. Chart series use `--chart-*` tokens, one hue per series.
- Numbers that update live use `tabular` so digits do not jitter. Respect reduced motion (handled globally in `globals.css`).

## TanStack Table v9

The API differs from v8. Use `useTable`, `tableFeatures({...})` with explicit row-model slots, `createColumnHelper<Features, Row>()` and `table.FlexRender`. Keep features, columns and data stable across renders. `components/data-table.tsx` is the shared wrapper; use it instead of building a new table.

## Brand

The logo in `components/brand/logo.tsx` is a **placeholder mark**. To use the official Kandari-lab logo, put the file in `public/brand/` and render it with `next/image` inside `LogoMark` and `Logo`. Nothing else references the mark.
