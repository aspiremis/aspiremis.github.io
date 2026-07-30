---
title: Short-Term Load and Solar Forecasting
summary: >-
  A careful comparison of classical and deep-learning forecasters for day-ahead
  load and PV output — including the baselines most papers quietly skip.
date: 2026-07-26
status: active
tech: ['Python', 'scikit-learn', 'pandas', 'PyTorch']
tags: ['forecasting', 'machine-learning', 'time-series', 'solar-pv']
github: https://github.com/shalini-ee/load-solar-forecasting
featured: true
order: 3
---

## Overview

Short-term forecasting is where machine learning most obviously belongs in power
systems, and also where it is most often oversold. This project is an attempt to
do the comparison honestly: same data, same splits, same metrics, and — the part
that usually goes missing — a seasonal naive baseline that the fancy models have
to actually beat.

## Problem statement

Given historical load, PV generation and weather, produce a 24-hour-ahead
forecast at hourly resolution, and quantify how much each modelling choice
actually buys.

Two properties make this harder than a generic regression problem:

- **Strong multi-scale seasonality.** Daily, weekly and annual cycles are all
  present, and a model that doesn't represent them explicitly wastes capacity
  learning them.
- **PV output is bounded by physics.** Generation is exactly zero at night and
  capped by clear-sky irradiance during the day. A model that predicts 40 kW at
  2 a.m. is not making a small error; it is revealing that it never learned the
  structure at all.

Error is reported as MAPE for load and, for PV, as nRMSE against installed
capacity — because MAPE is undefined at night, when actual output is zero:

$$
\text{nRMSE} = \frac{1}{P_{\text{rated}}}\sqrt{\frac{1}{n}\sum_{t=1}^{n}\left(\hat{y}_t - y_t\right)^2}
$$

This detail matters more than it sounds. A paper reporting PV MAPE is either
dropping night hours or dividing by zero somewhere, and the two choices are not
comparable.

## Architecture

```
data/         ingestion, resampling, timezone & DST handling, gap policy
features/     calendar, lags, rolling stats, clear-sky index
models/       naive · linear · random_forest · gradient_boosting · lstm
evaluate/     rolling-origin backtest, metrics, error decomposition
```

Feature engineering is deliberately shared across every model, so the comparison
measures the *model*, not who got the better features.

## Implementation

The features that carried the most weight:

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

Backtesting uses a **rolling-origin** split, never a random one. Random splits on
time series leak future information backwards through the lag features and
produce results that look excellent and mean nothing.

## Results

Day-ahead forecasts, 12 months of data, rolling-origin backtest with a 30-day
test window stepped monthly:

| Model | Load MAPE | PV nRMSE | Train time |
|---|---|---|---|
| Seasonal naive (t − 168 h) | 8.4% | 14.1% | — |
| Linear regression | 6.9% | 11.8% | < 1 s |
| Random forest | 5.1% | 9.4% | 42 s |
| Gradient boosting | **4.6%** | **8.7%** | 88 s |
| LSTM (2 × 64) | 4.8% | 8.9% | 21 min |

What I take from this:

- **The LSTM did not win.** With well-constructed lag features, gradient boosting
  matched or beat it at a fraction of the training cost. The deep model would
  likely pull ahead with substantially more data, but at this scale, claiming it
  is "better" would be dishonest.
- **The naive baseline is not embarrassing.** 8.4% MAPE from copying last week is
  a reminder of how much of a load curve is pure repetition — and any model that
  can't clear that bar comfortably isn't earning its complexity.
- **Clear-sky index was the single highest-value feature.** Removing it degraded
  PV nRMSE from 8.7% to 12.3%, a bigger swing than any change of model.

## Future improvements

- Probabilistic forecasts (quantile regression / prediction intervals) — a point
  forecast is the wrong output for anything that feeds a reserve decision
- Sky-image or satellite-derived inputs for intra-hour PV ramps
- Hierarchical reconciliation across feeder → substation → system level
- Test transfer to a site with no history, which is the actually hard case

## Code

The repository contains the full feature pipeline, the backtesting harness, and
notebooks reproducing every number in the table.
