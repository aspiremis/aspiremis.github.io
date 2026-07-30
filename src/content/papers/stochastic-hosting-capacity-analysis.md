---
title: 'Stochastic Analysis of PV Hosting Capacity in Distribution Feeders'
authors: ['M. Rylander', 'J. Smith', 'W. Sunderman']
venue: 'IEEE Transactions on Industry Applications'
year: 2016
readOn: 2026-07-19
topic: renewable-integration
takeaway: >-
  Hosting capacity should be reported as a range produced by stochastic siting,
  not a single deterministic number — the spread across placements is often wider
  than the difference between feeders.
tags: ['hosting-capacity', 'stochastic', 'distribution', 'methodology']
---

## Why I read it

I had built a deterministic hosting-capacity script and wanted to know whether
"place PV randomly, many times" was a real methodology or something I'd invented
because it was easy. It's a real methodology, and this is one of the papers that
established it.

## What it does

Runs large numbers of stochastic PV deployment scenarios on real utility feeders,
varying location and size, and reports hosting capacity as a *region* bounded by a
minimum (worst placement) and maximum (best placement) rather than a point.

## What I took from it

- The framing of hosting capacity as **minimum / maximum / expected**, which is
  much more honest than a single figure and maps directly onto what a planner
  actually needs to decide.
- Confirmation that **overvoltage is typically the first binding constraint** on
  feeders with headroom in their conductors. My own IEEE 33-bus results reproduced
  this, which was reassuring.
- The observation that feeder-specific characteristics — length, conductor size,
  regulator placement — dominate any general rule of thumb. There is no universal
  "15% penetration is safe" number, and the ones in circulation come from a
  specific study on specific feeders.

## What I'd still like to know

The paper works with snapshot analysis at critical conditions. My open question is
how much conservatism that introduces relative to a full time-series study — the
worst hour is by construction worse than the typical hour, but I haven't seen the
gap quantified in a way I trust.

That's most of my thesis interest in one sentence, so it's a useful place to be
stuck.
