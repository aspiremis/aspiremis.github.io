---
title: Reading the Load Flow Jacobian
description: >-
  Each of the four submatrices answers a physical question. Knowing which is
  which turns a debugging session from guesswork into inspection.
date: 2026-07-14
topic: power-systems
tags: ['newton-raphson', 'load-flow', 'jacobian', 'numerical-methods']
status: growing
---

## The structure

$$
\begin{bmatrix} \Delta P \\ \Delta Q \end{bmatrix} =
\begin{bmatrix} H & N \\ M & L \end{bmatrix}
\begin{bmatrix} \Delta \delta \\ \Delta |V| / |V| \end{bmatrix}
$$

Each block is a sensitivity, and each has a plain-language reading:

| Block | Derivative | Question it answers |
|---|---|---|
| $H$ | $\partial P / \partial \delta$ | How much does real power flow change if I twist an angle? |
| $N$ | $\partial P / \partial \lvert V\rvert$ | How much does real power change if I raise a voltage? |
| $M$ | $\partial Q / \partial \delta$ | How much does reactive flow change with angle? |
| $L$ | $\partial Q / \partial \lvert V\rvert$ | How much does reactive flow change with voltage? |

On a transmission system, $H$ and $L$ are large and $N$ and $M$ are small. That
observation is the entire basis of the fast decoupled method — and it stops being
true when $R/X$ approaches 1.

## Why $\Delta|V|/|V|$ and not $\Delta|V|$

The right-hand vector uses the *normalised* magnitude correction. This isn't
cosmetic. It makes the $N$ and $L$ entries dimensionally consistent with $H$ and
$M$, which improves the conditioning of the matrix and, conveniently, makes the
expressions for all four blocks structurally similar.

Getting this wrong produces a solver that still converges — just more slowly, and
to a slightly displaced answer. That is a far nastier failure mode than one that
diverges visibly, and it cost me two evenings.

## Which rows and columns exist

Not every bus contributes every equation:

- **Slack bus** — $|V|$ and $\delta$ both fixed. No rows, no columns.
- **PV bus** — $|V|$ fixed, $\delta$ unknown. Contributes a $P$ row and a $\delta$
  column, but no $Q$ row and no $|V|$ column.
- **PQ bus** — both unknown. Contributes everything.

So for $n_{pq}$ PQ buses and $n_{pv}$ PV buses, the Jacobian is
$(2n_{pq} + n_{pv}) \times (2n_{pq} + n_{pv})$. Index bookkeeping here is the most
common source of bugs in a from-scratch implementation, and the symptom is usually
a matrix that is the wrong shape by exactly one.

## Debugging by inspection

Things I now check before suspecting the maths:

1. **Is it square and the right size?** Recount PV and PQ buses.
2. **Does its sparsity match the Y-bus?** It should — $\partial P_i/\partial \delta_k$
   is nonzero only where $Y_{ik}$ is.
3. **Is the diagonal dominant?** If a diagonal entry is near zero, a bus is
   effectively disconnected or an impedance is mis-entered.
4. **Does the mismatch fall roughly quadratically?** Newton's method should
   roughly square the error each step near the solution. Linear decay means the
   Jacobian is wrong, not the tolerance.

That fourth check is the most useful diagnostic I've found. A correct
implementation goes something like 10⁻¹ → 10⁻³ → 10⁻⁷. Anything decaying steadily
by a constant factor is telling you the derivative information is inconsistent
with the function being solved.

## Related

- [[ybus-construction]] — the sparsity pattern the Jacobian inherits
- Fast decoupled load flow, and where the decoupling assumption fails
