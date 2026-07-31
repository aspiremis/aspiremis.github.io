---
title: The Baseline Your Forecasting Paper Forgot
description: >-
  My LSTM beat linear regression comfortably. It also lost to gradient boosting,
  and only barely cleared a model that copies last week. Here is why the boring
  baseline belongs in every comparison.
date: 2026-07-29
topic: machine-learning
tags: ['forecasting', 'machine-learning', 'methodology', 'time-series']
---

Every short-term load forecasting paper I read this month reported that its
proposed model beat the alternatives. Almost none of them reported what a
seasonal naive forecast would have achieved on the same data.

I built one, mostly out of curiosity. It predicts that the load at any hour will
equal the load at that same hour one week earlier. Seven lines of pandas, no
training, no hyperparameters.

It got **8.4% MAPE**.

## The full comparison

Twelve months of hourly data, rolling-origin backtest, identical features for
every learned model:

| Model | Load MAPE | PV nRMSE | Train time |
|---|---|---|---|
| Seasonal naive (t − 168 h) | 8.4% | 14.1% | — |
| Linear regression | 6.9% | 11.8% | < 1 s |
| Random forest | 5.1% | 9.4% | 42 s |
| Gradient boosting | **4.6%** | **8.7%** | 88 s |
| LSTM (2 × 64) | 4.8% | 8.9% | 21 min |

Two results here are worth more than the winner.

## The naive model is 55% as good as the best one, for free

Going from "copy last week" to a tuned gradient boosting model cuts error from
8.4% to 4.6%. That's a genuine, valuable improvement — a 45% reduction — and it
is also much less than the framing of most papers implies.

More importantly, it sets the scale. If someone reports 7% MAPE on a load series
without a baseline, I now have no idea whether that's good. On this dataset it
would be *worse than copying last week*. The number alone carries no information
about whether the model learned anything.

The reason the baseline does so well is that a load curve is mostly repetition.
Same building, same occupancy schedule, same weekday behaviour. A model's real
job isn't to predict the pattern — it's to predict the *departures* from it, which
are a much smaller share of the variance and a much harder target.

## The LSTM lost

This is the result I sat with longest, because I'd built the LSTM expecting it to
win and had already half-written the conclusion where it did.

Gradient boosting beat it on both targets, trained in 88 seconds instead of 21
minutes, and required no architecture decisions. With well-constructed lag and
calendar features, there was nothing left for the recurrence to discover. The
temporal structure I thought the LSTM would learn, I had already handed to every
model in the feature matrix.

I don't think this generalises to "LSTMs are bad at load forecasting." I think it
generalises to something narrower and more useful: **at this data scale, with good
features, sequence models don't have an edge.** Give it ten years of data across
hundreds of feeders and the answer may well flip. On one year and one site, the
honest report is that the deep model cost twenty times as much to train and did
not win.

Writing that up felt worse than it should have. It is also the only version of the
result that's worth anything.

## Two methodology traps I nearly walked into

**Random train/test splits.** Splitting a time series randomly lets the model see
future values through its own lag features — `lag_24h` for a test sample may well
be a training sample. The scores look wonderful. They mean nothing. Rolling-origin
backtesting is the only split that respects causality.

**MAPE on solar generation.** PV output is exactly zero at night, and MAPE divides
by the actual value. Every night hour is either a division by zero or silently
dropped, and papers reporting "PV MAPE" rarely say which. I switched to nRMSE
against installed capacity:

$$
\text{nRMSE} = \frac{1}{P_{\text{rated}}}\sqrt{\frac{1}{n}\sum_{t=1}^{n}\left(\hat{y}_t - y_t\right)^2}
$$

It's defined everywhere, it's comparable across sites of different sizes, and it
doesn't quietly discard a third of the data.

## What I actually changed my mind about

I came into this thinking the interesting question was *which model*. Having run
it, the interesting questions are *which baseline*, *which split*, and *which
metric* — because those three decisions moved my results more than the choice
between random forest and LSTM ever did.

The single highest-value thing I added wasn't a model at all. It was the clear-sky
index feature, which separates "overcast noon" from "night" for the PV target.
Removing it degraded nRMSE from 8.7% to 12.3% — a larger swing than any model
substitution in the table.

Feature that encodes the physics: 3.6 points. Twenty minutes of LSTM training:
worse than gradient boosting.

---

*Backtesting harness and notebooks:
[load-solar-forecasting](https://github.com/aspiremis/load-solar-forecasting).*
