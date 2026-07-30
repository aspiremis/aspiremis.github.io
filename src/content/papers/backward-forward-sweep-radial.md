---
title: 'A Compensation-Based Power Flow Method for Weakly Meshed Distribution Networks'
authors: ['D. Shirmohammadi', 'H. W. Hong', 'A. Semlyen', 'G. X. Luo']
venue: 'IEEE Transactions on Power Systems'
year: 1988
readOn: 2026-07-16
topic: distribution-systems
takeaway: >-
  Radial network structure can replace matrix factorisation entirely — sweep
  currents inward, sweep voltages outward, and handle the few loops with a
  compensation step.
tags: ['load-flow', 'distribution', 'backward-forward-sweep', 'classic']
---

## Why I read it

After watching fast decoupled load flow struggle on a feeder with $R/X \approx 1.2$,
I wanted to understand the method that distribution engineers actually use, and
why it sidesteps the problem rather than solving it better.

## What it does

Exploits the fact that distribution networks are radial or nearly so. Instead of
forming and factorising a Jacobian, it alternates two sweeps:

1. **Backward** — starting from the far ends, accumulate branch currents back
   toward the source using Kirchhoff's current law.
2. **Forward** — starting from the source with a known voltage, propagate voltage
   drops outward.

Repeat until voltages stop changing. Weakly meshed networks — a handful of tie
switches closed — are handled by breaking the loops and applying a compensation
current, so the core radial method is preserved.

## What I took from it

- **The $R/X$ problem simply doesn't arise.** There's no linearisation and no
  decoupling assumption, so nothing degrades as resistance grows. This reframed my
  earlier debugging: the issue was never that distribution networks are "hard", it
  was that I'd brought a transmission-shaped tool.
- Convergence depends on the network's voltage drop rather than on matrix
  conditioning, which is why it holds up on long, heavily loaded feeders.
- A structural lesson that generalises well beyond load flow: exploiting known
  topology beats a general-purpose numerical method, when the topology is
  genuinely constrained.

## Caveat I noted

The method assumes a single source. Distribution feeders with substantial embedded
generation are no longer strictly radial in the power-flow sense, and the paper
predates that being common. Worth checking how modern implementations handle a
feeder exporting to the substation — which is precisely the condition my hosting-
capacity work creates.
