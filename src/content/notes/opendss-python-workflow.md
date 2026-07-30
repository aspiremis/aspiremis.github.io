---
title: A Reproducible OpenDSS + Python Workflow
description: >-
  Driving OpenDSS from Python is easy. Driving it in a way you can re-run six
  months later and get the same numbers takes a few deliberate choices.
date: 2026-07-22
topic: simulation
tags: ['opendss', 'python', 'reproducibility', 'tooling']
status: seedling
---

## The basic loop

```python
import py_dss_interface

dss = py_dss_interface.DSS()
dss.text("compile [feeders/ieee33/Master.dss]")
dss.text("set mode=snapshot")
dss.solution.solve()

if dss.solution.converged:
    voltages = dss.circuit.buses_vmag_pu
```

That's the whole interface. Everything below is about the parts that bite later.

## Things that cost me time

**Always recompile, never mutate.** OpenDSS keeps state between commands. If you
add PV systems in a loop without recompiling, scenario 200 contains everything from
scenarios 1–199. My hosting-capacity results were quietly nonsense for an entire
run before I noticed the trend was monotonic in a way physics didn't justify.

```python
def fresh(master_path):
    """A clean circuit per scenario. Cheap, and the alternative is silent
    contamination of every result after the first."""
    dss.text(f"compile [{master_path}]")
    return dss
```

**Check `converged` every single time.** OpenDSS returns the last iterate rather
than raising when it fails. A non-converged solve looks exactly like a converged
one from Python — you get numbers, they're just wrong. Any result not guarded by a
convergence check is untrustworthy.

**Seed the RNG and store the seed with the results.** Monte Carlo studies are
worthless if you can't reproduce the run that produced a surprising figure.

```python
rng = np.random.default_rng(seed)
results.attrs['seed'] = seed
results.attrs['dss_version'] = dss.dss_version
results.attrs['feeder_sha'] = sha256_of(master_path)
```

Hashing the feeder file has already caught me once, when I'd edited a `.dss` model
and forgotten, then couldn't work out why old numbers wouldn't reproduce.

**Absolute paths in `compile`.** OpenDSS resolves relative paths against its own
working directory, which changes as it compiles nested files. Relative paths work
until they suddenly don't.

## Snapshot vs. time series

`mode=snapshot` solves one operating point. `mode=daily` or `yearly` steps through
load and generation shapes.

Snapshot at the worst case — peak generation, minimum load — is the standard
conservative screen and it's fast enough for large Monte Carlo sweeps. Time series
tells you *how often* a violation actually occurs, which is a different and often
more useful question, at maybe 100× the compute.

I use snapshot for sweeping the scenario space and time series only on the
scenarios that snapshot flags as interesting. That two-stage structure has been the
single biggest saving in wall-clock time.

## Still figuring out

- Whether `py-dss-interface` or `OpenDSSDirect.py` is the better long-term bet
- How to parallelise scenarios cleanly — the COM interface is stateful and does not
  like being shared across processes
- Storing results in a format that survives a schema change six months from now

## Related

- [[per-unit-system]] — OpenDSS reports voltages in p.u. by default, on its own
  base convention
