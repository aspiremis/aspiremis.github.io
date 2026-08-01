---
title: Short-Term Load and Solar Forecasting
summary: >-
  A planned comparison of classical and deep-learning forecasters for day-ahead
  load and PV output — including the baselines most papers quietly skip.
date: 2026-07-26
status: planned
tech: ['Python', 'scikit-learn', 'pandas', 'PyTorch']
tags: ['forecasting', 'machine-learning', 'time-series', 'solar-pv']
featured: true
order: 3
---

> **Status: planned.** A design document. The experimental protocol below is what I
> intend to run; no results have been produced yet. The point of writing the
> protocol first is that it commits me to a fair comparison before I know which
> model I'd prefer to win.

## Overview

Short-term forecasting is where machine learning most obviously belongs in power
systems, and also where it is most often oversold. This project is an attempt to do
the comparison honestly: same data, same splits, same metrics, and — the part that
usually goes missing — a seasonal naive baseline that the sophisticated models have
to actually beat.

## Problem statement

Given historical load, PV generation and weather, produce a 24-hour-ahead forecast
at hourly resolution, and quantify how much each modelling choice actually buys.

Two properties make this harder than a generic regression problem:

- **Strong multi-scale seasonality.** Daily, weekly and annual cycles are all
  present, and a model that doesn't represent them explicitly wastes capacity
  learning them.
- **PV output is bounded by physics.** Generation is exactly zero at night and
  capped by clear-sky irradiance during the day. A model that predicts 40 kW at
  2 a.m. is not making a small error; it is revealing that it never learned the
  structure at all.

## Metrics, decided in advance

Error will be reported as MAPE for load and, for PV, as nRMSE against installed
capacity — because MAPE is undefined at night, when actual output is zero:

$$
\text{nRMSE} = \frac{1}{P_{\text{rated}}}\sqrt{\frac{1}{n}\sum_{t=1}^{n}\left(\hat{y}_t - y_t\right)^2}
$$

This detail matters more than it sounds. A paper reporting PV MAPE is either
dropping night hours or dividing by zero somewhere, and the two choices are not
comparable. Fixing the metric before running anything is how you avoid choosing the
one that flatters your result.

## Planned architecture

```
data/         ingestion, resampling, timezone & DST handling, gap policy
features/     calendar, lags, rolling stats, clear-sky index
models/       naive · linear · random_forest · gradient_boosting · lstm
evaluate/     rolling-origin backtest, metrics, error decomposition
```

Feature engineering will be **shared across every model**, so the comparison
measures the model rather than who got the better features.

## Intended approach

The features I expect to carry the most weight:

```python
def build_features(df):
    """Calendar + lag + clear-sky features shared by every model."""
    out = pd.DataFrame(index=df.index)

    # Cyclical encoding — hour 23 and hour 0 must be adjacent, which a raw
    # integer hour cannot express.
    hour = df.index.hour + df.index.minute / 60
    out['hour_sin'] = np.sin(2 * np.pi * hour / 24)
    out['hour_cos'] = np.cos(2 * np.pi * hour / 24)
    out['doy_sin']  = np.sin(2 * np.pi * df.index.dayofyear / 365.25)
    out['doy_cos']  = np.cos(2 * np.pi * df.index.dayofyear / 365.25)
    out['is_weekend'] = (df.index.dayofweek >= 5).astype(int)

    # Lags at 24h and 168h capture yesterday and last week at the same hour.
    for lag in (24, 48, 168):
        out[f'lag_{lag}h'] = df['target'].shift(lag)

    out['roll_mean_24h'] = df['target'].shift(24).rolling(24).mean()

    # Clear-sky index separates "cloudy" from "night" — without it, a model
    # cannot tell a heavily overcast noon from 8 p.m.
    out['clear_sky_index'] = (df['ghi'] / df['ghi_clearsky']).clip(0, 1.2).fillna(0)

    return out
```

## Experimental protocol

Committing to this before running anything is the whole point.

- **Rolling-origin backtest, never a random split.** Random splits on time series
  leak future information backwards through the lag features and produce results
  that look excellent and mean nothing.
- **A seasonal naive baseline** — predict that this hour equals the same hour last
  week — reported alongside every model. If a model can't clear that comfortably, it
  isn't earning its complexity.
- **Ablation on the clear-sky index**, because I suspect a physics-derived feature
  will matter more than the choice of model, and I'd rather test that than assume it.
- Training cost reported alongside accuracy. A model that wins by a small margin at
  twenty times the cost has not obviously won.

## Scope beyond the first version

- Probabilistic forecasts (quantile regression, prediction intervals) — a point
  forecast is the wrong output for anything that feeds a reserve decision
- Sky-image or satellite-derived inputs for intra-hour PV ramps
- Hierarchical reconciliation across feeder → substation → system level
- Transfer to a site with no history, which is the genuinely hard case

## Code

Not public yet. The repository, the feature pipeline and the backtesting harness
will be linked here once the protocol above has actually been run.
