---
semester: 1
title: 'Autumn 2026 — Foundations'
period: 'July – November 2026'
status: current
summary: >-
  The first semester is mostly about rebuilding my fundamentals at a much higher
  resolution. Undergrad taught me to apply formulas; this semester is teaching me
  where those formulas come from and, more usefully, when they stop being true.
courses:
  - code: EE6101
    name: Advanced Power System Analysis
    credits: 4
    note: Y-bus formulation, load flow, sparsity, symmetrical components, fault analysis.
  - code: EE6103
    name: Distribution System Engineering
    credits: 3
    note: Radial networks, unbalanced three-phase modelling, backward-forward sweep.
  - code: EE6105
    name: Power Quality
    credits: 3
    note: Harmonics, sags and swells, flicker, IEEE 519 limits, measurement practice.
  - code: EE6107
    name: Grid Integration of Renewable Energy
    credits: 3
    note: PV and wind interconnection, IEEE 1547, variability and hosting capacity.
  - code: EE6191
    name: Power Systems Simulation Laboratory
    credits: 2
    note: MATLAB/Simulink and OpenDSS labs backing the theory courses.
labs:
  - 'Load flow on IEEE 14-bus and 30-bus systems, hand-verified against textbook results'
  - 'Symmetrical and unsymmetrical fault studies in Simulink'
  - 'Harmonic measurement on a lab rectifier load and THD computation against IEEE 519'
  - 'Building an unbalanced 4-wire distribution feeder in OpenDSS from a feeder data sheet'
highlights:
  - 'Wrote a Newton-Raphson load flow from scratch instead of calling a library — the single most useful thing I have done so far'
  - 'Understood why the fast decoupled method works, and exactly which assumptions break it'
  - 'First proper exposure to OpenDSS and COM/Python scripting for repeated studies'
books:
  - title: Power System Analysis
    author: John J. Grainger & William D. Stevenson
  - title: Distribution System Modeling and Analysis
    author: William H. Kersting
  - title: 'Electrical Power Systems Quality'
    author: Dugan, McGranaghan, Santoso & Beaty
conferences: []
achievements:
  - 'Admitted to M.Tech Power Systems Engineering, IIT Bhubaneswar'
---

## What this semester is actually for

I came in expecting the coursework to be an extension of my B.Tech power systems
paper. It isn't. The difference is that every result now comes with the question
*"under what assumptions?"* attached to it, and most of my early mistakes have
come from carrying an undergrad assumption into a problem where it no longer
holds.

The clearest example: I spent an entire evening debugging a load flow that
refused to converge on a distribution feeder, before realising I was applying a
transmission-system method to a network with an R/X ratio near 1. The
Newton-Raphson Jacobian isn't wrong there — the *decoupling* assumption I had
quietly inherited is.

## How I'm working

Three habits I'm trying to hold to for the next two years:

1. **Implement before importing.** If a method appears in a course, I write a
   small version of it myself before I use a library. It is slower, and it is the
   only thing that has actually stuck.
2. **Validate against something known.** Every solver I write gets checked
   against published IEEE test-system results before I trust it on anything new.
3. **Write the note the same week.** If I don't write it down while the confusion
   is still fresh, I lose the part that was actually hard — which is the part
   worth recording.

## Open questions I'm carrying forward

- How much of hosting-capacity analysis can be done analytically before you are
  forced into time-series simulation?
- Where is the honest boundary between "machine learning helps here" and "a
  physical model is simply better" in distribution system problems?
- What does power quality look like on a feeder that is already 40% inverter-fed?
  Most of the classical material assumes it isn't.
