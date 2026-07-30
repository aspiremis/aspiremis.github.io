---
title: Power System Analysis
topic: power-systems
description: >-
  The steady-state core — network modelling, load flow, faults. Everything else
  I am studying rests on being fluent here.
status: in-progress
startedOn: 2026-07-05
progress: 55
order: 1
---

## Where I am

Comfortable with Y-bus formulation, per-unit, and all three classical load-flow
methods — comfortable enough to have implemented them rather than only used them.
Symmetrical components and balanced fault analysis are solid. Unbalanced faults
are still slower than they should be.

## Covered

- Per-unit system and base conversion
- Y-bus and Z-bus formulation, sparsity structure
- Gauss-Seidel, Newton-Raphson, fast decoupled load flow
- Symmetrical components, sequence networks
- Three-phase symmetrical fault analysis

## In progress

- Unsymmetrical fault analysis — single line-to-ground, line-to-line, double
  line-to-ground
- Bus impedance matrix building algorithm
- Economic dispatch and the loss coefficient formulation

## Not started

- Contingency analysis and security assessment
- State estimation
- Optimal power flow

## What clicked

Writing the load flow myself. Reading the Newton-Raphson derivation left me able
to reproduce it; implementing it left me able to *debug* it, which turned out to
be a completely different skill.
