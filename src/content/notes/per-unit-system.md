---
title: Why Per-Unit Actually Helps
description: >-
  Not just "it makes numbers smaller" — per-unit makes transformer turns ratios
  disappear from the network model, which is the real payoff.
date: 2026-07-08
topic: power-systems
tags: ['per-unit', 'fundamentals', 'transformers']
status: evergreen
---

## The definition

Every quantity is expressed as a fraction of a chosen base:

$$
\text{p.u. value} = \frac{\text{actual value}}{\text{base value}}
$$

Pick two bases — usually $S_{\text{base}}$ (three-phase MVA) and $V_{\text{base}}$
(line-to-line kV) — and the rest follow:

$$
Z_{\text{base}} = \frac{V_{\text{base}}^2}{S_{\text{base}}}, \qquad
I_{\text{base}} = \frac{S_{\text{base}}}{\sqrt{3}\, V_{\text{base}}}
$$

## The reason it exists

The textbook justification is that per-unit values sit conveniently near 1.0, so
errors are obvious. True, and not the point.

The actual payoff: **if you choose voltage bases in the ratio of the transformer
turns ratios, transformers vanish from the network model as ideal elements.** Their
per-unit impedance is the same seen from either side, so a multi-voltage-level
network collapses into a single impedance diagram with no ratio blocks in it.

Without per-unit, every transformer in a load flow needs its impedance referred
across, and a network with four voltage levels becomes an exercise in bookkeeping
that is almost entirely opportunities to make sign and scaling errors.

## Changing base

Manufacturer data comes on the equipment's own rating, so converting to a system
base is routine:

$$
Z_{\text{pu,new}} = Z_{\text{pu,old}} \times
\frac{S_{\text{base,new}}}{S_{\text{base,old}}} \times
\left(\frac{V_{\text{base,old}}}{V_{\text{base,new}}}\right)^2
$$

The voltage term is squared and the power term is not. That asymmetry is where I
make mistakes when working quickly, so it's worth stating explicitly: impedance
scales as $V^2/S$, and the conversion factor inherits that shape exactly.

## The catch nobody mentions early

The transformer-disappears property requires the voltage bases to be chosen in
the turns ratio. If you pick bases arbitrarily, an off-nominal ratio remains in
the model — which is exactly how tap-changing transformers are represented in load
flow. Tap changers *are* transformers deliberately operating off their base ratio,
so they cannot be made to disappear, and shouldn't be.

## Related

- [[ybus-construction]] — where the per-unit impedances end up
- Three-phase vs. single-phase base conventions still catch me out; worth its own
  note
