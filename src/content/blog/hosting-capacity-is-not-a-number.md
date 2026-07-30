---
title: Hosting Capacity Is Not a Number
description: >-
  Three hundred Monte Carlo runs on the same feeder at the same penetration
  produced everything from a comfortable pass to a serious violation. Reporting
  a single figure throws away the most important part of the answer.
date: 2026-07-28
topic: renewable-integration
tags: ['hosting-capacity', 'solar-pv', 'distribution', 'opendss', 'uncertainty']
featured: true
---

Ask what a feeder's PV hosting capacity is and you'll usually get a number.
"About 60%." "Around 2.4 MW." It's a satisfying answer, it fits in a table, and
it is mostly an artefact of how the study was run.

I've been building a toolkit that runs hosting-capacity studies as a Monte Carlo
sweep rather than a single deterministic case, and the distributions it produces
have changed how I read the term.

## The setup

IEEE 33-bus test feeder. For each penetration level from 10% to 100% of total
feeder load, generate 300 scenarios. Each scenario places PV at randomly chosen
load buses, sized proportionally to the load there, until the target penetration
is reached. Solve at the worst case — peak PV output coinciding with minimum load
— and check every operating limit.

The only thing varying between scenarios at a given penetration level is *where*
the panels went.

## The result

| Penetration | Scenarios with a violation |
|---|---|
| 20% | 0% |
| 40% | 4% |
| 60% | 38% |
| 80% | 91% |
| 100% | 100% |

At 60% penetration, the feeder is fine in roughly three cases out of five and in
violation in the other two. Same feeder, same total capacity, same load. The
entire difference is siting.

So what is the hosting capacity of this feeder? If you want zero risk, it's about
40%. If you'll accept a 1-in-3 chance of an overvoltage in the worst hour of the
year, it's 60%. Those are different engineering decisions, and collapsing them
into one number hides the decision rather than informing it.

## Why siting matters this much

Voltage rise at an injection point scales with the impedance between that point
and the source:

$$
\Delta V \approx \frac{R \cdot P_{\text{inj}} + X \cdot Q_{\text{inj}}}{V_{\text{nominal}}}
$$

A bus at the far end of the feeder has a much larger accumulated $R$ and $X$ back
to the substation than one near it. Identical capacity at the two locations
produces very different voltage rise — I measured close to a factor of four
between the best and worst single-bus placements on this feeder.

Random siting therefore isn't noise around a true value. It's sampling a genuinely
wide outcome space, and the spread *is* the finding.

## Two things I got wrong on the way

**I defined penetration ambiguously at first.** Penetration as a fraction of total
feeder load and as a fraction of substation transformer rating are both in common
use, and they can differ by 30% or more on the same feeder. I lost an afternoon to
results that wouldn't line up with a reference paper before realising we were
measuring different quantities with the same word. My results now state the
definition explicitly, every time.

**I assumed thermal limits would bind first.** They didn't, and it wasn't close.
Overvoltage was the first violation in essentially every scenario. The conductor on
this feeder has ample current headroom; what runs out is voltage margin. My
intuition had come from transmission-side thinking, where the $R$ term is small
enough to ignore and thermal ratings really are what you watch.

## What I'd like to report instead

A hosting-capacity study is more useful when it reports:

- The **penetration–violation curve**, not a single threshold
- **Which limit binds**, and at which locations, since that determines what the
  mitigation actually is
- The **sensitivity to inverter power factor** — a quick run at 0.95 leading moved
  my 50%-violation point up by around 15 percentage points, which is a bigger
  effect than most of the modelling choices I agonised over

That last one is worth sitting with. Volt-var control changed the answer more than
any amount of care in the simulation setup. If the study's purpose is to inform a
decision, the controllable variable deserves at least as much attention as the
uncontrollable one.

## Where this goes next

The obvious weakness of what I have is the worst-case snapshot. Peak PV with
minimum load is conservative by construction, and I don't yet know by how much.
The next version runs quasi-static time series over a full year, which should let
me say something like "violations occur in 0.3% of annual hours" instead of "the
worst hour is bad" — a far more actionable statement for anyone who has to decide
whether to approve an interconnection.

---

*Code and scenario definitions:
[pv-hosting-capacity](https://github.com/shalini-ee/pv-hosting-capacity).*
