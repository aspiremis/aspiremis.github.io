---
title: THD, TDD and What IEEE 519 Actually Limits
description: >-
  IEEE 519 does not set a limit on current THD, which is the single most common
  misreading of the standard. It limits TDD, and the difference matters.
date: 2026-07-18
topic: power-quality
tags: ['harmonics', 'ieee-519', 'thd', 'power-quality', 'standards']
status: growing
---

## The two definitions

**Total harmonic distortion** is referenced to the fundamental:

$$
\text{THD}_I = \frac{\sqrt{\sum_{h=2}^{\infty} I_h^2}}{I_1} \times 100\%
$$

**Total demand distortion** is referenced to the maximum demand load current:

$$
\text{TDD} = \frac{\sqrt{\sum_{h=2}^{\infty} I_h^2}}{I_L} \times 100\%
$$

where $I_L$ is the maximum demand load current at the point of common coupling,
usually averaged over the preceding 12 months.

Same numerator. Different denominator.

## Why the denominator changes everything

Consider a nonlinear load drawing a small current at light load. Its harmonic
currents are small in absolute terms — but so is $I_1$, so THD can be enormous.
A drive running at 10% load might show 80% current THD while injecting a harmonic
current that is trivial compared to the system's capacity to absorb it.

Reporting that as a violation is meaningless. The system doesn't care about the
ratio; it cares about the amperes.

TDD fixes this by holding the denominator fixed at maximum demand. A load that is
lightly loaded produces a low TDD, correctly reflecting that it is not stressing
the system. **IEEE 519 sets current limits in terms of TDD, not THD.**

I've seen "current THD must be under 5%" quoted in specifications often enough
that I assumed it was in the standard. It isn't.

## Voltage is a different story

For *voltage* distortion, IEEE 519 does use THD, and there the fundamental is the
right reference — system voltage is held near nominal by design, so the
denominator doesn't collapse the way load current does.

Typical limits at the PCC:

| System voltage | Individual harmonic | Voltage THD |
|---|---|---|
| ≤ 1 kV | 5.0% | 8.0% |
| 1 kV – 69 kV | 3.0% | 5.0% |
| 69 kV – 161 kV | 1.5% | 2.5% |
| > 161 kV | 1.0% | 1.5% |

The limits tighten as voltage rises, because distortion at transmission level
propagates to far more customers.

## Current limits depend on system strength

The TDD limits aren't a single number either — they scale with the short-circuit
ratio $I_{SC}/I_L$. A stiff system (high short-circuit current relative to the
load) can absorb proportionally more harmonic current before the voltage distortion
becomes objectionable, so it's allowed more.

That coupling is the logic of the whole standard: **the current limits exist to
keep voltage distortion acceptable**, and how much current it takes to distort the
voltage depends on the source impedance. The two tables are not independent
requirements; one is the means to the other.

## Where it's measured

At the **point of common coupling** — the point where other customers connect —
not at the terminals of the offending equipment. A drive can be as distorted as it
likes internally, provided the PCC stays within limits. This is a shared-
responsibility standard, and locating the PCC correctly is often the first
argument in a compliance dispute.

## Related

- Harmonic measurement practice — window length, and why a single snapshot is
  usually not enough
- Filter design for harmonic mitigation, once I've done the lab work
