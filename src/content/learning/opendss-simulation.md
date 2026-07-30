---
title: OpenDSS and Distribution Simulation
topic: simulation
description: >-
  Learning to model unbalanced distribution feeders properly, and to drive the
  simulation from Python so studies are repeatable rather than hand-run.
status: in-progress
startedOn: 2026-07-12
progress: 40
order: 2
---

## Where I am

I can build a feeder model from a data sheet, run snapshot and daily simulations,
and drive the whole thing from Python for batch studies. The gap is in the
modelling detail — unbalanced multi-phase configurations and regulator control
still involve more trial and error than understanding.

## Covered

- Circuit definition, `Master.dss` structure, `compile` semantics
- Line geometries, line codes, and when each is appropriate
- Loads, load shapes, and the difference between `mode=snapshot` and `mode=daily`
- Driving OpenDSS from Python for Monte Carlo scenario sweeps
- PVSystem elements and basic inverter modelling

## In progress

- Regulator and capacitor control modelling
- Quasi-static time series (QSTS) over a full year
- Unbalanced three-phase modelling with realistic phasing

## Not started

- Dynamics mode and inverter dynamic models
- Storage elements and dispatch

## What clicked

Realising OpenDSS keeps state between commands unless you recompile. Half a day
of confusing Monte Carlo results turned out to be scenario 200 still containing
every PV system from scenarios 1 through 199.
