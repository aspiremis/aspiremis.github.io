---
title: Machine Learning for Energy Systems
topic: machine-learning
description: >-
  Where data-driven methods genuinely help in power systems, and where a physical
  model is simply the better answer.
status: in-progress
startedOn: 2026-07-15
progress: 35
order: 5
---

## Where I am

Comfortable with the standard supervised toolkit and with time series done
correctly. Actively working on the judgement of when to reach for it at all.

## Covered

- Regression and tree ensembles — random forest, gradient boosting
- Time series cross-validation, and why random splits leak
- Feature engineering for load and generation forecasting
- Metric selection, including why MAPE fails on solar output

## In progress

- Probabilistic forecasting — quantile regression, pinball loss, calibration
- Sequence models, and being honest about when they earn their cost
- Physics-informed approaches that constrain a model with known relationships

## Not started

- Reinforcement learning for dispatch and control
- Graph neural networks on network topology

## What clicked

That a seasonal naive baseline got 8.4% MAPE on my load data. It reframed the
question from "how good is my model" to "how much is my model adding over
repetition", which is a much harder and more honest bar.
