---
title: PV Hosting Capacity Toolkit
summary: >-
  Automated OpenDSS studies that answer a concrete question for a distribution
  feeder — how much rooftop solar can it absorb before something breaks?
date: 2026-07-20
status: active
tech: ['Python', 'OpenDSS', 'pandas', 'Matplotlib']
tags: ['hosting-capacity', 'opendss', 'distribution', 'solar-pv', 'simulation']
github: https://github.com/shalini-ee/pv-hosting-capacity
featured: true
order: 2
---

## Overview

"Hosting capacity" is the amount of distributed generation a feeder can accept
before it violates an operating limit. It sounds like a single number. It isn't —
it depends on where the PV is placed, what the load is doing at the time, and
which limit you consider binding.

This toolkit automates the study: it drives OpenDSS from Python, sweeps PV
penetration across many random siting scenarios, and reports the distribution of
outcomes rather than one convenient answer.

## Problem statement

For a given radial distribution feeder, find the maximum aggregate PV capacity
that can be installed without violating:

- **Voltage** — steady-state voltage outside the ANSI/IS limits, typically
  0.95–1.05 p.u.
- **Thermal** — any line or transformer loaded beyond its rating
- **Voltage regulation** — excessive tap operations on regulators
- **Reverse power flow** — export through the substation transformer, where the
  utility's protection scheme doesn't allow it

The complication is that the answer depends heavily on *placement*. The same
total capacity concentrated at the feeder end and spread across the feeder produce
completely different voltage profiles, because voltage rise scales with the
product of injected power and upstream impedance:

$$
\Delta V \approx \frac{R \cdot P_{\text{inj}} + X \cdot Q_{\text{inj}}}{V_{\text{nominal}}}
$$

On a distribution feeder $R$ is not negligible, so real-power injection alone
raises voltage — which is exactly the mechanism that limits hosting capacity in
practice.

## Architecture

```
feeder/       OpenDSS model loading, validation, base-case snapshot
scenarios/    stochastic PV siting — Monte Carlo over location & size
engine/       OpenDSS COM/Direct-DLL driver, batch execution, result capture
limits/       voltage, thermal, regulator and reverse-power checks
analysis/     hosting-capacity curves, violation attribution, plots
```

The design decision that mattered: **scenario generation is separate from the
simulation engine.** It means I can swap a uniform-random siting model for a
rooftop-area-weighted one without touching the OpenDSS driver, and I can replay
an exact scenario set for reproducibility.

## Implementation

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

Penetration is defined against total feeder load, not transformer rating — the two
give noticeably different numbers and papers are not always explicit about which
they used, which cost me a confusing afternoon when my results wouldn't line up
with a reference.

## Results

Run on the **IEEE 33-bus** test feeder, 300 Monte Carlo scenarios per penetration
level, unity power factor, peak-PV/minimum-load condition:

| Penetration | Scenarios with any violation | First binding limit |
|---|---|---|
| 20% | 0% | — |
| 40% | 4% | Overvoltage, feeder end |
| 60% | 38% | Overvoltage, feeder end |
| 80% | 91% | Overvoltage, then thermal |
| 100% | 100% | Overvoltage + reverse power |

Three things I did not expect before running it:

1. **Overvoltage binds long before thermal limits do.** On this feeder the
   conductor has plenty of headroom; it is the voltage rise that stops you. That
   inverts the intuition I had from transmission-side thinking.
2. **The spread at a given penetration is enormous.** At 60% penetration, siting
   alone decides whether the feeder is fine or badly out of limits. A single
   deterministic "hosting capacity" number hides this completely.
3. **Unity power factor is a choice, not a constraint.** A quick sensitivity run
   with inverters at 0.95 leading pushed the 50%-violation point up by roughly
   15 percentage points — volt-var control is doing real work.

## Future improvements

- Time-series (QSTS) simulation over a full year instead of the worst-case
  snapshot — the snapshot is conservative and I want to quantify by how much
- Volt-var and volt-watt inverter control curves per IEEE 1547-2018
- Rooftop-area-weighted siting using building footprint data, instead of uniform
  random placement
- Extend to a real Indian distribution feeder rather than only IEEE test systems
- Export a one-page utility-readable report per feeder

## Code

The repository includes the modified IEEE 33-bus OpenDSS model, the scenario
definitions used for the table above, and the notebook that generates the
hosting-capacity curves.
