---
title: Power Flow Solver from First Principles
summary: >-
  A planned load-flow engine written from scratch — Gauss-Seidel, Newton-Raphson
  and fast decoupled — to be validated against published IEEE test system results.
date: 2026-07-12
status: planned
tech: ['Python', 'NumPy', 'SciPy', 'Matplotlib']
tags: ['power-flow', 'newton-raphson', 'numerical-methods', 'ieee-test-systems']
featured: true
order: 1
---

> **Status: planned.** This page is a design document, not a report. It describes
> what I intend to build and why. There are no results here yet, and there won't be
> until the code exists and has been validated — at which point this page gets
> rewritten with real numbers.

## Overview

Every power system course starts with load flow, and almost every student ends up
running it through a package that hides the interesting part. I want the opposite:
a small, readable Python implementation of the three classical load-flow methods,
built so that each step of the algorithm is visible and checkable.

It is deliberately not trying to compete with pandapower or PSS®E. It is trying to
become the thing I read when I need to remember *why* the Jacobian has the
structure it does.

## Problem statement

Given a network described by its bus and line data, find the complex voltage at
every bus such that the power injected at each bus matches its specification.

For each bus $i$, the injected complex power must satisfy the network equations:

$$
S_i = P_i + jQ_i = V_i \sum_{k=1}^{N} Y_{ik}^{*} V_k^{*}
$$

Splitting into real and imaginary parts with $V_i = |V_i|\angle\delta_i$ and
$Y_{ik} = G_{ik} + jB_{ik}$ gives the two mismatch equations a solver must drive to
zero:

$$
P_i = |V_i| \sum_{k=1}^{N} |V_k| \left( G_{ik}\cos\delta_{ik} + B_{ik}\sin\delta_{ik} \right)
$$

$$
Q_i = |V_i| \sum_{k=1}^{N} |V_k| \left( G_{ik}\sin\delta_{ik} - B_{ik}\cos\delta_{ik} \right)
$$

These are nonlinear and coupled, which is the entire reason the field has three
different iterative methods rather than one closed-form answer.

## Planned architecture

Four modules, because that boundary is where I expect bugs to hide:

```
network/     bus & branch data, per-unit conversion, validation
ybus/        admittance matrix assembly (sparse), shunt & tap handling
solvers/     gauss_seidel.py · newton_raphson.py · fast_decoupled.py
report/      convergence history, losses, voltage profile plots
```

The admittance matrix is the shared foundation. For a network with $N$ buses:

$$
Y_{ii} = y_{i0} + \sum_{k \neq i} y_{ik}, \qquad Y_{ik} = -y_{ik}
$$

Real networks are sparse — a 300-bus system typically has under 1% of its Y-bus
populated — so it should be assembled directly into `scipy.sparse` rather than
built dense and converted.

## Intended approach

The Newton-Raphson core is the piece that matters. Each iteration solves the
linearised system:

$$
\begin{bmatrix} \Delta P \\ \Delta Q \end{bmatrix} =
\begin{bmatrix} H & N \\ M & L \end{bmatrix}
\begin{bmatrix} \Delta \delta \\ \Delta |V| / |V| \end{bmatrix}
$$

Sketched below to fix the structure before writing it properly:

```python
def solve(network, tol=1e-8, max_iter=30):
    """Newton-Raphson power flow in polar coordinates."""
    v, delta = network.flat_start()
    history = []

    for iteration in range(max_iter):
        p_calc, q_calc = injected_power(network.ybus, v, delta)
        mismatch = np.concatenate([
            network.p_spec[network.pq_pv] - p_calc[network.pq_pv],
            network.q_spec[network.pq]    - q_calc[network.pq],
        ])

        error = np.max(np.abs(mismatch))
        history.append(error)
        if error < tol:
            return Solution(v, delta, iteration, history, converged=True)

        jacobian = build_jacobian(network.ybus, v, delta, network.pq, network.pv)
        correction = spsolve(jacobian.tocsc(), mismatch)

        delta[network.pq_pv] += correction[:network.n_pq_pv]
        v[network.pq]       *= 1 + correction[network.n_pq_pv:]

    return Solution(v, delta, max_iter, history, converged=False)
```

Two decisions I want to get right from the start:

- **Voltage magnitudes update multiplicatively.** The Jacobian is formulated in
  terms of $\Delta|V|/|V|$ rather than $\Delta|V|$, which keeps the submatrix
  entries dimensionally consistent and better conditioned. Getting this wrong
  produces a solver that converges slowly to a slightly wrong answer — a far nastier
  failure than one that diverges visibly.
- **Rebuild the Jacobian every iteration.** Holding it constant is a real
  optimisation, but it obscures why Newton-Raphson converges quadratically, and
  readability is the point of this project.

## How it will be validated

This is the part I care most about, and the reason there are no numbers on this
page. Before I trust the solver on anything, it has to reproduce **published IEEE
common data format results** on the 14-, 30-, 57- and 118-bus systems, to a
tolerance of $10^{-6}$ p.u. on bus voltage magnitude.

If it can't reproduce a known answer, it has no business producing a new one.

I also intend to provoke the failure case deliberately: applying fast decoupled to
a distribution feeder with $R/X \approx 1$, where the decoupling assumption breaks
down. Watching a method fail under conditions you understand teaches more than
watching it succeed.

## Scope beyond the first version

- A backward-forward sweep solver, which is the method that actually suits radial
  distribution networks
- Continuation power flow, to trace the P–V curve up to the nose point
- Three-phase unbalanced formulation — the first version is positive-sequence only
- PV-to-PQ bus-type switching when reactive limits bind
- Packaging well enough that someone else can `pip install` it

## Code

The repository isn't public yet. It will be linked here once there is something
worth reading, along with the validation notebook that reproduces the IEEE
reference results.
