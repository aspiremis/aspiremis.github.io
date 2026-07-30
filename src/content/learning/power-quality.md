---
title: Power Quality
topic: power-quality
description: >-
  Harmonics, sags, flicker — the disturbances that don't show up in a load flow
  but decide whether equipment actually survives.
status: in-progress
startedOn: 2026-07-08
progress: 45
order: 4
---

## Where I am

The theory is landing well; measurement practice is where I am weakest, and that
is mostly a matter of lab hours.

## Covered

- Harmonic sources, characteristic harmonics of six- and twelve-pulse converters
- THD, TDD, and why IEEE 519 limits the second one
- Voltage sags — causes, characterisation, ITIC/CBEMA curves
- Flicker and the $P_{st}$ / $P_{lt}$ measurement framework

## In progress

- Harmonic load flow and frequency-domain network modelling
- Passive filter design, detuning, and resonance risk
- Measurement practice — window length, aggregation intervals per IEC 61000-4-30

## Not started

- Active power filters and their control
- Power quality in networks dominated by inverter-based resources

## What clicked

That the current limits in IEEE 519 exist *in order to* keep voltage distortion
acceptable. They aren't two independent requirements — one is the mechanism for
achieving the other, which is why the current limits scale with system strength.
