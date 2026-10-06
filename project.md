# Alliance Automations

**Kandari-lab · Dyeing floor intelligence.** A live monitoring, control and analytics product for garment dyeing sections. This repository is the frontend and a production-grade demo that runs on a simulated 50-machine floor, built to win the pilot.

## What exists today

A complete UI on a deterministic plant simulator. There is no backend, database, ERP link or hardware yet. Everything below runs in the browser.

| Route | Screen | What it shows |
| --- | --- | --- |
| `/` | Landing | Pitch, live counters, links to every screen |
| `/dashboard` | Overview | KPI row, fleet map of all 50 machines, live alerts, 24 h output, bay load, delivery risk, utility intensity |
| `/control` | Control panel | Filterable grid of machine tiles with cycle progress and live step values |
| `/control/[machineId]` | Machine detail | Sensor gauges, planned vs actual temperature, recipe timeline, hold and shade-check commands, event log |
| `/batches` | Batches | Sortable, searchable table of batches in machines and completed today |
| `/schedule` | Schedule | Per-bay machine timeline (done, running, next) and a delivery and maintenance calendar |
| `/efficiency` | Efficiency | OEE trend with go-live marker, loss Pareto, utility intensity, improvement levers (illustrative data) |
| `/ai` | AI agents | Seven-agent registry with live insights and a question-answering assistant |
| `/crm` | CRM | Order pipeline, orders table, buyer cards, shade approvals |
| `/roadmap` | Roadmap | 52-week plan, per-phase checklists, exit tests, risks |
| `/tv` | TV wallboard | Full screen, rotates through the five bays, alert ticker |
| `/tablet` | Operator tablet | Touch UI: reason-code holds, ΔE keypad, batch scan |

The `Finishing` view in the original reference screenshot is not built yet.

## Domain rules

These definitions fix the inconsistencies found in the original mockup. They live in `lib/domain/rules.ts` and every screen uses them.

- **Projected end** = now + planned time left in the current step + planned time of all later steps.
- **Excess time** = projected end − standard target end (never negative). It is a projection, so it can be non-zero before the target has passed.
- **Delayed** = excess time ≥ 15 minutes while the machine is not on hold. Delay KPI, tile status and alerts all use this single rule.
- **Escalation:** a supervisor is notified at +15 min and the manager at +60 min.
- **On hold:** an operator or signal has paused the batch with a reason code. The step timer pauses; hold time still counts toward the overrun.
- **Machine phases:** offline → idle → ready → running → complete. The shown status adds held and delayed on top of the running phase.
- **Running time** is measured from batch start, not entered by hand.
- **Today** starts at the 06:00 shift start. Production KPIs sum completed batches since then.
- **Shade check:** ΔE (CIE2000) ≤ 1.0 passes. A failure raises a shade-correction hold, and on release inserts top-up dosing and a second dyeing hold into the recipe. Any correction means the batch was not right first time.

## Architecture

```
Machine layer   PLC / dyeing controller, PT100, pressure, level, flow, energy meters, QR cards
   │ Modbus RTU/TCP, OPC UA
Edge layer      Industrial gateway, store-and-forward buffer (SQLite)
   │ MQTT QoS 1 over wired LAN
Platform        Broker → ingestion → PostgreSQL + TimescaleDB → REST / WebSocket → rules → AI agents
   │
Applications    Control room · TV wallboards · operator tablets · ERP/CRM sync · WhatsApp/SMS/Telegram alerts
```

In this repository the Machine, Edge and Platform layers are replaced by `lib/sim/` feeding `lib/store/plant.ts`.

### Swapping the simulator for the real feed

1. Keep `PlantSnapshot` in `lib/domain/types.ts` as the contract the backend must fill (orders, batches, machine states, completed batches, events).
2. In `lib/store/plant.ts`, replace `seedPlant` and `advance` with a WebSocket subscription that sets a new snapshot. `buildViews`, `deriveAlerts` and `computeKpis` stay unchanged.
3. Replace the in-store commands (`hold`, `release`, `recordShadeCheck`, `acknowledge`) with API calls that return the updated state.
4. Replace `buildHistory` with a query over daily aggregates.

Planning fields (buyer, order, quantity, GSM, shade, batch number) come from the ERP. Machine fields (step, temperature, fill, dosing, drain, circulation, times) come from the controller. Everything else is derived.

## Simulator

`lib/sim/engine.ts` advances the plant in one-minute steps from a seeded random generator, so a reload with the same seed gives the same floor.

- 50 machines in five bays with capacities from 100 to 1,500 kg. Two machines start out of service.
- Reactive cotton exhaust recipe (loading through unloading), scaled by batch weight and shade depth, with one soaping cycle, or two for dark shades.
- About 8% of batches run 5 to 15% slow. Holds occur at roughly five an hour across the floor, weighted toward shade correction, chemicals and steam pressure.
- The top bar speed control runs the demo at 1×, 10× or 60×.

## Roadmap

The full plan with steps, team and exit tests is in `lib/roadmap.ts` and the `/roadmap` page.

| Phase | Weeks | Goal |
| --- | --- | --- |
| 0 Discovery | 0–3 | Process map, machine inventory, ERP format, KPI baseline, paid pilot scope |
| 1 Digital batch tracking | 3–8 | Backend, QR cards, tablet entry, offline sync; proves adoption with no hardware |
| 2 Pilot IoT | 8–16 | Gateway, MQTT, TimescaleDB on 3 to 5 machines, signal-derived status |
| 3 Scale | 16–28 | All 50 machines, TV wallboards, escalation, ERP sync, energy per batch |
| 4 AI | 28–40 | Anomaly detection, ETA model, sequencing, Claude assistant |
| 5 Productize | 40–52 | Multi-factory cloud, subscription pricing, buyer portal |

Needed from the client to start Phase 0: machine brands and controller models, and which ERP they use. These decide the Phase 2 integration design.

## Decisions and constraints

- **ERP/MES, not CRM, carries production data.** The CRM screen covers buyer-facing communication: ETAs, shade approvals, order pipeline.
- **Rules before machine learning.** Alerts and ETAs are plain logic. Models need one to six months of clean history, so AI agents run in shadow mode first.
- **Read-only toward controllers** in early phases. Wired Ethernet or RS485 with IP65 enclosures; no Wi-Fi on the floor.
- **Baseline before claims.** Measure four weeks of current performance before reporting any improvement.
- **Demo numbers are illustrative.** The efficiency page and the simulated feed are not measurements. Never quote them to a client as results.

## Known gaps

- Finishing section view and its data model.
- Official logo (placeholder mark in `components/brand/logo.tsx`).
- Authentication, roles and per-buyer data isolation.
- Backend, persistence, ERP and hardware integration.
- Automated tests; the simulator and `lib/domain/rules.ts` are the first candidates because they are pure functions.
