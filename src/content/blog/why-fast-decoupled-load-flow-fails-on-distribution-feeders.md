---
title: Why Fast Decoupled Load Flow Falls Apart on Distribution Feeders
description: >-
  The method that converges in seven iterations on a transmission system took
  sixty on a distribution feeder. The reason is one assumption I had stopped
  noticing I was making.
date: 2026-07-24
topic: power-systems
tags: ['load-flow', 'distribution', 'numerical-methods', 'debugging']
featured: true
---

I spent a good part of a week convinced my fast decoupled load flow had a bug.

It solved the IEEE 14-bus system in seven iterations. It solved the 30-bus and
57-bus systems just as happily. Then I pointed it at a small radial distribution
feeder and watched it grind through sixty iterations before I killed it.

There was no bug. The method was doing exactly what it was designed to do. I was
using it somewhere its design assumptions don't hold, and I hadn't noticed because
those assumptions had become invisible to me.

## What fast decoupled actually assumes

Start from the Newton-Raphson Jacobian, which relates power mismatches to
corrections in voltage angle and magnitude:

$$
\begin{bmatrix} \Delta P \\ \Delta Q \end{bmatrix} =
\begin{bmatrix} H & N \\ M & L \end{bmatrix}
\begin{bmatrix} \Delta \delta \\ \Delta |V| / |V| \end{bmatrix}
$$

The fast decoupled method throws away $N$ and $M$ — the off-diagonal blocks — and
solves two smaller, constant systems instead of one large changing one:

$$
\Delta P / |V| = B' \, \Delta \delta, \qquad \Delta Q / |V| = B'' \, \Delta |V|
$$

That is a very large saving. The Jacobian never has to be rebuilt or refactorised.
But it is only justified if $N$ and $M$ are genuinely small, and that requires
three things to be true:

1. $X \gg R$ for every branch
2. Voltage angle differences across branches are small
3. Reactive flow is not strongly coupled to angle

The first one is doing nearly all the work.

## Where the assumption comes from

On a transmission line, the reactance dominates the resistance by a wide margin.
Typical $R/X$ ratios sit somewhere around 0.1 to 0.3. Under that condition, real
power flow is governed almost entirely by angle difference, and reactive flow
almost entirely by magnitude difference:

$$
P_{ik} \approx \frac{|V_i||V_k|}{X_{ik}} \sin\delta_{ik} \approx \frac{\delta_{ik}}{X_{ik}}
$$

The $P$–$\delta$ and $Q$–$|V|$ pairs really are close to independent, so decoupling
them costs almost nothing.

Distribution feeders are built differently, and for good reasons that have nothing
to do with load flow. Conductors are shorter, smaller in cross-section, and run at
lower voltage. The resistance per unit length is comparatively much larger. On the
feeder I was testing, $R/X$ was about **1.2** — resistance slightly *exceeding*
reactance.

At that ratio, real power injection moves voltage magnitude substantially:

$$
\Delta V \approx \frac{R P + X Q}{V}
$$

The $RP$ term is no longer a correction. It is a leading term. Which means $\Delta P$
depends strongly on $\Delta|V|$, which means the $N$ block that fast decoupled
discards is not small at all. Throwing it away doesn't make the method wrong —
the mismatch equations are still solved exactly at convergence — it makes the
*search direction* poor, so it takes far more steps to get there.

## The part that actually surprised me

My first instinct was that this was a numerical curiosity. It isn't. The same
physics that breaks the solver is the physics that limits how much rooftop solar
a feeder can take.

Because $R$ is large, injecting real power at a bus **raises the voltage there**.
That is precisely the mechanism behind PV overvoltage on distribution feeders, and
it's why hosting capacity studies so often find voltage, not thermal rating, to be
the binding constraint. I ran into the same $RP$ term in two places in the same
month, from opposite directions, before I noticed it was the same term.

That connection is the thing I would have missed if I had used a library.

## What to use instead

For radial distribution networks, the sensible answer isn't a better general
solver — it's a method that exploits the radial structure. **Backward-forward
sweep** walks the feeder from the ends to the source accumulating currents, then
back out updating voltages. No Jacobian, no matrix factorisation, and convergence
that doesn't care about $R/X$ at all.

Full Newton-Raphson also works fine, since it never made the decoupling assumption
in the first place. It just costs more per iteration.

## The lesson I'm keeping

The methods in a textbook come with conditions attached, and those conditions get
stated once — usually in a sentence you read before you understood why it
mattered. Then you use the method twenty times in contexts where the conditions
happen to hold, and the caveat quietly stops being part of how you think about it.

Sixty iterations is a cheap way to get reminded. I'd rather collect these
reminders now, on test systems, than later on something that matters.

---

*The solver, the test cases and the failing feeder are all in
[power-flow-solver](https://github.com/aspiremis/power-flow-solver) if you want to
reproduce it.*
