---
title: Python for Engineering Computation
topic: python
description: >-
  NumPy, SciPy, pandas — used well enough that the code is fast, readable and
  reproducible six months later.
status: consolidating
startedOn: 2026-07-05
progress: 70
order: 3
---

## Where I am

This is the tooling I am most comfortable with, and I am now working on the
difference between code that runs and code that can be trusted.

## Covered

- NumPy vectorisation, broadcasting, avoiding Python-level loops
- `scipy.sparse` — formats, and when each is the right one
- Sparse linear solves and why the format you build in is not the format you
  solve in
- pandas time series: resampling, timezone handling, rolling windows
- Matplotlib for publication-quality figures

## In progress

- Testing numerical code — property-based tests, tolerance selection
- Profiling, and being honest about where time actually goes
- Packaging so that work is installable rather than a folder of scripts

## Not started

- Numba or Cython for the inner loops that stay slow
- Parallel and distributed execution for large scenario sweeps

## What clicked

Building a sparse matrix in `lil_matrix` and converting to `csr_matrix` before
solving. My first Y-bus assembly was dense, and the entire computational advantage
of sparsity was thrown away in the one place it mattered.
