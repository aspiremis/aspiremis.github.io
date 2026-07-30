---
semester: 2
title: 'Spring 2027 — Dynamics, Protection and Optimisation'
period: 'January – May 2027'
status: upcoming
summary: >-
  Where the first semester is steady-state, the second moves into time: stability,
  protection coordination and the optimisation methods that decide how a system is
  actually operated. This is also when I expect to settle on a thesis direction.
courses:
  - code: EE6102
    name: Power System Dynamics and Stability
    credits: 4
    note: Planned — synchronous machine modelling, small-signal and transient stability.
  - code: EE6104
    name: Power System Protection
    credits: 3
    note: Planned — relay coordination, distance protection, protection of inverter-fed networks.
  - code: EE6106
    name: FACTS and HVDC Transmission
    credits: 3
    note: Planned.
  - code: EE6108
    name: Optimisation Techniques in Power Systems
    credits: 3
    note: Planned — OPF, unit commitment, convex relaxations.
  - code: EE6192
    name: Seminar
    credits: 2
    note: Planned — literature survey feeding into the thesis proposal.
labs: []
highlights: []
books:
  - title: Power System Stability and Control
    author: Prabha Kundur
  - title: Power System Dynamics — Stability and Control
    author: Jan Machowski, Janusz Bialek & James Bumby
conferences: []
achievements: []
---

## Why this semester matters

Everything in Semester 1 is a snapshot: solve the network at one instant and
report the voltages. Semester 2 is about what happens *between* those instants —
whether a disturbance decays or grows, whether a relay sees a fault correctly
when the fault current is supplied by inverters rather than machines, and how an
operator chooses among the feasible states.

Protection of inverter-dominated networks is the topic I'm most curious about
going in. Conventional overcurrent protection assumes a fault delivers several
times rated current from a rotating machine. An inverter is current-limited by
firmware and simply won't do that, which quietly invalidates a great deal of
classical coordination practice.

## What I want to leave this semester with

- A clear thesis direction, narrow enough to actually finish
- A working small-signal stability model I built myself, not just ran
- Enough optimisation background to read OPF papers without stalling on notation

*This page is a plan, not a record. I'll rewrite it with what actually happened
once the semester is over.*
