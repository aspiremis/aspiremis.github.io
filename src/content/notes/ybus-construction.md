---
title: Building the Y-bus Without Thinking Hard
description: >-
  The admittance matrix has a mechanical construction rule and a sparsity
  structure that mirrors the network graph exactly. Both are worth internalising.
date: 2026-07-10
updated: 2026-07-21
topic: power-systems
tags: ['ybus', 'load-flow', 'sparse-matrices', 'fundamentals']
status: evergreen
---

## The rule

For an $N$-bus network:

$$
Y_{ii} = y_{i0} + \sum_{k \neq i} y_{ik}
\qquad\text{(sum of every admittance touching bus } i\text{)}
$$

$$
Y_{ik} = -y_{ik}
\qquad\text{(negative of the admittance between } i \text{ and } k\text{)}
$$

where $y_{i0}$ is any shunt admittance at bus $i$ — line charging, capacitor
banks, shunt reactors.

That's the whole construction. It can be done by inspection, one branch at a time,
and it's additive, which is why the loop below works.

## Why it's assembled by branch, not by bus

The natural-looking implementation loops over buses and asks "what connects here?"
The better one loops over branches and adds each branch's stamp into four
positions:

```python
def build_ybus(n_buses, branches, shunts):
    """Assemble Y-bus by stamping each branch into four positions."""
    ybus = lil_matrix((n_buses, n_buses), dtype=complex)

    for br in branches:
        i, k = br.from_bus, br.to_bus
        y = 1 / complex(br.r, br.x)

        ybus[i, i] += y + 1j * br.b_shunt / 2   # half line charging each end
        ybus[k, k] += y + 1j * br.b_shunt / 2
        ybus[i, k] -= y
        ybus[k, i] -= y

    for bus, y_shunt in shunts.items():
        ybus[bus, bus] += y_shunt

    return ybus.tocsr()
```

Each branch is visited once, contributes four entries, and the diagonal
accumulates naturally. It also generalises: a transformer with off-nominal tap
$a$ stamps as $y/a^2$, $y/a$, $y/a$, $y$ instead — same structure, different
coefficients.

## Sparsity is the point

$Y_{ik}$ is nonzero only if buses $i$ and $k$ are directly connected. **The Y-bus
is the network's adjacency structure with electrical weights.** Real power systems
have each bus connected to a handful of neighbours regardless of system size, so
the matrix is extremely sparse — under 1% populated on a 300-bus system.

This isn't a memory footnote. It's why load flow scales at all. A dense
factorisation is $O(N^3)$; a sparse one with good ordering is closer to $O(N^{1.4})$
on power-system topologies. My first implementation built the matrix dense and
converted it afterwards, which discarded the entire advantage at the one moment it
mattered.

## Quick checks

- **Symmetric** for a network with no phase-shifting transformers. If it isn't,
  there's a stamping bug.
- **Diagonally dominant** in most practical networks.
- **Singular** if there's no shunt path to ground anywhere — a legitimate reason a
  solve can fail that has nothing to do with the solver.
- Row sums are zero for a network with no shunt elements at all. A fast unit test.

## Related

- [[per-unit-system]] — the impedances stamped in must already be per-unit
- [[newton-raphson-jacobian]] — the Jacobian inherits this sparsity pattern
