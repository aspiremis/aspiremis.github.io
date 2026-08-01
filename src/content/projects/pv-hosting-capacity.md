---
title: PV Hosting Capacity Toolkit
summary: >-
  Planned OpenDSS automation to answer a concrete question for a distribution
  feeder — how much rooftop solar can it absorb before something breaks?
date: 2026-07-20
status: planned
tech: ['Python', 'OpenDSS', 'pandas', 'Matplotlib']
tags: ['hosting-capacity', 'opendss', 'distribution', 'solar-pv', 'simulation']
featured: true
order: 2
---

> **Status: planned.** A design document, not a report. The methodology below is
> what I intend to implement; there are no results yet. This is also the direction
> I expect my thesis to grow out of, so the page will be rewritten repeatedly.

## Overview

"Hosting capacity" is the amount of distributed generation a feeder can accept
before it violates an operating limit. It sounds like a single number. It isn't —
it depends on where the PV is placed, what the load is doing at the time, and which
limit you consider binding.

This toolkit is meant to automate the study: drive OpenDSS from Python, sweep PV
penetration across many random siting scenarios, and report the *distribution* of
outcomes rather than one convenient answer.

## Problem statement

For a given radial distribution feeder, find the maximum aggregate PV capacity that
can be installed without violating:

- **Voltage** — steady-state voltage outside the ANSI/IS limits, typically
  0.95–1.05 p.u.
- **Thermal** — any line or transformer loaded beyond its rating
- **Voltage regulation** — excessive tap operations on regulators
- **Reverse power flow** — export through the substation transformer, where the
  utility's protection scheme doesn't allow it

The complication is that the answer depends heavily on *placement*. The same total
capacity concentrated at the feeder end and spread across the feeder produce
different voltage profiles, because voltage rise scales with the product of injected
power and upstream impedance:

$$
\Delta V \approx \frac{R \cdot P_{\text{inj}} + X \cdot Q_{\text{inj}}}{V_{\text{nominal}}}
$$

On a distribution feeder $R$ is not negligible, so real-power injection alone raises
voltage — the mechanism I expect to be the binding constraint in practice.

## Planned architecture

```
feeder/       OpenDSS model loading, validation, base-case snapshot
scenarios/    stochastic PV siting — Monte Carlo over location & size
engine/       OpenDSS driver, batch execution, result capture
limits/       voltage, thermal, regulator and reverse-power checks
analysis/     hosting-capacity curves, violation attribution, plots
```

The design decision I care about: **scenario generation stays separate from the
simulation engine.** That means a uniform-random siting model can be swapped for a
rooftop-area-weighted one without touching the OpenDSS driver, and an exact scenario
set can be replayed for reproducibility.

## Intended approach

Each scenario places PV systems at randomly chosen load buses until a target
penetration is reached, then solves and checks every limit:

```python
def run_scenario(feeder, penetration, rng):
    """Place PV to hit a penetration level, solve, return violations."""
    dss = feeder.fresh_copy()
    target_kw = feeder.total_load_kw * penetration

    placed_kw, sites = 0.0, []
    for bus in rng.permutation(feeder.load_buses):
        if placed_kw >= target_kw:
            break
        size_kw = min(feeder.load_at(bus) * rng.uniform(0.5, 1.5),
                      target_kw - placed_kw)
        dss.add_pvsystem(bus=bus, kw=size_kw, pf=1.0)
        placed_kw += size_kw
        sites.append((bus, size_kw))

    dss.solve()
    return ScenarioResult(
        penetration=penetration,
        sites=sites,
        voltage=check_voltage(dss, vmin=0.95, vmax=1.05),
        thermal=check_thermal(dss, limit=1.0),
        reverse=check_reverse_power(dss),
        tap_ops=count_tap_operations(dss),
    )
```

One definition to pin down before generating any numbers: **penetration will be
defined against total feeder load, not transformer rating.** The two give noticeably
different figures and papers are not always explicit about which they used. Stating
it on every result is the only way the numbers mean anything.

## What I want the study to report

Not a single hosting-capacity figure. Specifically:

- The **penetration–violation curve** across scenarios, so the spread from siting is
  visible rather than averaged away
- **Which limit binds first**, and at which locations, since that determines what
  the mitigation actually is
- **Sensitivity to inverter power factor** — volt-var control is the one genuinely
  controllable variable, and I expect it to move the answer more than most modelling
  choices

## Validation plan

Run first on the **IEEE 33-bus** test feeder, and reproduce a published
hosting-capacity result before attempting anything new. Reproducing someone else's
number is the only way to know the pipeline is right.

## Scope beyond the first version

- Time-series (QSTS) simulation over a full year instead of a worst-case snapshot —
  the snapshot is conservative by construction and I want to quantify by how much
- Volt-var and volt-watt inverter control curves per IEEE 1547-2018
- Rooftop-area-weighted siting using building footprint data
- Extension to a real Indian distribution feeder rather than only IEEE test systems

## Code

Not public yet. It will be linked here once the toolkit runs end to end on a test
feeder, along with the OpenDSS model and scenario definitions.
