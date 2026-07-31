---
title: Power Flow Solver from First Principles
summary: >-
  A load-flow engine written from scratch — Gauss-Seidel, Newton-Raphson and fast
  decoupled — validated against published IEEE test system results.
date: 2026-07-12
status: active
tech: ['Python', 'NumPy', 'SciPy', 'Matplotlib']
tags: ['power-flow', 'newton-raphson', 'numerical-methods', 'ieee-test-systems']
github: https://github.com/aspiremis/power-flow-solver
featured: true
order: 1
---

## Overview

Every power system course starts with load flow, and almost every student ends up
running it through a package that hides the interesting part. This project is the
opposite: a small, readable Python implementation of the three classical load-flow
methods, built so that each step of the algorithm is visible and checkable.

It is deliberately not trying to compete with pandapower or PSS®E. It is trying to
be the thing I read when I need to remember *why* the Jacobian has the structure
it does.

## Problem statement

Given a network described by its bus and line data, find the complex voltage at
every bus such that the power injected at each bus matches its specification.

For each bus $i$, the injected complex power must satisfy the network equations:

$$
S_i = P_i + jQ_i = V_i \sum_{k=1}^{N} Y_{ik}^{*} V_k^{*}
$$

Splitting into real and imaginary parts with $V_i = |V_i|\angle\delta_i$ and
$Y_{ik} = G_{ik} + jB_{ik}$ gives the two mismatch equations the solver actually
drives to zero:

$$
P_i = |V_i| \sum_{k=1}^{N} |V_k| \left( G_{ik}\cos\delta_{ik} + B_{ik}\sin\delta_{ik} \right)
$$

$$
Q_i = |V_i| \sum_{k=1}^{N} |V_k| \left( G_{ik}\sin\delta_{ik} - B_{ik}\cos\delta_{ik} \right)
$$

These are nonlinear and coupled, which is the entire reason the field has three
different iterative methods rather than one closed-form answer.

## Architecture

The code separates cleanly into four stages, and I kept them as four modules
because that boundary is exactly where bugs used to hide:

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
populated — so it is assembled directly into `scipy.sparse` rather than built dense
and converted, which was my first, embarrassingly slow, version.

## Implementation

The Newton-Raphson core is the piece worth showing. Each iteration solves the
linearised system:

$$
\begin{bmatrix} \Delta P \\ \Delta Q \end{bmatrix} =
\begin{bmatrix} H & N \\ M & L \end{bmatrix}
\begin{bmatrix} \Delta \delta \\ \Delta |V| / |V| \end{bmatrix}
$$

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

Two decisions in there took me longer than they should have:

- **Voltage magnitudes update multiplicatively.** The Jacobian is formulated in
  terms of $\Delta|V|/|V|$ rather than $\Delta|V|$, because it keeps the submatrix
  entries dimensionally consistent and better conditioned. Getting this wrong
  produces a solver that converges — slowly, and to a slightly wrong answer, which
  is much worse than one that fails loudly.
- **The Jacobian is rebuilt every iteration.** Holding it constant is a real
  optimisation, but it obscures why Newton-Raphson converges quadratically in the
  first place, so the readable version keeps rebuilding.

## Results

Validated against the published IEEE common data format results. Convergence
tolerance $10^{-8}$ p.u. on maximum power mismatch, flat start:

| System | Method | Iterations | Max \|V\| error vs. published |
|---|---|---|---|
| IEEE 14-bus | Newton-Raphson | 4 | 2.1 × 10⁻⁶ p.u. |
| IEEE 14-bus | Fast decoupled | 7 | 3.4 × 10⁻⁶ p.u. |
| IEEE 14-bus | Gauss-Seidel | 128 | 8.9 × 10⁻⁵ p.u. |
| IEEE 30-bus | Newton-Raphson | 4 | 3.0 × 10⁻⁶ p.u. |
| IEEE 57-bus | Newton-Raphson | 5 | 4.7 × 10⁻⁶ p.u. |
| IEEE 118-bus | Newton-Raphson | 5 | 6.2 × 10⁻⁶ p.u. |

The iteration counts reproduce the textbook expectation almost exactly, which is
the point — the numbers are a check on my implementation, not a discovery.

The more interesting result is the failure case. Applying fast decoupled to a
distribution feeder with $R/X \approx 1.2$ took 60+ iterations where it takes 7 on
a transmission system. The decoupling assumption that $P$ depends mainly on
$\delta$ and $Q$ mainly on $|V|$ relies on $X \gg R$, and distribution networks
simply do not satisfy it. That single experiment taught me more about the method
than the derivation did.

## Future improvements

- Add a backward-forward sweep solver, which is the method that actually suits
  radial distribution networks
- Continuation power flow, to trace the P–V curve up to the nose point
- Three-phase unbalanced formulation — currently everything is positive-sequence
- Proper handling of PV-to-PQ bus-type switching when reactive limits bind
- Package it well enough that someone else can `pip install` it

## Code

The repository is public and includes the IEEE test-case data files and the
validation notebook that produced the table above.
