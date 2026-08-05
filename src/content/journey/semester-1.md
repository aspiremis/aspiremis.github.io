---
semester: 1
title: 'Autumn 2026 — Foundations'
period: 'July – November 2026'
session: 'Autumn 2026-27'
status: current
summary: >-
  Six courses: two core, a laboratory, and three electives that between them cover
  power quality, high voltage and renewable integration. Undergrad taught me to apply
  formulas; this semester is teaching me where they come from and, more usefully, when
  they stop being true.
courses:
  - code: EE6L001
    name: Power System Analysis and Operation
    ltp: '3-1-0'
    credits: 4
    type: Core
    instructor: Prof. S. R. Samantaray
    note: >-
      Four modules. Load flow (18 h) — Y-bus formulation, Gauss-Seidel,
      Newton-Raphson, decoupled, line flows and losses, AC-DC systems. State
      estimation (14 h) — least squares, static and dynamic, tracking. Optimal
      system operation (18 h) — economic dispatch, unit commitment, hydrothermal
      scheduling, security and contingency analysis. Load forecasting (6 h) —
      time series, Kalman filters, restructured markets.
  - code: EE6L017
    name: Distribution System Engineering
    ltp: '3-0-0'
    credits: 3
    type: Core
    instructor: Dr. Pankaj Dilip Achlerkar
    note: >-
      Four modules. Load modelling (8 h) — static ZIP, exponential and polynomial
      models, dynamic composite models. Distribution system features (2 h) —
      substation layouts, grounding, feeder structures. Load flow and short-circuit
      analysis (25 h) — backward-forward sweep, Gauss implicit Z-bus, Monte Carlo
      probabilistic load flow, phase-variable fault analysis. Approximate analytical
      methods (15 h) — voltage drop and loss estimation, optimal DG and capacitor
      placement, hosting capacity, reconfiguration.
  - code: EE6P004
    name: Power System Analysis and Operation Laboratory
    ltp: '0-0-3'
    credits: 2
    type: Core Lab
    instructor: Dr. Pankaj Dilip Achlerkar
    note: >-
      Nine experiments — power quality phenomena and signal processing;
      Newton-Raphson load flow; economic dispatch and OPF; distribution system load
      flow; phasor estimation by full- and half-cycle Fourier algorithms; distance
      protection; transmission line modelling, parameter estimation and the Ferranti
      effect; numerical over/under voltage and frequency relays; active power flow
      control with a three-phase phase-shifting transformer.
  - code: EE6L002
    name: Electric Power Quality
    ltp: '3-0-0'
    credits: 3
    type: Elective
    instructor: Dr. Narsa Reddy Tummuru
    note: >-
      Power quality events and their sources, international standards, monitoring
      and the signal processing behind it, passive tuned and detuned L-C filters,
      and active filters — STATCOM, DVR and UPQC — including their control design.
  - code: EE6L009
    name: High Voltage Engineering
    ltp: '3-0-0'
    credits: 3
    type: Elective
    instructor: Dr. Bidhan Biswas
    note: >-
      Generation of high DC, AC and impulse voltages and currents; impulse generator
      design and control; measurement of high and peak voltages; breakdown in
      gaseous, liquid and solid dielectrics; electric stress in different geometries
      and insulation design; testing of high-voltage apparatus.
  - code: EE6L006
    name: Renewable and Distributed Energy Sources
    ltp: '3-0-0'
    credits: 3
    type: Elective
    instructor: Dr. Abhineet Prakash
    note: >-
      Grid integration challenges for renewables and storage; controller design for
      grid-connected and islanded microgrid operation; limits of linear controllers
      and nonlinear alternatives; voltage and frequency regulation and power dispatch
      in distributed generators; optimal capacity sizing; large-scale integration.
labs:
  - 'PSAO hardware: voltage regulation and the PV curve of a transmission line'
  - 'PSAO hardware: overcurrent protection of a three-phase induction motor'
  - 'PSAO hardware: Ferranti effect, ABCD parameters and shunt compensation'
  - 'PSAO hardware: under/over frequency and under/over voltage relays'
  - 'PSAO hardware: ZIP load characteristics'
  - 'PSAO simulation: five MATLAB experiments, after the mid-semester exam'
highlights:
  - 'Wrote a Newton-Raphson load flow from scratch instead of calling a library — the single most useful thing I have done so far'
  - 'Understood why the fast decoupled method works, and exactly which assumptions break it'
  - 'First proper exposure to backward-forward sweep, and why distribution needs its own solver'
  - 'Started building a MATLAB course for myself, because the coursework assumes it and nobody teaches it'
books:
  - title: Power System Analysis
    author: John J. Grainger & William D. Stevenson
  - title: Distribution System Modeling and Analysis
    author: William H. Kersting
  - title: Electrical Power Systems Quality
    author: Dugan, McGranaghan, Santoso & Beaty
  - title: High Voltage Engineering
    author: M. S. Naidu & V. Kamaraju
conferences: []
achievements:
  - 'Admitted to M.Tech Power Systems Engineering, IIT Bhubaneswar'
---

## What this semester is actually for

I came in expecting the coursework to be an extension of my B.Tech power systems
paper. It isn't. The difference is that every result now comes with the question
*"under what assumptions?"* attached to it, and most of my early mistakes have come
from carrying an undergrad assumption into a problem where it no longer holds.

The clearest example: I spent an entire evening on a load flow that refused to
converge on a distribution feeder, before realising I was applying a
transmission-system method to a network with an R/X ratio near 1. The Newton-Raphson
Jacobian isn't wrong there — the *decoupling* assumption I had quietly inherited is.

That is also why **EE6L001** and **EE6L017** sit so well together this semester. One
teaches load flow as it is done on transmission systems; the other shows immediately
why distribution needs backward-forward sweep instead. Taking both in the same term
makes that boundary obvious in a way that meeting them a year apart would not.

## How the six fit together

The two core courses are the spine. The three electives deliberately pull in different
directions:

- **Electric Power Quality (EE6L002)** looks at what the waveform is actually doing,
  which steady-state load flow says nothing about at all.
- **High Voltage Engineering (EE6L009)** is the one furthest from my comfort zone —
  insulation and breakdown physics rather than network analysis. I chose it partly
  because it is the only course this year that makes me think about the *equipment*
  rather than the equations.
- **Renewable and Distributed Energy Sources (EE6L006)** is closest to where I want my
  thesis to go, and it connects directly to the hosting-capacity work I am scoping.

The laboratory (**EE6P004**) is where MATLAB stops being optional. Which is what
prompted the [Learning Hub](/learning) on this site — the coursework assumes the tool
and nobody teaches it.

## How I'm working

Three habits I'm trying to hold to for the next two years:

1. **Implement before importing.** If a method appears in a course, I write a small
   version of it myself before I use a library. It is slower, and it is the only thing
   that has actually stuck.
2. **Validate against something known.** Every solver I write gets checked against
   published IEEE test-system results before I trust it on anything new.
3. **Write the note the same week.** If I don't write it down while the confusion is
   still fresh, I lose the part that was actually hard — which is the part worth
   recording.

## Open questions I'm carrying forward

- How much of hosting-capacity analysis can be done analytically before you are forced
  into time-series simulation?
- Where is the honest boundary between "machine learning helps here" and "a physical
  model is simply better" in distribution system problems?
- What does power quality look like on a feeder that is already 40% inverter-fed? Most
  of the classical material assumes it isn't.
- Does anything from high voltage engineering feed back into the network-analysis side,
  or do the two stay separate in practice? I genuinely don't know yet.
