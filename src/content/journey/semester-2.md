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
  - code: EE6L004
    name: Power System Protection
    ltp: '3-1-0'
    credits: 4
    type: Core
    note: 'Per the department curriculum. Instructor confirmed at registration.'
  - code: EE6L021
    name: Power System Stability and Control
    ltp: '3-1-0'
    credits: 4
    type: Core
    note: 'Per the department curriculum.'
  - name: Department Elective IV
    ltp: '3-0-0'
    credits: 3
    type: Elective
    note: 'Not yet chosen. The department list includes FACTS, HVDC Transmission, Smart Grid Technology, Wide Area Monitoring Systems and Power System Modelling and Simulation.'
  - name: Department Elective V
    ltp: '3-0-0'
    credits: 3
    type: Elective
    note: 'Not yet chosen.'
  - code: EE6P002
    name: Energy Systems Laboratory
    ltp: '0-0-3'
    credits: 2
    type: Core Lab
    note: 'Per the department curriculum.'
  - code: EE6P057
    name: Computer Methods in Power System Laboratory
    ltp: '1-0-3'
    credits: 3
    type: Core Lab
    note: 'Per the department curriculum. The computational half of the degree, and the reason the MATLAB track on this site exists.'
  - code: EE6D101
    name: Thesis Part-1
    credits: 2
    type: Thesis
    note: 'Problem formulation and literature survey.'
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
