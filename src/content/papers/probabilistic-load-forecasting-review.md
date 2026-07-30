---
title: 'Probabilistic Electric Load Forecasting: A Tutorial Review'
authors: ['Tao Hong', 'Shu Fan']
venue: 'International Journal of Forecasting'
year: 2016
readOn: 2026-07-27
topic: machine-learning
takeaway: >-
  Point forecasts are the wrong output for most power system decisions. If the
  forecast feeds a reserve or capacity decision, the uncertainty is the part the
  decision actually needs.
tags: ['forecasting', 'probabilistic', 'methodology', 'review']
---

## Why I read it

My forecasting project produces point forecasts and reports MAPE, and I had a
nagging sense that I was optimising the wrong thing. This review confirmed it,
fairly directly.

## What it does

Surveys the field of probabilistic load forecasting — methods that produce
quantiles, intervals or full densities — and argues for why they matter, how they
should be evaluated, and where the field was heading.

## What I took from it

- **Point forecasts discard the information the decision needs.** A system operator
  sizing reserve doesn't want the expected load; they want to know how bad the
  90th-percentile hour could be. A forecast that is right on average and silent
  about its spread cannot answer that.
- **Evaluation has to change too.** MAPE is undefined for a distribution. Pinball
  loss and CRPS are the right tools, and they reward calibration — an interval
  claiming 90% coverage should contain the outcome 90% of the time — rather than
  just sharpness.
- The **hierarchy problem**: forecasts made at feeder, substation and system level
  should be mutually consistent, and generally aren't unless you reconcile them
  deliberately.

## What this changes about my own work

Two concrete additions to the backlog:

1. Add quantile regression alongside the point models, and evaluate with pinball
   loss.
2. Stop reporting only MAPE. A model that is well calibrated and slightly less
   sharp is more useful for most downstream decisions than the reverse, and my
   current metric can't see the difference.

Reading this made my forecasting comparison feel less finished than it did a week
ago, which is probably the correct outcome.
